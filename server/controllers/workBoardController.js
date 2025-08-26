import { StatusCodes } from 'http-status-codes';
import { WorkBoardMessages } from '../constants/enums.js';
import { deleteUseCaseData, deleteWorkBoardActionItemsService, fetchWorkBoardAccessToken,  fetchWorkBoardUserInfo, generateActivitiesDoc, getPersosnalWorkStreamActionItems, getRecentWorkStreamBasedWBAiService, getSignleWorkboardSyncInfo, getUserBasedWorkBoardActivityService, getUsersAllActionItemService, getWorkBoardAccessToken, getWorkBoardActivityService, getWorkBoardGoalService, getWorkBoardTeamService, getWorkBoardUserGoalService, getWorkStreamBasedWBAiService, getWorkStreamList, getWorkStreamListWithInfo, upsertWorkBoardSyncData } from '../service/workBoardService.js';
import { createOrUpdateAppAuthService, deleteAppAuthCredentialService, getGoogleAuthCredentialService } from '../service/googleAuthService.js';
import { createSingleKnowledgeBaseService, deleteFileIdsFromKnowledgeBaseAssistant, replaceCharacters, updateFileIdsInKnowledgeBaseAssistant } from '../service/knowledgeBase.js';
import { getOpenAIInstance } from '../config/openAI.js';
import { deleteFilesVectorStore, getAssistantByIdOrAssistantIdService, getSingleAssistantByIdService, updateAssistantFileIds } from '../service/assistantService.js';
import { createOpenAIFileObject, deleteAssistantFileByID, doesAssistantExist, retrieveAssistantFromOpenAI } from '../lib/openai.js';
import { extractWorkBoardIdFromQuestion } from '../utils/googleDriveHelperFunctions.js';
import { uploadFilesToVectorStore } from '../lib/vectorStore.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mime from 'mime';
import { ensureDirectoryExistence } from '../lib/s3.js';
import { deleteLocalFile, uploadFiles } from '../utils/assistant.js';
import { uploadToS3Bucket } from '../lib/s3.js';

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getWorkBoardAccess = async (req, res) => {
  const { code,redirectUri,userId } = req.body;
  try {
    const response = await fetchWorkBoardAccessToken(code, redirectUri);

    if (response.data.success) {
      const { access_token, refresh_token, scope, token_type } = response.data;
      const appName ="work-board";
      const storeWorkBoardCredentials = await createOrUpdateAppAuthService(userId,code,access_token,refresh_token,appName);
      res.status(StatusCodes.OK).json({
        accessToken: access_token,
        refreshToken: refresh_token,
        scope: scope,
        tokenType: token_type,
        message: WorkBoardMessages.WORKBOARD_FETCHED_SUCCESSFULLY,
      });
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FAILED_TO_FETCH_WORKBOARD_ACCESS_TOKEN,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FAILED_TO_FETCH_WORKBOARD_ACCESS_TOKEN,
    });
  }
};

export const getWorkBoardUserInfo = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const response = await fetchWorkBoardUserInfo(accessToken);

    if (response.data.success) {
      res.status(StatusCodes.OK).json({
        ...response.data,
        message: WorkBoardMessages.USER_INFO_FETCHED_SUCCESSFULLY,
      });
    } else {
      console.error(WorkBoardMessages.FETCH_USER_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_USER_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_USER_INFO_ERROR,
    });
  }
};

// 

//----------------
export const getWorkBoardGoal = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const data = await getWorkBoardGoalService(accessToken);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_GOAL_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_GOAL_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_GOAL_INFO_ERROR,
    });
  }
};

//----------------
export const syncWorkBoardActivity = async (req, res) => {
  const {userId} =req.params;
  try {
    const data = await getWorkBoardActivityService(userId);
    if (data) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error('Failed to retrieve activity information');
      res.status(StatusCodes.BAD_REQUEST).json({
        message:  WorkBoardMessages.FETCH_ACTIVITY_INFO_ERROR,
      });
    }
  } catch (error) {
    console.error('Error fetching activity information:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:  WorkBoardMessages.FETCH_ACTIVITY_INFO_ERROR,
    });
  }
};

