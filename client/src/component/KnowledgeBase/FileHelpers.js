import { formatToTreeData } from "./FileTree";
import { getAllKnowledgeBase, deleteSingleUsersAllKnowledgeBase, deleteMultipleKnowledgeBase } from "../../api/knowledgeBase";
import { getBase64 } from "./fileToBase64";
import { createKnowledgeBase } from "../../api/knowledgeBase";
import { createVectorOfKnowledgeBase } from "../../api/knowledgeBase";
import { getUserID, getUserRole } from "../../Utility/service";
import { message, Tag, Modal } from 'antd'
import { deleteKnowledgeBase } from "../../api/knowledgeBase";
import { GOOGLE_DRIVE_FILES_TO_KNOWLEDGE_BASE, ONEDRIVE_FILES_TO_KNOWLEDGE_BASE, SHAREPOINT_FILES_TO_KNOWLEDGE_BASE } from "../../constants/Api_constants";
import { axiosSecureInstance } from "../../api/axios";

const userId = getUserID();
const role = getUserRole();
export const getAllFiles = async (setIsAdmin, setAllUsersFileTreeStructure, setFiles, setFolderStructure, setAllPublicData, setPublicFilesStructure, setIsLoading, setIsChecked, page, pageSize, searchQuery, selectedTree, setTableLoading) => {
  try {
    setTableLoading(true);
    if (role === "superadmin") {
      setIsAdmin(true);
      }
    const response = await getAllKnowledgeBase(page, pageSize, searchQuery, selectedTree);
    const fetchedData = response?.data || null;
    const allPublicFiles = response?.allPublicKnowledgeBase || null;
    const treeData = response?.treeData;
    const publicTreeData = response?.publicTreeData;

    if(response?.data){
      setFolderStructure(treeData);
    }else if(response?.allUserData){
      setAllUsersFileTreeStructure(treeData);
    }
    if(allPublicFiles){
      setPublicFilesStructure(publicTreeData);
      setAllPublicData(allPublicFiles);
    }

    setFiles([fetchedData]);
    setIsLoading(false);
    setIsChecked(false);
    setTableLoading(false);
    return true;
  } catch (error) {
    setTableLoading(false);
    setIsLoading(false);
    console.error('Error fetching files:', error);
  }
};

export const deleteAllKnowledgeBaseOfaUser = async (userId, serSelectedRows, serFolderStructure) => {
  try {
    const response = await deleteSingleUsersAllKnowledgeBase(userId);
    message.success(response.message)
    serSelectedRows([]);
    serFolderStructure([]);

  } catch (error) {
    console.error('Error fetching files:', error);
  }
};

export const deleteMultipleKnowledgeBaseOfaUser = async (userId, serSelectedRows, serFolderStructure) => {
  try {
    const response = await deleteSingleUsersAllKnowledgeBase(userId, {

    });
    message.success(response.message)
    serSelectedRows([]);
    serFolderStructure([]);

  } catch (error) {
    console.error('Error fetching files:', error);
  }
};


export const searchItems = (items, query) => {
  const filteredItems = [];

  const searchRecursive = (items, query) => {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (item.name?.toLowerCase().includes(query.toLowerCase())) {
        filteredItems.push(item);
      }
      if (item.children && item.children.length > 0) {
        searchRecursive(item.children, query);
      }
    }
  };

  searchRecursive(items, query);

  return filteredItems;
};
export const addFolderToParent = (structure, parentKey, newFolder) => {
  return structure.map(folder => {
    if (folder.key === parentKey) {
      folder.children = folder.children ? [...folder.children, newFolder] : [newFolder];
    } else if (folder.children && folder.children.length > 0) {
      folder.children = addFolderToParent(folder.children, parentKey, newFolder);
    }
    return folder;
  });
};
export const getParentFolderNames = (structure, folderKey, parentNames = []) => { 

  for (const folder of structure) {
    if (folder._id === folderKey) {
      
      return [...parentNames, folder.title || folder.name].join('/'); // Join parent folder names with '/'
      ; // Return parent folder names if the folder is found
    } else if (folder.children && folder.children.length > 0) {
      const updatedParentNames = [...parentNames, folder.name];
      const result = getParentFolderNames(folder.children, folderKey, updatedParentNames);
      if (result) return result; // Return if the folder is found in the children
    }
  }
  return null;
};
export const addFilesToFolder = (structure, folderKey, files) => {
  return structure.map(folder => {
    if (folder.key === folderKey) {
      folder.children = folder.children ? [...folder.children, ...files] : [...files];
    } else if (folder.children && folder.children.length > 0) {
      folder.children = addFilesToFolder(folder.children, folderKey, files);
    }
    return folder;
  });
};

