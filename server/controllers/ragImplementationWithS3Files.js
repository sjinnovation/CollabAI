import { getOpenAIInstance } from "../config/openAI.js";
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from "openai";
import { getEmbedding } from "./preprocessOfRAG.js";
import { StatusCodes } from "http-status-codes";
import { CommonMessages, KnowledgeBaseMessages } from "../constants/enums.js";
import { chatResponse } from "../service/rag.js";
import { vectorQuery } from "../service/rag.js";

const queryPinecone = async (embeddingsWithIds, fileNameList,userId) => {
  try {
    const fileList = fileNameList[0].knowledgeBaseId
    let allMatches = [];
    for(let file of fileList){
      for (const embeddingObj of embeddingsWithIds) {
        const queryRequest = {
          vector: embeddingObj.embedding,
          topK: 100, // page size
          includeMetadata: true,
        };
        const namespace = file.owner+"/"+file.name
        const result =await vectorQuery(namespace,queryRequest);
        allMatches.push(...result.matches);
      }
      
    }
    return allMatches;
  } catch (error) {
    console.error("Error querying Pinecone:", error);
    throw error; // Rethrow the error to handle it in the calling function
  }
};

export const findAssistantContext=async (userId,query, fileNameList) => {
  try {
    const embeddingsWithIds = await getEmbedding(query);
    const results = await queryPinecone(embeddingsWithIds, fileNameList,userId);
    const relevantDocs = results.filter(result => result.metadata); 
    if (relevantDocs.length === 0) {
      return { error: CommonMessages.NOT_FOUND_ERROR,StatusCodes : StatusCodes.NOT_FOUND};
    }
    const contextChunks = relevantDocs.map((match) => match.metadata.text.substring(0, 1000)); // Limit each context chunk
    const context = contextChunks.join("\n");
    
    return { context : context,StatusCodes : StatusCodes.OK} ;

  } catch (error) {
    console.error(error);
    
    return { error: CommonMessages.NOT_FOUND_ERROR,StatusCodes : StatusCodes.INTERNAL_SERVER_ERROR};
  }
};

/**
 * @async
 * @function ragImplementation
 * @description implemented RAG based prompt answering
 * @param {Object} req - Request object. Should contain the following parameters in body: { query, userId } where query is the prompt
 * @param {Object} res - will send the query answer
 * @returns {Response} 200 - as successfully answer propmts 
 * @throws {Error} Will throw an error if answering failed
 */
export const ragImplementation = async (req, res) => {
  try {
    const { query, userId } = req.body;
    const embeddingsWithIds = await getEmbedding(query);
    const results = await queryPinecone(embeddingsWithIds, userId);

    const relevantDocs = results.filter(result => result.metadata); // Ensure only results with metadata are processed

    if (relevantDocs.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({ error:CommonMessages.NOT_FOUND });
    }
    const contextChunks = relevantDocs.map((match) => match.metadata.text.substring(0, 1000)); // Limit each context chunk
    const context = contextChunks.join("\n");

    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: `Based on the following documents, answer the question: ${query}\n\nDocuments:\n${context}` }
    ];

    const response = await chatResponse(messages);

    const answer = response.choices[0].message.content;
    return res.status(StatusCodes.OK).json({ answer,message : KnowledgeBaseMessages.MESSAGE_SUCCESS });

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: CommonMessages.INTERNAL_SERVER_ERROR});
  }
};
