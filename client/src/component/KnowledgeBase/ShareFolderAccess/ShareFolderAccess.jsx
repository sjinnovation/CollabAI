import { Avatar, Button, Checkbox, List, message, Modal, Skeleton, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { getUsersForGrantAccess, grantAccessToUsers, removeAccessToUsers } from '../../../api/knowledgeBase';
import ShareAccessUserList from './ShareAccessUserList/ShareAccessUserList';
import GivenAccessUserList from './GivenAccessUserList/GivenAccessUserList';
import "./style.scss"
const ShareFolderAccess = ({ isShowShareAccessModal, setIsShowShareAccessModal, dataSource, setSelectedFolderData, selectedFolderData, setMount, mount }) => {
  const [key, setKey] = useState('1');
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const handleShareAccess = async () => {
    try {
      const requestBody = selectedUserIds?.map((user) => {
        return {
          knowledgeBaseId: selectedFolderData?._id,
          owner: selectedFolderData?.userId,
          collaborator: user
        };
      });
  
      const response = await grantAccessToUsers(selectedFolderData?._id, requestBody);
      if (response) {
        message.success(response.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      // Reset state after handling the access
      setSelectedFolderData({});
      setIsShowShareAccessModal(false);
      setSelectedUserIds([]);
      setKey("1");
      setMount((prevState) => !prevState);
    }
  };


  const handleRemoveAccess = async () => {
    try {
      const requestBody = selectedUserIds?.map((user) => {
        return {
          knowledgeBaseId: selectedFolderData?._id,
          owner: selectedFolderData?.userId,
          collaborator: user
        };
      });
  
      const response = await removeAccessToUsers(selectedFolderData?._id, requestBody);
      if (response) {
        message.success(response.message);
      }
    }catch (error) {
      console.error(error);
     }
     finally {
      setSelectedFolderData({});
      setIsShowShareAccessModal(false);
      setSelectedUserIds([]);
      setKey("1");
      setMount((prevState) => !prevState)
    }

  }

  const onChange = (key) => {
    setKey(key);
    setSelectedUserIds([]);
  };

  const items = [
    {
      key: '1',
      label: 'Share Access',
      children: (
        <ShareAccessUserList
          isShowShareAccessModal={isShowShareAccessModal}
          selectedFolderData={selectedFolderData}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          mount={mount}
        />
      ),
    },
    {
      key: '2',
      label: 'Remove Access',
      children: (
        <GivenAccessUserList 
          isShowShareAccessModal={isShowShareAccessModal}
          selectedFolderData={selectedFolderData}
          selectedUserIds={selectedUserIds}
          setSelectedUserIds={setSelectedUserIds}
          mount={mount}
        />
    ),
    },
  ];

  return (
    <div>
      <Modal
        title="Access Management"
        open={isShowShareAccessModal}
        footer={[
          <Button key="back" onClick={() => {
            setIsShowShareAccessModal(false);
            setSelectedFolderData({});
            setSelectedUserIds([]);
          }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={key === '1' ? handleShareAccess : handleRemoveAccess}>
            Confirm
          </Button>,

        ]}
        className="knowledge-base-modal"

        // // onOk={s}
        onCancel={() => {
          setIsShowShareAccessModal(false);
          setSelectedFolderData({});
          setSelectedUserIds([]);
        }}
      >
        <Tabs activeKey={key} onChange={onChange} items={items} />
      </Modal>
    </div>
  );
};

export default ShareFolderAccess;