export const handleOkDeleteAllKnowledgeBaseModal = async (userId, setSelectedRowKeys, setFolderStructure, setIsModalVisible) => {

  await deleteAllKnowledgeBaseOfaUser(userId, setSelectedRowKeys, setFolderStructure)
  setIsModalVisible(false);
};
export const handleCancelDeleteAllKnowledgeBaseModal = (setSelectedRowKeys, setIsModalVisible) => {
  setSelectedRowKeys([]);
  setIsModalVisible(false);
};

export const handleFileChange = async (event, setIsLoading, selectedFolder, folderStructure, setFolderStructure, setFileList, setSelectedFolder, setSelectedFile,selectedFile, fileInputRef, setIsUploading, selectedFolderData) => {
  setIsLoading(true);
  const files = event.target.files;

  try {
    const selectedFiles = await Promise.all(
      Array.from(files).map(async (file) => {
        const base64 = await getBase64(file);
        return {
          name: file.name,
          owner: userId,
          key: `${selectedFolder}-${file.name}`,
          type: 'file',
          category: file.type,
          size: file.size,
          lastEdited: new Date().toLocaleString(),
          base64: base64,
        };
      })
    );

    const uploadedFileNames = selectedFiles.map(file => {

      const updatedFileName =file.name;
      return { name: updatedFileName, size: file.size, base64: file.base64, type: file.category, parentId: selectedFolder || "", isKnowledgeBaseShareable: selectedFolderData?.isKnowledgeBaseShareable, isFileShared: selectedFolderData?.isKnowledgeBaseShareable, sharedKnowledgeBaseOwner: selectedFolderData?.userId ?? null };

    });

    const knowledgeBase = {
      fileDetails: uploadedFileNames,
      owner: userId
    };
    const response = await createKnowledgeBase(knowledgeBase);
    const preProcessForVectorEmbeddings = {
      fileDetails: uploadedFileNames,
      userId: userId
    }
    if (response.success) {
      message.success(response.message);
      setIsLoading(false);
    } else {
      message.error(response.message);
      setIsLoading(false);
    }
    const updatedStructure = selectedFolder
      ? addFilesToFolder(folderStructure, selectedFolder, selectedFiles)
      : [...folderStructure, ...selectedFiles];

    setFolderStructure(updatedStructure);
    setFileList([]);
    setSelectedFolder('');
    setSelectedFile('');
    setIsUploading(false);


  } catch (error) {
    console.error('Error uploading files:', error);
    message.error('Failed to upload files');
    setIsLoading(false);
  }
};
export const removeItemFromFolder = (structure, itemKey) => {
  return structure.filter(folder => {
    if (folder.key === itemKey) {
      return false;
    }
    if (folder.children) {
      folder.children = removeItemFromFolder(folder.children, itemKey);
    }
    return true;
  });
};

export const flattenData = (data) => {
  let result = [];
  data?.forEach(item => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result = result.concat(flattenData(item.children));
    }
  });
  return result;
};
export const deleteItem = async (key, setIsLoading, fileList, setFileList, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys, setMount) => {
  try {
    setIsLoading(true);
    const deleteFileOrFolder = await deleteKnowledgeBase(key, userId);
    const updatedFileList = fileList.filter(file => file.key !== key);
    const updatedFolderStructure = removeItemFromFolder(folderStructure, key);
    setFileList(updatedFileList);
    setFolderStructure(updatedFolderStructure);
    setSelectedRowKeys(selectedRowKeys.filter(k => k !== key));
    setIsLoading(false);
    setMount((prevState) => !prevState);
    message.success(deleteFileOrFolder.message);
  } catch (error) {
    console.error('Error Deleting KnowledgeBase Files:', error);
    message.error('Error Deleting KnowledgeBase Files');
  }

};