export const getWorkBoardActivity = async (req, res) => {
  const {userId} =req.params;
  try {
    const data = await getUsersAllActionItemService(userId);

      res.status(StatusCodes.OK).json({data: data||null,message : WorkBoardMessages.WORKBOARD_ACTION_ITEM_FETCHED_SUCCESSFULLY});

  } catch (error) {
    console.error('Error fetching activity information:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_ACTIVITY_INFO_ERROR,
    });
  }
};
//----------------
export const getWorkBoardTeam = async (req, res) => {
  const { accessToken } = req.body;

  try {
    const data = await getWorkBoardTeamService(accessToken);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_TEAM_INFO_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_TEAM_INFO_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_TEAM_INFO_ERROR,
    });
  }
};

//----------------
export const getWorkBoardUserGoal = async (req, res) => {
  const { accessToken, userId } = req.body;

  try {
    const data = await getWorkBoardUserGoalService(accessToken, userId);

    if (data.success) {
      res.status(StatusCodes.OK).json(data);
    } else {
      console.error(WorkBoardMessages.FETCH_USER_GOALS_FAILED);
      res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.FETCH_USER_GOALS_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_USER_GOALS_ERROR,
    });
  }
};

export const createWorkBoardKnowledgeBase = async (req, res) => {
  const { name,url,userId,parentId =  null } = req.body;

  try {
    let workBoardTitle = '';
    if(name ===''){
      let ids = []
      ids = extractWorkBoardIdFromQuestion(url);
      const workBoardInfo =  await getUserBasedWorkBoardActivityService(userId,ids[0]);
      workBoardTitle = workBoardInfo.data.activity.ai_description;

    }else{
      workBoardTitle = name;
    }
    const nameWithoutForwardSlash = workBoardTitle.replace('/','-');
    const { resultFileName, replacedIndices }= replaceCharacters(nameWithoutForwardSlash);
    let fileName = resultFileName;
    fileName =fileName +'.ai'
    const s3_link = "knowledgeBase/" + fileName;
    const data = await createSingleKnowledgeBaseService(fileName, 0, s3_link, userId,replacedIndices,url,parentId);

    if (data) {
      return res.status(StatusCodes.OK).json({data,message: WorkBoardMessages.WORKBOARD_CREATE_KNOWLEDGE_BASE_SUCCESSFUL});
    } else {
      console.error(WorkBoardMessages.WORKBOARD_CREATE_KNOWLEDGE_BASE_FAILED);
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: WorkBoardMessages.WORKBOARD_CREATE_KNOWLEDGE_BASE_FAILED,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_USER_GOALS_ERROR,
    });
  }
};

