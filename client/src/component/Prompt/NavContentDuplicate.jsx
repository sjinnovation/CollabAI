import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import NavLinksContainer from "./NavLinksContainer";
import NavPrompt from "./NavPrompt";
import NewChat from "./NewChat";
import { getUserID } from "../../Utility/service";
import { SidebarContext } from "../../contexts/SidebarContext";
import Scrollbars from "rc-scrollbars";
import { VscListSelection } from "react-icons/vsc";
import { FaSearch } from "react-icons/fa";
import { categorizePrompts } from "../../Utility/helper";
import { getChatThread } from "../../api/threadApiFunctions";
import { AssistantContext } from "../../contexts/AssistantContext";
import AssistantList from "../layout/NewSidebar/AssistantList";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import debounce from "lodash/debounce";
import { LuLayers } from "react-icons/lu";
import "./exploreAssistant.css";
import { getSingleAssistant } from "../../api/assistantChatPageApi";
import "./NavBar.css";
import "./NavContentDuplicate.css";
import { FolderOpenOutlined } from "@ant-design/icons";
import { AiOutlineAntDesign } from "react-icons/ai";
import logo from "../../assests/images/NewLogo.png";
import darkLogo from "../../assests/images/NewLogo-dark.png";
import logoIcon from "../../assests/images/brandLogo/logoIcon.svg";
import { ThemeContext } from "../../contexts/themeConfig";
import { FaArrowRightFromBracket, FaFolderOpen } from "react-icons/fa6";
import { BsFillLayersFill } from "react-icons/bs";
import CommonNavLinks from "../layout/NewSidebar/CommonNavLinks";
import SideBarFolder from "../layout/NewSidebar/SideBarFolder/SideBarFolder";
import { Tabs } from 'antd';
import TabPane from "antd/es/tabs/TabPane";
import { IoFileTrayStacked } from "react-icons/io5";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { fetchCompanyInfo } from "../../api/settings";
import logoPath from "../layout/logoPath";

