import React, { createContext, useEffect, useState } from 'react';
import { getPersonalizeAssistantSetting } from '../api/settings';
import { getUserID } from '../Utility/service';
import { getGoogleAuthCredentials } from '../api/googleAuthApi';
import { getWorkBoardAuthCredentials } from '../api/workBoard';
import { getWebCrawlerCredentials } from '../api/webCrawl';
import { getFluxCredentials } from '../api/fluxImageGenerator';

const userId = getUserID();
export const FileContext = createContext({
  selectedFile: [], 
  setSelectedFile: () => {},

  folderStructure: [], 
  setFolderStructure: () => {},

  publicFilesStructure: [], 
  setPublicFilesStructure: () => {},

  selectedFolders: [],
  setSelectedFolders: () => {},

  fileList: [], 
  setFileList: () => {},

  selectedRowKeys: [],
  setSelectedRowKeys: () => {},

  isModalVisible: false,
  setIsModalVisible: () => {},

  isLoading: false,
  setIsLoading: () => {},

  deletedFileList: [],
  setDeletedFileList: () => {},

  enablePersonalize: false,
  setEnablePersonalize: () => {},

  isEditPageLoading: false,
  setIsEditPageLoading: () => {},

  isConnected: false,
  setIsConnected: () => {},

  token: '', 
  setToken: () => {},

  isWorkBoardConnected: false, 
  setIsWorkBoardConnected: () => {},

  workBoardToken: '', 
  setWorkBoardToken: () => {},

  selectedFileAppWithFileId: {
    appName: '',
    fileIdOrUrl: '',
    fileName: ''
  }, // Default value
  setSelectedFileAppWithFileId: () => {},

  isWebCrawlConnected: false, 
  setIsWebCrawlConnected: () => {},

  webCrawledFilesStructure: [],
  setWebCrawledFilesStructure: () => {}
});

export const FileContextProvider = ({ children }) => {
  const initialAppValues ={
    "appName":'',
    "fileIdOrUrl":'',
    "fileName" :'',
  }
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
  const [isWorkBoardConnected, setIsWorkBoardConnected] = useState(false);
  const [workBoardToken, setWorkBoardToken] = useState('');
  const [selectedFileAppWithFileId,setSelectedFileAppWithFileId]= useState(initialAppValues);
  const [isWebCrawlConnected,setIsWebCrawlConnected] = useState(false);
  const [webCrawledFilesStructure ,setWebCrawledFilesStructure] = useState([]);
  const [isFluxConnected,setIsFluxConnected] = useState(false);
  const [fluxFilesStructure ,setFluxFilesStructure] = useState([]);
  const [fluxImageGenerator,setFluxImageGenerator] = useState([]);
  const [isIntegrateAppsConnected,setIsIntegrateAppsConnected] = useState(false);
  const [deleteFileIds, setDeleteFileIds] = useState([]);

  useEffect(() => {
    getPersonalizeAssistantSetting().then(response =>{
    let isPersonalizeAssistantEnabled= false;
    if(response!== undefined){
      isPersonalizeAssistantEnabled = JSON.parse(response?.personalizeAssistant);

    }
      setEnablePersonalize(isPersonalizeAssistantEnabled);
    });
    getGoogleAuthCredentials(userId, setIsConnected,setToken);
    getWorkBoardAuthCredentials(userId,setIsWorkBoardConnected,setWorkBoardToken);
    getWebCrawlerCredentials(setIsWebCrawlConnected);
    getFluxCredentials(setIsFluxConnected);
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
        isWorkBoardConnected, setIsWorkBoardConnected,
        workBoardToken, setWorkBoardToken,
        isEditPageLoading,setIsEditPageLoading,
        selectedFileAppWithFileId,setSelectedFileAppWithFileId,
        isWebCrawlConnected,setIsWebCrawlConnected,
        webCrawledFilesStructure ,setWebCrawledFilesStructure,
        isFluxConnected,setIsFluxConnected,
        fluxFilesStructure ,setFluxFilesStructure,
        fluxImageGenerator,setFluxImageGenerator,
        isIntegrateAppsConnected,
        setIsIntegrateAppsConnected,
        deleteFileIds, 
        setDeleteFileIds
        }}>
      {children}
    </FileContext.Provider>
  );
};