export const getWorkBoardCredentials =async (req,res)=>{
  const {userId} = req.params;
  try {
    const workBoardAuthData = await getWorkBoardAccessToken(userId);
    if (workBoardAuthData?.success) {
      res.status(StatusCodes.OK).json({accessToken:workBoardAuthData?.data?.accessToken || null,refreshToken:workBoardAuthData?.data?.refreshToken || null});
    } else {
      console.error('Failed to retrieve user goals');
      res.status(StatusCodes.OK).json({
        message:  WorkBoardMessages.WORKBOARD_IS_NOT_CONNECTED,
      });
    }
  } catch (error) {
    console.error('Error fetching user goals:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FAILED_TO_FETCH_WORKBOARD_ACCESS_TOKEN,
    });
  }

}
export const deleteWorkBoardAuthCredentials = async (req, res) => {
  const { userId } = req.params;
  try {
    const credentialsOfWorkBoardAuth = await deleteAppAuthCredentialService(userId,"work-board");
    const deleteWorkBoardActionItemsFromDB = await deleteWorkBoardActionItemsService(userId);
    return res.status(StatusCodes.OK).json({ success: true, message: WorkBoardMessages.WORKBOARD_CREDENTIALS_DELETED_SUCCESSFULLY });
  } catch (err) {
    console.error('Error listing other files:', err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ Error: err, message: CommonMessages.INTERNAL_SERVER_ERROR, success: false, });

  }
}
export const syncWorkBoardStreamData = async (fileId) => {
  const openai = await getOpenAIInstance();

  let files = [];
  const isWorkBoardSyncInfoExist = await getSignleWorkboardSyncInfo(fileId);

  if (isWorkBoardSyncInfoExist) {
    const useCaseArray = isWorkBoardSyncInfoExist?.useCaseData;
    for (const useCase of useCaseArray) {
      const assistantSettings = await getAssistantByIdOrAssistantIdService(
        useCase?.assistantId
      );
      const isExistingOpenAIAssistant = await doesAssistantExist(
        openai,
        assistantSettings?.assistant_id
      );

      const assistantInfoFromOpenAI = isExistingOpenAIAssistant
        ? await retrieveAssistantFromOpenAI(
            openai,
            assistantSettings?.assistant_id
          )
        : null;
      const fileIds = isExistingOpenAIAssistant
        ? assistantSettings?.file_ids
        : [];
      if (fileIds.includes(useCase?.opeanaiFileId)) {
        let newFileIds = fileIds.filter((id) => id !== useCase?.opeanaiFileId);
        const updateFileIds = await updateAssistantFileIds(
          assistantSettings?.assistant_id,
          newFileIds
        );
        if (isExistingOpenAIAssistant) {
          const responseOfFileIdsDelete = await deleteAssistantFileByID(
            openai,
            assistantSettings?.assistant_id,
            useCase?.opeanaiFileId
          );
          const deletedVectorStoreFile = await deleteFilesVectorStore(
            openai,
            assistantSettings?.vectorStoreId,
            useCase?.opeanaiFileId
          );
          const deleteFromSyncTable = await deleteUseCaseData(
            fileId,
            assistantSettings?._id
          );
          const fileInfo = {
            file_id: useCase?.opeanaiFileId,
            key: fileId,
          };
          const deleteFromKnowledgeBaseAssistant =
            await deleteFileIdsFromKnowledgeBaseAssistant(
              assistantSettings?.assistant_id,
              fileInfo
            );
        }
        const assistantInformation = [];
        const ids = extractWorkBoardIdFromQuestion(
          isWorkBoardSyncInfoExist?.knowledgeBaseId?.url
        );

        if (fileId) {
          const workBoardActionItemJson =
            await getUserBasedWorkBoardActivityService(
              isWorkBoardSyncInfoExist?.knowledgeBaseId?.owner,
              fileId
            );
          const directoryPath = path.join(__dirname, "../docs", "downloads");
          const nameOfFile = isWorkBoardSyncInfoExist?.knowledgeBaseId?.name;
          const lastDotIndex = nameOfFile?.lastIndexOf(".");
          let namePart = nameOfFile;
          // const fileName = namePart + ".json";
          const fileName = nameOfFile;
          const filePath = path.join(directoryPath, fileName);
          ensureDirectoryExistence(filePath);
          fs.mkdirSync(directoryPath, { recursive: true });
          fs.writeFileSync(
            filePath,
            JSON.stringify(workBoardActionItemJson, null, 2),
            "utf8"
          );
          let fileSizeInBytes = 0;
          let encodingInfo = "N/A";

          const fileObject = {
            fieldname: "files",
            originalname: isWorkBoardSyncInfoExist?.knowledgeBaseId?.name,
            encoding: encodingInfo,
            mimetype: mime.getType(
              isWorkBoardSyncInfoExist?.knowledgeBaseId?.name
            ),
            destination: "../docs/downloads/",
            filename: isWorkBoardSyncInfoExist?.knowledgeBaseId?.name,
            path: filePath,
            size: fileSizeInBytes,
            key: isWorkBoardSyncInfoExist?.knowledgeBaseId?._id,
          };
          files.push(fileObject);
          if (files) {
            const assistantInformation = [];
            const newFileIdsFromOpenai = await uploadFiles(
              openai,
              files,
              assistantInformation
            );
            const uploadedFilesToVectorStore = await uploadFilesToVectorStore(
              openai,
              assistantSettings?.vectorStoreId,
              newFileIdsFromOpenai
            );

            const fileIds = [...newFileIds, ...newFileIdsFromOpenai];
            Promise.all(files.map(deleteLocalFile))
              .then(() => console.log("All files deleted"))
              .catch((err) =>
                console.error("Failed to delete some files:", err)
              );
            const updateFileIdsOfAssistant = await updateAssistantFileIds(
              assistantSettings?.assistant_id,
              fileIds
            );
            const newUseCaseData = {
              opeanaiFileId: newFileIdsFromOpenai[0],
              assistantId: useCase?.assistantId,
              userId: useCase?.userId,
            };
            const updateWorkBoarSyncUseCase = await upsertWorkBoardSyncData(
              fileId,
              newUseCaseData
            );
            const assistantNewFileInfo = {
              file_id: newFileIdsFromOpenai[0],
              key: fileId,
            };
            const updateFileIdsInKBAssistant =
              await updateFileIdsInKnowledgeBaseAssistant(
                assistantSettings?.assistant_id,
                assistantNewFileInfo
              );
          }
        }
      }
    }
    return
  }
};
export const syncWorkBoardKnowledgeBase = async (req, res) => {
  const { fileId } = req.params;
  const openai = await getOpenAIInstance();

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
          const assistantInformation = [];
          const ids = extractWorkBoardIdFromQuestion(isWorkBoardSyncInfoExist?.knowledgeBaseId?.url);

          if (ids?.length > 0) {

            const workBoardActionItemJson = await getUserBasedWorkBoardActivityService(isWorkBoardSyncInfoExist?.knowledgeBaseId?.owner, ids[0]);
            const directoryPath = path.join(__dirname, '../docs', 'downloads');
            const nameOfFile = isWorkBoardSyncInfoExist?.knowledgeBaseId?.name
            const lastDotIndex = nameOfFile?.lastIndexOf('.');
            let namePart = nameOfFile;
            const fileName = namePart + '.json'
            const filePath = path.join(directoryPath, fileName);
            ensureDirectoryExistence(filePath);
            fs.mkdirSync(directoryPath, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify(workBoardActionItemJson, null, 2), 'utf8');
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

    }
    return res.status(StatusCodes.OK).json({ message: WorkBoardMessages.WORKBOARD_CREATE_KNOWLEDGE_BASE_SUCCESSFUL });

  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: WorkBoardMessages.FETCH_USER_GOALS_ERROR,
    });
  }
};

