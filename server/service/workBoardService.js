import axios from 'axios';
import qs from 'qs';
import { getGoogleAuthCredentialService } from './googleAuthService.js';
import connectAppsAuth from '../models/connectAppsAuthModel.js';
import WorkBoardAI from '../models/workBoardActionItems.js';
import mongoose from 'mongoose';
import WorkBoardSync from '../models/workBoardSyncModel.js';
import KnowledgeBase from '../models/knowledgeBase.js';
import { deleteFilesVectorStore, getAssistantByIdOrAssistantIdService, updateAssistantFileIds } from './assistantService.js';
import { deleteAssistantFileByID, doesAssistantExist, retrieveAssistantFromOpenAI } from '../lib/openai.js';
import { deleteFileIdsFromKnowledgeBaseAssistant, updateFileIdsInKnowledgeBaseAssistant } from './knowledgeBase.js';
import { extractWorkBoardIdFromQuestion } from '../utils/googleDriveHelperFunctions.js';
import { ensureDirectoryExistence } from '../lib/s3.js';
import { deleteLocalFile, uploadFiles } from '../utils/assistant.js';
import { uploadFilesToVectorStore } from '../lib/vectorStore.js';
import mime from 'mime';
import mimeTypes from 'mime-types';
import fs from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Document, Packer, Paragraph, TextRun } from "docx";
import moment from 'moment';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const WorkBoardBaseURL = process.env.WORKBOARD_BASE_URL; 

