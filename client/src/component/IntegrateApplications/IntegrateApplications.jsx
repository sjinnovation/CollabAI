import { FolderOpenOutlined } from "@ant-design/icons";
import { Button, Modal, Space, Switch, Table, Tag, Tooltip, message, notification } from "antd";
import { useEffect, useState } from "react";
import { TbPlugConnectedX } from "react-icons/tb"; // Main page icon
import { AiFillGoogleCircle, AiFillDropboxCircle } from "react-icons/ai"; // Icons for apps
import { MdWork } from "react-icons/md"; // Another example icon for My WorkBoard
import { FaGoogleDrive } from "react-icons/fa";
import GoogleDrive from "./GoogleDrive";
import { connectGoogleDrive, disconnectGoogleDrive } from "./GoogleDriveHelperFunctions";
import { gapi } from 'gapi-script';
import useDrivePicker from 'react-google-drive-picker'
import { useGoogleDriveAuth, useGoogleDriveSignIn } from "./useGoogleDrive";
import { LoginWithGoogle } from "./LoginWithGoogle";
import { GetGoogleLogin } from "./Login";
import { useGoogleLogin } from '@react-oauth/google';
import { getUserID } from "../../Utility/service";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { getGoogleAuthCredentials } from "../../api/googleAuthApi";
import { axiosSecureInstance } from "../../api/axios";
import googleDriveIcon from '../../assests/images/google-drive-icon.png';
import workBoardIcon from '../../assests/images/work-board-icon.png';
import { FileContext } from "../../contexts/FileContext";
import { GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS, GOOGLE_AUTH_SLUG, GOOGLE_DRIVE_FILES_GETTING_SLUG, REACT_APP_WORKBOARD_AUTH_URL, REACT_APP_WORKBOARD_REDIRECT_URI, SYNC_GOOGLE_DRIVE_FILES } from "../../constants/Api_constants";
import { useContext } from "react";
const { Title } = Typography;
const userId = getUserID();


const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;


export const IntegrateApplications = () => {
  const { isConnected, setIsConnected, token, setToken } = useContext(FileContext);
  const workboardToken = localStorage.getItem('workboard_access_token');
  const [applicationList, setApplicationList] = useState([
    { key: '1', name: 'Google Drive', icon: <img src={googleDriveIcon} alt="Google Drive Icon" style={{ width: 25, height: 25, marginRight: 8 }} /> },
  ]);
  const [showSyncFileAlertModal, setShowSyncFileAlertModal] = useState(false);

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

  useEffect(() => {
    getGoogleAuthCredentials(userId, setIsConnected, setToken);
  }, []);

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

  const handleRemoveWorkBoard = () => {
    Modal.confirm({
      title: 'Confirm Disconnection',
      content: 'Are you sure you want to disconnect your WorkBoard account?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        localStorage.removeItem('workboard_access_token');
        window.location.reload();
      },
    });
  };

  const applicationData = [
    { key: '1', name: 'Google Drive', icon: <img src={googleDriveIcon} alt="Google Drive Icon" style={{ width: 25, height: 25, marginRight: 8 }} /> },
    // { key: '2', name: 'Work Board', icon: <img src={workBoardIcon} alt="Google Drive Icon" style={{ width: 25, height: 25, marginRight: 9 }} /> },
  ];

  const columns = [
    {
      title: 'Application',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
      render: (text, record) => (
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
          {record.icon}
          <b>{text}</b>
        </span>
      ),
    }, 
    
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (_, record) => (
        <Space>
          <Tag color={record.name === 'Google Drive' ? (isConnected ? "green" : "red") : (workboardToken ? "green" : "red")}>
            {record.name === 'Google Drive' ? (isConnected ? "Connected" : "Disconnected") : (workboardToken ? "Connected" : "Disconnected")}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => (
        <Space>
          {record.name === "Google Drive" ? (
            isConnected ? (
              <Tooltip title={`Disconnect from ${record.name}`}>
                <Button onClick={logout} style={{ backgroundColor: "#6697cc" }}>Disconnect</Button>
              </Tooltip>
            ) : (
              <Tooltip title={`Connect to ${record.name}`}>
                <Button onClick={() => login()}>Connect</Button>
              </Tooltip>
            )
          ) : (
            workboardToken ? (
              <Tooltip title="Disconnect from Work Board">
                <Button style={{ backgroundColor: "#6697cc" }} onClick={handleRemoveWorkBoard}>Disconnect</Button>
              </Tooltip>
            ) : (
              <Tooltip title="Connect to Work Board">
                <Button onClick={handleConnectWorkBoard}>Connect</Button>
              </Tooltip>
            )
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ margin: "20px" }}>
      <div className="large-icon-container" style={{ margin: 10 }}>
        <TbPlugConnectedX className="large-icon lg" />
        <span> Connect Apps</span>
      </div>
      <Table
        bordered={true}
        columns={columns}
        dataSource={applicationData}
        pagination={false}
      />
      <Modal
        title={
          <>
            <ExclamationCircleOutlined style={{ color: 'red', marginRight: 8 }} />
            Google Drive File Sync Failed
          </>
        }
        open={showSyncFileAlertModal}
        onOk={() => setShowSyncFileAlertModal(false)}
        onCancel={() => setShowSyncFileAlertModal(false)}>
        <p>Please Connect With Google Drive</p>
      </Modal>
    </div>
  );
};

export default IntegrateApplications;