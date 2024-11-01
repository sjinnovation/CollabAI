import { formatToTreeData } from "./FileTree";
import { getAllKnowledgeBase, deleteSingleUsersAllKnowledgeBase, deleteMultipleKnowledgeBase } from "../../api/knowledgeBase";
import { getBase64 } from "./fileToBase64";
import { createKnowledgeBase } from "../../api/knowledgeBase";
import { createVectorOfKnowledgeBase } from "../../api/knowledgeBase";
import { getUserID, getUserRole } from "../../Utility/service";
import { message, Tag, Modal } from 'antd'
import { deleteKnowledgeBase } from "../../api/knowledgeBase";

const userId = getUserID();
const role = getUserRole();
export const getAllFiles = async (setIsAdmin, setAllUsersFileTreeStructure, setFiles, setFolderStructure, setAllPublicData, setPublicFilesStructure,setIsLoading,setIsChecked) => {
  try {
    const response = await getAllKnowledgeBase();
    const fetchedData = response.data;
    const formattedData = formatToTreeData(fetchedData);
    const allPublicFiles = response.allPublicKnowledgeBase;
    const formattedPublicData = formatToTreeData(allPublicFiles);
    setPublicFilesStructure(formattedPublicData);

    if (getUserRole() === "superadmin") {
      setIsAdmin(true);
      const fetchedAllUserData = response?.allUserData;
      const formattedAllUsersData = formatToTreeData(fetchedAllUserData);
      setAllUsersFileTreeStructure(formattedAllUsersData);

    }
    setAllPublicData(allPublicFiles);
    setFiles([fetchedData]);
    setFolderStructure(formattedData);
    setIsLoading(false);
    setIsChecked(false);
    return true;
  } catch (error) {
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
    if (folder.key === folderKey) {
      return [...parentNames, folder.title || folder.name].join('/'); // Join parent folder names with '/'
      ; // Return parent folder names if the folder is found
    } else if (folder.children && folder.children.length > 0) {
      const updatedParentNames = [...parentNames, folder.title];
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

export const handleFileChange = async (event, setIsLoading, selectedFolder, folderStructure, setFolderStructure, setFileList, setSelectedFolder, setSelectedFile, fileInputRef, setIsUploading) => {
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

    const previousParentFolderNames = getParentFolderNames(folderStructure, selectedFolder);
    const uploadedFileNames = selectedFiles.map(file => {
      const updatedFileName = previousParentFolderNames ? `${previousParentFolderNames}/${file.name}` : file.name;
      return { name: updatedFileName, size: file.size, base64: file.base64, type: file.category };
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
    } else {
      message.error(response.message);
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
  data.forEach(item => {
    result.push(item);
    if (item.children && item.children.length > 0) {
      result = result.concat(flattenData(item.children));
    }
  });
  return result;
};
export const deleteItem = async (key, setIsLoading, fileList, setFileList, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys) => {
  try {
    setIsLoading(true);
    const deleteFileOrFolder = await deleteKnowledgeBase(key, userId);
    const updatedFileList = fileList.filter(file => file.key !== key);
    const updatedFolderStructure = removeItemFromFolder(folderStructure, key);
    setFileList(updatedFileList);
    setFolderStructure(updatedFolderStructure);
    setSelectedRowKeys(selectedRowKeys.filter(k => k !== key));
    setIsLoading(false);
    message.success(deleteFileOrFolder.message);

  } catch (error) {
    console.error('Error Deleting KnowledgeBase Files:', error);
    message.error('Error Deleting KnowledgeBase Files');
  }

};


export const deleteMultipleKnowledgeBases = async (setIsChecked, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys) => {
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
    return true;

  } catch (error) {
    console.error('Error Deleting KnowledgeBase Files:', error);
    message.error('Error Deleting KnowledgeBase Files');
    return false;
  }

};

