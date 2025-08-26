import React, { useEffect, useState, useRef, useContext } from "react";
import { Layout, Table, Button, Dropdown, Menu, message, Space, Tree, Input, Modal, Tooltip, Tabs, Switch, Tag, Form, List, Avatar, Skeleton, Checkbox } from 'antd';
import { FolderOpenOutlined, DownOutlined, FolderAddOutlined, UpOutlined, FileOutlined, SyncOutlined, UserAddOutlined, ProductOutlined, DownloadOutlined, SmileOutlined, CheckCircleOutlined, UnlockOutlined, LockOutlined, UserOutlined, AntDesignOutlined } from '@ant-design/icons';
import './KnowledgeBase.css';
import { getUserID } from '../../Utility/service';
import { ThemeContext } from "../../contexts/themeConfig";
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import { MdOutlineSdStorage, MdOutlineUploadFile } from "react-icons/md";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { createKnowledgeBase, moveKnowledgeBaseFile, updateKnowledgeBaseFolderName } from "../../api/knowledgeBase";
import { FileTree } from "../../component/KnowledgeBase/FileTree";
import { getAllFiles, getParentFolderNames, addFolderToParent, searchItems, handleFileChange, handleOkDeleteAllKnowledgeBaseModal, handleCancelDeleteAllKnowledgeBaseModal, flattenData, deleteItem, deleteMultipleKnowledgeBases, extractWorkBoardIdFromQuestion, sendFileToServer, sendOneDriveFileToServer } from "../../component/KnowledgeBase/FileHelpers";
import GoogleFilePicker from "../../component/KnowledgeBase/importFromGoogle";
import { FileContext } from "../../contexts/FileContext";
import { ShowFileTree } from "../../component/KnowledgeBase/ShowFileTree";
import { FaGoogleDrive, FaPlus } from "react-icons/fa";
import { updateKnowledgeBase } from "../../api/knowledgeBase";
import ModalComponent, { assistantListModal } from "../../component/KnowledgeBase/Modals";
import { LoginWithGoogle } from "../../component/IntegrateApplications/LoginWithGoogle";
import googleDriveIcon from '../../assests/images/google-drive-icon.png';
import fileIcon from '../../assests/images/file.png';
import folderIcon from '../../assests/images/folder.png';
import { WebCrawlForm } from "../../component/WebCrawl/webCrawlForm";
import ActionItemModalComponent from "../../component/WorBoard/WorkBoardModal";
import { extractAllGoogleDriveLinks } from "../../component/IntegrateApplications/GoogleDriveHelperFunctions";
import { syncGoogleDriveFiles } from "../../api/googleAuthApi";
import { TbFolderShare, TbWorld } from "react-icons/tb";
import { FiFolderPlus } from "react-icons/fi";
import { LuFilePlus, LuFolderPlus } from "react-icons/lu";
import { LuFolderUp } from "react-icons/lu";
import userIcon from "../../assests/images/user-icon.png"
import { TbFolderSymlink } from "react-icons/tb";

import CustomDropdown from "../../component/common/CustomDropdown";
import { PiFolderPlus, PiFolderPlusBold } from "react-icons/pi";
import { HiOutlineDocumentArrowUp } from "react-icons/hi2";
import folder from "../../assests/images/file-icons/folder.png"
import sharedFolder from "../../assests/images/file-icons/share-folder.png"
import code from "../../assests/images/file-icons/css.png"
import doc from "../../assests/images/file-icons/doc.png"
import pdf from "../../assests/images/file-icons/pdf.png"
import ppt from "../../assests/images/file-icons/ppt.png"
import txt from "../../assests/images/file-icons/txt.png"
import xls from "../../assests/images/file-icons/xls.png"
import cvs from "../../assests/images/file-icons/csv-file.png"
import json from "../../assests/images/file-icons/json.png"
import ai from "../../assests/images/file-icons/ai.png"
import workBoardIcon from "../../assests/images/knowledge-base-menu/workboard_icon.svg"
import youTubeIcon from "../../assests/images/YouTube.png"
import driveIcon from "../../assests/images/knowledge-base-menu/google_drive_icon.svg"
import firecrawlIcon from "../../assests/images/knowledge-base-menu/fire_crawl_icon.svg"
import webPageIcon from "../../assests/images/knowledge-base-menu/global_icon.svg"
import oneDriveIcon from "../../assests/images/knowledge-base-menu/one_drive.png"
import { BsThreeDotsVertical } from "react-icons/bs";
import { RiDeleteBin3Line } from "react-icons/ri";
import { BiSolidLockOpen } from "react-icons/bi";
import { BiSolidLock } from "react-icons/bi";
import { MdOutlineEdit } from "react-icons/md";
import { FaCheckCircle } from "react-icons/fa";
import { LiaShareSolid } from "react-icons/lia";
import { MdAssistant } from 'react-icons/md';
import { SiDependabot } from "react-icons/si";

import FolderList from "../../component/KnowledgeBase/Common/FolderList";
import ShareFolderAccess from "../../component/KnowledgeBase/ShareFolderAccess/ShareFolderAccess";
import YouTubeModalComponent from "../../component/YouTube/youTubeModal";
import { isYoutubeUrl } from "../../component/YouTube/youTubeHelpers";
import { SidebarContext } from "../../contexts/SidebarContext";
import OneDriveFilePicker from "../../component/IntegrateApplications/OneDriveFilePicker";
import { fetchIntegrateAppsCreds } from "../../api/IntegrateApps";
import SharePointFilePicker from "../../component/IntegrateApplications/SharePointFilePicker";
import { fetchIntegrateAppsId } from "../../api/api_endpoints";
import { useServiceCredentials } from "../../Hooks/useServiceCredentials";

const { Sider, Content } = Layout;
const { confirm } = Modal;
const userId = getUserID();