const NavContentDuplicate = ({
  setChatLog,
  chatLog,
  triggerUpdate,
}) => {
  const userid = getUserID();
  const [chatThread, setChatThread] = useState([]);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || '1');

  const {
    assistants,
    setAssistants,
    totalPage,
    setTotalPage,
    page,
    setPage,
    loading,
    setLoading,
    handleFetchAssistants,
    fetchSearchedAssistants,
    searchQuery,
    setSearchQuery,
    deletedAssistantThreadId,
    triggerUpdateThreads,
    setTriggerUpdateThreads,
    assistantSelected,
    setAssistantSelected,
    assistantIdLinked,
    setAssistantIdLinked,
    addAssistantName,
    setAddAssistantName,
  } = useContext(AssistantContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { assistant_id } = useParams();
  const { setShowMenu, showMenu, setShowProjectSidebar, showProjectSidebar, brandAvatar, setBrandAvatar } = useContext(SidebarContext);
  const [activeItem, setActiveItem] = useState(null);
  const [logoUrl, setLogoUrl] = useState(brandAvatar);

  const getCompanyInfo = async () => {
    const response = await fetchCompanyInfo();
    setBrandAvatar(response?.data?.company?.brandLogo);
  };

  useEffect(() => {
    getCompanyInfo();

    const getLogo = async () => {
      const logo = await logoPath("faviLogo");
      if (logo) {
        setLogoUrl(logo);
        return;
      }
      setLogoUrl(brandAvatar || logoIcon);
    };
    getLogo();
  }, []);

  useEffect(() => {
    if (showProjectSidebar) {
      setActiveItem("projects");
    } else if (showMenu) {
      setActiveItem("threads");
    }
    else if (location.pathname.startsWith("/knowledge-base")) {
      setActiveItem("knowledgeBase");
    } else if (location.pathname.startsWith("/public-agent")) {
      setActiveItem("exploreAgents");
    }
    else {
      setActiveItem(null);
    }
  }, [location.pathname, showProjectSidebar, showMenu]);

  const handleIActiveItemClick = (item) => {
    setActiveItem(item);
  };

  useEffect(() => {
    if (assistant_id) {
      setAssistantSelected(true);
      setAssistantIdLinked(assistant_id);
    } else {
      setAssistantSelected(false);
      setAssistantIdLinked("");
    }
    if (assistantIdLinked) {
      const fetchData = async () => {
        const res = await getSingleAssistant(assistantIdLinked);
        if (res?.assistant?.name) {
          setAddAssistantName(res.assistant.name);
        }
      };
      fetchData();
    }
  }, [assistantIdLinked, window.location.pathname]);

  const handleClick = () => {
    navigate("/public-agent");
    setShowMenu(false);
    setShowProjectSidebar(false);
  };
  const handleClickProject = () => {
    setShowProjectSidebar(!showProjectSidebar);
    setShowMenu(false);
    setActiveItem(!showProjectSidebar ? "projects" : null);
  };
  const handleClickThreads = () => {
    setShowMenu(!showMenu);
    setShowProjectSidebar(false);
    setActiveItem(!showMenu ? "threads" : null);
  };

  const handleClickOnKnowledgeBase = () => {
    navigate("/knowledge-base");
    setShowMenu(false);
    setShowProjectSidebar(false);
    setActiveItem("knowledgeBase");
  };

  const handleAssistantSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setPage(1);
    }, 600),
    []
  );

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  return (
    <div className="sidebar-content-wrapper">
      <div className="w-100 logo-wrapper logo-btn-align" >
        <img
          onClick={() => {
            navigate("/chat", { replace: true });
          }}
          alt="brand logo"
          src={logoUrl ? logoUrl : logoIcon}
          width={50}
          height={40}
        />
        <div className="new-chat-btn-size" style={{ padding: "0.875rem", paddingBottom: 0 }}>
          <NewChat />
        </div>
      </div>
      {/* Wrap sidebar-main-content in Scrollbars */}
      <div className="sidebar-main-content">
        <div
          onClick={() => {
            handleClickOnKnowledgeBase();
            handleIActiveItemClick("knowledgeBase");
          }}
          className={`glyphicon glyphicon-th-large sidebar-item mx-2 mt-3 ${activeItem === "knowledgeBase" ? "active-class" : ""}`}
        >
          <p className="custom-size-for-explore-text fw-bold sidebar-text">
            <FaFolderOpen className="fs-5 me-2 sidebar-icon" />
            Knowledge Base
          </p>
        </div>
        <div
          onClick={() => {
            handleClick();
            handleIActiveItemClick("exploreAgents");
          }}
          className={`glyphicon glyphicon-th-large sidebar-item mx-2 ${activeItem === "exploreAgents" ? "active-class" : ""}`}
        >
          <p className="fw-bold custom-size-for-explore-text sidebar-text">
            <BsFillLayersFill className="fs-5 me-2 sidebar-icon" />
            Explore Agents
          </p>
        </div>
        <div
          onClick={() => {
            handleClickProject();
            handleIActiveItemClick("projects");
          }}
          className={`glyphicon glyphicon-th-large sidebar-item mx-2 sidebar-item-alignment ${activeItem === "projects" && showProjectSidebar ? "active-class" : ""}`}
        >
          <p className="fw-bold custom-size-for-explore-text sidebar-text">
            <IoFileTrayStacked className="fs-5 me-2 sidebar-icon" />
            Projects
          </p>
          <p className="fw-bold custom-size-for-explore-text sidebar-text">
            {showProjectSidebar ? (
              <IoIosArrowBack className="fs-5 me-2 sidebar-icon" />
            ) : (
              <IoIosArrowForward className="fs-5 me-2 sidebar-icon" />
            )}
          </p>
        </div>

        {!(
          location.pathname === "/projects" ||
          location.pathname.startsWith("/projects/")
        ) && (
          <div
            onClick={() => {
              handleClickThreads();
              handleIActiveItemClick("threads");
            }}
            className={`glyphicon glyphicon-th-large sidebar-item mx-2 sidebar-item-alignment ${
              activeItem === "threads" && showMenu ? "active-class" : ""
            }`}
          >
            <p className="fw-bold custom-size-for-explore-text sidebar-text">
              <VscListSelection className="fs-5 me-2 sidebar-icon" />
              Threads
            </p>
            <p className="fw-bold custom-size-for-explore-text sidebar-text">
              {showMenu ? (
                <IoIosArrowBack className="fs-5 me-2 sidebar-icon" />
              ) : (
                <IoIosArrowForward className="fs-5 me-2 sidebar-icon" />
              )}
            </p>
          </div>
        )}
        {/* ) : null} */}

          <div className="tab-container-for-folder">
            <div style={{ padding: "0.875rem", paddingTop: 0 }}>
              <div className="d-flex w-100 align-items-center">
                <hr className="sidebar-hr" style={{ width: "50%" }} />
                <small
                  style={{
                    fontSize: "0.75rem",
                    lineHeight: "1rem",
                    padding: "0.5rem",
                    whiteSpace: "nowrap",
                  }}
                  className="text-capitalize text-secondary"
                >
                  Frequently Used Agents
                </small>
                <hr className="sidebar-hr" style={{ width: "50%" }} />
              </div>

            <div className="input-group input-group-sm mb-1">
              <span
                className="input-group-text sidebar-search"
                id="basic-addon1"
              >
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control sidebar-search"
                placeholder="Search Agent"
                aria-label="Agent Search"
                aria-describedby="basic-addon1"
                onChange={(e) => handleAssistantSearch(e?.target?.value)}
              />
            </div>

            <AssistantList
              propsData={{
                assistants,
                setAssistants,
                page,
                totalPage,
                loading,
                actions: {
                  setPage,
                },
                setAssistantSelected,
                setAssistantIdLinked,
                handleFetchAssistants,
              }}
            />
          </div>
        </div>
      </div>

      <NavLinksContainer chatLog={chatThread} setChatLog={setChatThread} />
    </div>
  );
};

export default NavContentDuplicate;