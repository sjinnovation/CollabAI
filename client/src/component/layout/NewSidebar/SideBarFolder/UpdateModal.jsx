import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from 'antd';
import { getUserID } from '../../../../Utility/service';
import { TiTick } from "react-icons/ti";
import './SideBarFolder.css';
import { axiosSecureInstance } from '../../../../api/axios';

const UpdateModal = ({ visible, onClose, folder, onFolderUpdated }) => {
    const [folderName, setFolderName] = useState('');
    const [folderColor, setFolderColor] = useState('');

    useEffect(() => {
        if (visible && folder) {
            setFolderName(folder.folderName);
            setFolderColor(folder.folderColor);
        }
    }, [visible, folder]);

    const handleUpdateFolder = async () => {
        if (!folderName) return;

        const userId = getUserID();
        const updatedData = {
            folderName,
            folderColor,
            userId,
        };

        try {
            await axiosSecureInstance.patch(`api/folder-chats/${folder._id}`, updatedData);
            onFolderUpdated(); 
            onClose(); 
        } catch (error) {
            console.error('Error updating folder:', error);
        }
    };


    const colorOptions = {
        black: '#000000',
        red: '#F14D42',
        orange: '#E36E30',
        yellow: '#B98618',
        gold: '#DB9F1E',
        green: '#3DCB40',
        darkGreen: '#30A633',
        teal: '#27C0A6',
        cyan: '#16B7DB',
        blue: '#6490F0',
        lightBlue: '#0088FF',
        navy: '#1D53BF',
        purple: '#512AEB',
        violet: '#875BE1',
        pink: '#EE4D83',
        magenta: '#E659C2',
    };

    const colorOptionsArray = Object.entries(colorOptions).map(([name, hex]) => ({ name, hex }));

    return (
        <Modal
            title="Update Project"
            visible={visible}
            onCancel={onClose}
            centered
            footer={[
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleUpdateFolder}>
                    Update
                </Button>,
            ]}
            width={300}
        >
            <Input
                placeholder="Enter project name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
            />
            <div className="color-selection">
                <div className="color-grid">
                {colorOptionsArray.map(({ name, hex }) => (
                        <div 
                            key={name} 
                            className={`color-circle ${folderColor === name ? 'selected' : ''}`}
                            style={{ backgroundColor: hex }}
                            onClick={() => setFolderColor(name)}
                        >
                            {folderColor === name && (
                                <TiTick className="tick-icon" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    );
};

export default UpdateModal;