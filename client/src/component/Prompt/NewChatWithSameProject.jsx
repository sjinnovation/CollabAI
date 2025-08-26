import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Button, Dropdown, Menu } from "antd";
import { MdKeyboardArrowRight } from "react-icons/md";
import { getChatThread } from "../../api/threadApiFunctions";
import { getUserID } from "../../Utility/service";

const NewChatWithSameProject = ({ projectName, projectId }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [chatThreadResult, setChatThreadResult] = useState([]);
  const userId = getUserID();
  const lastProjectThreadKeyRef = useRef(null);

  const handleGetChatThread = async () => {
    try {
      let folderId = projectId;
      let assistantIdLinked = null;
      const result = await getChatThread(
        userId,
        () => {},
        assistantIdLinked,
        folderId
      );
      const { success, data, error } = result;
      if (success) {
        setChatThreadResult(data || []);
      } else {
        setChatThreadResult([]);
      }
    } catch (error) {
      setChatThreadResult([]);
    }
  };

  const getCurrentThreadId = () => {
    const parts = location.pathname.split("/");
    return parts[parts.length - 1];
  };

  useEffect(() => {
    const currentThreadId = getCurrentThreadId();
    const currentKey = `${projectId}-${currentThreadId}`;

    if (lastProjectThreadKeyRef.current !== currentKey) {
      lastProjectThreadKeyRef.current = currentKey;
      handleGetChatThread();
    }
  }, [userId, location.pathname, projectId]);

  const handleNewChat = () => {
    navigate(`/projects/${projectId}`, {
      replace: true,
      state: {
        isNewChat: true,
        showInstructions: true,
      },
    });
  };

  const toTitleCase = (str) => {
    const title = str
      ?.toLowerCase()
      .split(" ")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    return title && title.length > 20 ? title.slice(0, 20) + "..." : title;
  };

  const dropdownMenu = (
    <Menu className="project-menu-dropdown">
      <Menu.Item key="new-chat" onClick={handleNewChat}>
        <span>
          New Chat <FaRegEdit size={12} style={{ marginLeft: 5 }} />
        </span>
      </Menu.Item>
      {chatThreadResult.length > 0 &&
        chatThreadResult.map((item) => (
          <Menu.Item
            key={item._id}
            style={{ cursor: "pointer" }}
            onClick={() =>
              navigate(`/projects/${item?.folderId}/${item?.threadid}`)
            }
          >
            <span>
              {toTitleCase(
                item.prompttitle || item.description || "Untitled Chat"
              )}
            </span>
          </Menu.Item>
        ))}
    </Menu>
  );

  const getCurrentThreadTitle = () => {
    const currentThreadId = getCurrentThreadId();
    if (!currentThreadId || currentThreadId === projectId) return null;

    const activeThread = chatThreadResult.find(
      (item) => item.threadid === currentThreadId
    );

    if (activeThread) {
      const title = toTitleCase(
        activeThread.prompttitle || activeThread.description || "Untitled Chat"
      );
      return title.length > 15 ? title.slice(0, 15) + "..." : title;
    }

    return null;
  };

  return (
    <div>
      <div
        style={{ padding: 0 }}
        className="thread d-flex justify-content-between align-items-center"
      >
        <span
          className="header-title d-flex align-items-center gap-1"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
          {projectName}
          {getCurrentThreadTitle() && <MdKeyboardArrowRight />}
        </span>

        <Dropdown
          overlay={dropdownMenu}
          trigger={["click"]}
          placement="bottomLeft"
          onVisibleChange={(visible) => setIsDropdownOpen(visible)}
        >
          <Button
            size="small"
            className="project-new-chat-button d-flex align-items-center gap-1 chat-thread-button"
          >
            {getCurrentThreadTitle() ? (
              <>
                <span className="chat-thread-title d-flex align-items-center gap-1">
                  {getCurrentThreadTitle()}
                  <MdKeyboardArrowRight />
                </span>
              </>
            ) : (
              <MdKeyboardArrowRight />
            )}
          </Button>
        </Dropdown>
      </div>
    </div>
  );
};

export default NewChatWithSameProject;