export const deleteMultipleKnowledgeBases = async (setIsChecked, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys, setMount) => {
  try {
    setIsChecked(true);
    const deleteMultipleKB = await deleteMultipleKnowledgeBase(userId, selectedRowKeys);
    for (let key of selectedRowKeys) {
      const updatedFolderStructure = removeItemFromFolder(folderStructure, key);
      setFolderStructure(updatedFolderStructure);
    }

    setSelectedRowKeys([]);
    setIsChecked(false);
    message.success(deleteMultipleKB.message);
    setMount((prevState) => !prevState);
    return true;

  } catch (error) {
    console.error('Error Deleting KnowledgeBase Files:', error);
    message.error('Error Deleting KnowledgeBase Files');
    return false;
  }

};

export const extractWorkBoardIdFromQuestion = (url)=>{
  const regex = /https:\/\/www\.myworkboard\.com\/wb\/(activity\/mywork\?do=popup&id=\d+|actionitem\?id=\d+)/g;
  const matches = url?.match(regex);
  let ids = [];

  if (matches) {
    matches.forEach((url) => {
      const urlObj = new URL(url);
      const id = urlObj.searchParams.get("id");
      if (id) {
        ids.push(id);
      }
    });
  }
  
  return ids.length > 0 ? ids : null;
};

export const sendFileToServer = async (filesInfo,folderStructure, selectedFolder) => {
  const uploadedFileDetails = filesInfo.map(file => {
      return { name: file.name, size: file.size, type : file.category, fileId : file.fileId,url : file?.url,parentId : selectedFolder ?? null };
  });
  const KnowledgeBase = {
      userId: userId,
      fileDetails: uploadedFileDetails,
  };

  try {
      if(uploadedFileDetails.length > 0){
          const response = await axiosSecureInstance.post(GOOGLE_DRIVE_FILES_TO_KNOWLEDGE_BASE,KnowledgeBase);
          message.success(response.data.message);
          
      }else{
          message.error("File could not be access. Use personal files only");
      }

  } catch (error) {
      console.error('Error uploading file:', error);
      message.error(error.response.data.message);

  }
};

export const sendOneDriveFileToServer = async (filesInfo, folderStructure, selectedFolder, oneDriveToken) => {
    const uploadedFileDetails = filesInfo.map(file => {
        return { 
            name: file.name, 
            size: file.size, 
            type: file.category, 
            fileId: file.fileId,
            url: file.url,
            parentId: selectedFolder ?? null 
        };
    });
    
    const KnowledgeBase = {
        userId: userId,
        fileDetails: uploadedFileDetails,
        token: oneDriveToken
    };

    try {
        if (uploadedFileDetails.length > 0) {
            const response = await axiosSecureInstance.post(ONEDRIVE_FILES_TO_KNOWLEDGE_BASE, KnowledgeBase);
            message.success(response.data.message);
        } else {
            message.error("File could not be accessed. Use personal files only");
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        message.error(error.response?.data?.message || 'Error uploading files');
    }
};

export const sendSharePointFileToServer = async (filesInfo, folderStructure, selectedFolder, sharePointToken) => {
  const uploadedFileDetails = filesInfo.map(file => ({
    name: file.name,
    size: file.size,
    type: file.category,
    fileId: file.fileId,
    url: file.url,
    siteId: file.siteId,
    driveId: file.driveId,
    parentId: selectedFolder ?? null,
  }));

  const KnowledgeBase = {
    userId: userId,
    fileDetails: uploadedFileDetails,
    token: sharePointToken,
  };

  try {
    if (uploadedFileDetails.length > 0) {
      const response = await axiosSecureInstance.post(SHAREPOINT_FILES_TO_KNOWLEDGE_BASE, KnowledgeBase);
      message.success(response.data.message);
    } else {
      message.error('File could not be accessed. Use accessible files only');
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    message.error(error.response?.data?.message || 'Error uploading files');
  }
};
