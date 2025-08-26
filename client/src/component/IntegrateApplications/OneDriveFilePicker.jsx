import React, { useEffect, useState } from 'react';
import { message, Modal, List, Breadcrumb, Spin } from 'antd';
import { Client } from '@microsoft/microsoft-graph-client';
import {
  FileOutlined,
  FolderOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FilePptOutlined,
  FileTextOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import oneDriveIcon from '../../assests/images/knowledge-base-menu/one_drive.png';
import { getUserID } from '../../Utility/service';
import { getAllServicesData } from '../../api/api_endpoints';
import { useNavigate } from "react-router-dom"
import "./oneDriveFile.css"

const userId = getUserID();

const OneDriveFilePicker = ({
  folderStructure,
  selectedFolder,
  selectedFile,
  setIsLoading,
  isLoading,
  token,
  setSelectedApp,
  setIsShowFolderListModal,
  setOpenCustomDropdown,
  setOneDriveFileInfo,
}) => {
  const [oneDriveClientId, setOneDriveClientId] = useState('');
  const [items, setItems] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState([{ id: 'root', name: 'OneDrive' }]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); 
  const navigate = useNavigate();
  const { confirm } = Modal;

  // Custom loading icon
  const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  // Supported file extensions
  const supportedExtensions = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'pdf', 'txt'];
  const maxFileSize = 1.5 * 1024 * 1024; // 1.5 MB in bytes

  // Map file extensions to icons
  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconStyle = { fontSize: 24, color: '#1890ff' };
    switch (extension) {
      case 'pdf':
        return <FilePdfOutlined style={iconStyle} />;
      case 'xls':
      case 'xlsx':
        return <FileExcelOutlined style={iconStyle} />;
      case 'doc':
      case 'docx':
        return <FileWordOutlined style={iconStyle} />;
      case 'ppt':
      case 'pptx':
        return <FilePptOutlined style={iconStyle} />;
      case 'txt':
        return <FileTextOutlined style={iconStyle} />;
      default:
        return <FileOutlined style={iconStyle} />;
    }
  };

  // Fetch clientId for Graph API (optional, for future use)
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const services = await getAllServicesData();
        const oneDriveService = services.find((service) => service.slug === 'onedrive');
        const clientIdField = oneDriveService?.authenticateFields.find(
          (field) => field.keyName === 'client_id'
        );
        if (clientIdField?.keyValue) {
          setOneDriveClientId(clientIdField.keyValue);
        } else {
          console.error('OneDrive client_id not found');
          // message.error('OneDrive client ID not configured');
        }
      } catch (error) {
        console.error('Error fetching clientId:', error);
        message.error('Failed to fetch OneDrive configuration');
      }
    };

    fetchClientId();
  }, []);

  // Initialize Microsoft Graph client
  const getGraphClient = () => {
    if (!token) {
      message.error('No access token provided for OneDrive');
      return null;
    }
    return Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
  };

  // Fetch items (files and folders) from OneDrive
  const fetchOneDriveItems = async (folderId = 'root') => {
    const client = getGraphClient();
    if (!client) return;

    setLoading(true);
    setItems([]); // Clear items while loading
    try {
      const path = folderId === 'root' ? '/me/drive/root/children' : `/me/drive/items/${folderId}/children`;
      const response = await client.api(path).get();
      const items = response.value.map((item) => ({
        ...item,
        isFolder: !!item.folder,
        isFile: !!item.file,
      }));
      setItems(items);
      setIsFilePickerOpen(true);
    } catch (error) {
      console.error('Error fetching OneDrive items:', error);
      if (error.statusCode === 401 || error.message?.includes('token is expired')) {
        confirm({
          title: "OneDrive Session Expired",
          content: (
            <div>
              <p>Your OneDrive session has expired. Please go to Connected apps page, disconnect and connect back to your OneDrive account to continue.</p>
            </div>
          ),
          okText: "Go to Profile",
          okType: "primary",
          onOk() {
            navigate("/profile", { state: { activeTabKey: "6" } });
          },
          cancelButtonProps: { style: { display: "none" } },
        });
      } else {
        message.error('Failed to fetch items from OneDrive');
      }
    } finally {
      setLoading(false);
      setInitialLoading(false); 
    }
  };

  // Handle folder navigation
  const handleFolderClick = (item) => {
    if (item.isFolder) {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
      fetchOneDriveItems(item.id);
      setSelectedFiles([]);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    fetchOneDriveItems(newPath[newPath.length - 1].id);
    setSelectedFiles([]);
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!supportedExtensions.includes(extension)) {
      message.warning(`File type (.${extension}) is not supported`);
      return;
    }
    if (file.size > maxFileSize) {
      message.warning(`File "${file.name}" exceeds 1.5 MB limit`);
      return;
    }

    setSelectedFiles((prev) => {
      if (prev.some((f) => f.id === file.id)) {
        return prev.filter((f) => f.id !== file.id);
      }
      return [...prev, file];
    });
  };

  // Handle file picker confirmation
  const handlePicked = () => {
    if (selectedFiles.length === 0) {
      message.warning('No files selected');
      return;
    }

    const filesInfo = selectedFiles.map((file) => {
      let name = file.name;
      name = name.replace(/[\/\\*|"?]/g, ' ');

      return {
        name: name,
        size: file.size,
        type: 'file',
        category: file.file?.mimeType || getMimeType(file.name),
        fileId: file.id,
        url: file.webUrl || file['@microsoft.graph.downloadUrl'],
      };
    });

    setOneDriveFileInfo(filesInfo);
    setIsShowFolderListModal(true);
    setOpenCustomDropdown(false);
    setSelectedApp('oneDrive');
    setIsFilePickerOpen(false);
    setSelectedFiles([]);
  };

  // Open file picker
  const openOneDrivePicker = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!token) {
      confirm({
        title: "OneDrive Not Connected",
        content: (
          <div>
            <p>OneDrive is not connected. You need to connect it first from your profile.</p>
          </div>
        ),
        okText: "Go to Profile",
        okType: "primary",
        onOk() {
          navigate("/profile", { state: { activeTabKey: "6" } }); // Navigate to Integrate Applications tab
        },
        cancelButtonProps: { style: { display: "none" } },
      });
      return;
    }

    setInitialLoading(true); 
    fetchOneDriveItems();
  };

  const getMimeType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    const mimeTypes = {
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pdf: 'application/pdf',
      txt: 'text/plain',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  };

  return (
    <>
      <li className="tool-item" onClick={openOneDrivePicker} style={{ cursor: 'pointer' }}>
        <div className="tool-item-icon">
          <img src={oneDriveIcon} alt="OneDrive Icon" style={{ width: 25, height: 25 }} />
        </div>
        <div className="tool-item-info">
          <div className="tool-name">Import From OneDrive</div>
          <p className="tool-details">Add Word, Excel, PowerPoint files (max file size 1.5 MB)</p>
        </div>
      </li>
      {initialLoading && (
        <div className="onedrive-loading-overlay">
        <Spin indicator={loadingIcon} tip="Loading OneDrive..." size="large" />
        </div>
      )}

      {/* File Picker Modal */}
      <Modal
        title="Select Files from OneDrive"
        open={isFilePickerOpen}
        onOk={handlePicked}
        onCancel={() => {
          setIsFilePickerOpen(false);
          setSelectedFiles([]);
          setCurrentPath([{ id: 'root', name: 'OneDrive' }]);
          setItems([]);
        }}
        okText="Select"
        cancelText="Cancel"
        width={800}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
        confirmLoading={loading}
      >
        <Breadcrumb style={{ marginBottom: 16 }}>
          {currentPath.map((folder, index) => (
            <Breadcrumb.Item key={folder.id}>
              <a onClick={() => handleBreadcrumbClick(index)}>{folder.name}</a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>

        <Spin
          spinning={loading}
          indicator={loadingIcon}
          tip="Loading files..."
          size="large"
          style={{ minHeight: '200px' }}
        >
          {loading ? (
            <div style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {/* Empty div to maintain height while loading */}
            </div>
          ) : (
            <List
              grid={{ gutter: 16, column: 1 }}
              dataSource={items}
              locale={{ emptyText: 'No files or folders found' }}
              renderItem={(item) => (
                <List.Item
                  onClick={() => (item.isFolder ? handleFolderClick(item) : handleFileSelect(item))}
                  style={{
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '4px',
                    background: selectedFiles.some((f) => f.id === item.id)
                      ? 'rgba(24, 144, 255, 0.15)'
                      : 'transparent',
                    border: selectedFiles.some((f) => f.id === item.id)
                      ? '1px solid rgba(24, 144, 255, 0.6)'
                      : 'none',
                    transition: 'background 0.2s ease',
                  }}
                >

                  <List.Item.Meta
                    avatar={item.isFolder ? <FolderOutlined style={{ fontSize: 24, color: '#faad14' }} /> : getFileIcon(item.name)}
                    title={item.name}
                    description={
                      item.isFile
                        ? `Size: ${(item.size / 1024).toFixed(2)} KB | Type: ${item.file?.mimeType || getMimeType(item.name)
                        }`
                        : 'Folder'
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Spin>
      </Modal>
    </>
  );
};

export default OneDriveFilePicker;