import fs from "fs";
import path from "path";
import pdf from "pdf-parse";
import { fileURLToPath } from 'url';
import { RAGMessages, CommonMessages } from "../constants/enums.js";
import { InternalServer } from "../middlewares/customError.js";
import { StatusCodes } from "http-status-codes";
import { createEmbeddingWithLLM } from "../service/rag.js";
import { upsertVectorDB } from "../service/rag.js";
import { replaceCharacters } from "../service/knowledgeBase.js";
import { findAndDeleteKnowledgeBase } from "../service/knowledgeBase.js";

import mammoth from 'mammoth';
import textract from 'textract';
import { parse as csvParse } from 'csv-parse'; // Named import for csv-parse
import xlsx from 'xlsx';
import { acceptedTypes, getMimeType } from "./knowledgeBase.js";

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility function to extract text from a PDF
const extractTextFromPDF = async (pdfPath) => {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdf(dataBuffer);
  return data.text;
};

// Utility function to extract text from a DOCX
const extractTextFromDocx = async (docxPath) => {
  const result = await mammoth.extractRawText({ path: docxPath });
  return result.value;
};

// Utility function to extract text from a PPTX
const extractTextFromPptx = async (pptxPath) => {
  return new Promise((resolve, reject) => {
    textract.fromFileWithPath(pptxPath, (error, text) => {
      if (error) return reject(error);
      resolve(text);
    });
  });
};

// Utility function to extract text from a TXT
const extractTextFromTxt = async (txtPath) => {
  const data = fs.readFileSync(txtPath, 'utf8');
  return data;
};

// Utility function to extract text from a CSV
const extractTextFromCsv = async (csvPath) => {
  const data = fs.readFileSync(csvPath, 'utf8');
  return new Promise((resolve, reject) => {
    csvParse(data, {}, (err, output) => {
      if (err) return reject(err);
      const text = output.flat().join(' '); // Flatten and join all rows
      resolve(text);
    });
  });
};

// Utility function to extract text from an XLSX
const extractTextFromXlsx = async (xlsxPath) => {
  const workbook = xlsx.readFile(xlsxPath);
  let text = '';
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const sheetText = xlsx.utils.sheet_to_csv(sheet);
    text += sheetText.replace(/,/g, ' '); // Replace commas to avoid token splitting
  });
  return text;
};

// Determine the appropriate extraction function based on file extension
export const extractText = async (filePath) => {
  const fileExtension = filePath.split('.').pop().toLowerCase();
  switch (fileExtension) {
    case 'pdf':
      return await extractTextFromPDF(filePath);
    case 'docx':
      return await extractTextFromDocx(filePath);
    case 'pptx':
      return await extractTextFromPptx(filePath);
    case 'txt':
      return await extractTextFromTxt(filePath);
    case 'csv':
      return await extractTextFromCsv(filePath);
    case 'xlsx':
      return await extractTextFromXlsx(filePath);
    default:
      throw new Error(`Unsupported file type: ${fileExtension}`);
  }
};

const getEmbeddingsFromChunks = async (chunks) => {
  let embeddings = [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const model = "text-embedding-ada-002";
    const response = await createEmbeddingWithLLM(model, chunk);
    if (response.data && response.data.length > 0) {
      embeddings.push({
        id: i, // Use index as a simple identifier
        embedding: response.data[0].embedding,
        text: chunk
      });
    } else {
      throw new Error('Failed to get embedding from OpenAI API.');
    }
  }
  return embeddings;
};

export const getEmbedding = async (text) => {
  const maxTokensPerRequest = 8000; // Example maximum tokens per request
  let chunks = [];
  let currentChunk = '';

  // Split text into chunks based on token limit
  for (let token of text.split(' ')) {
    if ((currentChunk + token).length < maxTokensPerRequest) {
      currentChunk += token + ' ';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = token + ' ';
    }
  }
  if (currentChunk !== '') {
    chunks.push(currentChunk.trim());
  }

  // Get embeddings for each chunk
  const embeddings = await getEmbeddingsFromChunks(chunks);
  return embeddings;
};

