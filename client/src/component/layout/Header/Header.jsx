import React, { useContext, useEffect, useState } from "react";
import { BiMoon, BiSun } from "react-icons/bi";
import { ThemeContext } from "../../../contexts/themeConfig";
import { useLocation, useParams } from "react-router-dom";
import "./Header.scss";
import { Button, Tooltip, Typography } from "antd";
import { pageTitle } from "./Utilities/pageTitleInfo";
import { SidebarContext } from "../../../contexts/SidebarContext";
import {
  TbLayoutSidebarLeftCollapse,
  TbLayoutSidebarRightCollapse,
} from "react-icons/tb";
import { getPageTitle } from "../../../Utility/helper";
import { PageTitleContext } from "../../../contexts/TitleContext";
import NewChatWithSameAssistant from "../../Prompt/NewChatWithSameAssistant";
import DarkModeToggler from "../../common/DarkModeToggler/DarkModeToggler";
import { FaFolderOpen } from "react-icons/fa";
import { AiOutlineMenuUnfold, AiOutlineMenuFold } from "react-icons/ai";
import SyncFilesFromNavBar from "../../Prompt/SyncFilesFromNavBar";
import { axiosSecureInstance } from "../../../api/axios";
import { CHECK_ASSISTANT_SYNC_ENABLE_STATUS } from "../../../constants/Api_constants";
import AssistantRating from "../../Assistant/AssistantRating";
// import logo from "../../../assests/images/Collab AI Logo White.png";
import { getProjectInfo } from "../../../api/projects";
import NewChatWithSameProject from "../../Prompt/NewChatWithSameProject";

