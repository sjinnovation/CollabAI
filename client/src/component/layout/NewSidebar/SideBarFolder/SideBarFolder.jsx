import React, { useContext, useEffect, useState } from "react";
import { getUserID } from "../../../../Utility/service";
import { axiosSecureInstance } from "../../../../api/axios";
import FolderModal from "./FolderModal";
import { Button, Menu, Dropdown, Avatar, Alert, Empty } from "antd";
import { FaRegFolderClosed } from "react-icons/fa6";
import { BsThreeDots, BsThreeDotsVertical } from "react-icons/bs";
import { Modal } from "antd";
import { FaSearch } from "react-icons/fa"; // Add this import
import { useParams } from 'react-router-dom';


import "./SideBarFolder.css";
import UpdateModal from "./UpdateModal";
import { MdOutlineDelete } from "react-icons/md";
import { FaRegEdit, FaRegFolderOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AiFillFolderAdd } from "react-icons/ai";
import { SidebarContext } from "../../../../contexts/SidebarContext";
const userId = getUserID();


const SideBarFolder = ({ setModalVisible, modalVisible }) => {
  const [folders, setFolders] = useState([])
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [openFolders, setOpenFolders] = useState({});
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { showMenu, setShowMenu,setShowProjectSidebar } = useContext(SidebarContext);
  const { projectId } = useParams();

    const fetchFolders = async () => {
        try {
            const response = await axiosSecureInstance.get(`api/folder-chats/user/${userId}`);
            const sortedFolders = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setFolders(sortedFolders);
            return response
        } catch (error) {
            console.error('Error fetching folders:', error);
        }
    };

  useEffect(() => {
    fetchFolders();
  }, [userId]);

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleFolderCreated = () => {
    fetchFolders();
  };

  const handleUpdateModalOpen = (folder) => {
    setSelectedFolder(folder);
    setUpdateModalVisible(true);
  };

  const handleUpdateModalClose = () => {
    setUpdateModalVisible(false);
    setSelectedFolder(null);
  };

  const handleFolderUpdated = () => {
    fetchFolders();
  };

  const getFolderColorStyle = (color) => {
    return { color: color && color !== 'white' ? color : 'var(--light-dark)' };
  };

  const handleDeleteFolder = (folderId) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this project ?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk: async () => {
        try {
          await axiosSecureInstance.delete(`api/folder-chats/${folderId}`);
          const foldersInfo = await fetchFolders();
          navigate(foldersInfo?.data.length > 0 ? `/projects/${foldersInfo?.data?.[0]?._id}` : '/chat', { replace: true });
        } catch (error) {
          console.error('Error deleting folder:', error);
        }
      },
    });
  };

  const toggleFolder = (folderId) => {
    setOpenFolders((prevState) => ({
      ...prevState,
      [folderId]: !prevState[folderId],
    }));
  };

  const handleFolderClick = (folderId) => {
    localStorage.setItem("projectId", folderId);
    navigate(`/projects/${folderId}`, { state: { folderId } });
  };



  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredFolders = folders.filter((folder) =>
    folder.folderName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sidebar-folder-inner-content">
      <div className="input-group input-group-sm mb-3 thread-search-wrapper">
        <span className="input-group-text thread-search" id="basic-addon1">
          <FaSearch />
        </span>
        <input
          type="text"
          className="form-control thread-search"
          placeholder="Search project"
          aria-label="Search project"
          aria-describedby="basic-addon1"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <FolderModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onFolderCreated={handleFolderCreated}
      />
      <UpdateModal
        visible={updateModalVisible}
        onClose={handleUpdateModalClose}
        folder={selectedFolder}
        onFolderUpdated={handleFolderUpdated}
      />
      <div className="folder-list">
        {filteredFolders.map((folder) => {
          const activeFolderId = localStorage.getItem("projectId");

          const colorOptions = {
            black: "#000000",
            red: "#F14D42",
            orange: "#E36E30",
            yellow: "#B98618",
            gold: "#DB9F1E",
            green: "#3DCB40",
            darkGreen: "#30A633",
            teal: "#27C0A6",
            cyan: "#16B7DB",
            blue: "#6490F0",
            lightBlue: "#0088FF",
            navy: "#1D53BF",
            purple: "#512AEB",
            violet: "#875BE1",
            pink: "#EE4D83",
            magenta: "#E659C2",
          };

          const getFolderColorStyle = (color) => {
            return { color: colorOptions[color] };
          };

          return (
            <div
              key={folder._id}
              className={`folder-item ${folder._id === projectId ? "active" : ""}`}
            >
              <span
                className="folder-with-icon"
                onClick={() => handleFolderClick(folder._id)}
                style={{ cursor: "pointer", marginLeft: "8px" }}
              >
                <span className="side-folder-design">
                  <span
                    onClick={() => {
                      toggleFolder(folder._id);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {openFolders[folder._id] ? (
                      <FaRegFolderOpen
                        className="folder-icon-project"
                        style={getFolderColorStyle(folder.folderColor)}
                      />
                    ) : (
                      <FaRegFolderClosed
                        className="folder-icon-project"
                        style={getFolderColorStyle(folder.folderColor)}
                      />
                    )}
                  </span>
                  <span>{folder.folderName}</span>
                </span>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item onClick={() => handleUpdateModalOpen(folder)}>
                        <span className="folder-name-icon">
                          <FaRegEdit /> Update Project
                        </span>
                      </Menu.Item>
                      <Menu.Item
                        onClick={() => handleDeleteFolder(folder._id)}
                        danger
                      >
                        <span className="folder-name-icon">
                          <MdOutlineDelete /> Delete Project
                        </span>
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button
                    className="botton-folder"
                    type="text"
                    style={{ marginLeft: "8px" }}
                  >
                    <BsThreeDotsVertical />
                  </Button>
                </Dropdown>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SideBarFolder;