//----------------
export const fetchWorkBoardAccessToken = async (code, redirectUri) => {
  const clientId = process.env.WORKBOARD_CLIENT_ID;
  const clientHash = process.env.WORKBOARD_CLIENT_HASH;

  const response = await axios.post(`${WorkBoardBaseURL}/oauth/token`, qs.stringify({
    client_id: clientId,
    client_hash: clientHash,
    code: code,
    redirect_uri: redirectUri,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response;
};

//----------------
export const fetchWorkBoardUserInfo = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/user/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  return response;
};


//----------------
export const getWorkBoardGoalService = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/goal/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};

//----------------
export const getWorkBoardActivityService = async (userId) => {
  const workBoardAuthCredentials = await getWorkBoardAccessToken(userId);
  const getWorkStreamActivityIdList = await getWorkStreamList(workBoardAuthCredentials?.data?.accessToken);
  const userInfo = await getUserInfo(workBoardAuthCredentials?.data?.accessToken);

  const response = await axios.get(`${WorkBoardBaseURL}/apis/activity/`, {
    headers: {
      'Authorization': `Bearer ${workBoardAuthCredentials?.data?.accessToken}`,
      'Accept': 'application/json'
    }
  });
  const actionItemData = [];
  const personalActionItem = response?.data?.data?.activity?.map(ai => ({
    description: ai?.ai_description,
    url: ai?.ai_url
  })).flat();

  const promises = getWorkStreamActivityIdList.map(async (id) => {
    const resp = await axios.get(`${WorkBoardBaseURL}/apis/workstream/${id}/activity`, {
      headers: {
        'Authorization': `Bearer ${workBoardAuthCredentials?.data?.accessToken}`,
        'Accept': 'application/json'
      }
    });

    const activities = resp?.data?.data?.workstream?.ws_activity?.activity || [];
    const activitiesWithEmailComments = activities.map(ai => {
      const loopMembers = ai.ai_loop_members || [];
      const commentsWithEmail = (ai.ai_comments || []).map(comment => {
        const owner = loopMembers.find(member => member.user_id === comment.comment_owner);
        return {
          ...comment,
          comment_owner: owner ? owner.user_email : comment.comment_owner
        };
      });
      return {
        ...ai,
        ai_comments: commentsWithEmail
      };
    });

    return activitiesWithEmailComments.filter(ai =>
      ai?.ai_state === "doing" &&
      (
        ai?.ai_loop_members?.some((LoopUser) => LoopUser?.user_email === userInfo?.user_email) ||
        ai?.ai_owner === userInfo?.user_id ||
        ai?.ai_created_by === userInfo?.user_id
      )
    ).map(ai => ({
      description: ai?.ai_description,
      url: ai?.ai_url,
      ai_comments: ai?.ai_comments
    }));
  });

  // Wait for all promises to resolve and flatten the results
  const results = await Promise.all(promises);
  actionItemData.push(...results.flat());


  const allActionItem = { "personal": personalActionItem, "inLoop": actionItemData };
  const insertAIinDB = await WorkBoardAI.updateOne({ userId: userId }, { userId: userId, actionItems: [allActionItem] }, { upsert: true });
  const getData = await getUsersAllActionItemService(userId);

  return allActionItem;
};

export const getUserBasedWorkBoardActivityService = async (userId,activityId) => {
  const getAuth= await getGoogleAuthCredentialService(userId,"work-board");

  const response = await axios.get(`${WorkBoardBaseURL}/apis/activity/${activityId}`, {
    headers: {
      'Authorization': `Bearer ${getAuth.accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};
//----------------
export const getWorkBoardTeamService = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/team/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};

//----------------
export const getWorkBoardUserGoalService = async (accessToken, userId) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/user/${userId}/goal/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};

export const getWorkStreamList =async (accessToken)=>{
const workStreamResponse =  await axios.get(`${WorkBoardBaseURL}/apis/workstream`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }
});
const workStreamList =(workStreamResponse.data.data.workstream.map((ws)=>parseInt(ws.ws_id)));
return workStreamList;
};
export const getWorkStreamListWithInfo =async (accessToken,userId)=>{
  try {

const workStreamResponse =  await axios.get(`${WorkBoardBaseURL}/apis/workstream`, {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Accept': 'application/json'
  }
});
const personal = {
    ws_id: 10000200345678,
    ws_name: "personal",
    ws_team_name: "personal"
  };
  const recent = {
    ws_id: 11111211345678,
    ws_name: "Recent",
    ws_team_name: "Recent"
  };
let allWSlist = workStreamResponse.data.data.workstream.filter(ai=>ai.ws_team_name !=="SJI Global HR Team").map((ai)=>{
  return {
    ws_id: ai.ws_id,
    ws_name : ai.ws_name,
    ws_team_name: ai.ws_team_name,
  }

});
  allWSlist = [personal,recent,...allWSlist ]
const getPreviousWSData = await WorkBoardAI.findOne({userId: userId});
const finalList = allWSlist?.map(ws =>{
  const isSynced = getPreviousWSData?.wsBasedActionItems?.filter(stream => stream.wsId === parseInt(ws.ws_id)) || [];

  return {
    ws_id: ws.ws_id,
    ws_name : ws.ws_name,
    ws_team_name: ws.ws_team_name,
    isSynced : isSynced?.length || ws.ws_name === "personal" ? true :false,
    lastSynced : isSynced?.length || ws.ws_name === "personal"? getPreviousWSData?.updatedAt : null
  }

}) || [];

return finalList;
}catch(error){
  console.error("Error fetching work stream list with info:", error);
  return [];
}
};
export const getWorkStreamActionItemByID =async (accessToken,workStreamId)=>{
  const actionItemList =  await axios.get(`${WorkBoardBaseURL}/apis/workstream/${workStreamId}/activity`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  };
export const getUserInfo = async (accessToken) => {
  const actionItemList = await axios.get(`${WorkBoardBaseURL}/apis/user`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  return { "user_id": actionItemList.data.data.user.user_id, "user_email": actionItemList.data.data.user.email };
};
export const getUsersAllActionItemService = async (userId)=>{
  const allActionItemList = await WorkBoardAI.findOne({userId: userId });
  return allActionItemList?.actionItems;
};

export const addCommentInWorkBoardAI = async (userId,id,comment)=>{
  const workBoardAuthCredentials = await getWorkBoardAccessToken(userId);

  return await axios.put(`https://www.myworkboard.com/wb/apis/activity/${id}`,{
    "ai_comments": [
      {
        "comment" : `${comment}`
      }
    ]
  },
  {
    headers: {
      'Authorization': `Bearer ${workBoardAuthCredentials.data.accessToken}`,
      'Accept': 'application/json'
    }
  })
};
export const getWorkBoardAccessToken = async (userId)=>{
  const workBoardAuth = await connectAppsAuth.findOne({ userId: userId, appName: "work-board" });
  if(workBoardAuth){
    return {success : true,data: workBoardAuth}
  }else{
    return {success : false,data: null}
  }
};
export const deleteWorkBoardActionItemsService = async(userId)=>{
  return await WorkBoardAI.deleteOne({userId : userId});
};
export const insertWorkBoardSyncData = async (knowledgeBaseId,newUseCaseData)=>{
  try {
      const upsertTheWorkBoardSyncInfo = await WorkBoardSync.updateOne(
        { knowledgeBaseId }, 
        {
            $push: { useCaseData: newUseCaseData },
        },
        { upsert: true }
    );
      return upsertTheWorkBoardSyncInfo;
  } catch (error) {
      console.error('Error inserting data:', error);
  }
};
export const isExistingKnowledgeBaseSync = async (KnowledgeBaseId) => {
  return await WorkBoardSync.findOne({ knowledgeBaseId: KnowledgeBaseId });
};

export const getSignleWorkboardSyncInfo =async (fileId)=>{
  const isWorkBoardSyncInfoExist = await WorkBoardSync.findOne({knowledgeBaseId : fileId}).populate({ path: 'knowledgeBaseId', model: KnowledgeBase, select: '_id name owner url' });;
  return isWorkBoardSyncInfoExist;
};
export const saveWorkBoardJsonLocally = async()=>{
  const workBoardActionItemJson = await getUserBasedWorkBoardActivityService(fileRecord[0].owner, ids[0]);
  const directoryPath = path.join(__dirname, '../docs', 'downloads');
  const fileName = namePart + '.json'
  const filePath = path.join(directoryPath, fileName);
  ensureDirectoryExistence(filePath);
  // Ensure the directory exists
  fs.mkdirSync(directoryPath, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(workBoardActionItemJson, null, 2), 'utf8');
  let fileSizeInBytes = 0;
  let encodingInfo = 'N/A';

  const fileObject = {
      fieldname: 'files',
      originalname: fileRecord[0].name,
      encoding: encodingInfo,
      mimetype: mime.getType(fileRecord[0].name),
      destination: '../docs/downloads/',
      filename: fileRecord[0].name,
      path: filePath,
      size: fileSizeInBytes,
      key: fileDetails.key
  };
  if (knowledgeSource === "true" || knowledgeSource === true) {
      ragFiles.push(fileObject);
  } else {
      files.push(fileObject);
  }
};

export const deleteUseCaseData = async (knowledgeBaseId, assistantId) => {
  try {
    const result = await WorkBoardSync.updateOne(
      { knowledgeBaseId },
      {
        $pull: {
          useCaseData: { assistantId: assistantId },
        },
      }
    );

    if (result.modifiedCount > 0) {
      console.log("useCaseData entry deleted successfully:", result);
      return result;
    } else {
      console.log("No matching useCaseData entry found or no changes made.");
      return null;
    }
  } catch (error) {
    console.error("Error deleting useCaseData entry:", error);
    return null;
  }
};
export const upsertWorkBoardSyncData =  async (knowledgeBaseId, newUseCaseData)=>{
  try {
      const result = await WorkBoardSync.updateOne(
          { knowledgeBaseId },
          {
              $push: { useCaseData: newUseCaseData },
          },
          { upsert: true }
      );

      if (result.modifiedCount > 0) {
        console.log("useCaseData entry deleted successfully:", result);
        return result;
      } else {
        console.log("No matching useCaseData entry found or no changes made.");
        return null;
      }
  } catch (error) {
      console.error("Error during upsert:", error);
      return null;

  }
}
export const deleteFileIdFromEverywhere = async (KnowledgeBaseId, fileIds, opeanaiFileId, assistantId, assistantObjectId,vectorStoreId) => {
  let newFileIds = fileIds.filter(id => id !== opeanaiFileId);
  const updateFileIds = await updateAssistantFileIds(assistantId, newFileIds);
  const responseOfFileIdsDelete = await deleteAssistantFileByID(openai, assistantId, opeanaiFileId);
  const deletedVectorStoreFile = await deleteFilesVectorStore(openai,vectorStoreId,opeanaiFileId);
  const deleteFromSyncTable = await deleteUseCaseData(KnowledgeBaseId, assistantObjectId);
  const fileInfo = {
    file_id: opeanaiFileId,
    key: KnowledgeBaseId
  };
  const deleteFromKnowledgeBaseAssistant = await deleteFileIdsFromKnowledgeBaseAssistant(assistantId, fileInfo);
  return deleteFromKnowledgeBaseAssistant;
};

export const syncWorkBoardFiles = async(openai,fileId)=>{
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
    return true;

  } catch (error) {
    console.error(error);
    return false;
  }
}

export const getWorkStreamBasedWBAiService = async (userId, wsId, wsTitle) => {
  const workBoardAuthCredentials = await getWorkBoardAccessToken(userId);
  const getWorkStreamActivityIdList = [wsId];
  const userInfo = await getUserInfo(workBoardAuthCredentials?.data?.accessToken);
  
  let actionItemData = [];

  const promises = getWorkStreamActivityIdList.map(async (id) => {
    const resp = await axios.get(`${WorkBoardBaseURL}/apis/workstream/${id}/activity`, {
      headers: {
        'Authorization': `Bearer ${workBoardAuthCredentials?.data?.accessToken}`,
        'Accept': 'application/json'
      }
    });

    const activities = resp?.data?.data?.workstream?.ws_activity?.activity || [];
    const activitiesWithEmailComments = activities.filter(ai =>
      ai?.ai_state === "doing" &&
      (
        ai?.ai_loop_members?.some((LoopUser) => LoopUser?.user_email === userInfo?.user_email) ||
        ai?.ai_owner === userInfo?.user_id ||
        ai?.ai_created_by === userInfo?.user_id
      )
    ).map(ai => {
      const loopMembers = ai.ai_loop_members || [];
      const commentsWithEmail = (ai.ai_comments || []).map(comment => {
        const owner = loopMembers.find(member => member.user_id === comment.comment_owner);
        return {
          ...comment,
          comment_owner: owner ? owner.user_email : comment.comment_owner
        };
      });
      return {
        ...ai,
        ai_comments: commentsWithEmail
      };
    });

    return activitiesWithEmailComments
  });

  // Wait for all promises to resolve and flatten the results
  const results = await Promise.all(promises);
  actionItemData.push(...results.flat());

  const aiDataWithWorkStream = { wsTitle: wsTitle, wsId: wsId, actionItems: actionItemData }
  const getPreviousWSData = await WorkBoardAI.findOne({ userId: userId });
  const allActionItem = getPreviousWSData?.wsBasedActionItems?.length > 0 ? [...getPreviousWSData.wsBasedActionItems, aiDataWithWorkStream] : [aiDataWithWorkStream]
  const insertAIinDB = await WorkBoardAI.updateOne({ userId: userId }, { userId: userId, wsBasedActionItems: allActionItem }, { upsert: true });
  const getData = await getUsersAllActionItemService(userId);

  return actionItemData;
};


export const generateActivitiesDoc = async (activities, filePath) => {
    const doc = new Document({
        creator: "WorkBoard Sync",
        title: "Workstream Activities",
        sections: activities.map((activity, idx) => {
            // Helper to get value or default
            const getVal = (val, def = "-") => (val !== undefined && val !== null && val !== "" ? val : def);

            return {
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `Activity #${idx + 1}`, bold: true, size: 28 }),
                        ],
                    }),
                    new Paragraph(`ID: ${getVal(activity.ai_id)}`),
                    new Paragraph(`Description: ${getVal(activity.ai_description)}`),
                    new Paragraph(`Created At: ${getVal(activity.ai_created_at)}`),
                    new Paragraph(`State: ${getVal(activity.ai_state)}`),
                    new Paragraph(`Rating: ${getVal(activity.ai_rating)}`),
                    new Paragraph(`Priority: ${getVal(activity.ai_priority)}`),
                    new Paragraph(`Effort: ${getVal(activity.ai_effort)}`),
                    new Paragraph(`Due Date: ${getVal(activity.ai_due_date)}`),
                    new Paragraph(`Workstream: ${getVal(activity.ai_workstream)}`),
                    new Paragraph(`Team: ${getVal(activity.ai_team)}`),
                    new Paragraph(`Workstream Name: ${getVal(activity.ai_workstream_name)}`),
                    new Paragraph(`Tags: ${getVal(activity.ai_tags)}`),
                    new Paragraph(`Due Before: ${getVal(activity.ai_due_before)}`),
                    new Paragraph(`Owner: ${getVal(activity.ai_owner)}`),
                    new Paragraph(`Created By: ${getVal(activity.ai_created_by)}`),
                    new Paragraph(`URL: ${getVal(activity.ai_url)}`),
                    new Paragraph(`Completed At: ${getVal(activity.ai_completed_at)}`),

                    // ai_files
                    new Paragraph({ children: [new TextRun({ text: "Files:", bold: true })] }),
                    ...(Array.isArray(activity.ai_files) && activity.ai_files.length > 0
                        ? activity.ai_files.map(file =>
                            new Paragraph(
                                `  - [${getVal(file.file_id)}] ${getVal(file.file_name)} (${getVal(file.file_url)}) Owner: ${getVal(file.file_owner)}`
                            )
                        )
                        : [new Paragraph("  - None")]),

                    // ai_sub_actions
                    new Paragraph({ children: [new TextRun({ text: "Sub Actions:", bold: true })] }),
                    ...(Array.isArray(activity.ai_sub_actions) && activity.ai_sub_actions.length > 0
                        ? activity.ai_sub_actions.map(sub =>
                            new Paragraph(
                                `  - [${getVal(sub.sub_ai_id)}] ${getVal(sub.sub_ai_description)} Owner: ${getVal(sub.sub_ai_owner)}`
                            )
                        )
                        : [new Paragraph("  - None")]),

                    // ai_comments
                    new Paragraph({ children: [new TextRun({ text: "Comments:", bold: true })] }),
                    ...(Array.isArray(activity.ai_comments) && activity.ai_comments.length > 0
                        ? activity.ai_comments.map(comment =>
                            new Paragraph(
                                `  - [${getVal(comment.comment_id)}] ${getVal(comment.comment)} by ${getVal(comment.comment_owner)} at ${getVal(comment.comment_timestamp)}`
                            )
                        )
                        : [new Paragraph("  - None")]),

                    // ai_loop_members
                    new Paragraph({ children: [new TextRun({ text: "Loop Members:", bold: true })] }),
                    ...(Array.isArray(activity.ai_loop_members) && activity.ai_loop_members.length > 0
                        ? activity.ai_loop_members.map(member =>
                            new Paragraph(
                                `  - ${getVal(member.user_id)} (${getVal(member.user_email)})`
                            )
                        )
                        : [new Paragraph("  - None")]),

                    new Paragraph("") // Empty line for spacing
                ],
            };
        }),
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(filePath, buffer);
}

