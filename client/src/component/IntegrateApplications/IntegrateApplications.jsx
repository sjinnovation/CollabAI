import { Button, Form, Modal, Space, Switch, Table, Tag, Tooltip, message, notification, Avatar, Input, Row, Col, Tabs } from "antd";
import { useEffect, useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { getUserID } from "../../Utility/service";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { getGoogleAuthCredentials } from "../../api/googleAuthApi";
import { axiosSecureInstance } from "../../api/axios";
import googleDriveIcon from '../../assests/images/knowledge-base-menu/google_drive_icon.svg';
import workBoardIcon from '../../assests/images/knowledge-base-menu/workboard_icon.svg';
import fireCrawl from '../../assests/images/knowledge-base-menu/fire_crawl_icon.svg';
import fluxIcon from '../../assests/images/flux.png';
import n8nIcon from '../../assests/images/n8n-logo.png';
import { FileContext } from "../../contexts/FileContext";
import { GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS, GOOGLE_AUTH_SLUG, GOOGLE_DRIVE_FILES_GETTING_SLUG, REACT_APP_WORKBOARD_AUTH_URL, REACT_APP_WORKBOARD_REDIRECT_URI, SYNC_GOOGLE_DRIVE_FILES, SYNC_WORKBOARD_ACTION_ITEM, WORKBOARD_AUTH_SLUG } from "../../constants/Api_constants";
import { useContext } from "react";
import { getWorkBoardAuthCredentials } from "../../api/workBoard";
import { InputModal } from "../common/InputModal";
import { AddWebCrawlKeyFormData } from "./webCrawlForms";
import { deleteFireCrawlKeyFromDB, storeFireCrawlKeyToDB } from "../../api/webCrawl";
import { AddFluxKeyFormData } from "./fluxForms";
import { deleteFluxKeyFromDB, storeFluxKeyToDB } from "../../api/fluxImageGenerator";
import { deleteIntegrateAppsCredsFromDB, getConnectionStatus, storeIntegrateAppsCredsToDB } from "../../api/IntegrateApps";
import { getAllServices, getService } from "../../api/api_endpoints";
import { IntegrateAppsModal } from "../common/ApiModal";
import { connectN8n, disconnectN8n, getN8nConnectionStatus } from "../../api/user";

import axios from "axios";
import { AddIntegrateAppsCredsFormData, OauthConnect, validateAndRedirect } from "./IntegrateAppsForm";
import WorkBoardSync from "../../Pages/WorkBoard/WorkBoard";
import { Link, useNavigate } from "react-router-dom";
const { Title } = Typography;
const userId = getUserID();


export const IntegrateApplications = ({isLoading}) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  let workboardToken = localStorage.getItem('workboard_access_token') || '';
  let acToken = localStorage.getItem("acToken");

  const {
    isConnected,
    setIsConnected,
    token,
    setToken,
    isWorkBoardConnected,
    setIsWorkBoardConnected,
    workBoardToken,
    setWorkBoardToken,
    isWebCrawlConnected,
    setIsWebCrawlConnected,
    isIntegrateAppsConnected,
    setIsIntegrateAppsConnected,
    isFluxConnected,
    setIsFluxConnected,
    setIsLoading
  }=useContext(FileContext);

  const [showSyncFileAlertModal, setShowSyncFileAlertModal] = useState(false);
  const [isWebCrawlerModalOpen,setIsWebCrawlerModalOpen] = useState(false);
  const [isFluxModalOpen,setIsFluxModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [apiResponse, setApiResponse] = useState([{}]);
  const [formitems, setFormitems] = useState([]);
  const [app, setApp] = useState([]);
  
  const allServices = async () => {
    const services = await getAllServices();
    setApiResponse(services.data.data);
  };
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);
    useEffect(() => {
      allServices(); 
    }, []); 
  
    useEffect(() => {
      const fetchConnectionStatuses = async () => {
        if (apiResponse.length === 0) return; 
  
        const appsWithConnection = await Promise.all(
          apiResponse.map(async (record) => {
            const isConnected = await checkServiceConnection(record._id); 
            return {
              name: record.service_name,
              isConnected,
              connect: (service_id, authType, authFields, authenticateFields, oauthurl, tokenurl, baseurl, type, contentType) =>
                handleIntegrateAppsConnect(service_id, authType, authFields, authenticateFields, oauthurl, tokenurl, baseurl, type, contentType),
              disconnect: (service_id, authType) => handleIntegrateAppsDisconnect(service_id, authType),
            };
          })
        );
  
        setApp(appsWithConnection); 
      };
  
      fetchConnectionStatuses();
    }, [apiResponse]); 

  const [isVerified, setIsVerified] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isIntegrateAppsModalOpen,setIsIntegrateAppsModalOpen] = useState(false);
  const [serviceid, setServiceId] = useState('');
  const [applicationsData, setApplicationsData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAppName, setCurrentAppName] = useState("");
  const [currentFields, setCurrentFields] = useState([]);
  const [appConfig, setAppConfig] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedApp, setSelectedApp] = useState(null);
  
  // n8n states
  const [isN8nConnected, setIsN8nConnected] = useState(false);
  const [isN8nModalOpen, setIsN8nModalOpen] = useState(false);
  const [isN8nConnecting, setIsN8nConnecting] = useState(false);
  const [n8nForm] = Form.useForm();

  useEffect(()=>{
    if(workboardToken){
      setWorkBoardToken(workboardToken);
    }

  },[workboardToken]);

  useEffect(() => {
    getGoogleAuthCredentials(userId, setIsConnected, setToken,setIsLoading);
    getWorkBoardAuthCredentials(
      userId,
      setIsWorkBoardConnected,
      setWorkBoardToken
    );
    allServices();
    
    // Check n8n connection status
    const checkN8nConnection = async () => {
      try {
        const response = await getN8nConnectionStatus(userId);
        if (response.data.success) {
          setIsN8nConnected(response.data.isN8nConnected);
        }
      } catch (error) {
        console.error('Error checking n8n connection:', error);
      }
    };
    checkN8nConnection();
  }, []);

  useEffect(() => {
      const fetchApps = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/get-apps`);
          const apps = response.data.apps.map((app) => ({
            key: app._id,
            name: app.service_name,
            slug: app.slug,
            status: app.is_active ? 'Connected' : 'Disconnected',
            icon: (
              <img
                src={app.service_icon} 
                alt={`${app.service_name} Icon`}
                style={{ width: 25, height: 25, marginRight: 9, marginLeft: 0, alignItems: 'left' }}
              />
            ),
            isConnected: app.is_active, 
            // connect: () => handleConnect(app.slug), // Define connection logic
            // disconnect: () => handleDisconnect(app.slug), // Define disconnection logic
          }));
          setApplicationsData(apps);
        } catch (error) {
          console.error('Error fetching apps:', error);
        }
      };
  
      fetchApps();
    }, []);

  useEffect(() => {
    if (token) {
      fetch(GOOGLE_DRIVE_FILES_GETTING_SLUG, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => response.json())
        .catch((error) => console.error('Error fetching files:', error));
    }
  }, [token]);



    


  const handleOpenModal = async (appId) => {
      if (!appId) {
        console.error('appId is undefined');
        return;
      }
      try {
        // Fetch the app configuration using the slug as the identifier
        const response = await axios.get(`${process.env.REACT_APP_BASE_URL}api/config/${appId}`);
        const appConfigFromDB = response.data;
  
        if (!appConfigFromDB) {
          console.error('No app configuration found');
          message.error('No app configuration found.');
          return;
        }
  
        // Set the fetched app configuration to state
        setAppConfig({
          _id: appConfigFromDB._id,
          name: appConfigFromDB.service_name,
          slug: appConfigFromDB.slug,
          icon: appConfigFromDB.service_icon,
          customFields: appConfigFromDB.customFields || [],
        });
  
        // Prepare initial form data for the custom fields
        const initialFormData = (appConfigFromDB.customFields || []).reduce((acc, field) => {
          acc[field.name] = ''; // Initialize each field with an empty value
          return acc;
        }, {});
        setFormData(initialFormData);
  
        // Open the modal
        setIsModalVisible(true);
      } catch (error) {
        console.error('Error fetching app configuration:', error);
        message.error('Failed to fetch app configuration.');
      }
    };
  const handleConnectClick = (app) => {
    setCurrentAppName(app.name);
    setCurrentFields(app.fields || []);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalVisible(false); // Hide the modal
    setSelectedApp(null); // Clear the selected app
  };

  const handleFormSubmit = async (values) => {
      const userID = getUserID()
      const { appId, appName, slug = appId, ...credentials } = values; // Default slug to appId if not provided
  
      try {
        // Save credentials with slug
        const saveResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}api/user-creds/save-creds`, {
          appId,
          appSlug: slug, // Pass slug as appSlug
          credentials,
          userId: userID,
        });
  
  
        const updateResponse = await axios.post(`${process.env.REACT_APP_BASE_URL}api/user-creds/update-connection-status`, {
          appId,
          isConnected: true,
        });
        // Update application data in UI
        setApplicationsData((prevData) =>
          prevData.map((item) =>
            item.key === appId ? { ...item, status: "Connected" } : item
          )
        );
  
        setIsModalVisible(false);
      } catch (error) {
        console.error('Error in handleFormSubmit:', {
          message: error.message,
          response: error.response?.data,
          stack: error.stack,
        });
        alert(error.response?.data?.error || 'Error saving credentials');
      }
    };

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      const body = { userId, code: codeResponse.code };
      const response = await axiosSecureInstance.post(GOOGLE_AUTH_SLUG, body);
      const accessToken = response?.data?.token;
      setToken(accessToken);
      setIsConnected(true);
    },
    flow: 'auth-code',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/drive.metadata.readonly',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    prompt: 'consent',
  });

  const logout = async () => {
    await axiosSecureInstance.delete(GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS(userId));
    setIsConnected(false);
  };
  const syncWorkBoardActionItem = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      const response = await axiosSecureInstance.get(SYNC_WORKBOARD_ACTION_ITEM(userId));
      const endTime = Date.now();

      const timeTaken = endTime - startTime;

      notification.open({
        message: 'Work Board Action Item Synced',
        description: 'All personal and assigned action items are synced successfully.',
        placement: 'bottomRight',
        style: {
          backgroundColor: '#6697cc',
          border: '1px solid #6697cc',
        },
      });
    } catch (error) {
      console.error("Error syncing WorkBoard:", error);
      notification.open({
        message: 'Sync Failed',
        description: 'Failed to sync WorkBoard Action Items. Please try again later.',
        placement: 'bottomRight',
        style: {
          backgroundColor: '#ff4d4f',
          border: '1px solid #ff4d4f',
        },
      });
    } finally {
      setIsLoading(false);
    }

  };

  const syncGoogleDriveFiles = async () => {
    const response = await axiosSecureInstance.get(SYNC_GOOGLE_DRIVE_FILES(userId));
    notification.open({
      message: 'Google Drive Files Synced',
      description: `Total ${response.data.allDownloadedFileList.length} Files Are Synced.`,
      placement: 'bottomRight',
      style: {
        backgroundColor: '#6697cc',
        border: '1px solid #6697cc',
      },
    });
  };

  const handleConnectWorkBoard = () => {
    const clientId = process.env.REACT_APP_WORKBOARD_CLIENT_ID;
    const redirectUri = REACT_APP_WORKBOARD_REDIRECT_URI;
    const authorizationUrl = `${REACT_APP_WORKBOARD_AUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}`;
    window.location.href = authorizationUrl;
  };

  const handleRemoveWorkBoard = async () => {
    Modal.confirm({
      title: 'Confirm Disconnection',
      content: 'Are you sure you want to disconnect your WorkBoard account?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        localStorage.removeItem('workboard_access_token');
        const response = await axiosSecureInstance.delete(WORKBOARD_AUTH_SLUG(userId));
        setIsWorkBoardConnected(false);
        setWorkBoardToken('');
        message.success(response.data.message);
      },
    });
  };

  const handleWebCrawlConnect =()=>{
    setIsWebCrawlerModalOpen(true);

  };
  const handleFluxConnect =()=>{
    setIsFluxModalOpen(true);

  };

  const handleWebCrawlDisConnect = async()=>{
    const responseOfFireCrawlKeyDelete = await deleteFireCrawlKeyFromDB();
    if(responseOfFireCrawlKeyDelete.status === 200){
      setIsWebCrawlConnected(false);
      message.success(responseOfFireCrawlKeyDelete.data.message);
    }else{
      message.error(responseOfFireCrawlKeyDelete.data.message);
    }
    return responseOfFireCrawlKeyDelete;
  };

  const handleFluxDisConnect = async()=>{
    const responseOfFluxKeyDelete = await deleteFluxKeyFromDB();
    if(responseOfFluxKeyDelete.status === 200){
      setIsFluxConnected(false);
      message.success(responseOfFluxKeyDelete.data.message);
    }else{
      message.error(responseOfFluxKeyDelete.data.message);
    }
    return responseOfFluxKeyDelete;
  };

  // n8n connection functions
  const handleN8nConnect = () => {
    setIsN8nModalOpen(true);
  };

  const handleN8nDisconnect = async () => {
    Modal.confirm({
      title: 'Confirm Disconnection',
      content: 'Are you sure you want to disconnect your n8n account?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await disconnectN8n(userId);
          if (response.data.success) {
            setIsN8nConnected(false);
            message.success('n8n disconnected successfully');
          } else {
            message.error('Failed to disconnect n8n');
          }
        } catch (error) {
          console.error('Error disconnecting n8n:', error);
          message.error('Failed to disconnect n8n');
        }
      },
    });
  };

  const handleN8nModalOk = async () => {
    try {
      setIsN8nConnecting(true);
      const values = await n8nForm.validateFields();
      const response = await connectN8n(userId, values.secretKey);
      
      if (response.data.success) {
        setIsN8nConnected(true);
        setIsN8nModalOpen(false);
        n8nForm.resetFields();
        message.success('n8n connected successfully');
      } else {
        message.error(response.data.message || 'Failed to connect n8n');
      }
    } catch (error) {
      console.error('Error connecting n8n:', error);
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to connect n8n');
      }
    } finally {
      setIsN8nConnecting(false);
    }
  };

  const handleN8nModalCancel = () => {
    setIsN8nModalOpen(false);
    n8nForm.resetFields();
  };

  const handleIntegrateAppsConnect = async (service_id, authType, authFields, authenticateFields, oauthurl, tokenurl, baseurl, type, contentType) => {
    setServiceId(service_id);
    if(authType == 'OAuth'){  
    const response = await OauthConnect(service_id, authFields, authenticateFields, oauthurl, tokenurl, baseurl, type, contentType);
    const { authorizationUrl } = response;
     const validation = await validateAndRedirect(authorizationUrl);
     
     if(typeof validation.data === 'object' && validation.data.status === false ){
       message.error('Technical Issue, contact your Administrator');
      }else {
       window.location.href = authorizationUrl;
     }
    }
    else{
      const items = await AddIntegrateAppsCredsFormData(service_id);
      setFormitems(items);
      setIsIntegrateAppsModalOpen(true);
    }
  }

  const handleIntegrateAppsDisconnect = async(service_id) => {
    const responseOfIntegratedappsCredsDelete = await deleteIntegrateAppsCredsFromDB(service_id);
    if(responseOfIntegratedappsCredsDelete.status === 200){
      setIsIntegrateAppsConnected(false);
      message.success(responseOfIntegratedappsCredsDelete.data.message);
       allServices();
    }else{
      message.error(responseOfIntegratedappsCredsDelete.data.message);
    }
    return responseOfIntegratedappsCredsDelete;
  }

  // Define checkServiceConnection function
  const checkServiceConnection = async (service_id) => {
    const status = await getConnectionStatus(service_id); 
    return status;
  };

  const applicationData = [
    { 
      key: '1', 
      name: 'Google Drive', 
      description: 'Connect to Google Drive to sync and access your files, documents, and folders.',
      icon: <img src={googleDriveIcon} alt="Google Drive Icon" style={{ width: 25, height: 25, marginRight: 9,alignItems:'left'}} /> 
    },
    { 
      key: '2', 
      name: 'Work Board', 
      description: 'Integrate with Work Board to manage tasks, projects, and team collaboration.',
      icon: <img src={workBoardIcon} alt="WorkBoard Icon" style={{ width: 25, height: 25, marginRight: 9,alignItems:'left'}} /> 
    },
    { 
      key: '3', 
      name: 'Firecrawl', 
      description: 'Web crawling service to extract and process data from websites.',
      icon: <img src={fireCrawl} alt="WebCrawl Icon" style={{ width: 25, height: 25, marginRight: 9,alignItems:'left'}} /> 
    },
    { 
      key: '4', 
      name: 'Flux', 
      description: 'AI-powered image generation and editing service.',
      icon: <img src={fluxIcon} alt="Flux Icon" style={{ width: 25, height: 25, marginRight: 9,alignItems:'left'}} /> 
    },
    { 
      key: '5', 
      name: 'n8n', 
      description: 'Workflow automation platform to create and manage automated processes.',
      icon: <img src={n8nIcon} alt="n8n Icon" style={{ width: 25, height: 25, marginRight: 9,alignItems:'left'}} /> 
    },
  ];