const KnowledgeBase = () => {
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [selectedFolderData, setSelectedFolderData] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isShowFolderListModal, setIsShowFolderListModal] = useState(false)
  const [isShowEditFolderModal, setIsShowEditFolderModal] = useState(false)
  const [isShowMoveFolderModal, setIsShowMoveFolderModal] = useState(false)
  const [isShowShareAccessModal, setIsShowShareAccessModal] = useState(false)
  const [showFileTree, setShowFileTree] = useState(true);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedMyFiles, setSelectedMyFiles] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsersFileTreeStructure, setAllUsersFileTreeStructure] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUploading, setIsUploading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTree, setSelectedTree] = useState(0);
  const [allPublicData, setAllPublicData] = useState([]);
  const [deselectedFolderKey, setDeselectedFolderKey] = useState('');
  const [enableMultipleDelete, setEnableMultipleDelete] = useState(false);
  const [isMutideleteModalVisible, setIsMultideleteModalVisible] = useState(false)
  const fileInputRef = useRef(null);
  const treeRef = useRef(null);
  const dropdownRef = useRef(null);
  const [autoTriggerPicker, setAutoTriggerPicker] = useState(false);

  const [isImportWebPages, setIsImportWebPages] = useState(false);
  const [isAddActionItem, setIsAddActionItem] = useState(false);
  const [isGoogleDrive, setIsGoogleDrive] = useState(false);
  const [isImportYouTubeTranscript, setIsImportYouTubeTranscript] = useState(false);

  const [tabActiveKey, setTabActiveKey] = useState('1')
  const [openCustomDropdown, setOpenCustomDropdown] = useState(false);
  const [oneDriveFileInfo, setOneDriveFileInfo] = useState(null);

  const { theme } = useContext(ThemeContext);
  const { selectedRowKeys, setSelectedRowKeys, folderStructure, setFolderStructure, fileList, setFileList, isModalVisible, setIsModalVisible, publicFilesStructure, setPublicFilesStructure, isWebCrawlConnected, setIsWebCrawlConnected, webCrawledFilesStructure, setWebCrawledFilesStructure, isWorkBoardConnected, setIsWorkBoardConnected } = useContext(FileContext);
  const { isConnected, setIsConnected, token, setToken } = useContext(FileContext);
  const [expandedRowKey, setExpandedRowKey] = useState(null);
  const [expandedRowKeyOfAllData, setExpandedRowKeyOfAllData] = useState(null);
  const [expandedRowKeyOfOrg, setExpandedRowKeyOfOrg] = useState(null);

  const [isWebCrawlerSyncing, setIsWebCrawlerSyncing] = useState(false);
  const [isActionItemSyncing, setIsActionItemSyncing] = useState(false);
  const [isGoogleDriveSyncing, setIsGoogleDriveSyncing] = useState(false);


  const [baseUrlForSync, setBaseUrlForSync] = useState('');
  const [baseUrlOfWBforSync, setBaseUrlOfWBforSync] = useState('');
  const [baseUrlOfGoogleDriveSync, setBaseUrlOfGoogleDriveSync] = useState('');

  const [syncingRecordId, setSyncingRecordId] = useState(null);
  const { knowledgeBaseMenu } = useContext(SidebarContext);

  const [mount, setMount] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isFileUploadChecked, setIsFileUploadChecked] = useState(false);
  const [selectedApp, setSelectedApp] = useState("device");
  const [googleFileInfo, setGoogleFileInfo] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [error, setError] = useState({
    newFolderName: false,
  });

  const handleExpand = (expanded, record) => {
    const key = record._id;
    setExpandedRowKey(expanded ? key : null);
  };

  const handleExpandOfAllData = (expanded, record) => {
    const key = record._id;
    setExpandedRowKeyOfAllData(expanded ? key : null);
  };
  const handleExpandOfOrg = (expanded, record) => {
    const key = record._id;
    setExpandedRowKeyOfOrg(expanded ? key : null);
  };

  const [form] = Form.useForm();
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    token: oneDriveToken,
    isConnected: isOneDriveConnected,
    loading: oneDriveLoading
  } = useServiceCredentials(userId, 'onedrive');

  const {
    token: sharePointToken,
    isConnected: isSharePointConnected,
    loading: sharePointLoading
  } = useServiceCredentials(userId, 'sharepoint');

  const handleFromDevice = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
      setIsShowFolderListModal(false);
      setIsButtonDisabled(true);
      setIsFileUploadChecked(false);

      // setSelectedFolderData({})

    }
  };
  const addFolder = async () => {

    if (!newFolderName) {
      setError({ ...error, newFolderName: true });
      return;
    }
    if (newFolderName?.includes(".") || newFolderName?.includes("@") || newFolderName?.includes(",") || newFolderName?.includes(":") || newFolderName?.includes(";")) return message.error("do not put dot(.) ,spaces and special characters in the folder name")
    const newFolder = {
      name: newFolderName,
      key: `${selectedFolder}-${new Date().getTime()}`,
      type: 'folder',
      children: []
    };

    const updatedStructure = [...folderStructure, newFolder];
    setFolderStructure(updatedStructure);
    setNewFolderName('');
    setIsCreatingFolder(false);
    const parentDirectory = null;
    const knowledgeBase = {
      fileDetails: (parentDirectory !== null) ? [{ name: parentDirectory + '/' + newFolderName, size: 0 }] : [{ name: newFolderName, size: 0 }],
      owner: userId
    };
    const responseOfKnowledgeBaseCreate = await createKnowledgeBase(knowledgeBase);
    if (responseOfKnowledgeBaseCreate.success) {
      setIsChecked(true);
      message.success(responseOfKnowledgeBaseCreate.message);
      setSelectedFolder('');
      setError({ ...error, newFolderName: false });
    } else {
      message.error(responseOfKnowledgeBaseCreate.message);
    }
    return responseOfKnowledgeBaseCreate
  };

  const filteredItems = Array.isArray(searchItems(folderStructure, searchQuery)) ? searchItems(folderStructure, searchQuery) : [];
  const filteredOnAllFilesItems = Array.isArray(searchItems(allUsersFileTreeStructure, searchQuery)) ? searchItems(allUsersFileTreeStructure, searchQuery) : [];
  const filteredPublicFileStructures = Array.isArray(searchItems(publicFilesStructure, searchQuery)) ? searchItems(publicFilesStructure, searchQuery) : [];
  const dataSource = searchQuery ? ((!Array.isArray(filteredItems)) ? [] : filteredItems) : folderStructure;
  const allUsersDataSource = searchQuery ? ((!Array.isArray(filteredOnAllFilesItems)) ? [] : filteredOnAllFilesItems) : allUsersFileTreeStructure
  const organizationalDataSource = searchQuery ? ((!Array.isArray(filteredPublicFileStructures)) ? [] : filteredPublicFileStructures) : publicFilesStructure;
  let flattenedData = flattenData(dataSource);
  if (selectedTree === 1) {
    flattenedData = flattenData(allUsersDataSource);

  } else if (selectedTree === 2) {
    flattenedData = flattenData(publicFilesStructure);
  }

  const rowSelection = {
    columnWidth: 10,
    selectedRowKeys,
    onChange: (newSelectedRowKeys, selectedRows) => {

      const deselectedKeys = selectedRowKeys.filter(
        (key) => !newSelectedRowKeys.includes(key)
      );

      let treeStruture = dataSource;
      if (selectedTree === 1) {
        treeStruture = allUsersDataSource

      } else if (selectedTree === 2) {
        treeStruture = organizationalDataSource
      }

      const allFolders = treeStruture.map((folder) => folder);

      // Find deselected folders
      const deselectedFolderDetails = deselectedKeys
        .map((key) => allFolders.find((folder) => folder.key === key))
        .filter(Boolean); // Filter out any undefined values
      const childrenKeys = deselectedFolderDetails.flatMap((folder) =>
        folder.children ? folder.children.map((child) => child.key) : []
      );      //setDeselectedFolders(deselectedFolderDetails);

      const filteredNewSelectedKeys = newSelectedRowKeys.filter(
        (key) => !childrenKeys.includes(key)
      );

      setSelectedRowKeys(filteredNewSelectedKeys);

      const rowDetails = folderStructure.filter((key) => key.key === deselectedKeys);
      const updatedSelectedRowKeys = [...newSelectedRowKeys];

    },
  };

  useEffect(() => {
    const allRowKeys = flattenedData.map(item => item.key);
    if (selectedRowKeys.length === allRowKeys.length && allRowKeys.length > 0) {

      setEnableMultipleDelete(true);

    } else {

      setEnableMultipleDelete(false);

    }

    for (let keys of selectedRowKeys) {
      let parentFound = false;

      let treeStruture = dataSource;
      if (selectedTree === 1) {
        treeStruture = allUsersDataSource

      } else if (selectedTree === 2) {
        treeStruture = organizationalDataSource
      }

      for (let parent of treeStruture) {
        if (parent.key === keys && parentFound === false) {
          parentFound = true;
          if ('children' in parent) {
            for (let child of parent.children) {
              const isAlreadyExistInKeys = selectedRowKeys.some(checkKey => checkKey === child.key);
              if (!isAlreadyExistInKeys) {
                setSelectedRowKeys((prev) => [...prev, child.key])

              }

            }
          }

        }
      }
    }
  }, [selectedRowKeys, flattenedData.length]);

  useEffect(() => {
    const page = 1;
    const pageSize = 10;
    // setIsLoading(true);
    getAllFiles(setIsAdmin, setAllUsersFileTreeStructure, setFiles, setFolderStructure, setAllPublicData, setPublicFilesStructure, setIsLoading, setIsChecked, page, pageSize, searchQuery, selectedTree, setTableLoading);

  }, [isChecked, isLoading, selectedTree, mount]);

  useEffect(() => {
    if (token && isConnected) {
      setAutoTriggerPicker(true);
    }
  }, [token, isConnected]);

  useEffect(() => {
    if (syncingRecordId) {
      syncGoogleDriveFiles(syncingRecordId).then(() => {
        setSyncingRecordId(null);
        setIsGoogleDrive(false);
        setIsGoogleDriveSyncing(false);
        setBaseUrlOfGoogleDriveSync(null);
        setIsLoading(true);
      });
    }


  }, [isGoogleDriveSyncing]);

  const deleteModal = (record) => {
    confirm({
      title: `Are you sure you want to delete ${record.type}?`,
      content: `You are deleting ${record?.name}.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteItem(record?._id, setIsLoading, fileList, setFileList, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys, setMount)
      },
      onCancel() {
        console.log('Cancel');
      },
    });

  };

  const updatePublicState = async (id, owner, isPublic) => {
    setIsLoading(true);
    const requestBody = {
      isPublic: isPublic,
      owner: owner
    }
    const isPubLicStateChanged = await updateKnowledgeBase(id, requestBody);
    if (isPubLicStateChanged.success) {
      setIsChecked(true);
      message.success(isPubLicStateChanged.message);
      setIsLoading(false);
    } else {
      message.error(isPubLicStateChanged.message);
      setIsLoading(false);
    }

  }

  const handleSync = (type, url, id) => {
    setSyncingRecordId(id);
    if (type === "workBoard") {
      setIsAddActionItem(true);
      setIsActionItemSyncing(true);
      setBaseUrlOfWBforSync(url);
    } else if (type === "webCrawler") {
      setIsImportWebPages(true);
      setIsWebCrawlerSyncing(true);
      setBaseUrlForSync(url);
    } else if (type === "googleDrive") {
      setIsGoogleDrive(true);
      setIsGoogleDriveSyncing(true);
      setBaseUrlOfGoogleDriveSync(url);
    }
  };


  const handleUpdateFolderName = async () => {
    try {
      const payload = {
        owner: selectedFolderData?.userId || null,
        name: newFolderName,
        oldFolderPath: selectedFolderData?.name,
      }
      const updatedFolder = await updateKnowledgeBaseFolderName(selectedFolderData._id, payload);

      if (updatedFolder.success) {
        setNewFolderName("");
        setSelectedFolder({});
        setIsShowEditFolderModal(false);
        message.success(updatedFolder.message);
        setMount((prevState) => !prevState);
      }
      else {
        setNewFolderName("");
        setSelectedFolder({})
      }
    } catch (error) {
      console.error(error);
    }
  }

  const treeId = ['1', '2', '3', '4'];

  const closeModal = () => {
    setIsVisible(false);
  };

  const createActionMenu = (record) => {
    return (
      <Menu>
        {record?.userId === userId && record?.type === 'folder' ? <Menu.Item key="edit">
          <span className="menu-item-style" onClick={() => {
            setNewFolderName(record.name);
            setSelectedFolderData(record)
            setIsShowEditFolderModal(true);
          }}><MdOutlineEdit /> Rename folder</span>
        </Menu.Item> : <></>}
        {record?.userId === userId && record?.type === 'file' ? <Menu.Item key="move">
          <span className="menu-item-style" onClick={() => {
            setIsShowMoveFolderModal(true);
            setSelectedFolderData(record)
            setSelectedFile(record?._id)
          }}><LiaShareSolid /> Move</span>
        </Menu.Item> : <></>}
        {record?.userId === userId && record?.type === 'folder' ? <Menu.Item key="share">
          <span className="menu-item-style" onClick={() => {
            setIsShowShareAccessModal(true);
            setSelectedFolderData(record);
          }}><TbFolderShare /> Share / remove folder access</span>
        </Menu.Item> : <></>}
        {((record?.userId === userId || record?.sharedKnowledgeBaseOwner === userId) || isAdmin) && (
          <Menu.Item key="public-private">
            <Space>
              <span className="menu-item-style" onClick={() => updatePublicState(record?._id, record?.userId, !record?.isPublic)}>{record?.isPublic ? <BiSolidLock /> : <BiSolidLockOpen />} Make {record?.isPublic ? 'private' : 'public'}</span>
            </Space>
          </Menu.Item>
        )}
        {record.url && (record?.userId === userId || record?.sharedKnowledgeBaseOwner === userId) && (

          <Tooltip title="Sync">
            {extractAllGoogleDriveLinks(record.url) ? (
              <Menu.Item key="sync" className="success-menu-item">
                <span className="menu-item-style" onClick={() => {
                  const type = "googleDrive";
                  handleSync(type, record.url, record._id);
                }}>{syncingRecordId === record._id && isGoogleDriveSyncing ? (<SyncOutlined spin />) : (<SyncOutlined />)} Sync</span>
              </Menu.Item>
            ) : (
              extractWorkBoardIdFromQuestion(record.url) ? (
              <Menu.Item key="sync" className="success-menu-item">
                <span className="menu-item-style" onClick={() =>{
                  const type = "workBoard";
                  handleSync(type, record.url, record._id);
                }}>{syncingRecordId === record._id && isActionItemSyncing ? (<SyncOutlined spin />) : (<SyncOutlined />)} Sync</span>
             </Menu.Item>
              ) : (

                !isYoutubeUrl(record.url) && <Menu.Item key="sync" className="success-menu-item">
                  <span className="menu-item-style" onClick={() => {
                    const type = "webCrawler";
                    handleSync(type, record.url, record._id);
                  }}>{syncingRecordId === record._id && isWebCrawlerSyncing ? (<SyncOutlined spin />) : (<SyncOutlined />)} Sync</span>
                </Menu.Item>
              )
            )}
          </Tooltip>
        )}
        {
          <Menu.Item key="assistantNameList" dataIndex='assistantNameList'>
            <span className="menu-item-style"
              onClick={() => {
                setIsVisible(true);
                assistantListModal(record?.assistantNameList, isVisible)

              }}><SiDependabot /> Associate Agents </span>
          </Menu.Item>
        }

        {(record?.userId === userId || record?.sharedKnowledgeBaseOwner === userId) && (
          <Menu.Item key="delete" danger>
            <span className="menu-item-style" onClick={() => deleteModal(record)}><RiDeleteBin3Line /> Delete</span>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  function getDisplayName(record) {
    const isFolder = record?.type === 'folder';
    const title = record?.name;
    const nameParts = record?.name?.split('/');
    const fileName = nameParts ? nameParts[nameParts.length - 1] : '';

    if (isFolder) {
      return title;
    } else {
      return fileName
    }
  }

  const columns = [
    {
      title: '', dataIndex: 'owner', key: 'owner', align: "center", width: "12%", render: (text, record) => (
        <>
          {record?.type === "folder" ? <Avatar src={record?.shared ? sharedFolder : folder} style={{ backgroundColor: "transparent" }} /> : <Avatar src={getFileIcon(record)} style={{ backgroundColor: "transparent" }} />}
        </>
      )
    },
    {
      title: 'File Name', dataIndex: 'name', key: 'name', align: "start", render: (text, record) => (
        <span style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {
              record?.url ? (
                <a
                  href={record?.url ?? ''}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'inherit',
                    textDecoration: 'none',
                    transition: 'color 0.3s ease, text-decoration 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (record?.url) {
                      e.currentTarget.style.textDecoration = 'underline';
                      e.currentTarget.style.color = '#1890ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (record?.url) {
                      e.currentTarget.style.textDecoration = 'none';
                      e.currentTarget.style.color = 'inherit';
                    }
                  }}
                >
                  {getDisplayName(record)}
                </a>
              ) :
                <span>
                  {getDisplayName(record)}
                </span>
            }
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8C8C8C", fontSize: "12px" }}>
            <span>Uploaded by {record.owner},</span>
            <span>File size {record.size} mb,</span>
            <span>Last updated {record.timeDifference}</span>
          </div>
        </span>
      ),
    },

    {
      title: 'Authorized Members', dataIndex: 'Access', key: 'Access', align: "center", width: "10%",
      render: (_, record) => (
        record?.accessedUser?.length > 0 ? (
          <Avatar.Group
            shape="circle"
            max={{
              count: 3,
              style: { color: '#f56a00', backgroundColor: '#fde3cf', cursor: 'pointer' },
              popover: { trigger: 'hover' },
            }}
          >
            <Avatar src={record?.accessedUser[0]?.userAvatar ?? userIcon} />
            {record?.accessedUser?.length > 1 && (
              record?.accessedUser?.map(user => (
                <Avatar shape="circle" size="small" src={user?.userAvatar ?? userIcon}>K</Avatar>
              ))
            )}
          </Avatar.Group>
        )
          :
          <></>
      )
    },
    {
      title: 'Privacy Mode', dataIndex: 'isPublic', key: 'isPublic', align: "center", width: "15%",
      render: (_, record) => (
        record?.isPublic ? (<Tag icon={<UnlockOutlined />} color="error">
          Public
        </Tag>) : (<Tag icon={<LockOutlined />} color="success">
          Private
        </Tag>)
      )
    },
    {
      title: 'Actions', key: 'action', align: "center", width: "10%",
      render: (_, record) => (
        <Dropdown overlay={createActionMenu(record)} trigger={['click']}>
          <a onClick={(e) => e.preventDefault()}>
            <Space>
              <BsThreeDotsVertical />
            </Space>
          </a>
        </Dropdown>
      ),
    },
  ];
  const organizationalColumn = [
    {
      title: '', dataIndex: 'owner', key: 'owner', align: "center", width: "12%", render: (text, record) => (
        <>
          {record?.type === "folder" ? <Avatar src={record?.shared ? sharedFolder : folder} style={{ backgroundColor: "transparent" }} /> : <Avatar src={getFileIcon(record)} style={{ backgroundColor: "transparent" }} />}
        </>
      )
    },
    {
      title: 'File Name', dataIndex: 'name', key: 'name', align: "start", render: (text, record) => (
        <span style={{ display: "flex", alignItems: "start", flexDirection: "column" }}>
          <div style={{ fontSize: "16px", fontWeight: 600 }}>
            {getDisplayName(record)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#8C8C8C", fontSize: "12px" }}>
            <span>Created by {record.owner},</span>
            <span>File size {record.size} MB,</span>
            <span>Last updated {record.timeDifference}</span>
          </div>
        </span>
      ),
    },
  ];
  // Render table data with children for folders
  const renderTableData = (items) =>
    items.map(item => {
      if (item.children && item.children.length > 0) {
        return {
          key: item._id.$oid,
          ...item,
          children: renderTableData(item.children),
        };
      }
      return { key: item._id.$oid, ...item };
    });

  const handleImportWebPagesClick = () => {
    if (isWebCrawlConnected) {
      form.resetFields();
      setIsShowFolderListModal(false);
      setIsButtonDisabled(true);
      setIsFileUploadChecked(false);
      setIsImportWebPages(true);
    } else {
      message.error("Please Connect Your WebCrawler !!");
    }
  };
  const handleImportYouTubeTransCriptClick = () => {
    if (isWebCrawlConnected) {
      form.resetFields();
      setIsShowFolderListModal(false);
      setIsButtonDisabled(true);
      setIsFileUploadChecked(false);
      setIsImportYouTubeTranscript(true);
    } else {
      message.error("Please Connect Your WebCrawler !!");
    }
  };
  const handleAddActionItemClick = () => {
    if (isWorkBoardConnected) {
      form.resetFields();
      setIsShowFolderListModal(false);
      setIsButtonDisabled(true);
      setIsFileUploadChecked(false);
      setIsAddActionItem(true);
    } else {
      message.error("Please Connect Your WorkBoard !!");
    }
  };

  const sidemenuItems = [
    {
      key: '1',
      icon: <UserAddOutlined />,
      label: 'My Files',
    },
    isAdmin && {
      key: '2',
      icon: <DownloadOutlined />,
      label: 'All User Files',
    },
    {
      key: '3',
      icon: <ProductOutlined />,
      label: 'Organizational Files',
    },

  ]

  const handleChangeSidemenu = (e) => {
    setTabActiveKey(e.key);
    setSelectedTree(e.key - 1)
    setPageSize(10)
    setCurrentPage(1)
  }

  const iconFile = {
    txt: txt,
    pptx: ppt,
    pdf: pdf,
    xlsx: xls,
    docx: doc,
    csv: cvs,
    ai: ai,
    json: json,

  }

  const getFileIcon = (file) => {
    const ext = file.name.split(".")[1];
    if (iconFile.hasOwnProperty(ext)) {
      return iconFile[ext];
    }
    else {
      if (file.shared) {
        return sharedFolder;
      }
      else {
        return folder;
      }
    }
  }

  const handleMoveFolder = async () => {
    try {
      const payload = {
        owner: selectedFolderData?.userId || null,
        parentFolder: selectedFolder,
      }

      const moveFolder = await moveKnowledgeBaseFile(selectedFile, payload);

      if (moveFolder.success) {
        setSelectedFile("");
        setSelectedFolderData({});
        setSelectedFolder("");
        setIsShowEditFolderModal(false);
        message.success(moveFolder.message);
        setMount((prevState) => !prevState);
        setIsShowMoveFolderModal(false)
      }
      else {
        setSelectedFile("");
        setSelectedFolderData({});
        setSelectedFolder({});
        setIsShowEditFolderModal(false);
        setMount((prevState) => !prevState);
        setIsShowMoveFolderModal(false)
      }
    } catch (error) {
      console.error(error);
    }
  }

  const deduplicateSharedFiles = (data) => {
    if (!Array.isArray(data)) return [];

    // Create a Map to track unique files by _id
    const uniqueMap = new Map();

    data.forEach(item => {
      if (!uniqueMap.has(item._id)) {
        uniqueMap.set(item._id, {
          ...item,
          children: item.children ? deduplicateSharedFiles(item.children) : undefined
        });
      }
    });

    return Array.from(uniqueMap.values());
  };



  return (

    <Layout className="parentLayout" >
      <Sider className="knowledge-base-sidemenu-main" width={256} trigger={null} collapsible collapsed={knowledgeBaseMenu} align={"center"} style={{ backgroundColor: theme === "light" ? "#fff" : "#000", borderRight: "1px solid var(--border-color)", padding: "15px", marginBottom: "55px" }} >
        <div className="side-top-section">
          <Button
            size="small"
            className="plusNewButton"
            ref={dropdownRef}
            type="primary"
            onMouseOver={() => setOpenCustomDropdown(true)}
            onMouseLeave={() => setOpenCustomDropdown(false)}
            block
            icon={<FaPlus />}
          >New</Button>
          <Modal
              title="New Folder"
              open={isCreatingFolder}
              onOk={addFolder}
              // confirmLoading={confirmLoading}
              onCancel={() => {
                setIsCreatingFolder(false)
                setNewFolderName("")
                setError({...error, newFolderName: false})
               }}
              className="knowledge-base-modal"
            >
               <Input
                placeholder="New Folder Name"
                value={newFolderName}
                onChange={e => {
                  setNewFolderName(e.target.value)
                  setError({...error, newFolderName: false})
                }}
                onPressEnter={addFolder}
                style={{ marginBottom: '0.5rem' }}
                status={error.newFolderName ? "error" : ""}
              />
              {error.newFolderName && <div style={{ color: 'red' }}>Please enter a folder name</div>}
          </Modal>
          <Modal
            title="Select Folder"
            open={isShowFolderListModal}
            onOk={async () => {
              if (selectedApp === "device") {
                handleFromDevice();
              } else if (selectedApp === "wb") {
                handleAddActionItemClick();

              } else if (selectedApp === "webPage") {
                handleImportWebPagesClick();
              } else if (selectedApp === "googleDrive") {
                setIsLoading(true);
                setIsShowFolderListModal(false);
                setIsButtonDisabled(true);
                setIsFileUploadChecked(false);
                await sendFileToServer(googleFileInfo, folderStructure, selectedFolder);
                setIsLoading(false);
              } else if (selectedApp === "oneDrive") {
                setIsLoading(true);
                setIsShowFolderListModal(false);
                setIsButtonDisabled(true);
                setIsFileUploadChecked(false);
                await sendOneDriveFileToServer(oneDriveFileInfo, folderStructure, selectedFolder, oneDriveToken);
                await getAllFiles(
                  setIsAdmin,
                  setAllUsersFileTreeStructure,
                  setFiles,
                  setFolderStructure,
                  setAllPublicData,
                  setPublicFilesStructure,
                  setIsLoading,
                  setIsChecked,
                  currentPage,
                  pageSize,
                  searchQuery,
                  selectedTree,
                  setTableLoading
                );
                setIsLoading(false);
              }
            }}
            onCancel={() => {
              setIsShowFolderListModal(false)
              setSelectedFolder("");
              setSelectedFolderData({});
              setIsButtonDisabled(true);
              setIsFileUploadChecked(false);
            }}
            okButtonProps={{ disabled: isButtonDisabled }}
            className="knowledge-base-modal"
          >
           <FolderList dataSource={dataSource} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} setSelectedFolderData={setSelectedFolderData} isFileUploadChecked={isFileUploadChecked} setIsFileUploadChecked={setIsFileUploadChecked} setIsButtonDisabled={setIsButtonDisabled}/>

          <Checkbox onChange={(e) => {
            setIsButtonDisabled(false);
            setIsFileUploadChecked(e.target.checked);
            setSelectedFolderData({});
            setSelectedFolder("");
            if(e.target.checked === false) {
              setIsButtonDisabled(true);
            }
          }} checked={isFileUploadChecked}  style={{ marginTop: "20px" }}>Upload files without selecting a folder</Checkbox>
        </Modal>
          <Modal
            title="Move Folder"
            open={isShowMoveFolderModal}
            onOk={() => handleMoveFolder()}
            onCancel={() => {
              setIsShowMoveFolderModal(false)
              setSelectedFolder("");
              setSelectedFile("");
            }}
            className="knowledge-base-modal"

          >
            <FolderList dataSource={dataSource} selectedFolder={selectedFolder} setSelectedFolder={setSelectedFolder} setSelectedFolderData={setSelectedFolderData} setIsButtonDisabled={setIsButtonDisabled} />
          </Modal>



          <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onClick={() => setIsUploading(true)} onChange={async (event) => {
            await handleFileChange(event,
              setIsLoading,
              selectedFolder,
              folderStructure,
              setFolderStructure,
              setFileList,
              setSelectedFolder,
              setSelectedFile,
              selectedFile,
              fileInputRef,
              setIsUploading, selectedFolderData);
            if (fileInputRef.current && isUploading) {
              fileInputRef.current.value = '';
              setSelectedFolderData({})
            }
          }
          } />
          <CustomDropdown openCustomDropdown={openCustomDropdown} setOpenCustomDropdown={setOpenCustomDropdown}>
            <div className={`dropdown-inner-wrapper ${openCustomDropdown ? 'show-dropdown' : ''}`}>
              <div className="organize-section">
                <span className="sub-title">Add & Organize</span>
                <div className="knowledge-base-tools-items">
                  <div className="tool-item" onClick={() => {
                    setIsCreatingFolder(true)

                    setOpenCustomDropdown(false);
                  }}>
                    <div className="tool-item-icon">
                      <LuFolderPlus className="icon" />
                    </div>
                    <div className="tool-item-info">
                      <div className="tool-name">Create Folder</div>
                      <p className="tool-details">
                        Create a folder to organize documents
                      </p>
                    </div>
                  </div>
                  <div className="tool-item" onClick={() => {
                    setIsShowFolderListModal(true)
                    setOpenCustomDropdown(false);
                    setSelectedApp("device");
                  }}>
                    <div className="tool-item-icon">
                      <LuFilePlus className="icon" />
                    </div>
                    <div className="tool-item-info">
                      <div className="tool-name">Upload Documents</div>
                      <p className="tool-details">
                        Add txt, pptx, pdf, xlsx, docx, csv (max file size 4.5 MB)
                      </p>
                    </div>

                  </div>
                </div>
              </div>

              <div className="section-divider"></div>
              <div className="organize-section">
                <span className="sub-title">Add files from Apps</span>
                <div className="knowledge-base-tools-items">
                  {isConnected === false || token === '' ?
                    <LoginWithGoogle setToken={setToken} setIsConnected={setIsConnected} /> :
                    <GoogleFilePicker
                      folderStructure={folderStructure}
                      selectedFolder={selectedFolder}
                      setIsLoading={setIsLoading}
                      isLoading={isLoading}
                      token={token}
                      autoTriggerPicker={autoTriggerPicker}
                      setAutoTriggerPicker={setAutoTriggerPicker}
                      setSelectedApp={setSelectedApp}
                      setIsShowFolderListModal={setIsShowFolderListModal}
                      setOpenCustomDropdown={setOpenCustomDropdown}
                      setGoogleFileInfo={setGoogleFileInfo}
                    />}

                  <OneDriveFilePicker
                    folderStructure={folderStructure}
                    selectedFolder={selectedFolder}
                    selectedFile={selectedFile}
                    setIsLoading={setIsLoading}
                    isLoading={isLoading}
                    token={oneDriveToken}
                    setSelectedApp={setSelectedApp}
                    setIsShowFolderListModal={setIsShowFolderListModal}
                    setOpenCustomDropdown={setOpenCustomDropdown}
                    setOneDriveFileInfo={setOneDriveFileInfo}
                  />
                  <SharePointFilePicker
                    folderStructure={folderStructure}
                    selectedFolder={selectedFolder}
                    selectedFile={selectedFile}
                    setIsLoading={setIsLoading}
                    isLoading={isLoading}
                    token={sharePointToken}
                    setSelectedApp={setSelectedApp}
                    setIsShowFolderListModal={setIsShowFolderListModal}
                    setOpenCustomDropdown={setOpenCustomDropdown}
                  // setSharePointFileInfo={setSharePointFileInfo}
                  />
                  <div className="tool-item"
                    onClick={() => {
                      handleImportWebPagesClick();
                    }}
                    >
                    <div className="tool-item-icon">
                      <img src={webPageIcon} alt="Web Page Icon" style={{ width: 20, height: 20, marginRight: 2 }} />
                    </div>
                    <div className="tool-item-info">
                      <div className="tool-name" >Import a website</div>
                      <p className="tool-details">
                        Add single or multiple pages
                      </p>
                    </div>
                  </div>
                  {/* <div className="tool-item" onClick={() => {
                    setIsShowFolderListModal(true)
                    setOpenCustomDropdown(false);
                    setSelectedApp("wb");
                  }}>
                    <div className="tool-item-icon">
                      <img src={workBoardIcon} alt="WorkBoard Icon" style={{ width: 20, height: 20, marginRight: 2 }} />
                    </div>
                    <div className="tool-item-info">
                      <div className="tool-name">Add an Action Item</div>
                      <p className="tool-details">
                        Add an Action Item from WorkBoard
                      </p>
                    </div>
                  </div> */}
                  {/* <div className="tool-item"
                    onClick={()=>{
                      setIsShowFolderListModal(true)
                      setOpenCustomDropdown(false);
                      setSelectedApp("youTube");                    }}
                    >
                    <div className="tool-item-icon">
                      <img src={youTubeIcon} alt="YouTube Icon" style={{ width: 40, height: 20, marginRight: 2 }} />
                    </div>
                    <div className="tool-item-info">
                      <div className="tool-name" >Import YouTube Transcript</div>
                      <p className="tool-details">
                        import youTube transcript from URL
                      </p>
                    </div>
                  </div> */}
                </div>
              </div>
            </div>
          </CustomDropdown>
        </div>

        <div className="knowledge-base-sidemenu">
          <Menu
            onClick={handleChangeSidemenu}
            style={{
              width: "100%",
              border: "none",
              textAlign: "start",
              backgroundColor: "transparent"
            }}
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            mode="inline"
            items={sidemenuItems}
          />
        </div>
      </Sider>
      <Layout style={{ overflowY: "auto", backgroundColor: "var(--main-bg-color)", marginBottom: "55px" }}>
        <Content className="tableContent">
          <DebouncedSearchInput data={{ search: searchQuery, setSearch: setSearchQuery, placeholder: "Search by file name", customStyle: { width: 300, height: 50 }, size: "large" }} />
          <div className="description-container">
            <span>Centralize your knowledge base files. Learn how it works by clicking <Button type="link" style={{ margin: 0, padding: 0, color: "blue" }} target="_blank" href="https://docs.google.com/document/d/1epYY8ECXYXQz51hDuGIKxnQEXI4_HDa3hRgSyrwlFOo/edit?tab=t.mv7qfzmuc0zx">Here</Button></span>
          </div>
          {selectedRowKeys.length ? (
           <div className="multi-delete-wrapper">
             <Button
                 style={{ marginTop: "15px" }}
                 type="primary"
                 danger
                 // disabled={selectedRowKeys.length === 1 ? (enableMultipleDelete === false) : selectedRowKeys.length <= 1}
                 onClick={() => setIsMultideleteModalVisible(true)}
                 icon={<AiOutlineDelete />}
             >
               Delete {selectedRowKeys?.length} items
             </Button>
           </div>
          ) : null}


          <Modal
            title="Delete Selected Knowledge Bases"
            visible={isMutideleteModalVisible}
            onOk={async () => {
              setIsLoading(true);
              const success = await deleteMultipleKnowledgeBases(setIsChecked, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys, setMount);
              if (success) {
                setIsMultideleteModalVisible(false);

              }
            }}
            onCancel={() => handleCancelDeleteAllKnowledgeBaseModal(setSelectedRowKeys, setIsMultideleteModalVisible)}
          >
            <p>You are deleting Multiple Knowledgebase at a time.</p>
          </Modal>

          <ModalComponent
            title={isWebCrawlerSyncing ? "Sync Web Pages" : "Import a Website"}
            form={form}
            isImportWebPages={isImportWebPages}
            setIsImportWebPages={setIsImportWebPages}
            setIsWebCrawlerSyncing={setIsWebCrawlerSyncing}
            SubmitText={isWebCrawlerSyncing ? "Sync" : "Start Crawling"}
            url={baseUrlForSync}
            setBaseUrlForSync={setBaseUrlForSync}
            setIsLoading={setIsLoading}
            syncingRecordId={syncingRecordId}
            setSyncingRecordId = {setSyncingRecordId}
          />
          {/* {/* <YouTubeModalComponent
            title="Import YouTube Video Transcript"
            form={form}
            isImportYouTubeTranscript={isImportYouTubeTranscript}
            setIsImportYouTubeTranscript={setIsImportYouTubeTranscript}
            SubmitText="Import Transcript"
            url={baseUrlForSync}
            setIsLoading={setIsLoading}
            parentId={selectedFolder}

          /> */}
          <ActionItemModalComponent
            title={isActionItemSyncing ? "Sync Action Item" : "Add Action Item"}
            form={form}
            isAddActionItem={isAddActionItem}
            setIsAddActionItem={setIsAddActionItem}
            setIsActionItemSyncing={setIsActionItemSyncing}
            SubmitText={isActionItemSyncing ? "Sync" : "Add"}
            url={baseUrlOfWBforSync}
            setBaseUrlOfWBforSync={setBaseUrlOfWBforSync}
            setIsLoading={setIsLoading}
            syncingRecordId={syncingRecordId}
            setSyncingRecordId={setSyncingRecordId}
            parentId={selectedFolder}
          />
          <>
            {tabActiveKey === "1" ?
              (
                <div>
                  <Table
                    loading={tableLoading}
                    rowSelection={rowSelection}
                    rowClassName="custom-row-selected"
                    columns={columns.map((column) => ({ ...column, width: column.width || 150, }))}
                    dataSource={deduplicateSharedFiles(dataSource || [])}
                    expandable={{
                      expandedRowKeys: expandedRowKey ? [expandedRowKey] : [],
                      onExpand: (expanded, record) => {
                        // Ensure we're not re-expanding an already expanded row
                        if (expanded && expandedRowKey === record._id) {
                          return;
                        }
                        setExpandedRowKey(expanded ? record._id : null);
                      },
                      rowExpandable: (record) => {
                        const hasChildren = record.children &&
                          Array.isArray(record.children) &&
                          record.children.length > 0;
                        // Ensure we're not showing empty folders
                        return hasChildren;
                      },
                      childrenColumnName: 'children',
                      indentSize: 20
                    }}
                    childrenColumnName="children"
                    rowKey="_id"
                    scroll={{ x: 1000, y: 350 }}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      showSizeChanger: true,
                      position: ["topRight"],
                      onShowSizeChange: (current, size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      },
                      onChange: (page) => setCurrentPage(page),
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                  />
                  <Modal
                    title="Delete All Knowledge Base"
                    visible={isModalVisible}
                    onOk={() => handleOkDeleteAllKnowledgeBaseModal(userId, setSelectedRowKeys, setFolderStructure, setIsModalVisible)}
                    onCancel={() => handleCancelDeleteAllKnowledgeBaseModal(setSelectedRowKeys, setIsModalVisible)}
                  >
                    <p>You are deleting All KnowledgeBase.</p>
                  </Modal>

                </div>
              ) : <></>
            }

            {isAdmin ? (tabActiveKey === "2" ?
              (
                <div>
                  <Table
                    loading={tableLoading}
                    rowSelection={rowSelection}
                    rowClassName="custom-row-selected"
                    columns={columns.map((column) => ({ ...column, width: column.width || 150, }))}
                    dataSource={allUsersDataSource || []}
                    expandable={{
                      expandedRowKeys: expandedRowKeyOfAllData ? [expandedRowKeyOfAllData] : [],
                      onExpand: handleExpandOfAllData,
                      rowExpandable: record => record.children && record.children.length > 0,
                    }}
                    rowKey={record => record._id}
                    scroll={{ x: 1000, y: 350 }}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      showSizeChanger: true,
                      position: ["topRight"],
                      onShowSizeChange: (current, size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      },
                      onChange: (page) => setCurrentPage(page),
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                  />
                </div>
              ) : <></>
            ) : <></>}

            {tabActiveKey === "3" ?
              (
                <div>
                  {isAdmin ? <Table
                    loading={tableLoading}
                    rowSelection={rowSelection}
                    rowClassName="custom-row-selected"
                    columns={columns.map((column) => ({ ...column, width: column.width || 150, }))}
                    dataSource={organizationalDataSource || []}
                    expandable={{
                      expandedRowKeys: expandedRowKeyOfOrg ? [expandedRowKeyOfOrg] : [],
                      onExpand: handleExpandOfOrg,
                      rowExpandable: record => record.children && record.children.length > 0,
                    }}
                    rowKey={record => record._id}
                    scroll={{ x: 1000, y: 350 }}
                    pagination={{
                      current: currentPage,
                      pageSize: pageSize,
                      showSizeChanger: true,
                      position: ["topRight"],
                      onShowSizeChange: (current, size) => {
                        setPageSize(size);
                        setCurrentPage(1);
                      },
                      onChange: (page) => setCurrentPage(page),
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                    }}
                  /> :
                    (<Table
                      loading={isLoading}
                      columns={organizationalColumn.map((column) => ({ ...column, width: column.width || 150, }))}
                      dataSource={organizationalDataSource || []}
                      expandable={{
                        expandedRowKeys: expandedRowKeyOfOrg ? [expandedRowKeyOfOrg] : [],
                        onExpand: handleExpandOfOrg,
                        rowExpandable: record => record.children && record.children.length > 0,
                      }}
                      rowKey={record => record._id}
                      scroll={{ x: 1000, y: 350 }}
                      pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        showSizeChanger: true,
                        position: ["topRight"],
                        onShowSizeChange: (current, size) => {
                          setPageSize(size);
                          setCurrentPage(1);
                        },
                        onChange: (page) => setCurrentPage(page),
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`
                      }}
                    />)
                    // <></>
                  }
                  <Modal
                    title="Delete All Knowledge Base"
                    visible={isModalVisible}
                    onOk={() => handleOkDeleteAllKnowledgeBaseModal(userId, setSelectedRowKeys, setFolderStructure, setIsModalVisible)}
                    onCancel={() => handleCancelDeleteAllKnowledgeBaseModal(setSelectedRowKeys, setIsModalVisible)}
                  >
                    <p>You are deleting All KnowledgeBase.</p>
                  </Modal>
                </div>
              ) : <></>
            }
          </>
        </Content>

        <Modal
          title="Edit Folder Name"
          open={isShowEditFolderModal}
          onOk={() => handleUpdateFolderName()}
          onCancel={() => {
            setIsShowEditFolderModal(false);
            setNewFolderName("");
          }}
          className="knowledge-base-modal"
        >
          <Input
            placeholder="New Folder Name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onPressEnter={addFolder}
            style={{ marginBottom: '0.5rem' }}
          />
        </Modal>
      </Layout>
      <ShareFolderAccess
        dataSource={dataSource}
        isShowShareAccessModal={isShowShareAccessModal}
        setIsShowShareAccessModal={setIsShowShareAccessModal}
        setSelectedFolderData={setSelectedFolderData}
        selectedFolderData={selectedFolderData}
        setMount={setMount}
        mount={mount}
      />
    </Layout >
  );
};

export default KnowledgeBase