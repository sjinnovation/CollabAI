import connectAppsAuth from "../models/connectAppsAuthModel.js";
import jwtDecode from 'jwt-decode';
import { deleteUseCaseData, getSignleWorkboardSyncInfo, upsertWorkBoardSyncData } from "./workBoardService.js";
import { deleteFilesVectorStore, getAssistantByIdOrAssistantIdService, updateAssistantFileIds } from "./assistantService.js";
import { deleteAssistantFileByID, doesAssistantExist, retrieveAssistantFromOpenAI, updateAssistantProperties } from "../lib/openai.js";
import { deleteFileIdsFromKnowledgeBaseAssistant, replaceCharacters, updateFileIdsInKnowledgeBaseAssistant, updateKnowledgeBaseFile } from "./knowledgeBase.js";
import { extractAllGoogleDriveLinks } from "../utils/googleDriveHelperFunctions.js";
import { allMimeTypeToExtension, downloadFile, getFileMetadata } from "../controllers/googleAuth.js";
import { deleteLocalFile, uploadFiles } from "../utils/assistant.js";
import { uploadFilesToVectorStore } from "../lib/vectorStore.js";
import mime from 'mime';
import mimeTypes from 'mime-types';
import fs from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import config from '../config.js';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createOrUpdateAppAuthService=async (userId,code,accessToken,refreshToken,appName="google-drive")=>{
    const filter = { userId: userId,appName:appName };
    const update = { $set: {userId:userId,code : code,accessToken : accessToken,refreshToken:refreshToken,appName:appName} };
    const options = { upsert: true };
    return await connectAppsAuth.updateOne(filter, update, options);
};

export const getGoogleAuthCredentialService = async(userId,appName="google-drive")=>{
    return await connectAppsAuth.findOne({userId : userId,appName:appName });
};
export const setClientCredentials =(client,key,value)=>{
    if(key === "access_token"){
        client.setCredentials({access_token:value});
    }else if(key === "refresh_token"){
        client.setCredentials({refresh_token:value});
    }

};
export const setAccessToken = async (client,refreshToken)=>{
    client.setCredentials({ refresh_token: refreshToken });
    const newTokenResponse = await client.refreshAccessToken();
    const newTokens = newTokenResponse.credentials;
    client.setCredentials({ access_token: newTokens.access_token});
    return newTokens;
};
export const deleteAppAuthCredentialService = async(userId,appName="google-drive")=>{
    return await connectAppsAuth.deleteOne({userId : userId,appName:appName });
};

export const isTokenValid = (token) => {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Time in seconds
      if (decodedToken.exp < currentTime) {
        return false;
      }
      return true;
    } catch (error) {
      console.log('Invalid token:', error);
      return false;
    }
};

export const syncGoogleDriveFiles = async (openai, fileId, userId) => {
  try {
    const isGoogleDriveSyncInfoExist = await getSignleWorkboardSyncInfo(fileId);
    if (isGoogleDriveSyncInfoExist) {
      const useCaseArray = isGoogleDriveSyncInfoExist?.useCaseData;
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
            if (assistantSettings?.vectorStoreId) {
              const deletedVectorStoreFile = await deleteFilesVectorStore(
                openai,
                assistantSettings?.vectorStoreId,
                useCase?.opeanaiFileId
              );
            }

            const deleteFromSyncTable = await deleteUseCaseData(fileId, assistantSettings?._id);
            const fileInfo = {
              file_id: useCase?.opeanaiFileId,
              key: fileId
            };
            const deleteFromKnowledgeBaseAssistant = await deleteFileIdsFromKnowledgeBaseAssistant(assistantSettings?.assistant_id, fileInfo);
          }
          const assistantInformation = [];
          let ids = []
          const links = extractAllGoogleDriveLinks(isGoogleDriveSyncInfoExist?.knowledgeBaseId?.url, ids);

          if (ids?.length > 0) {
            const baseDir = join(__dirname, './../docs/googleDrive');
            if (!fs.existsSync(baseDir)) {
              fs.mkdirSync(baseDir, { recursive: true });
            }
            // const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);
            // if (credentialsOfGoogleAuth) {
            //   const newTokens = await setAccessToken(client, credentialsOfGoogleAuth?.refreshToken);
            // }else{
            //   return false
            // }

            const { fileName, mimeType, fileSize } = await getFileMetadata(ids[0], userId);
            const fileDirectory = await downloadFile(ids[0], fileName, mimeType, baseDir);

            let { resultFileName, replacedIndices } = replaceCharacters(fileName);
            resultFileName = resultFileName.replace(/[\/\\*|"?]/g, ' ');
            const fileExtension = allMimeTypeToExtension[mimeType] || '';
            const lastDotIndex = resultFileName.lastIndexOf('.');
            let namePart = resultFileName;
            let extensionPart = '';

            if (lastDotIndex > 0 && lastDotIndex !== resultFileName.length - 1) {
              namePart = resultFileName.substring(0, lastDotIndex);
              extensionPart = resultFileName.substring(lastDotIndex);
            }
            let fileBaseName = resultFileName;

            fileBaseName = resultFileName + fileExtension;
            // Create knowledge base entry
            const updatedKnowledgeBaseBody = {
              name: fileBaseName,
              size: fileSize,
              spaceIndex: replacedIndices,
            }

            const updateKnowledgeBase = await updateKnowledgeBaseFile(fileId, updatedKnowledgeBaseBody);
            let fileSizeInBytes = 0;
            let encodingInfo = 'N/A';
            let files = [];

            const fileObject = {
              fieldname: 'files',
              originalname: isGoogleDriveSyncInfoExist?.knowledgeBaseId?.name,
              encoding: encodingInfo,
              mimetype: mime.getType(isGoogleDriveSyncInfoExist?.knowledgeBaseId?.name),
              destination: '../docs/googleDrive/',
              filename: isGoogleDriveSyncInfoExist?.knowledgeBaseId?.name,
              path: fileDirectory,
              size: fileSizeInBytes,
              key: isGoogleDriveSyncInfoExist?.knowledgeBaseId?._id
            };
            files.push(fileObject);
            if (files) {
              const assistantInformation = [];
              const newFileIdsFromOpenai = await uploadFiles(openai, files, assistantInformation);
              const fileIds = [...newFileIds, ...newFileIdsFromOpenai];
              const updateData = {
                tool_resources: {
                  "code_interpreter": {
                    "file_ids": fileIds
                  }
                }
              };
              const uploadedFilesToVectorStore = (assistantSettings?.vectorStoreId !== '' && assistantSettings?.vectorStoreId !== ' ' && assistantSettings?.vectorStoreId !== null) ? await uploadFilesToVectorStore(openai, assistantSettings?.vectorStoreId, newFileIdsFromOpenai) : null;
              if (assistantSettings?.tools.filter(tool => tool.type === 'code_interpreter').length > 0) {
                const responseOfCodeInterpreterUpdate = await updateAssistantProperties(openai, assistantSettings?.assistant_id, updateData);
              }
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

    }
    return true;

  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function getGoogleAuthClient() {
  
  const credentials = config.GOOGLE_SPREADSHEET_CREDENTIALS_PATH;
  if(!credentials)
    return;

  const auth = new google.auth.GoogleAuth({
    keyFile: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return await auth.getClient();
}