const icons = {
  // beanstalk: beanstalk,
  // Add more mappings for slug to icon references as needed
};
  const staticapps = [
    {
      name: "Google Drive",
      description: "Connect to Google Drive to sync and access your files, documents, and folders.",
      isConnected: isConnected,
      connect: login,
      disconnect: logout
    },
    {
      name: "Work Board",
      description: "Integrate with Work Board to manage tasks, projects, and team collaboration.",
      isConnected: workBoardToken,
      connect: handleConnectWorkBoard,
      disconnect: handleRemoveWorkBoard,
      // sync: syncWorkBoardActionItem
      sync: () => navigate('/work-board-sync')
    },
    {
      name: "Firecrawl",
      description: "Web crawling service to extract and process data from websites.",
      isConnected: isWebCrawlConnected,
      connect: handleWebCrawlConnect,
      disconnect: handleWebCrawlDisConnect,
    },
    {
      name: "Flux",
      description: "AI-powered image generation and editing service.",
      isConnected: isFluxConnected,
      connect: handleFluxConnect,
      disconnect: handleFluxDisConnect,
    },
    {
      name: "n8n",
      description: "Workflow automation platform to create and manage automated processes.",
      isConnected: isN8nConnected,
      connect: handleN8nConnect,
      disconnect: handleN8nDisconnect,
    },
  ];

  // Data for System Apps (Static Apps)
  const systemAppsData = applicationData.map((app) => ({
    ...app,
    isConnected: staticapps.find(staticApp => staticApp.name === app.name)?.isConnected || false,
  }));

  // Data for Installed Apps (Dynamic Services)
  const installedAppsData = apiResponse
    .filter((record) => record.is_active) 
    .map((record) => {
      return {
        key: record._id,
        name: record.service_name,
        description: record.description || 'Custom integration service',
        service_id: record._id,
        icon: (
          <img
            src={`${process.env.REACT_APP_BASE_URL}${record.service_icon}`} 
            alt={`${record.service_name} Icon`}
            style={{
              width: 25,
              height: 25,
              marginRight: 9,
              marginLeft: 0,
              alignItems: 'left',
            }}
          />
        ),
        authType: record.authType,
        authFields: record.authFields,
        authenticateFields: record.authenticateFields,
        oauthurl: record.oauthurl ?? '',
        tokenurl: record.tokenurl ?? '',
        baseurl: record.baseurl ?? '',
        type: record.type ?? '',
        contentType: record.contentType ?? '',
        is_active: record.is_active,
      };
    });

  // Columns for System Apps (Static Apps)
  const systemAppsColumns = [
    {
      title: 'Application',
      dataIndex: 'name',
      key: 'name',
      align: 'start',
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'start', fontSize: '16px' }}>
          {record.icon}
          <b>{text}</b>
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'start',
      render: (text) => (
        <span style={{ fontSize: '14px', color: '#666' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const app = staticapps.find(app => app.name === record.name);
        
        return app ? (
          <Space>
            <Tag color={app.isConnected ? 'green' : 'red'}>
              {app.isConnected ? 'Connected' : 'Disconnected'}
            </Tag>
          </Space>
        ) : null;
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "left",
      render: (_, record) => {
        const app = staticapps.find(app => app.name === record.name);
    
        if (app) {
          return (
            <Space>
              {app.isConnected ? (
                <Space>
                  <Tooltip title={`Disconnect from ${app.name}`}>
                    <Button danger
                      onClick={() => app.disconnect()}
                    >
                      Disconnect
                    </Button>
                  </Tooltip>
                  {app.sync && (
                    <Tooltip title={`Sync ${app.name}`}>
                      <Button onClick={app.sync} style={{ backgroundColor: "green"}}>
                        Sync
                      </Button>
                    </Tooltip>
                  )}
                </Space>
              ) : (
                <Tooltip title={`Connect to ${app.name}`}>
                  <Button onClick={() => app.connect()}>
                    Connect
                  </Button>
                </Tooltip>
              )}
            </Space>
          );
        }
        return null;
      },
    }
  ];

  // Columns for Installed Apps (Dynamic Services)
  const installedAppsColumns = [
    {
      title: 'Application',
      dataIndex: 'name',
      key: 'name',
      align: 'start',
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'start', fontSize: '16px' }}>
          {record.icon}
          <b>{text}</b>
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      align: 'start',
      render: (text) => (
        <span style={{ fontSize: '14px', color: '#666' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        const dynamicApp = app.find(dynamicApp => dynamicApp.name === record.name) || applicationsData.find(dynamicApp => dynamicApp.name === record.name);
        
        return dynamicApp ? (
          <Space>
            <Tag color={dynamicApp.isConnected ? 'green' : 'red'}>
              {dynamicApp.isConnected ? 'Connected' : 'Disconnected'}
            </Tag>
          </Space>
        ) : null;
      },
    },
    {
      title: "Actions",
      dataIndex: "actions",
      key: "actions",
      align: "left",
      render: (_, record) => {
        const dynamicApp = app.find(dynamicApp => dynamicApp.name === record.name);
    
        if (dynamicApp) {
          return (
            <Space>
              {dynamicApp.isConnected ? (
                <Space>
                  <Tooltip title={`Disconnect from ${dynamicApp.name}`}>
                    <Button danger
                      onClick={() => record.service_id ? dynamicApp.disconnect(record.service_id) : dynamicApp.disconnect()}
                    >
                      Disconnect
                    </Button>
                  </Tooltip>
                </Space>
              ) : (
                <Tooltip title={`Connect to ${dynamicApp.name}`}>
                  <Button onClick={() => record.service_id ? dynamicApp.connect(record.service_id, record.authType,record.authFields,record.authenticateFields,record.oauthurl,record.tokenurl, record.baseurl, record.type, record.contentType) : dynamicApp.connect()}>
                    Connect
                  </Button>
                </Tooltip>
              )}
            </Space>
          );
        }

        return (
          <Space>
            <Tooltip
              title={
                record.status === 'Connected'
                  ? `Disconnect from ${record.name}`
                  : `Connect to ${record.name}`
              }
            >
              <Button
                onClick={() => {
                  if (record.status === 'Connected') {
                    setApplicationsData(prevData =>
                      prevData.map(item =>
                        item.key === record.key
                          ? { ...item, status: 'Disconnected' }
                          : item
                      )
                    );
                  } else {
                    handleConnectClick(record);
                    handleOpenModal(record.slug);
                  }
                }}
              >
                {record.status === 'Connected' ? 'Disconnect' : 'Connect'}
              </Button>
            </Tooltip>
          </Space>
        );
      },
    }
  ];
  const handleWebCrawlKeyInsert = async () => {
    form
      .validateFields()
      .then(async (values) => {
        const responseOfKeyStore = await storeFireCrawlKeyToDB(values?.fireCrawlKey);
        setIsWebCrawlConnected(true);
        setIsWebCrawlerModalOpen(false);
        message.success(responseOfKeyStore.data.message);
        form.resetFields();

      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });

  };
  const handleIntegrateAppsInstertCreds = async (formItemsRaw) => {
    let formItems = [];

    if (Array.isArray(formItemsRaw)) {
      formItems = formItemsRaw;
    } else if (typeof formItemsRaw === 'object') {
      // convert object to array (fallback, if you ever need it)
      formItems = Object.keys(formItemsRaw).map((key) => ({
        name: key,
        value: formItemsRaw[key],
        group: key.split('_')[0],
      }));
    } else {
      console.error('Expected formItems to be an array');
      return;
    }

    try {
      const values = await form.validateFields();

      const groupedValues = {
        authFields: {},
        headers: {},
        otherFields: {},
      };

      // Go through form values, split the prefix, and group
      Object.keys(values).forEach((key) => {
        const [group, ...nameParts] = key.split('_');
        const originalName = nameParts.join('_');

        if (group === 'authFields') {
          groupedValues.authFields[originalName] = values[key];
        } else if (group === 'headers') {
          groupedValues.headers[originalName] = values[key];
        } else {
          groupedValues.otherFields[originalName] = values[key];
        }
      });


      const responseOfKeyStore = await storeIntegrateAppsCredsToDB(groupedValues, serviceid);
      setIsIntegrateAppsConnected(true);
      setIsIntegrateAppsModalOpen(false);
      message.success(responseOfKeyStore.data.message);
      allServices();
      form.resetFields();
    } catch (errorInfo) {
      console.log('Validation failed:', errorInfo);
    }
  };
  const handleFluxKeyInsert = async () => {
    form
      .validateFields()
      .then(async (values) => {
        const responseOfKeyStore = await storeFluxKeyToDB(values?.fluxKey);
        setIsFluxConnected(true);
        setIsFluxModalOpen(false);
        message.success(responseOfKeyStore.data.message);
        form.resetFields();

      })
      .catch((errorInfo) => {
        console.log('Validation failed:', errorInfo);
      });

  };

  const handleFireCrawlModalClose = ()=>{
    setIsWebCrawlerModalOpen(false);
  }
  const handleFluxInputModalClose = ()=>{
    setIsFluxModalOpen(false);
  }

  const handleInputModalClose = () => {
    setIsIntegrateAppsModalOpen(false);
  };

  return (
    <div >
      <div className="header-section">
        <h2 className="component-title">Integrated Apps</h2>
        <p className="component-subtitle">
          Connect and manage your integrations with external applications and services to enhance your workflow.
        </p>
      </div>
      
      <Tabs
        defaultActiveKey="system"
        style={{ marginTop: '20px' }}
        items={[
          {
            key: 'system',
            label: 'System Apps',
            children: (
              <div style={{ marginTop: '16px' }}>
                <Table
                  loading={isLoading}
                  columns={systemAppsColumns}
                  dataSource={systemAppsData}
                  pagination={false}
                  rowKey="key"
                />
              </div>
            ),
          },
          {
            key: 'installed',
            label: 'Installed Apps',
            children: (
              <div style={{ marginTop: '16px' }}>
                <Table
                  loading={isLoading}
                  columns={installedAppsColumns}
                  dataSource={installedAppsData}
                  pagination={false}
                  rowKey="key"
                />
              </div>
            ),
          },
        ]}
      />
      <Modal
        title={
          <>
            <ExclamationCircleOutlined
              style={{ color: "red", marginRight: 8 }}
            />
            Google Drive File Sync Failed
          </>
        }
        open={showSyncFileAlertModal}
        onOk={() => setShowSyncFileAlertModal(false)}
        onCancel={() => setShowSyncFileAlertModal(false)}
      >
        <p>Please Connect With Google Drive</p>
      </Modal>

      <InputModal
        propsData={{
          title: "Add FireCrawl Key",
          data: null,
          placeholder: "Add FireCrawl Key",
          open: isWebCrawlerModalOpen,
          onCancel: handleFireCrawlModalClose,
          onOk: handleWebCrawlKeyInsert,
          okText: "Add Key",
          formItems: AddWebCrawlKeyFormData,
          form: form,
        }}
      />
      <InputModal
        propsData={{
          title: "Add Flux Key",
          data: null,
          placeholder: "Add Flux Key",
          open: isFluxModalOpen,
          onCancel: handleFluxInputModalClose,
          onOk: handleFluxKeyInsert,
          okText: "Add Key",
          formItems: AddFluxKeyFormData,
          form: form,
        }}
      />

      <IntegrateAppsModal
        propsData={{
          title: "Required Fields to Connect the Service",
          data: null,
          placeholder: "",
          open: isIntegrateAppsModalOpen,
          onCancel: handleInputModalClose,
          onOk: () => handleIntegrateAppsInstertCreds(formitems),
          okText: "Add",
          formItems: Array.isArray(formitems) ? formitems : [],
          form: form
        }}
      />

      {/* n8n Connection Modal */}
      <Modal
        title="Connect to n8n"
        open={isN8nModalOpen}
        onOk={handleN8nModalOk}
        onCancel={handleN8nModalCancel}
        confirmLoading={isN8nConnecting}
        okText="Connect"
        cancelText="Cancel"
      >
        <Form
          form={n8nForm}
          layout="vertical"
          name="n8nConnectionForm"
        >
          <Form.Item
            label="Secret Key"
            name="secretKey"
            rules={[
              {
                required: true,
                message: 'Please enter your n8n secret key!',
              },
            ]}
          >
            <Input.Password 
              placeholder="Enter your n8n API secret key"
              size="large"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Configure ${appConfig?.name}`}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {appConfig && (
          <Form
            onFinish={handleFormSubmit}
            initialValues={{ appId: appConfig._id, appName: appConfig.name, slug: appConfig.slug }} // Add slug
          >
            <Row gutter={16}>
              <Col span={24} style={{ textAlign: 'center' }}>
                <img src={appConfig.iconUrl} alt={appConfig.name} width={50} height={50} />
                <h3>{appConfig.name}</h3>
              </Col>
            </Row>

            <Form.Item name="appId" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="appName" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="slug" hidden>
              <Input />
            </Form.Item>

            {appConfig.customFields.map((field) => (
              <Form.Item
                key={field.name}
                label={field.label}
                name={field.name}
                rules={[{ required: true, message: `${field.label} is required` }]}
              >
                <Input />
              </Form.Item>
            ))}

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Space>
          </Form>
        )}

      </Modal>
    </div>
  );
};

export default IntegrateApplications;