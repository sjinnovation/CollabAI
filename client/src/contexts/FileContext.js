// SelectedFileContext.js
import React, { createContext, useEffect, useState } from 'react';
import { getConfig, getPersonalizeAssistantSetting } from '../api/settings';
import { getUserID } from '../Utility/service';
import { getGoogleAuthCredentials } from '../api/googleAuthApi';

const userId = getUserID();
export const FileContext = createContext();

export const FileContextProvider = ({ children }) => {
  const [selectedFile, setSelectedFile] = useState([]);
  const [folderStructure, setFolderStructure] = useState([]);
  const [publicFilesStructure ,setPublicFilesStructure] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading,setIsLoading] = useState(false);
  const [deletedFileList,setDeletedFileList] = useState([]);
  const [enablePersonalize,setEnablePersonalize] = useState(false);
  const [isEditPageLoading,setIsEditPageLoading] = useState(false);

  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState('');



  useEffect(() => {
    getPersonalizeAssistantSetting().then(response =>{
    let isPersonalizeAssistantEnabled= false;
    if(response!== undefined){
      isPersonalizeAssistantEnabled = JSON.parse(response?.personalizeAssistant);

    }
      setEnablePersonalize(isPersonalizeAssistantEnabled);
    });
    getGoogleAuthCredentials(userId, setIsConnected,setToken);


  }, []);


  return (
    <FileContext.Provider value={{
        selectedFile, setSelectedFile,
        folderStructure, setFolderStructure,
        selectedFolders, setSelectedFolders,
        fileList, setFileList,
        selectedRowKeys, setSelectedRowKeys,
        isModalVisible, setIsModalVisible,
        isLoading,setIsLoading,
        publicFilesStructure ,setPublicFilesStructure,
        deletedFileList,setDeletedFileList,
        enablePersonalize,setEnablePersonalize,
        isConnected, setIsConnected,
        token, setToken,
        isEditPageLoading,setIsEditPageLoading
        

        }}>
      {children}
    </FileContext.Provider>
  );
};
