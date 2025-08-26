import { axiosSecureInstance } from './axios';
import { getUserID } from '../Utility/service';
import { ADD_FILE_TO_PROJECTS, ADD_WAITING_FILE_TO_PROJECTS, SINGLE_PROJECT_SLUG } from '../constants/Api_constants';
import { message } from 'antd';
const userId = getUserID();

export const getProjectMessages = async (projectId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/projects/${projectId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project messages:', error);
    throw error;
  }
};

export const saveProjectMessage = async (projectId, messageData) => {
  try {
    const response = await axiosSecureInstance.post(`/api/projects/${projectId}/messages`, messageData);
    return response.data;
  } catch (error) {
    console.error('Error saving project message:', error);
    throw error;
  }
};

export const getProjectParticipants = async (projectId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/projects/${projectId}/participants`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project participants:', error);
    throw error;
  }
};

export const fetchFolders = async (setFolders) => {
  try {
      console.log("fetch folder function getting called");
      const response = await axiosSecureInstance.get(`api/folder-chats/user/${userId}`);
      const sortedFolders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setFolders(sortedFolders);
  } catch (error) {
      console.error('Error fetching folders:', error);
  }
};
export const getProjectInfo = async (projectId) => {
  return await axiosSecureInstance.get(SINGLE_PROJECT_SLUG(projectId));


}
export const updateProjectInfo = async (projectId,updatedProjectData) => {
  return await axiosSecureInstance.patch(SINGLE_PROJECT_SLUG(projectId),updatedProjectData);
}
export const handleFileSubmit =async (projectId,fileList = [],setFileList, selectedFile, setSelectedFile, fetchFolderData, threadId = null,msgId = null,showUploadMassage = true,waitingFile =  false)=>{
  const formData = new FormData();

  // Add other required fields
  formData.append('userId', userId);
  formData.append('folderId', projectId);
  formData.append('threadId', threadId);
  formData.append('msgId', msgId);
  formData.append('waitingFile', waitingFile);
  formData.append('fileNameList', JSON.stringify(selectedFile));

  // Append each file
  fileList.forEach((file) => {
    formData.append('files', 'originFileObj' in file ? file.originFileObj : file);
  });
  const response = await axiosSecureInstance.post(ADD_FILE_TO_PROJECTS, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if(response.status === 200){
    if(showUploadMassage){
      message.success(response.data.message);
    }
    setFileList([]);
    setSelectedFile([]);
    fetchFolderData(projectId)
    return {success: true, response};
  }else{
    message.error(response.error.data.message);
    return {success: false}
  }
  
}

export const handleWaitingFileSubmit =async (projectId,fileList = [],setFileList,threadId = null,msgId = null,showUploadMassage = true)=>{
  const formData = new FormData();

  // Add other required fields
  formData.append('userId', userId);
  formData.append('folderId', projectId);
  formData.append('threadId', threadId);
  formData.append('msgId', msgId);
  // Append each file
  fileList.forEach((file) => {
    formData.append('info',JSON.stringify({ name : file.name,uid : file.uid}));
    console.log("file.originFileObj : ",file);
    formData.append('files', 'originFileObj' in file ? file.originFileObj : file);
  });
  const response = await axiosSecureInstance.post(ADD_WAITING_FILE_TO_PROJECTS, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  if(response.status === 200){
    if(showUploadMassage){
      message.success(response.data.message);
    }
    // setFileList([]);
    return response;
  }else{
    message.error(response.error.data.message);
    return []
  }
  
}
