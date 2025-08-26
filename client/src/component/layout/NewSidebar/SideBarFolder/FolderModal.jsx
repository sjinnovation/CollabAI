// FolderModal.jsx
import React, { useEffect, useState } from 'react';
import { Modal, Input, Button } from 'antd';
import axios from 'axios'; // Adjust based on your API setup
import { getUserID } from '../../../../Utility/service';
import { axiosSecureInstance } from '../../../../api/axios';
import { HiOutlineLightBulb } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import './FolderModal.css';



const FolderModal = ({ visible, onClose, onFolderCreated }) => {
    const [folderName, setFolderName] = useState('');
 
    useEffect(() => {
        if (visible) {
            setFolderName('');
        }
    }, [visible]);

    const navigate = useNavigate();

    const handleCreateFolder = async () => {
        if (!folderName) return;

        const userId = getUserID();
        const folderData = {
            folderName,
            folderColor: 'white', 
            userId,
        };

        try {
            const response = await axiosSecureInstance.post("api/folder-chats", folderData);
            const projectId = response?.data?.folderChat?._id;
            localStorage.setItem("projectId",projectId);
            onFolderCreated(); 
            onClose();
            if(projectId) {
              navigate(`/projects/${projectId}`); 
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    return (
        <Modal
    className="create-project-modal-whole"
    title={<div className="create-project-modal-title">Project name</div>}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} className="projects-button">
          Cancel
        </Button>,
        <Button className="projects-button" key="submit" type="primary" onClick={handleCreateFolder} >
          Create Project
        </Button>,
      ]}
    >
      <Input
        style={{marginTop:"20px", borderRadius:"8px"}}
        placeholder="E.g., Milestone Event Planning"
        value={folderName}
        onChange={(e) => setFolderName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCreateFolder();
          }
        }}
      />
      <div className="create-project-modal">
        <div className="create-project-icon">
          <HiOutlineLightBulb />
        </div>
        <div>
          <p className="create-project-subtext">
            <span style={{fontWeight:800}}>What's a project? </span><br /> Projects keep chats, files, and custom
            instructions in one place. Use them for ongoing work, or just to
            keep things tidy.
          </p>
        </div>
      </div>
    </Modal>
    );
};

export default FolderModal;