import { useContext, useState } from 'react';
import './projectSidebar.css';
import SideBarFolder from '../NewSidebar/SideBarFolder/SideBarFolder';
import { Tooltip } from 'antd';
import { MdOutlineMenuOpen } from "react-icons/md";
import { SidebarContext } from '../../../contexts/SidebarContext';
import { IoIosArrowBack } from 'react-icons/io';
import { AiFillFolderAdd } from "react-icons/ai";

const ProjectSidebar = () => {
  const { setShowProjectSidebar, showProjectSidebar } = useContext(SidebarContext);
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  return (
    <div className="project-sidebar-wrapper">
      <div className="project-sidebar-header">
        <div className="project-sidebar-title-icon">
          <h5 className="project-sidebar-title">Projects</h5>
          <p
            className="project-sidebar-icon"
            onClick={handleOpenModal}
            style={{ cursor: "pointer", display: "inline" }}
          >
            <AiFillFolderAdd className="create-folder__icon" />
          </p>
        </div>
        <div className="project-sidebar-header-icons">
          <Tooltip title="Collapse button">
            <button
              className="toggle-sidebar"
              onClick={() => {
                setShowProjectSidebar((prevState) => !prevState);
              }}
            >
              {showProjectSidebar ? (
                <IoIosArrowBack className="projectSide-bar-icon" />
              ) : (
                <IoIosArrowBack className="projectSide-bar-icon" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="project-sidebar-content">
        <SideBarFolder modalVisible={modalVisible} setModalVisible={setModalVisible}/>
      </div>
    </div>
  );
};

export default ProjectSidebar;