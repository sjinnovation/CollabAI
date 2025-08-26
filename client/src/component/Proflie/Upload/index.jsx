import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Flex, Upload, message } from 'antd';
import React, { useContext, useState } from 'react'
import { toast } from 'react-toastify';
import { axiosSecureInstance } from '../../../api/axios';
import { deleteUserPhoto, uploadUserPhoto } from '../../../api/profile';
import loader from "../../../assests/images/loader.svg";
import { ProfileContext } from '../../../contexts/ProfileContext';

const UploadPhoto = ({userInfo, userFirstName, userId, setUserInfo}) => {
  const [userImage, setUserImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUserAvatar, userAvatar } = useContext(ProfileContext);

  const handleImgMetaData = (info) => {
    if (info.file.status === "done") {
      const reader = new FileReader();
      reader.readAsDataURL(info.file.originFileObj);
      reader.onload = () => {
        setUserImage(reader.result);
      };
      reader.onerror = (error) => {
        message.error("Failed to read the image file");
      };
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleImgUpload = async () => {
    const formData = new FormData();
    setIsLoading(true);
    try {
      if (userImage) {
        formData.append("image", userImage);
      }

      const response = await uploadUserPhoto(userId, formData);

      if (response?.status === 200) {
        message.success(response?.data?.message);
        setIsLoading(false);
        setUserInfo((prevState) => (
          {
            ...prevState,
            userAvatar: response?.data?.user?.userAvatar,
          }
        ));
        setUserAvatar(response?.data?.user?.userAvatar);
        setUserImage(null);
      }
    } catch (error) {
      message.error("Profile image upload unsuccessful");
      message.error(error?.message);
      setIsLoading(false);
    }
  };

  const removeProfileImg = () => {
    setUserImage(null);
  };

  const deleteUserImage = async () => { 
    try {
      setIsLoading(true);
      const response = await deleteUserPhoto(userId);
      setUserImage(null);

      if(response?.status === 200) {
        message.success(response?.data?.message);
        setUserAvatar("");
        setUserInfo((prevState) => (
          {
            ...prevState,
            userAvatar: "",
          }
        ));
        setIsLoading(false);
      }
      
    } catch (error) {
      message.error("Profile image delete unsuccessful");
    }
  }

  return (
    <Card title="Upload Photo" className="profile-card__container upload-photo-container">
    <div className="profile-card__content">
      {userImage ? (
        <Avatar
          size={84}
          src={URL.createObjectURL(userImage)}
          shape="square"
          className="profile-card__avatar"
        />
      ) : userInfo?.userAvatar ? (
        <Avatar
          size={84}
          src={userInfo?.userAvatar}
          shape="square"
          className="profile-card__avatar"
        />
      ) : (
        <Avatar
          size={84}
          shape="square"
          style={{ fontSize: "46px", objectFit: "cover" }}
        >
          {userFirstName}
        </Avatar>
      )}

      {userImage ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Button
            icon={<UploadOutlined />}
            style={{
              marginTop: 16,
              backgroundColor: "#2952BF",
              color: "#fff",
            }}
            onClick={handleImgUpload}
          >
            {isLoading ? (
              <img style={{ width: "22px" }} src={loader} alt="loader" />
            ) : (
              "Upload"
            )}
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            style={{ marginTop: 16 }}
            onClick={removeProfileImg}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Flex gap="small" style={{ marginTop: "24px" }}>
          <Upload
            accept="image/*"
            showUploadList={false}
            customRequest={({ file, onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            beforeUpload={(file) => {
              const isImage = file.type.startsWith("image/");
              if (!isImage) {
                return false;
              } else {
                setUserImage(file);
              }
              return false;
            }}
            style={{ width: "100%" }}
          >
            <Button
              icon={<UploadOutlined />}
              style={{
                fontSize: "12px",
                boxShadow: "none",
                backgroundColor: "#2952BF",
              }}
              onChange={handleImgMetaData}
              type="primary"
              block
            >
              Click to Upload
            </Button>
          </Upload>
          {userAvatar && (
            <Button
              type="primary"
              danger
              block
              icon={<DeleteOutlined />}
              style={{ fontSize: `12px` }}
              onClick={deleteUserImage}
            >
              {isLoading ? (
                <img style={{ width: "22px" }} src={loader} alt="loader" />
              ) : (
                " Delete Photo"
              )}
            </Button>
          )}
        </Flex>
      )}
    </div>
  </Card>
  )
}

export default UploadPhoto;