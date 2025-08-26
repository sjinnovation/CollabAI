import { useEffect, useState } from 'react';
import { Button, Input, List, message } from 'antd';
import { getUserID } from '../../Utility/service';
import { retrieveUserProfile } from '../../api/profile';
import "./ProfileInfoStyle.css";

import { editUser, usersAPIKeyGenerate } from "../../api/user";
import TextArea from 'antd/es/input/TextArea';
import UploadPhoto from '../../component/Proflie/Upload';
import PasswordChange from '../../component/Proflie/PasswordChange';
import ProfileHeader from '../../component/Proflie/ProfileHeader';
import Support from '../../component/Proflie/Support';
import Device from '../../component/Proflie/Device';
import { SyncOutlined } from '@ant-design/icons';
import { Tooltip } from "antd";
import { CopyOutlined } from '@ant-design/icons';

const ProfileInfo = () => {
  const userId = getUserID();
  const [userInfo, setUserInfo] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingApiKey, setIsGeneratingApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(()=>{
      retrieveUserProfile(userId).then((user)=>{
      setUserInfo(user);
    });
  },[userId]);

  const handleApiKeyGeneration = async () => {
    setIsGeneratingApiKey(true);
    try {
      const response = await usersAPIKeyGenerate(userId);
        // message.success(response.data.message || "API Key generated successfully");
        setUserInfo((prevState) => ({
          ...prevState,
          apiKey: response?.data?.apiKey, // Assuming the API returns the new API key
        }));

    } catch (error) {
      console.error("Error generating API Key", error);

      // message.error("Error generating API Key");
    } finally {
      setIsGeneratingApiKey(false);

    }
  };
  const handleUpdateClick = async (actionType) => {
    try {
      if(actionType === 'Edit') {
        setIsEditing(!isEditing);
      }
      else {
        if (userInfo) {
          if (userInfo.newPassword === userInfo.confirmPassword) {
            setUserInfo((prevState) => ({
              ...prevState,
              password: prevState.confirmPassword,
              newPassword: "",
              confirmPassword: "",
            }));
            const updatedUserResponse = await editUser(userId, userInfo);
            if (updatedUserResponse?.status === 200) {
              setIsEditing(!isEditing);
              message.success("Profile successfully updated");

            }
          }
        } else {
          console.error("Failed to update user info");
        }
      }

    } catch (error) {
      console.error("Error updating user info", error);
    }

    window.dispatchEvent(new Event('userDataChanged'));
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // setUserInfo(originalUserInfo);
  };

  const handleCopyApiKey = async () => {
    if (userInfo?.apiKey) {
      await navigator.clipboard.writeText(userInfo.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
    }
  };

  const data = [
    { title: "First Name", description: userInfo?.fname || "" },
    { title: "Last Name", description: userInfo?.lname || "" },
    { title: "Designation", description: userInfo?.designation || "" },
    { title: "Responsibility", description: userInfo?.responsibility || "" },
    {
      title: "Company Information",
      description: userInfo?.companyInformation || "",
    },
    { title: "User Role", description: userInfo?.role || "" },
    { title: "Email Address", description: userInfo.email || "" },
    { title: "Generate API Key", description: "This API Key will be used in access agent from n8n" || "" },

    
  ];

  const filteredData = isEditing
    ? data
    : data.filter(
        (item) =>
          item.title !== "New Password" && item.title !== "Confirm Password"
      );

  const userFirstName = userInfo?.fname?.at(0).toUpperCase();

  return (
    <>
    <div className="profile--container">
      <ProfileHeader title="My Profile" subHeading="View and manage your profile information, including personal details and account settings." />
      <div className="profile-card">
        <UploadPhoto
          userFirstName={userFirstName}
          setUserInfo={setUserInfo}
          userId={userId}
          userInfo={userInfo}
        />
        <PasswordChange userId={userId} />
      </div>

      <div className="form-component" style={{ flexGrow: 1 }}>
        <div className="text-end mb-2 action-button-wrapper">
          <Button
            onClick={() => handleUpdateClick(!isEditing ? "Edit" : "Update")}
          >
            {!isEditing ? "Edit" : "Update"}
          </Button>

          {isEditing && (
            <Button danger className="ms-2" onClick={handleCancelClick}>
              Cancel
            </Button>
          )}
        </div>
        <div>
          <List
            header={
              <strong style={{ fontSize: "15px" }}>Your Account Details</strong>
            }
            size="medium"
            bordered={false}
            dataSource={filteredData}
            className="profile-info-list"
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={item.title}
                  description={
                    isEditing ? (
                      item.title === "First Name" ? (
                        <Input
                          type="text"
                          value={userInfo.fname}
                          onChange={(e) =>
                            setUserInfo({ ...userInfo, fname: e.target.value })
                          }
                        />
                      ) : item.title === "Last Name" ? (
                        <Input
                          type="text"
                          value={userInfo.lname}
                          onChange={(e) =>
                            setUserInfo({ ...userInfo, lname: e.target.value })
                          }
                        />
                      ) : item.title === "Designation" ? (
                        <TextArea
                          value={userInfo.designation}
                          onChange={(e) =>
                            setUserInfo({
                              ...userInfo,
                              designation: e.target.value,
                            })
                          }
                        />
                      ) : item.title === "Responsibility" ? (
                        <TextArea
                          value={userInfo.responsibility}
                          onChange={(e) =>
                            setUserInfo({
                              ...userInfo,
                              responsibility: e.target.value,
                            })
                          }
                        />
                      ) : item.title === "Company Information" ? (
                        <TextArea
                          value={userInfo.companyInformation}
                          onChange={(e) =>
                            setUserInfo({
                              ...userInfo,
                              companyInformation: e.target.value,
                            })
                          }
                        />
                      ) : item.title === "User Role" ? (
                        <Input disabled value={userInfo.role} />
                      ) : item.title === "Email Address" ? (
                        <Input disabled value={userInfo.email} />
                      ) : null
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "start",
                          width: "100%",
                        }}
                        className="custom--profile__container"
                      >
                        <span>{item.description}</span>
                        {item.title === "Email Address" && (
                          <Button
                            size="middle"
                            className="custom-disabled-button"
                            disabled
                          >
                            Change Email
                          </Button>
                        )}
                      </div>
                    )
                  }
                />
              </List.Item>
            )}
          />
           <Button
            type="primary"
            className="mt-2"
            onClick={async() =>{await handleApiKeyGeneration()} }
          >
            {"Generate API Key"} <SyncOutlined spin={isGeneratingApiKey} />
          </Button>
          {userInfo?.apiKey && (
            <div className="mt-2" >
              <strong>API Key </strong>
              <Input
                type="password"
                value={userInfo.apiKey}
                readOnly
                disabled
                className="api-key-input"
                style={{ width: 300 }}
                suffix={
                  <Tooltip title={copied ? "Copied!" : "Copy"}>
                    <CopyOutlined
                      style={{ cursor: "pointer" }}
                      onClick={handleCopyApiKey}
                    />
                  </Tooltip>
                }
              />
            </div>
          )}
          
            
          <Support />
          <Device />
        </div>
      </div>
      <div/>
    </div>
    </>
  );
};

export default ProfileInfo;