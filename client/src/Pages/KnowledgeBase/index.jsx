import React, { useEffect, useState, useRef, useContext } from "react";
import { Layout, Table, Button, Dropdown, Menu, message, Space, Tree, Input, Modal, Tooltip, Tabs, Switch, Tag } from 'antd';
import { FolderOpenOutlined, DownOutlined, FolderAddOutlined, UpOutlined, FileOutlined } from '@ant-design/icons';
import './KnowledgeBase.css';
import { getUserID } from '../../Utility/service';
import { ThemeContext } from "../../contexts/themeConfig";
import DebouncedSearchInput from "../SuperAdmin/Organizations/DebouncedSearchInput";
import { MdOutlineUploadFile } from "react-icons/md";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { createKnowledgeBase } from "../../api/knowledgeBase";
import { FileTree } from "../../component/KnowledgeBase/FileTree";
import { getAllFiles, getParentFolderNames, addFolderToParent, searchItems, handleFileChange, handleOkDeleteAllKnowledgeBaseModal, handleCancelDeleteAllKnowledgeBaseModal, flattenData, deleteItem, deleteMultipleKnowledgeBases } from "../../component/KnowledgeBase/FileHelpers";
import GoogleFilePicker from "../../component/KnowledgeBase/importFromGoogle";
import { FileContext } from "../../contexts/FileContext";
import { ShowFileTree } from "../../component/KnowledgeBase/ShowFileTree";
import { FaGoogleDrive } from "react-icons/fa";
import { updateKnowledgeBase } from "../../api/knowledgeBase";
import { assistantListModal } from "../../component/KnowledgeBase/Modals";
import { LoginWithGoogle } from "../../component/IntegrateApplications/LoginWithGoogle";

const { Sider, Content } = Layout;
const { confirm } = Modal;
const userId = getUserID();