const upsertVectors = async (fileName, vectors, userId) => {
  try {

    let upsertPayload = vectors.map((vector, index) => {
      return {
        id: `${fileName}_${index}`, // Unique identifier for each vector
        values: vector.embedding, // Ensure this is an array of numbers
        metadata: { text: vector.text }

      };
    });

    const namespace = userId + '/' + fileName

    await upsertVectorDB(namespace, upsertPayload)
    return true
  } catch (error) {
    console.error("Error upserting vectors in Pinecone:", error);
    throw error; // Handle or propagate the error as needed
  }
};

// Main function to create and upsert vectors
export const createAndUpsertVector = async (filePath, fileName, userId) => {
  const text = await extractText(filePath);
  const embedding = await getEmbedding(text);
  const response = await upsertVectors(fileName, embedding, userId);
  return response;
};


export const preprocessFilesForRAG = async (files,userId) => {
  try {
    for (let file of files) {
      if(file.destination.includes("downloads")){
        try {
          await createAndUpsertVector(file.path, file.filename, userId);
        } catch (error) {
          console.error("error: ", error);
          const isAdmin = true
          const responseOfDeleteKnowledgeBase = await findAndDeleteKnowledgeBase(file.filename, userId,isAdmin);
        }
      }
    }
    return {message: RAGMessages.VECTOR_CREATED_SUCCESSFULLY}
    
  } catch (error) {
    console.error("Error processing PDFs:", error); // Log the error for debugging
    return {message: CommonMessages.INTERNAL_SERVER_ERROR}
  }
};

/**
 * @async
 * @function preprocessPDFs
 * @description make vectors of a single pdf file
 * @param {Object} req - Request object. Should contain the following parameters in body: { fileDetails, userId }  where fileDetails which is an array of file with it's information and userId
 * @param {Object} res - Response object
 * @returns {Response} 201 - as create vectors of pdfs 
 * @throws {Error} Will throw an error if vector create failed
 */
// Preprocess PDFs and store vectors in Pinecone
export const preprocessPDFs = async (req, res, next) => {
  const { fileDetails, userId } = req.body;
  const pdfDir = path.join(__dirname, "../docs/uploads");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true , mode: 0o777});
  }else{
    fs.chmodSync(pdfDir, 0o777); 
  }

  try {
    let processedFileCount = 0;
    for (let file of fileDetails) {
      const { resultFileName, replacedIndices }= replaceCharacters(file.name);
      const fileNameWithoutEspChar = resultFileName;

      const mimeType = getMimeType(file.base64);
      if (acceptedTypes(mimeType)) {
        const { resultFileName, replacedIndices }= replaceCharacters(file.name);
        const fileNameWithoutEspChar = resultFileName;
        const fileNameWithUserId = userId.toString()+'\\'+fileNameWithoutEspChar;
        const pdfPath = path.join(pdfDir, fileNameWithUserId); 
        const relativePath = path.relative(pdfDir, pdfPath);
        const pathParts = relativePath.split(path.sep);
        let currentDir = pdfDir;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
            currentDir = path.join(currentDir, pathParts[i]);
  
            if (!fs.existsSync(currentDir)) {
              fs.mkdirSync(currentDir, { mode: 0o777 });
            } else {
              fs.chmodSync(currentDir, 0o777);
            }
        }

        // Decode base64 data
        try {
          const base64Data = file.base64?.replace(/^data:.*,/, '');
          const pdfData = Buffer.from(base64Data, 'base64');

          // Write file data to pdfPath
          await fs.promises.writeFile(pdfPath, pdfData);
          await createAndUpsertVector(pdfPath, fileNameWithoutEspChar, userId);

          // Optionally, delete the file after processing
          if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
          }
          processedFileCount += 1;

        } catch (error) {
          console.error("error: ", error);
          const responseOfDeleteKnowledgeBase = await findAndDeleteKnowledgeBase(fileNameWithoutEspChar, userId);
        }
      }

    }
    if (processedFileCount === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: CommonMessages.BAD_REQUEST_ERROR,
      });
    }

    return res.status(StatusCodes.CREATED).json({
      message: RAGMessages.VECTOR_CREATED_SUCCESSFULLY,
    });

  } catch (error) {
    console.error("Error processing PDFs:", error); // Log the error for debugging
    next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR)); // Handle the error response
  }
};