import React, { useContext, useEffect, useState } from "react";
import Header from "../Header/Header";
import ThreadSidebarWrapper from "../../Prompt/ThreadSidebar/ThreadSidebarWrapper";
import { Outlet, useLocation, useParams } from "react-router-dom";
import Footer from "../footer/footer";
import { SidebarContext } from "../../../contexts/SidebarContext";
import { getUserAvatar } from "../../../api/userApiFunctions";
import { getUserID } from "../../../Utility/service";
import { ProfileContext } from "../../../contexts/ProfileContext";
import { getProjectInfo } from "../../../api/projects";
import ProjectSidebar from "../ProjectSidebar/ProjectSidebar";

const MainContent = () => {
  const userId = getUserID();
  const { setUserAvatar } = useContext(ProfileContext);
  const { showMenu, setShowMenu, showProjectSidebar, setShowProjectSidebar } = useContext(SidebarContext);
  const location = useLocation();
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState(null);
  useEffect(() => {
    if (projectId) {
      getProjectInfo(projectId).then(response => {
        setProjectName(response?.data?.folderName);
      });
    }


  }, [projectId]);

  useEffect(() => {
    if (
      // location?.pathname === "/public-assistant" ||
      location.pathname.startsWith("/chat/") ||
      location.pathname === "/projects" ||
      location.pathname.startsWith("/projects/") ||
      location.pathname.startsWith("/agents/")
    ) {
      return
    } else {
      setShowMenu(false);
    }
  }, [location, setShowMenu]);

  useEffect(() => {
    if (location.pathname === "/projects" || location.pathname.startsWith("/projects/")) {
      return;
    } else {
      setShowProjectSidebar(false);
    }
  }, [location.pathname, setShowProjectSidebar]);

  const handleFetchUserAvatar = async () => {
    try {
      const { success, data, error } = await getUserAvatar(userId);
      if(!userId) {
        return null;
      }
      if (success) {
        setUserAvatar(data);
      }
    } catch (error) {
      console.error("Error fetching user avatar data:", error);
    }
  };

  useEffect(() => {
    handleFetchUserAvatar();
  }, [userId]);


  return (
    <>
      <div
        className="main-wrapper min-vh-100 d-flex flex-column justify-content-between flex-grow-1">
        <Header />
        <section className="flex-grow-1 d-flex z-0">
          <div className={`project-sidebar ${showProjectSidebar ? "open-sidebar" : "close-sidebar"}`}>
            <ProjectSidebar />
          </div>
          {/* Sidebar for chat thread */}
          <div className={`thread-sidebar ${showMenu ? "open-sidebar" : "close-sidebar"}`}>
            <ThreadSidebarWrapper folderId={projectId ? projectId : null} projectName={projectName} />
          </div>
          <div
            className={`main-chat-area-section flex-grow-1 ${showMenu ? "move-main-layout" : ""
              }`}
          >
            <Outlet />
          </div>
        </section>
        <Footer />
      </div>
    </>
  );
};

export default MainContent;
