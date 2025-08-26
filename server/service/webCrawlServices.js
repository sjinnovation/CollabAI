import { ensureDirectoryExistence, uploadToS3Bucket } from "../lib/s3.js";
import WebCrawlKnowledgeBase from "../models/webCrawlKnowledgeBase.js";
import { createSingleKnowledgeBaseService, deleteFileIdsFromKnowledgeBaseAssistant, replaceCharacters, updateFileIdsInKnowledgeBaseAssistant } from "./knowledgeBase.js";
import fs from 'fs';
import { deleteUseCaseData, getSignleWorkboardSyncInfo, getUserBasedWorkBoardActivityService, insertWorkBoardSyncData, upsertWorkBoardSyncData } from "./workBoardService.js";
import { getOpenAIInstance } from "../config/openAI.js";
import { deleteFilesVectorStore, getAssistantByIdOrAssistantIdService, updateAssistantFileIds } from "./assistantService.js";
import { deleteAssistantFileByID, doesAssistantExist, retrieveAssistantFromOpenAI } from "../lib/openai.js";
import { extractWorkBoardIdFromQuestion } from "../utils/googleDriveHelperFunctions.js";
import { deleteLocalFile, uploadFiles } from "../utils/assistant.js";
import { uploadFilesToVectorStore } from "../lib/vectorStore.js";
import path, { dirname } from 'path';
import { fileURLToPath } from "url";
import mime from 'mime';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const saveCrawlMarkdownAsJsonToS3 = async (markdownPages, baseUrl, userId) => {
  try {
    let folderName = urlToFolderName(baseUrl);  // Convert URL to folder name
    folderName = folderName.trim();
    const folderNameWithSpaces = folderName;

    const titleCount = {};  // Track counts for duplicate titles
    let webCrawlInfo = [];
    const { resultFileName, replacedIndices } = replaceCharacters(folderNameWithSpaces);
    const s3FolderName = 'knowledgeBase/' + userId + "/" + resultFileName;

    const pageInfo = {
      name: resultFileName,
      owner: userId,
      s3_link: s3FolderName,
      isPublic: false,
      spaceIndex: replacedIndices,
      title: resultFileName,
      url: baseUrl,
      size : 0,
      createdAt: new Date(),
    }
    webCrawlInfo.push(pageInfo);

    // Loop through each page and save it to S3 in the designated folder
    const uploadPromises = markdownPages.map(async (pageContent, index) => {
      let ogTitle = '';
      let ogUrl = '';

      if (pageContent?.metadata?.ogTitle) {
        ogTitle = pageContent?.metadata?.ogTitle;
        ogUrl = pageContent?.metadata?.ogUrl;
      } else if (pageContent?.metadata?.title) {
        ogTitle = pageContent?.metadata?.title;
        ogUrl = pageContent?.metadata?.ogUrl || null;
      } else {
        ogTitle = `page${index + 1}`;
        ogUrl = pageContent?.metadata?.ogUrl || null;
      }
      let formattedTitle = formatTitleForFilename(ogTitle);
      // Check if the title has already been used; if so, add a count to make it unique
      if (titleCount[formattedTitle]) {
        titleCount[formattedTitle] += 1;
        formattedTitle = titleCount[formattedTitle] > 1 ? `${formattedTitle}_${titleCount[formattedTitle]}` : formattedTitle;
      } else {
        titleCount[formattedTitle] = 1;
      }
      // Convert page content to JSON format
      const jsonData = {
        userId: userId,
        url: ogUrl,
        title: ogTitle,
        timestamp: new Date().toISOString(),
        content: pageContent
      };

      // Convert JSON data to buffer for S3 upload
      const fileBuffer = Buffer.from(JSON.stringify(jsonData), 'utf-8');
      const sizeInBytes = Buffer.byteLength(JSON.stringify(jsonData), 'utf8');

      const contentType = 'application/json';
      const fileNameWithSpace = `${folderNameWithSpaces}/${formattedTitle}.json`;

      // Generate a file name for each page, falling back to "page<number>" if no title is available
      const { resultFileName, replacedIndices } = replaceCharacters(fileNameWithSpace);
      const fileName = resultFileName;

      const s3FileName = 'knowledgeBase/' + userId + "/" + fileName; // Ensure a unique file name
      const pageInfo = {
        name: fileName,
        size: sizeInBytes,
        owner: userId,
        s3_link: s3FileName,
        isPublic: false,
        spaceIndex: replacedIndices,
        title: ogTitle,
        url: ogUrl,
        content: pageContent,
        createdAt: new Date(),
      }
      webCrawlInfo.push(pageInfo);
      // Upload JSON file to S3 within the designated folder
      return await uploadToS3Bucket(fileName, fileBuffer, contentType, userId);
    });

    const uploadResults = await Promise.all(uploadPromises);
    return webCrawlInfo;
  } catch (error) {
    console.error("Error saving JSON files to S3:", error);
    throw new Error("Error saving JSON files to S3");
  }
};