export const getAllWorkStream = async (req,res)=>{
  const {userId} =req.params;
  try {
  const workBoardAuthCredentials = await getWorkBoardAccessToken(userId);
  const getWorkStreamActivityIdList = await getWorkStreamListWithInfo(workBoardAuthCredentials?.data?.accessToken,userId);
  if (getWorkStreamActivityIdList) {
      res.status(StatusCodes.OK).json({
        data:getWorkStreamActivityIdList,
        message : WorkBoardMessages.WORKSTREAM_FETCHED_SUCCESSFULLY
      });
    } else {
      console.error('Failed to retrieve work stream information');
      res.status(StatusCodes.BAD_REQUEST).json({
        message:  WorkBoardMessages.WORKSTREAM_FETCHING_FAILED,
      });
    }
  } catch (error) {
    console.error('Error fetching work stream information:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:  WorkBoardMessages.WORKSTREAM_FETCHING_FAILED,
    });
  }

}
export const syncWorkBoardStream = async (req, res) => {
  const {userId} =req.params;
  const {wsId,wsTitle} =req.body;
  
  try {
    let data = [];
    if(wsTitle === 'personal'){
      data = await getPersosnalWorkStreamActionItems(userId)
    }else if(wsTitle === 'Recent'){
      data = await getRecentWorkStreamBasedWBAiService(userId,wsId,wsTitle);
    }else{
      data = await getWorkStreamBasedWBAiService(userId,wsId,wsTitle);
    }
    const fileName = `${wsTitle}-workstream-action-items.docx`;
    const filePath = path.join(__dirname, "../docs",fileName );
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await generateActivitiesDoc(data, filePath);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    // Create file buffer for S3 upload
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = mime.getType(fileName) || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    // Upload to S3
    const s3_link = await uploadToS3Bucket(fileName, fileBuffer, contentType, userId);
    const owner = userId;
    const spaceIndexes = [];
    const url = null;
    let parentId = null;
    const isKnowledgeBaseShareable = false;
    const isFileShared = false;
    const sharedFolderOwner = null;
    const createFolder = await createSingleKnowledgeBaseService("work-board-action-items", 0, s3_link, owner, spaceIndexes, url);
    parentId = createFolder?._id || null;
    const knowledgeBaseInfo = await createSingleKnowledgeBaseService(fileName, size, s3_link, owner,spaceIndexes,url, parentId, isKnowledgeBaseShareable, isFileShared, sharedFolderOwner);
    const syncData = await syncWorkBoardStreamData(knowledgeBaseInfo._id);

    // Delete the local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (data) {
      res.status(StatusCodes.OK).json({
        data,
        message : WorkBoardMessages.WORKSTREAM_AI_FETCHED_SUCCESSFULLY});
    } else {
      console.error('Failed to retrieve activity information');
      res.status(StatusCodes.BAD_REQUEST).json({
        message:  WorkBoardMessages.WORKSTREAM_AI_FETCHING_FAILED,
      });
    }
  } catch (error) {
    console.error('Error fetching activity information:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message:  WorkBoardMessages.WORKSTREAM_AI_FETCHING_FAILED,
    });
  }
};

