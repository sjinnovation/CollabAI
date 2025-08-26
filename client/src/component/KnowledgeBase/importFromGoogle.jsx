import React, { useState, useEffect } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { useGooglePicker } from 'react-google-picker';

import { FaGoogleDrive } from "react-icons/fa";
import { axiosSecureInstance } from '../../api/axios';
import { getUserID } from '../../Utility/service';
import { createVectorOfKnowledgeBase } from '../../api/knowledgeBase';
import { getParentFolderNames } from './FileHelpers';
import { createKnowledgeBase } from '../../api/knowledgeBase';
import { GET_FILE_FROM_GOOGLE_DRIVE, GOOGLE_DRIVE_FILES_TO_KNOWLEDGE_BASE } from '../../constants/Api_constants';
import { message } from 'antd';
import { LoginWithGoogle } from '../IntegrateApplications/LoginWithGoogle';
import useGoogleDrivePicker from '../IntegrateApplications/useGoogleDrivePicker';
import googleDriveIcon from "../../assests/images/knowledge-base-menu/google_drive_icon.svg"
import { MdAddToDrive } from 'react-icons/md';


const userId = getUserID();

const GoogleFilePicker = ({ folderStructure, selectedFolder,selectedFile, setIsLoading,isLoading,token, autoTriggerPicker, setAutoTriggerPicker,setSelectedApp,setIsShowFolderListModal, setOpenCustomDropdown,setGoogleFileInfo}) => {
    const [openPicker, data, authResponse] = useDrivePicker();

    const accessToken = process.env.REACT_APP_GOOGLE_DRIVE_ACCESS_KEY;
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
    const handlePicked = async (data) => {
        if (data.docs && data.docs.length > 0) {
            const files = data.docs.map(async (file) => {
                const url = GET_FILE_FROM_GOOGLE_DRIVE(file.id, apiKey)
                let name = file.name;
                name =  name.replace(/[\/\\*|"?]/g, ' ');
                return {
                    name: name,
                    size: file?.sizeBytes,
                    type: 'file',
                    category: file?.mimeType,
                    fileId: file?.id,
                    url: file?.url
                };
            });
            const filesInfo = await Promise.all(files);
            if(filesInfo){
                setGoogleFileInfo(filesInfo);
                setIsShowFolderListModal(true);
                setOpenCustomDropdown(false);
                setSelectedApp("googleDrive");
            }
        }

    };
    const handleOpenPicker = useGoogleDrivePicker(handlePicked);
    useEffect(() => {
        if (data) {
            handlePicked(data);

        }
    }, [data]);

    const fetchFile = async (fileUrl) => {
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) {
                let errorMsg = `Failed to fetch file: ${response.statusText}`;
                if (response.status === 404) {
                  errorMsg = 'File not found. Please check the file ID and make sure the file is public.';
                } else if (response.status === 403) {
                  errorMsg = 'Access denied. Please ensure the file is shared publicly and check your API key permissions.';
                }
                throw new Error(errorMsg);
              }
            const blob = await response.blob();
            return convertToBase64(blob);
        } catch (error) {
            console.error("Error fetching file:", error);
        }
    };

    const convertToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result);
                } else {
                    reject(new Error("Failed to convert blob to base64"));
                }
            };
            reader.onerror = (error) => {
                console.error("Error converting blob to base64:", error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    };

    const sendFileToServer = async (filesInfo,folderStructure, selectedFolder) => {
        const previousParentFolderNames = getParentFolderNames(folderStructure, selectedFolder);
        const uploadedFileDetails = filesInfo.map(file => {
            const updatedFileName = selectedFile ? `${selectedFile}/${file.name}` : file.name;
            return { name: updatedFileName, size: file.size, type : file.category, fileId : file.fileId,url : file?.url };
        });
        const KnowledgeBase = {
            userId: userId,
            fileDetails: uploadedFileDetails,
        };

        try {
            if(uploadedFileDetails.length > 0){
                const response = await axiosSecureInstance.post(GOOGLE_DRIVE_FILES_TO_KNOWLEDGE_BASE,KnowledgeBase);
                message.success(response.data.message);
                
            }else{
                message.error("File could not be access. Use personal files only");
            }

        } catch (error) {
            console.error('Error uploading file:', error);
            message.error(error.response.data.message);

        }
    };

    return (
        <li className="tool-item" onClick={()=>{
            handleOpenPicker(apiKey)}} >
           <div className="tool-item-icon">
                <img src={googleDriveIcon} alt="Google Drive Icon" style={{ width: 25, height: 25 }} />
            </div>
            <div className="tool-item-info">
                <div className="tool-name"> Import From Google Drive</div>
                <p className="tool-details">Add Google doc, sheet, ppt (max file size 1.5 MB)</p>
            </div>                
        </li>
    );
};

export default GoogleFilePicker;