// Helper function to format title to be S3-friendly
export const formatTitleForFilename = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')  // Replace non-alphanumeric characters with underscores
    .substring(0, 70);            // Limit length to 50 characters for brevity
};

export const urlToFilename = (url) => {
  return url.replace(/https?:\/\//, '')
    .replace(/[^\w\s-]/g, '_')
    .replace(/\s+/g, '_')
    .concat('.json');
};

export const urlToFolderName = (url) => {
  return url
    .replace(/https?:\/\//, '')         // Remove protocol
    .replace(/[^\w\s-]+/g, ' ')         // Replace special characters with a dash
    .replace(/\s+/g, ' ')               // Replace multiple spaces with a single space
    .trim();                            // Trim spaces at the beginning and end
};


export const storeWebCrawlInfoToDBService = async (webCrawlInfo, userId, baseUrl, storedKBIds = [],parentId) => {
  const webCrawlStorePromises = webCrawlInfo.map(async (info, index) => {
    const storeInKnowledgeBase = await createSingleKnowledgeBaseService(info.name, info.size, info.s3_link, info.owner, info.spaceIndex, baseUrl,parentId);
    if (storeInKnowledgeBase) {
      storedKBIds.push({
        key: storeInKnowledgeBase?._id.toString(),
        content: info.content,
        name: info.name,
      }
      );
      await insertWorkBoardSyncData(storeInKnowledgeBase?._id, [])
    }
    return await createWebCrawlCollection(info, userId);
  });
  const webCrawlCollectionCreateResult = await Promise.all(webCrawlStorePromises);
  return webCrawlCollectionCreateResult
};
export const storeWebCrawlFolderInfoToDBService = async (info,userId,baseUrl,parentId = null, isKnowledgeBaseShareable = false, isFileShared = false, sharedFolderOwner = null ) => {
  
    const storeInKnowledgeBase = await createSingleKnowledgeBaseService(info.name, info.size, info.s3_link, info.owner,info.spaceIndex,baseUrl,parentId,isKnowledgeBaseShareable,isFileShared,sharedFolderOwner);
    const storeWebCrawlCollection=await createWebCrawlCollection(info,userId);
  return storeInKnowledgeBase
};
export const createWebCrawlCollection = async (info,userId) => {
  return await WebCrawlKnowledgeBase.updateOne({ owner: userId, url: info?.url }, info, { upsert: true });
};
export const readJsonFile = async (filePath) => {
  return await new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        reject(err);
      }

      try {
        const jsonData = JSON.parse(data); // Parse JSON string into object
        resolve(jsonData);
      } catch (parseErr) {
        console.error('Error parsing JSON:', parseErr);
        reject(parseErr);
      }
    });
  });
};
export const deleteAllWebCrawledCollection = async (userId) => {
  const deleteResponse = await WebCrawlKnowledgeBase.deleteMany({ owner: userId });
  return deleteResponse;
};