function sanitizeFileName(name) {
  return name.replace(/[:*?"<>|\\\/]/g, '-');
}
export const syncWorkBoardStreamWithCron = async (userId, wsId,wsTitle) => {
      let data = [];
    if(wsTitle === 'personal'){
      data = await getPersosnalWorkStreamActionItems(userId)

    }else{
      // data = await getWorkStreamBasedWBAiService(userId,wsId,wsTitle);
      data = []
    }

    const safeFileName = sanitizeFileName(`${wsTitle}-workstream-action-items.docx`);
    const filePath = path.join(__dirname, "../docs",safeFileName );
    const fileName = safeFileName
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    await generateActivitiesDoc(data, filePath);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    // Create file buffer for S3 upload
    const fileBuffer = fs.readFileSync(filePath);
    const contentType = mime.getType(fileName) || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    // Upload to S3
    const s3_link = await uploadToS3Bucket(fileName, fileBuffer, contentType, userId);
    const owner = userId;
    const spaceIndexes = [];
    const url = null;
    let parentId = null;
    const isKnowledgeBaseShareable = false;
    const isFileShared = false;
    const sharedFolderOwner = null;
    const createFolder = await createSingleKnowledgeBaseService("work-board-action-items", 0, s3_link, owner, spaceIndexes, url);
    parentId = createFolder?._id || null;
    await createSingleKnowledgeBaseService(fileName, size, s3_link, owner,spaceIndexes,url, parentId, isKnowledgeBaseShareable, isFileShared, sharedFolderOwner);
    
    // Delete the local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    if (data) {
        return data
    } else {
      console.error('Failed to retrieve activity information');
      return null

    }

};