export const getPersosnalWorkStreamActionItems = async (userId) => {
  const workBoardAuthCredentials = await getWorkBoardAccessToken(userId);
  const response = await axios.get(`${WorkBoardBaseURL}/apis/activity/`, {
    headers: {
      'Authorization': `Bearer ${workBoardAuthCredentials?.data?.accessToken}`,
      'Accept': 'application/json'
    }
  });

  const personalActionItem = response?.data?.data?.activity || [];


  const activitiesWithEmailComments = personalActionItem.map(ai => {
    const loopMembers = ai.ai_loop_members || [];
    const commentsWithEmail = (ai.ai_comments || []).map(comment => {
      const owner = loopMembers.find(member => member.user_id === comment.comment_owner);
      return {
        ...comment,
        comment_owner: owner ? owner.user_email : comment.comment_owner
      };
    });
    return {
      ...ai,
      ai_comments: commentsWithEmail
    };
  });

  return activitiesWithEmailComments;
}

const parsedDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // Custom handler for "hh:mm am/pm Xd ago"
  let relTimeMatch = dateStr.match(/^(\d{1,2}:\d{2}\s*[ap]m)\s*(\d+)d ago$/i);
  if (relTimeMatch) {
    const timePart = relTimeMatch[1];
    const daysAgo = parseInt(relTimeMatch[2], 10);
    let m = moment().startOf('day'); // today at 00:00
    const time = moment(timePart, "hh:mm a");
    if (!time.isValid()) return null;
    m.hour(time.hour()).minute(time.minute());
    m.subtract(daysAgo, 'days');
    return m;
  }

  // Custom handler for "hh:mm am/pm Xh ago"
  relTimeMatch = dateStr.match(/^(\d{1,2}:\d{2}\s*[ap]m)\s*(\d+)h ago$/i);
  if (relTimeMatch) {
    const timePart = relTimeMatch[1];
    const hoursAgo = parseInt(relTimeMatch[2], 10);
    let m = moment().startOf('day');
    const time = moment(timePart, "hh:mm a");
    if (!time.isValid()) return null;
    m.hour(time.hour()).minute(time.minute());
    m.subtract(hoursAgo, 'hours');
    return m;
  }

  // Custom handler for "hh:mm am/pm Xm ago"
  relTimeMatch = dateStr.match(/^(\d{1,2}:\d{2}\s*[ap]m)\s*(\d+)m ago$/i);
  if (relTimeMatch) {
    const timePart = relTimeMatch[1];
    const minutesAgo = parseInt(relTimeMatch[2], 10);
    let m = moment().startOf('day');
    const time = moment(timePart, "hh:mm a");
    if (!time.isValid()) return null;
    m.hour(time.hour()).minute(time.minute());
    m.subtract(minutesAgo, 'minutes');
    return m;
  }

  // Try known formats
  let parsed = moment(dateStr, [
    "YYYY-MM-DD",
    "MMM D, YYYY",
    "HH:mm a MMM D, YYYY",
    "hh:mm a MMM DD, YYYY",
    "MM/DD/YYYY",
    "D d ago"
  ], true);

  if (!parsed.isValid()) {
    parsed = moment(dateStr); // Try generic/ISO parsing
  }
  if (!parsed.isValid()) {
    // Optionally log for analysis
    console.warn("Unrecognized date format:", dateStr);
    return null;
  }
  return parsed;
};
export const getRecentWorkStreamBasedWBAiService = async (userId, wsId, wsTitle) => {
  const workBoardAuthCredentials = await getWorkBoardAccessToken(userId);
  const userInfo = await getUserInfo(workBoardAuthCredentials?.data?.accessToken);
  let getWorkStreamActivityIdList = await getWorkStreamListWithInfo(workBoardAuthCredentials?.data?.accessToken,userId);
  getWorkStreamActivityIdList = getWorkStreamActivityIdList.map(ws=> ws.ws_id).filter(id => id !== 10000200345678 && id !== 11111211345678); // Exclude personal and recent workstreams
  
  let actionItemData = [];
  const now = moment();
  const threeMonthsAgo = now.clone().subtract(3, 'months');

  const promises = getWorkStreamActivityIdList.map(async (id) => {
    const resp = await axios.get(`${WorkBoardBaseURL}/apis/workstream/${id}/activity`, {
      headers: {
        'Authorization': `Bearer ${workBoardAuthCredentials?.data?.accessToken}`,
        'Accept': 'application/json'
      }
    });

    const activities = resp?.data?.data?.workstream?.ws_activity?.activity || [];
    const activitiesWithEmailComments = activities.filter(ai =>
      ai?.ai_state === "doing" &&(
        ai?.ai_loop_members?.some((LoopUser) => LoopUser?.user_email === userInfo?.user_email) ||
        ai?.ai_owner === userInfo?.user_id ||
        ai?.ai_created_by === userInfo?.user_id
      ) && 
      ai.ai_comments.some(commentTime =>{
        const parsedCommentDate  = parsedDate(commentTime.comment_timestamp);

        return parsedCommentDate  && parsedCommentDate?.isBetween(threeMonthsAgo, now, null, '[]');
      })
    ).map(ai => {
      const loopMembers = ai.ai_loop_members || [];
      const commentsWithEmail = (ai.ai_comments || []).map(comment => {
        const owner = loopMembers.find(member => member.user_id === comment.comment_owner);
        return {
          ...comment,
          comment_owner: owner ? owner.user_email : comment.comment_owner
        };
      });

      return {
        ...ai,
        ai_comments: commentsWithEmail
      };
    });

    return activitiesWithEmailComments
  });

  // Wait for all promises to resolve and flatten the results
  const results = await Promise.all(promises);
  actionItemData.push(...results.flat());

  const aiDataWithWorkStream = { wsTitle: wsTitle, wsId: wsId, actionItems: actionItemData }
  const getPreviousWSData = await WorkBoardAI.findOne({ userId: userId });
  const allActionItem = getPreviousWSData?.wsBasedActionItems?.length > 0 ? [...getPreviousWSData.wsBasedActionItems, aiDataWithWorkStream] : [aiDataWithWorkStream]
  const insertAIinDB = await WorkBoardAI.updateOne({ userId: userId }, { userId: userId, wsBasedActionItems: allActionItem }, { upsert: true });
  const getData = await getUsersAllActionItemService(userId);

  return actionItemData;
};