export const syncWebCrawlKnowledgeBase = async (idInfo) => {
  const openai = await getOpenAIInstance();
  const { key: fileId, content, name } = idInfo;
  try {
    let files = [];
    const isWorkBoardSyncInfoExist = await getSignleWorkboardSyncInfo(fileId);
    if (isWorkBoardSyncInfoExist) {
      const useCaseArray = isWorkBoardSyncInfoExist?.useCaseData;
      for (const useCase of useCaseArray) {
        const assistantSettings = await getAssistantByIdOrAssistantIdService(useCase?.assistantId);
        const isExistingOpenAIAssistant = await doesAssistantExist(openai, assistantSettings?.assistant_id);

        const assistantInfoFromOpenAI = isExistingOpenAIAssistant ? await retrieveAssistantFromOpenAI(openai, assistantSettings?.assistant_id) : null;
        const fileIds = isExistingOpenAIAssistant ? assistantSettings?.file_ids : [];
        if (fileIds.includes(useCase?.opeanaiFileId)) {
          let newFileIds = fileIds.filter(id => id !== useCase?.opeanaiFileId);
          const updateFileIds = await updateAssistantFileIds(assistantSettings?.assistant_id, newFileIds);
          if (isExistingOpenAIAssistant) {
            const responseOfFileIdsDelete = await deleteAssistantFileByID(openai, assistantSettings?.assistant_id, useCase?.opeanaiFileId);
            const deletedVectorStoreFile = await deleteFilesVectorStore(
              openai,
              assistantSettings?.vectorStoreId,
              useCase?.opeanaiFileId
            );
            const deleteFromSyncTable = await deleteUseCaseData(fileId, assistantSettings?._id);
            const fileInfo = {
              file_id: useCase?.opeanaiFileId,
              key: fileId

            };
            const deleteFromKnowledgeBaseAssistant = await deleteFileIdsFromKnowledgeBaseAssistant(assistantSettings?.assistant_id, fileInfo);
          }

          const directoryPath = path.join(__dirname, '../docs', 'downloads');
          const nameOfFile = isWorkBoardSyncInfoExist?.knowledgeBaseId?.name
          const lastDotIndex = nameOfFile?.lastIndexOf('.');
          let namePart = nameOfFile;
          const fileName = namePart + '.json'
          const filePath = path.join(directoryPath, fileName);
          ensureDirectoryExistence(filePath);
          fs.mkdirSync(directoryPath, { recursive: true });
          fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
          let fileSizeInBytes = 0;
          let encodingInfo = 'N/A';

          const fileObject = {
            fieldname: 'files',
            originalname: isWorkBoardSyncInfoExist?.knowledgeBaseId?.name,
            encoding: encodingInfo,
            mimetype: mime.getType(isWorkBoardSyncInfoExist?.knowledgeBaseId?.name),
            destination: '../docs/downloads/',
            filename: isWorkBoardSyncInfoExist?.knowledgeBaseId?.name,
            path: filePath,
            size: fileSizeInBytes,
            key: isWorkBoardSyncInfoExist?.knowledgeBaseId?._id
          };
          files.push(fileObject);
          if (files) {
            const assistantInformation = [];
            const newFileIdsFromOpenai = await uploadFiles(openai, files, assistantInformation);
            const uploadedFilesToVectorStore = await uploadFilesToVectorStore(openai, assistantSettings?.vectorStoreId, newFileIdsFromOpenai)

            const fileIds = [...newFileIds, ...newFileIdsFromOpenai];
            Promise.all(files.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
            const updateFileIdsOfAssistant = await updateAssistantFileIds(assistantSettings?.assistant_id, fileIds);
            const newUseCaseData = {
              opeanaiFileId: newFileIdsFromOpenai[0],
              assistantId: useCase?.assistantId,
              userId: useCase?.userId
            }
            const updateWorkBoarSyncUseCase = await upsertWorkBoardSyncData(fileId, newUseCaseData);
            const assistantNewFileInfo = {
              file_id: newFileIdsFromOpenai[0],
              key: fileId
            };
            const updateFileIdsInKBAssistant = await updateFileIdsInKnowledgeBaseAssistant(assistantSettings?.assistant_id, assistantNewFileInfo);

          }
        }

      }

    }
    return true

  } catch (error) {
    console.error(error);
    return false
  }
};