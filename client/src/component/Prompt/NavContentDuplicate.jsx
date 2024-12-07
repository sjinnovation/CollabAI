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
import { FaSearch } from "react-icons/fa";
import { categorizePrompts } from "../../Utility/helper";
import { getChatThread } from "../../api/threadApiFunctions";
import { AssistantContext } from "../../contexts/AssistantContext";
import AssistantList from "../layout/NewSidebar/AssistantList";
import { useNavigate, useParams } from "react-router-dom";
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
import whiteLogo from "../../assests/images/collab_ai_logo_white.svg";
import { ThemeContext } from "../../contexts/themeConfig";
import { FaFolderOpen } from "react-icons/fa6";
import { BsFillLayersFill } from "react-icons/bs";
import CommonNavLinks from "../layout/NewSidebar/CommonNavLinks";
import PortfolioHome from "../../Pages/PortfolioHome";


const NavContentDuplicate = ({
  setChatLog,
  chatLog,
  setShowMenu,
  triggerUpdate,
}) => {
  const userid = getUserID();
  const [chatThread, setChatThread] = useState([]);
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
  const { assistant_id } = useParams();
  // const [assistantSelected, setAssistantSelected] = useState(false);
  // const [assistantIdLinked, setAssistantIdLinked] = useState("");
  // const [addAssistantName, setAddAssistantName] = useState("");
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
    navigate('/public-agent');
  };
  const retrievingUniqueAssistant = assistants.filter(
    (assistant, index, self) =>
      index ===
      self.findIndex((anyAssistant) => anyAssistant.name === assistant.name)
  );
  const handleClickOnKnowledgeBase = () => {
    navigate("/knowledge-base");
  };
  const handleClickClientInfo = () => {
    navigate('/portfolio-management/ClientInfo');
  };
  const handleClickPodInfo = () => {
    navigate('/portfolio-management/PodInfo');
  };
  const [showSubButtons, setShowSubButtons] = useState(false); // State for sub-buttons visibility

  const toggleSubButtons = () => {
    setShowSubButtons(!showSubButtons); // Toggle visibility
  };
  const handleAssistantSearch = useCallback(
    debounce((value) => {
      setSearchQuery(value);
      setPage(1);
    }, 600),
    []
  );
  const handlePortfolioManagement = () => {
    navigate("/portfolio");
  }
  // Main sidebar end
  return (
    <div className="w-100 h-100 d-flex flex-column justify-content-between">
      <div className="w-100 logo-wrapper" style={{ padding: "0.875rem" }}>
        <img
          onClick={() => {
            navigate("/chat", { replace: true });
          }}
          alt="brand logo"
          // src={theme === "light" ? darkLogo : logo}
          src={whiteLogo}
          width="250"
          height="60"
        />
      </div>
      <div className="h-100 w-100">
        <div style={{ padding: "0.875rem", paddingBottom: 0 }}>
          <NewChat />
        </div>
        <div
          onClick={handleClickOnKnowledgeBase}
          className="glyphicon glyphicon-th-large sidebar-item"
        >
          <p className="custom-size-for-explore-text fw-bold sidebar-text">
            <FaFolderOpen className="fs-5 me-2 sidebar-icon" /> 
            Knowledge Base
          </p>
        </div>
        <div
          onClick={handleClick}
          className="glyphicon glyphicon-th-large sidebar-item"
        >
          <div className="sidebar">
      {/* Portfolio Management Button */}
      <div
        onClick={toggleSubButtons}
        className="glyphicon glyphicon-th-large sidebar-item"
      >
        <p className="fw-bold custom-size-for-explore-text sidebar-text">
          <BsFillLayersFill className="fs-5 me-2 sidebar-icon" />
          Portfolio Management
        </p>
      </div>

      {/* Sub-buttons */}
      {showSubButtons && (
        <div className="sub-buttons-container">
          <button onClick={handleClickClientInfo }>
            Client Info
          </button>
          <button onClick={handleClickPodInfo}>Pod Info</button>
        </div>
      )}
    </div>
          <p className="fw-bold custom-size-for-explore-text sidebar-text">
            <BsFillLayersFill className="fs-5 me-2 sidebar-icon" />
            Explore Agents
          </p>
        </div>
        <div
          onClick={handlePortfolioManagement}
          className="glyphicon glyphicon-th-large sidebar-item"
        >
          <p className="fw-bold custom-size-for-explore-text sidebar-text">
            <BsFillLayersFill className="fs-5 me-2 sidebar-icon" />
            Portfolio management
          </p>
        </div>
        <div style={{ padding: "0.875rem", paddingTop: 0 }}>
          {/* <div className="input-group input-group-sm mb-1">
            <span className="input-group-text sidebar-search" id="basic-addon1">
              <FaSearch />
            </span>
            <input
              type="text"
              className="form-control sidebar-search"
              placeholder="Search Agent"
              aria-label="Username"
              aria-describedby="basic-addon1"
              // value={searchQuery}
              onChange={(e) => handleAssistantSearch(e.target.value)}
            />
          </div> */}
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
        {/* <div className="single-border"></div> */}
      </div>
      <CommonNavLinks />
      <NavLinksContainer chatLog={chatThread} setChatLog={setChatThread} />
    </div>
  );
};
export default NavContentDuplicate;
