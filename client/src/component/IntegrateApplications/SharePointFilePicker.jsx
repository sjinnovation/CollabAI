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
import sharePointIcon from '../../assests/images/knowledge-base-menu/sharepoint.png';
import { getUserID } from '../../Utility/service';
import { getAllServicesData } from '../../api/api_endpoints';
import { useNavigate } from 'react-router-dom';

const userId = getUserID();

const SharePointFilePicker = ({
  folderStructure,
  selectedFolder,
  selectedFile,
  setIsLoading,
  isLoading,
  token,
  setSelectedApp,
  setIsShowFolderListModal,
  setOpenCustomDropdown,
  setSharePointFileInfo,
}) => {
  const [sharePointClientId, setSharePointClientId] = useState('');
  const [sites, setSites] = useState([]);
  const [drives, setDrives] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState([{ id: 'root', name: 'SharePoint Sites' }]);
  const [currentSite, setCurrentSite] = useState(null);
  const [currentDrive, setCurrentDrive] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const navigate = useNavigate();
  const { confirm } = Modal;

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

  // Fetch clientId for Graph API
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const services = await getAllServicesData();
        const sharePointService = services.find((service) => service.slug === 'sharepoint');
        const clientIdField = sharePointService?.authenticateFields.find(
          (field) => field.keyName === 'client_id'
        );
        if (clientIdField?.keyValue) {
          setSharePointClientId(clientIdField.keyValue);
        } else {
          console.error('SharePoint client_id not found');
          // message.error('SharePoint client ID not configured');
        }
      } catch (error) {
        console.error('Error fetching clientId:', error);
        message.error('Failed to fetch SharePoint configuration');
      }
    };

    fetchClientId();
  }, []);

  // Initialize Microsoft Graph client
  const getGraphClient = () => {
    if (!token) {
      message.error('No access token provided for SharePoint');
      return null;
    }
    return Client.init({
      authProvider: (done) => {
        done(null, token);
      },
    });
  };

  // Fetch SharePoint sites
  const fetchSharePointSites = async () => {
    const client = getGraphClient();
    if (!client) return;

    setLoading(true);
    try {
      const response = await client.api('/sites?search=*').get();
      const sites = response.value.map((site) => ({
        id: site.id,
        name: site.displayName,
        isSite: true,
      }));
      setSites(sites);
      setItems(sites);
      setIsFilePickerOpen(true);
      setCurrentPath([{ id: 'root', name: 'SharePoint Sites' }]);
    } catch (error) {
      console.error('Error fetching SharePoint sites:', error);
      message.error('Failed to fetch SharePoint sites');
      if (error.statusCode === 401 || error.message?.includes('token is expired')) {
        confirm({
          title: "SharePoint Session Expired",
          content: (
            <div>
              <p>Your SharePoint session has expired. Please go to Connected apps page, disconnect and connect back to your OneDrive account to continue.</p>
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
    }

    finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  // Fetch document libraries (drives) for a site
  const fetchDrives = async (siteId) => {
    const client = getGraphClient();
    if (!client) return;

    setLoading(true);
    try {
      const response = await client.api(`/sites/${siteId}/drives`).get();
      const drives = response.value.map((drive) => ({
        id: drive.id,
        name: drive.name,
        isDrive: true,
      }));
      setDrives(drives);
      setItems(drives);
      setCurrentPath([...currentPath, { id: siteId, name: currentSite.name }]);
    } catch (error) {
      console.error('Error fetching drives:', error);
      message.error('Failed to fetch document libraries');
    } finally {
      setLoading(false);
    }
  };

  // Fetch items (files and folders) from a document library
  const fetchDriveItems = async (driveId, folderId = 'root') => {
    const client = getGraphClient();
    if (!client) return;

    setLoading(true);
    try {
      const path =
        folderId === 'root'
          ? `/drives/${driveId}/root/children`
          : `/drives/${driveId}/items/${folderId}/children`;
      const response = await client.api(path).get();
      const items = response.value.map((item) => ({
        ...item,
        isFolder: !!item.folder,
        isFile: !!item.file,
      }));
      setItems(items);
    } catch (error) {
      console.error('Error fetching drive items:', error);
      message.error('Failed to fetch items from document library');
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation (sites, drives, folders)
  const handleItemClick = (item) => {
    if (item.isSite) {
      setCurrentSite(item);
      fetchDrives(item.id);
    } else if (item.isDrive) {
      setCurrentDrive(item);
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
      fetchDriveItems(item.id);
      setSelectedFiles([]);
    } else if (item.isFolder) {
      setCurrentPath([...currentPath, { id: item.id, name: item.name }]);
      fetchDriveItems(currentDrive.id, item.id);
      setSelectedFiles([]);
    } else {
      handleFileSelect(item);
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    const newPath = currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    const target = newPath[newPath.length - 1];
    if (target.id === 'root') {
      fetchSharePointSites();
    } else if (currentSite && !currentDrive) {
      fetchDrives(target.id);
    } else if (currentDrive) {
      fetchDriveItems(currentDrive.id, target.id === currentSite.id ? 'root' : target.id);
    }
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
        siteId: currentSite.id,
        driveId: currentDrive.id,
      };
    });

    setSharePointFileInfo(filesInfo);
    setIsShowFolderListModal(true);
    setOpenCustomDropdown(false);
    setSelectedApp('sharePoint');
    setIsFilePickerOpen(false);
    setSelectedFiles([]);
  };

  // Open file picker
  const openSharePointPicker = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!token) {
      confirm({
        title: 'SharePoint Not Connected',
        content: (
          <div>
            <p>SharePoint is not connected. You need to connect it first from your profile.</p>
          </div>
        ),
        okText: 'Go to Profile',
        okType: 'primary',
        onOk() {
          navigate('/profile', { state: { activeTabKey: '6' } });
        },
        cancelButtonProps: { style: { display: 'none' } },
      });
      return;
    }
    setInitialLoading(true); 
    fetchSharePointSites();
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
      <li className="tool-item" onClick={openSharePointPicker} style={{ cursor: 'pointer' }}>
        <div className="tool-item-icon">
          <img src={sharePointIcon} alt="SharePoint Icon" style={{ width: 25, height: 25 }} />
        </div>
        <div className="tool-item-info">
          <div className="tool-name">Import From SharePoint</div>
          <p className="tool-details">Add Word, Excel, PowerPoint files (max file size 1.5 MB)</p>
        </div>
      </li>

      {initialLoading && (
              <div className="onedrive-loading-overlay">
              <Spin indicator={loadingIcon} tip="Loading OneDrive..." size="large" />
              </div>
      )}

      <Modal
        title="Select Files from SharePoint"
        open={isFilePickerOpen}
        onOk={handlePicked}
        onCancel={() => {
          setIsFilePickerOpen(false);
          setSelectedFiles([]);
          setCurrentPath([{ id: 'root', name: 'SharePoint Sites' }]);
          setItems([]);
          setCurrentSite(null);
          setCurrentDrive(null);
        }}
        okText="Select"
        cancelText="Cancel"
        width={800}
        bodyStyle={{ maxHeight: '60vh', overflowY: 'auto' }}
      >
        <Breadcrumb style={{ marginBottom: 16 }}>
          {currentPath.map((folder, index) => (
            <Breadcrumb.Item key={folder.id}>
              <a onClick={() => handleBreadcrumbClick(index)}>{folder.name}</a>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
        <Spin spinning={loading}>
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={items}
            renderItem={(item) => (
              <List.Item
                onClick={() => handleItemClick(item)}
                style={{
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '4px',
                  background: selectedFiles.some((f) => f.id === item.id) ? '#e6f7ff' : 'transparent',
                  border: selectedFiles.some((f) => f.id === item.id) ? '1px solid #1890ff' : 'none',
                }}
              >
                <List.Item.Meta
                  avatar={
                    item.isSite || item.isDrive || item.isFolder ? (
                      <FolderOutlined style={{ fontSize: 24, color: '#faad14' }} />
                    ) : (
                      getFileIcon(item.name)
                    )
                  }
                  title={item.naame}
                  description={
                    item.isFile
                      ? `Size: ${(item.size / 1024).toFixed(2)} KB | Type: ${item.file?.mimeType || getMimeType(item.name)
                      }`
                      : item.isSite
                        ? 'SharePoint Site'
                        : item.isDrive
                          ? 'Document Library'
                          : 'Folder'
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Modal>
    </>
  );
};

export default SharePointFilePicker;