const Header = () => {
  const { theme, toggleTheme, themeIsChecked, setThemeIsChecked } = useContext(ThemeContext);
  const { setShowMenu, showMenu, showMainSidebar, setShowMainSidebar, showSettingMenu, setSettingMenu, setOrganizationSettingsMenu, organizationSettingsMenu, agentListMenu, setAgentListMenu, knowledgeBaseMenu, setKnowledgeBaseMenu } = useContext(SidebarContext);
  const { pageTitle, setPageTitle } = useContext(PageTitleContext);
  const [isSyncEnable, setIsSyncEnable] = useState(false);
  const location = useLocation();
  const paramAssistantId = location.pathname.split("/")[2]
  const isSmallDevice = window.matchMedia("(max-width: 1024px)").matches;
  const [currentPathForAgentList, setCurrentPathForAgentList] = useState("");

  useEffect(() => {
    const pathForAgentListUrl = ["/myAgents", "/publicAgents", "/organizationalAgents", "/myFunctions", "/allFunctions", "/userAgents"];
    if (pathForAgentListUrl.includes(location.pathname)) {
      setCurrentPathForAgentList(location.pathname);
    }
  }, [location.pathname]);

  const { projectId } = useParams();
  const [projectName, setProjectName] = useState(null);
  useEffect(() => {
    if (projectId) {
      getProjectInfo(projectId).then(response => {
        setProjectName(response?.data?.folderName);
      });
    }
  }, [projectId]);



  const checkAssistantSyncStatus = async (assistantId) => {
    const isSyncEnabled = await axiosSecureInstance.get(CHECK_ASSISTANT_SYNC_ENABLE_STATUS(assistantId));
    if (isSyncEnabled.data.enableSync) {
      setIsSyncEnable(isSyncEnabled.data.enableSync);
    }
  }

  useEffect(() => {
    if (location.pathname.startsWith("/agents/")) {
      setIsSyncEnable(false);
      checkAssistantSyncStatus(location.pathname.split("/")[2])
    }

  }, [location.pathname]);


  const isChatPath = /^\/chat\/.*$/.test(location.pathname);

  return (
    <nav
      className="navbar navbar-expand sticky-top nav-bar w-100"
      aria-label="Second navbar example"
      style={
        theme === "light"
          ? { backgroundColor: "#eef3ff" }
          : { backgroundColor: "#212121" }
      }
    >
      <div className="container-fluid CustomFlex">
        <div className="d-flex align-items-center gap-2">
          {/* Main Sidebar Toggle - All Routes */}

          {isSmallDevice ? (
            <button
              className="toggle-sidebar main-sidebar-toggle"
              onClick={() => setShowMainSidebar((prev) => !prev)}
            >
              {showMainSidebar ? (
                <AiOutlineMenuFold className="main-sidebar-close-icon" />
              ) : (
                <AiOutlineMenuUnfold className="main-sidebar-open-icon" />
              )}
            </button>
          ) : (
            <Tooltip title="Toggle Main Sidebar">
              <button
                className="toggle-sidebar main-sidebar-toggle"
                onClick={() => setShowMainSidebar((prev) => !prev)}
              >
                {showMainSidebar ? (
                  <AiOutlineMenuFold className="main-sidebar-close-icon" />
                ) : (
                  <AiOutlineMenuUnfold className="main-sidebar-open-icon" />
                )}
              </button>
            </Tooltip>
          )}

          {location?.pathname === "/profile" ? (
            isSmallDevice ? (
              <button
                className="toggle-sidebar"
                onClick={() => setSettingMenu((prevState) => !prevState)}
              >
                {showSettingMenu ? (
                  <TbLayoutSidebarRightCollapse className="thread-bar-close-icon setting-sidebar-display" />
                ) : (
                  <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon setting-sidebar-display" />
                )}
              </button>
            ) : (
              <Tooltip title="Collapse button">
                <button
                  className="toggle-sidebar"
                  onClick={() => setSettingMenu((prevState) => !prevState)}
                >
                  {showSettingMenu ? (
                    <TbLayoutSidebarRightCollapse className="thread-bar-close-icon setting-sidebar-display" />
                  ) : (
                    <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon setting-sidebar-display" />
                  )}
                </button>
              </Tooltip>
            )
          ) : (
            <></>
          )}

          {location?.pathname === "/public-agent" ? (
            isSmallDevice ? (
              <button
                className="toggle-sidebar"
                onClick={() => setSettingMenu((prevState) => !prevState)}
              >
                {showSettingMenu ? (
                  <TbLayoutSidebarRightCollapse className="thread-bar-close-icon public-agent-explore-sidebar-display" />
                ) : (
                  <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon public-agent-explore-sidebar-display" />
                )}
              </button>
            ) : (
              <Tooltip title="Collapse button">
                <button
                  className="toggle-sidebar"
                  onClick={() => setSettingMenu((prevState) => !prevState)}
                >
                  {showSettingMenu ? (
                    <TbLayoutSidebarRightCollapse className="thread-bar-close-icon public-agent-explore-sidebar-display" />
                  ) : (
                    <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon public-agent-explore-sidebar-display" />
                  )}
                </button>
              </Tooltip>
            )
          ) : (
            <></>
          )}

          {location?.pathname === "/config" ? (
            isSmallDevice ? (
              <button
                className="toggle-sidebar"
                onClick={() => setOrganizationSettingsMenu((prevState) => !prevState)}
              >
                {organizationSettingsMenu ? (
                  <TbLayoutSidebarRightCollapse className="thread-bar-close-icon organization-setting-display" />
                ) : (
                  <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon organization-setting-display" />
                )}
              </button>
            ) : (
              <Tooltip title="Collapse button">
                <button
                  className="toggle-sidebar"
                  onClick={() => setOrganizationSettingsMenu((prevState) => !prevState)}
                >
                  {organizationSettingsMenu ? (
                    <TbLayoutSidebarRightCollapse className="thread-bar-close-icon organization-setting-display" />
                  ) : (
                    <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon organization-setting-display" />
                  )}
                </button>
              </Tooltip>
            )
          ) : (
            <></>
          )}

          {currentPathForAgentList === location?.pathname ? (
            isSmallDevice ? (
              <button
                className="toggle-sidebar"
                onClick={() => setAgentListMenu((prevState) => !prevState)}
              >
                {agentListMenu ? (
                  <TbLayoutSidebarRightCollapse className="thread-bar-close-icon agent-list-sidebar-display" />
                ) : (
                  <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon agent-list-sidebar-display" />
                )}
              </button>
            ) : (
              <Tooltip title="Collapse button">
                <button
                  className="toggle-sidebar"
                  onClick={() => setSettingMenu((prevState) => !prevState)}
                >
                  {agentListMenu ? (
                    <TbLayoutSidebarRightCollapse className="thread-bar-close-icon agent-list-sidebar-display" />
                  ) : (
                    <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon agent-list-sidebar-display" />
                  )}
                </button>
              </Tooltip>
            )
          ) : (
            <></>
          )}

          {location?.pathname === "/knowledge-base" ? (
            isSmallDevice ? (
              <button
                className="toggle-sidebar"
                onClick={() => setKnowledgeBaseMenu((prevState) => !prevState)}
              >
                {knowledgeBaseMenu ? (
                  <TbLayoutSidebarRightCollapse className="thread-bar-close-icon knowledgeBaseMenu-setting-display" />
                ) : (
                  <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon knowledgeBaseMenu-setting-display" />
                )}
              </button>
            ) : (
              <Tooltip title="Collapse button">
                <button
                  className="toggle-sidebar"
                  onClick={() => setKnowledgeBaseMenu((prevState) => !prevState)}
                >
                  {knowledgeBaseMenu ? (
                    <TbLayoutSidebarRightCollapse className="thread-bar-close-icon knowledgeBaseMenu-setting-display" />
                  ) : (
                    <TbLayoutSidebarLeftCollapse className="thread-bar-open-icon knowledgeBaseMenu-setting-display" />
                  )}
                </button>
              </Tooltip>
            )
          ) : (
            <></>
          )}

         <Typography.Title level={5} className="rounded m-0">
            {!projectId && <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "18px" }}> {getPageTitle(location.pathname)?.icon ?? <></>}</span>
              {getPageTitle(location.pathname)?.title ?? ""}
            </div>}
              {pageTitle[location.pathname] && (
                <NewChatWithSameAssistant assistantId={location.pathname.split("/")[2]} assistantName={pageTitle[location.pathname]} />
              )}
              {projectId && (
                <NewChatWithSameProject projectId={projectId} projectName={projectName} />
              )}

          </Typography.Title>
          <Typography.Title level={5} className="rounded m-0">
            {pageTitle[location.pathname] && isSyncEnable && (
              <SyncFilesFromNavBar assistantId={location.pathname.split("/")[2]} assistantName={pageTitle[location.pathname]} />
            )}
          </Typography.Title>

        </div>
        <div className="d-flex align-items-center">
            <div className="me-5">
                {paramAssistantId?.slice(0, 5) === "asst_" && <AssistantRating assistantId={paramAssistantId} />}
            </div>
            <DarkModeToggler theme={theme} toggleTheme={toggleTheme} themeIsChecked={themeIsChecked} setThemeIsChecked={setThemeIsChecked}/>
          </div>

      </div>
    </nav>
  );
};

export default Header;