const KnowledgeBase = () => {
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showFileTree, setShowFileTree] = useState(true);
  const [selectedFile, setSelectedFile] = useState('');
  const [selectedMyFiles, setSelectedMyFiles] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [allUsersFileTreeStructure, setAllUsersFileTreeStructure] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false)
  const [isUploading, setIsUploading] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTree, setSelectedTree] = useState(0);
  const [allPublicData, setAllPublicData] = useState([]);
  const [deselectedFolderKey, setDeselectedFolderKey] = useState('');
  const [enableMultipleDelete,setEnableMultipleDelete] = useState(false);
  const [isMutideleteModalVisible, setIsMultideleteModalVisible] = useState(false)
  const fileInputRef = useRef(null);
  const treeRef = useRef(null);
  const dropdownRef = useRef(null);
  const [autoTriggerPicker, setAutoTriggerPicker] = useState(false);


  const { theme } = useContext(ThemeContext);
  const { selectedRowKeys, setSelectedRowKeys, folderStructure, setFolderStructure, fileList, setFileList, isModalVisible, setIsModalVisible, publicFilesStructure, setPublicFilesStructure } = useContext(FileContext);
  const {isConnected, setIsConnected,token, setToken}=useContext(FileContext);



  const handleFromDevice = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileInputClick = (event) => {
    event.stopPropagation(); // Prevent click propagation to the document mousedown event
  };
  const addFolder = async () => {
    
    if (!newFolderName) return;
    if (newFolderName?.includes(".") || newFolderName?.includes("@") || newFolderName?.includes(",") || newFolderName?.includes(":") || newFolderName?.includes(";")) return message.error("do not put dot(.) ,spaces and special characters in the folder name")
    const newFolder = {
      name: newFolderName,
      key: `${selectedFolder}-${new Date().getTime()}`,
      type: 'folder',
      children: []
    };

    const updatedStructure =[...folderStructure, newFolder];
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
    getAllFiles(setIsAdmin, setAllUsersFileTreeStructure, setFiles, setFolderStructure, setAllPublicData, setPublicFilesStructure,setIsLoading,setIsChecked);

  }, [isChecked,isLoading]);

  useEffect(() => {
    if (token && isConnected) {
      setAutoTriggerPicker(true);
    }
  }, [token, isConnected]);

  const deleteModal = (record) => {
    confirm({
      title: `Are you sure you want to delete ${record.type}?`,
      content: `You are deleting ${record?.name}.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        deleteItem(record?.key, setIsLoading, fileList, setFileList, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys)
      },
      onCancel() {
        console.log('Cancel');
      },
    });

  };

  const updatePublicState = async (id, owner, isPublic) => {

    const requestBody = {
      isPublic: isPublic,
      owner: owner
    }
    const isPubLicStateChanged = await updateKnowledgeBase(id, requestBody);
    if (isPubLicStateChanged.success) {
      setIsChecked(true);
      message.success(isPubLicStateChanged.message);
    } else {
      message.error(isPubLicStateChanged.message);

    }

  }
  const treeId = ['1', '2', '3'];


  const closeModal = () => {
    setIsVisible(false);
  };
  const columns = [
    {
      title: 'Name', dataIndex: 'name', key: 'name', align: "center", render: (text, record) => (
        <span>
          {record?.type === 'folder' ? (
            <FolderOpenOutlined style={{ marginRight: 8 }} />
          ) : (
            <FileOutlined style={{ marginRight: 8 }} />
          )}
          {record?.type === 'folder' ? record.title : record.name.split('/')[record.name.split('/').length - 1]}
        </span>
      ),
    },

    { title: 'Owner', dataIndex: 'owner', key: 'owner', align: "center", },
    { title: 'Size (MB)', dataIndex: 'size', key: 'size', align: "center" },
    {
      title: 'Folder/File Type', dataIndex: 'isPublic', key: 'isPublic', align: "center",
      render: (_, record) => (
        record?.isPublic ? "Public" : "Private"
      )
    },

    { title: 'Last Edited', dataIndex: 'timeDifference', key: 'timeDifference', align: "center" },
    {
      title: 'Associate Agents',
      dataIndex: 'assistantNameList',
      key: 'assistantNameList',
      align: "center",
      render: (_, record) => (
        <div>
          {/* Edit button */}

          {record?.assistantNameList?.length === 1 && record?.assistantNameList[0] === '-' ? '-' : <Button
            type="link"
            onClick={() => {
              setIsVisible(true);
              assistantListModal(record?.assistantNameList, isVisible)

            }}
            style={{ marginRight: 8 }}
          >
            <span>
              <i className="bi bi-arrow-up-right-circle "></i>
            </span>


          </Button>}
        </div>
      ),
    }

    ,

    {
      title: 'Action', key: 'action', align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Delete">
            <Button onClick={() => deleteModal(record)} icon={<AiOutlineDelete />} />
          </Tooltip>
          {isAdmin && <Tooltip title="Public or Private">
            <Switch
              checked={record?.isPublic}
              onClick={async (checked) => { await updatePublicState(record?._id, record?.userId, checked) }}
            />
          </Tooltip>

          }

        </Space>
      ),
    },
  ];
  const organizationalColumn = [
    {
      title: 'Name', dataIndex: 'name', key: 'name', align: "center", render: (text, record) => (
        <span>
          {record?.type === 'folder' ? (
            <FolderOpenOutlined style={{ marginRight: 8 }} />
          ) : (
            <FileOutlined style={{ marginRight: 8 }} />
          )}
          {record?.type === 'folder' ? record.title : record.name.split('/')[record.name.split('/').length - 1]}
        </span>
      ),
    },

    { title: 'Owner', dataIndex: 'owner', key: 'owner', align: "center", },
    { title: 'Size (MB)', dataIndex: 'size', key: 'size', align: "center" },
    {
      title: 'Folder/File Type', dataIndex: 'isPublic', key: 'isPublic', align: "center",
      render: (_, record) => (
        record?.isPublic ? "Public" : "Private"
      )
    },

    { title: 'Last Edited', dataIndex: 'timeDifference', key: 'timeDifference', align: "center" },
    {
      title: 'Associate Assistants',
      dataIndex: 'assistantNameList',
      key: 'assistantNameList',
      align: "center",
      render: (_, record) => (
        <div>
          {/* Edit button */}

          {record?.assistantNameList?.length === 1 && record?.assistantNameList[0] === '-' ? '-' : <Button
            type="link"
            onClick={() => {
              setIsVisible(true);
              assistantListModal(record?.assistantNameList, isVisible)

            }}
            style={{ marginRight: 8 }}
          >
            <span>
              <i className="bi bi-arrow-up-right-circle "></i>
            </span>


          </Button>}
        </div>
      ),
    }

    ,

  ];
  const items = [
    {
      key: treeId[0],
      label: 'My Files',
      onClick: () => { setSelectedMyFiles(true); setSelectedTree(0) },
      children:
        <div>
          <Table
            loading={isLoading}
            rowSelection={rowSelection}
            columns={columns.map((column) => ({...column,width: column.width || 150,}))}
            dataSource={dataSource}
            rowKey="key"
            scroll={{ x: 300,y :350 }} 
            pagination={{ pageSize: 10 }} 

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
    },

    isAdmin && {
      key: treeId[1],
      label: 'All User Files',
      onClick: () => { setSelectedMyFiles(false); setSelectedTree(1) },
      children: <div>
        <Table
          loading={isLoading}
          rowSelection={rowSelection}
          columns={columns.map((column) => ({...column,width: column.width || 150,}))}
          dataSource={allUsersDataSource}
          rowKey="key"
          scroll={{ x: 300,y :350 }} 
            pagination={{ pageSize: 10 }} 
        />

      </div>
    },
    {
      key: treeId[3],
      label: 'Organizational Files',
      onClick: () => { setSelectedMyFiles(false); setSelectedTree(2) },
      children:
        <div>
          {isAdmin ? <Table
            loading={isLoading}
            rowSelection={rowSelection}
            columns={columns.map((column) => ({...column,width: column.width || 150,}))}
            dataSource={organizationalDataSource}
            rowKey="key"
            scroll={{ x: 300,y :350 }} 
            pagination={{ pageSize: 10 }} 
          /> : <Table
            loading={isLoading}
            columns={organizationalColumn.map((column) => ({...column,width: column.width || 150,}))}
            dataSource={organizationalDataSource}
            rowKey="key"
            scroll={{ x: 300,y :350 }} 
            pagination={{ pageSize: 10 }} 
          />}
          <Modal
            title="Delete All Knowledge Base"
            visible={isModalVisible}
            onOk={() => handleOkDeleteAllKnowledgeBaseModal(userId, setSelectedRowKeys, setFolderStructure, setIsModalVisible)}
            onCancel={() => handleCancelDeleteAllKnowledgeBaseModal(setSelectedRowKeys, setIsModalVisible)}
          >
            <p>You are deleting All KnowledgeBase.</p>
          </Modal>
        </div>
    },

  ].filter(Boolean);


  return (

    <Layout className="parentLayout" >
      <Sider width={350} align={"center"} style={{ backgroundColor: theme === "light" ? "#fff" : "#000" }} >
        <Dropdown overlay={
          <Menu>
            <Menu.Item key="1" onClick={() => setIsCreatingFolder(true)}><FolderAddOutlined /> Create Folder</Menu.Item>
            <Menu.Item key="2" onClick={handleFromDevice}><MdOutlineUploadFile /> Upload Document (Max File Size 4.5MB)</Menu.Item>
            <Menu.Item key="3" >
              {isConnected === false || token ===''?
              <LoginWithGoogle setToken={setToken} setIsConnected={setIsConnected} />:
                <GoogleFilePicker
                  folderStructure={folderStructure}
                  selectedFolder={selectedFolder}
                  setIsLoading={setIsLoading}
                  isLoading={isLoading}
                  token={token}
                  autoTriggerPicker={autoTriggerPicker} 
                  setAutoTriggerPicker={setAutoTriggerPicker}
                />}</Menu.Item>


          </Menu>
        } placement="bottomLeft" ref={dropdownRef}>
          <Button className="plusNewButton" ref={dropdownRef}>+New</Button>
        </Dropdown>

        <>
          <div className="treeParent">
            <Button className="allFilesShowButton" onClick={() => setShowFileTree(!showFileTree)}>
              <div>
                {showFileTree ? <DownOutlined style={{ marginRight: 8 }} /> : <UpOutlined style={{ marginRight: 8 }} />}
                <FolderOpenOutlined style={{ marginRight: 8 }} />
                All Files
              </div>
              <div>{showFileTree ? "-" : "+"}</div>
            </Button>

            {isCreatingFolder && (
              <div className="createFolder" ref={dropdownRef}>
                <Input
                  placeholder="New Folder Name"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  onPressEnter={addFolder}
                  style={{ marginBottom: '0.5rem' }}
                />
                <Button onClick={addFolder} style={{ width: "100%" }}>
                  Add Folder
                </Button>
                <Button onClick={() => { setIsCreatingFolder(false) }} style={{ width: "100%" }}>
                  Cancel
                </Button>
              </div>
            )}

            {showFileTree && <div ref={treeRef}>
              <ShowFileTree
                dataProps={{
                  selectedMyFiles, folderStructure, setFolderStructure, selectedFolder, setSelectedFolder, selectedFile, setSelectedFile, isAdmin, allUsersFileTreeStructure, setAllUsersFileTreeStructure, allPublicData, publicFilesStructure, setPublicFilesStructure
                }}
              />
            </div>
            }
          </div>
        </>
        <input type="file" multiple ref={fileInputRef} style={{ display: 'none' }} onClick={() => setIsUploading(true)} onChange={async (event) => {
          await handleFileChange(event,
            setIsLoading,
            selectedFolder,
            folderStructure,
            setFolderStructure,
            setFileList,
            setSelectedFolder,
            setSelectedFile,
            fileInputRef, setIsUploading);
          if (fileInputRef.current && isUploading) {
            fileInputRef.current.value = '';
          }
        }
        } />

      </Sider>
      <Layout>
        <Content className="tableContent" >
          <DebouncedSearchInput data={{ search: searchQuery, setSearch: setSearchQuery, placeholder: "Search Files", customStyle: { width: 500, height: 100 }, size: "large" }} />

          <div className="large-icon-container">
            <FolderOpenOutlined className="large-icon lg" />
            <span> Knowledge Base</span>
          </div>
          <div className="description-container">
            <span>Knowledge Base Document's Inventory</span>
          </div>
          <Button disabled={selectedRowKeys.length ===1 ?(enableMultipleDelete === false): selectedRowKeys.length<=1} onClick={() => setIsMultideleteModalVisible(true)} icon={<AiOutlineDelete />}>Delete</Button>

          <Modal
            title="Delete Selected Knowledge Bases"
          
            visible={isMutideleteModalVisible}
            onOk={async () => {
              setIsLoading(true);
              const success = await deleteMultipleKnowledgeBases(setIsChecked, folderStructure, setFolderStructure, selectedRowKeys, setSelectedRowKeys);
              if (success) {
                setIsMultideleteModalVisible(false);

              }
            }}
            onCancel={() => handleCancelDeleteAllKnowledgeBaseModal(setSelectedRowKeys, setIsMultideleteModalVisible)}
          >

            <p>You are deleting Multiple Knowledgebase at a time.</p>
          </Modal>
          <Space className="tabs" direction="vertical" ref={dropdownRef}>
            <Tabs defaultActiveKey="1" items={items} onChange={(key) => {
              const item = items.find((item) => item.key === key);
              if (item && item.onClick) item.onClick();
            }} />

          </Space>
        </Content>
      </Layout>

    </Layout >
  );
};

export default KnowledgeBase