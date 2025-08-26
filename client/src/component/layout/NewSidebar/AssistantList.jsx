import { IoIosMore } from "react-icons/io";
import { Link } from "react-router-dom";
import { Avatar, Button, message, Spin } from "antd";
import { PushpinOutlined, PushpinFilled } from "@ant-design/icons";
import { useContext, useMemo, useState } from "react";
import {
  addPinnedAssistant,
  deletePinnedAssistant,
} from "../../../api/pinnedAssistant";
import { getUserID } from "../../../Utility/service";
import "./AssistantList.css";
import agentPlaceholder from "../../../assests/images/agents-placeholder.png";
import { AssistantContext } from "../../../contexts/AssistantContext";

const AssistantList = ({ propsData }) => {
  const { searchQuery } = useContext(AssistantContext);
  const {
    assistants,
    setAssistants,
    actions,
    page,
    totalPage,
    loading,
    setAssistantSelected,
    setAssistantIdLinked,
    handleFetchAssistants,
  } = propsData;

  const [isLoading, setIsLoading] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [seeAllMode, setSeeAllMode] = useState(false);

  const sortedUniqueAssistants = useMemo(() => {
    const unique = assistants.filter(
      (assistant, index, self) =>
        index === self.findIndex((a) => a?.name === assistant?.name)
    );
    return unique.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const aLastUsed = new Date(a.lastUsed);
      const bLastUsed = new Date(b.lastUsed);
      return bLastUsed - aLastUsed;
    });
  }, [assistants]);

  const displayAssistants = useMemo(() => {
    if (!seeAllMode && page === 1) {
      return sortedUniqueAssistants.slice(0, 6);
    }
    return sortedUniqueAssistants;
  }, [sortedUniqueAssistants, page, seeAllMode]);

  const handlePinButtonClick = async (
    assistantId,
    id,
    currentPinStatus,
    event
  ) => {
    event.preventDefault();
    // Enforce maximum 3 pinned agents.
    if (!currentPinStatus) {
      const pinnedCount = assistants.filter(
        (assistant) => assistant?.isPinned
      ).length;
      if (pinnedCount >= 3) {
        message.warning("Maximum 3 agents can be pinned");
        return;
      }
    }
    setIsLoading(true);
    const updatePinStatus = !currentPinStatus;
    try {
      if (updatePinStatus) {
        await addPinnedAssistant(assistantId, id, getUserID(), updatePinStatus);
      } else {
        await deletePinnedAssistant(
          assistantId,
          id,
          getUserID(),
          updatePinStatus
        );
      }
      const updatedAssistants = assistants.map((assistant) =>
        assistant?.assistant_id === assistantId
          ? { ...assistant, isPinned: updatePinStatus }
          : assistant
      );
      setAssistants(updatedAssistants);
      if (updatePinStatus) {
        const newPinnedCount = updatedAssistants.filter(
          (assistant) => assistant?.isPinned
        ).length;
        if (newPinnedCount === 3) {
          message.info("3 agents are now pinned");
        }
      }
    } catch (error) {
      console.error("Failed to update pin status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render the list of agents.
  const listContent = (
    <>
      {displayAssistants.map((assistant, index) => (
        <Link
          to={`/agents/${assistant?.assistant_id}`}
          onClick={() => {
            setAssistantIdLinked(assistant?.assistant_id);
            setAssistantSelected(true);
          }}
          rel="noreferrer"
          key={index}
          style={{ textDecoration: "none" }}
        >
          <div
            className="navPrompt assistant-list sidebar-item px-2"
            onMouseEnter={() =>
              !assistant?.isPinned && setHoveredUser(assistant)
            }
            onMouseLeave={() => !assistant?.isPinned && setHoveredUser(null)}
          >
            {assistant?.image_url ? (
              <Avatar
                className="agent-image"
                size={20}
                src={assistant?.image_url}
              />
            ) : (
              <img
                className="sidebar-icon"
                width={20}
                height={20}
                src={agentPlaceholder}
                alt=""
              />
            )}
            <p className="sidebar-text agents-name">{assistant?.name}</p>
            {assistant?.isPinned ? (
              <PushpinFilled
                onClick={(e) =>
                  handlePinButtonClick(
                    assistant?.assistant_id,
                    assistant?._id,
                    assistant?.isPinned,
                    e
                  )
                }
                style={{
                  marginLeft: "5px",
                  color: "#1890ff",
                  cursor: "pointer",
                }}
              />
            ) : (
              <PushpinOutlined
                className="pin-icon"
                onClick={(e) =>
                  handlePinButtonClick(
                    assistant?.assistant_id,
                    assistant?._id,
                    assistant?.isPinned,
                    e
                  )
                }
                style={{
                  marginLeft: "5px",
                  color: "gray",
                  cursor: "pointer",
                }}
                disabled={loading || isLoading}
              />
            )}
          </div>
        </Link>
      ))}
    </>
  );

  // Render listContent in a div, relying on parent Scrollbars
  const contentWrapper = (
    <div style={{ width: "245px" }}>
      {listContent}
      {seeAllMode && loading && (
        <div style={{ textAlign: "center", padding: "10px" }}>
          <Spin size="small" className="assistant-list-spinner" />
          <div className="assistant-list-loading-text">Loading more agents...</div>
        </div>
      )}
    </div>
  );

  // Render the toggle button if there's no search query and more than 6 assistants.
  const renderInitialButton = () => {
    if (searchQuery && searchQuery?.trim() !== "") return null;
    if (sortedUniqueAssistants.length > 6) {
      return seeAllMode ? (
        loading ? (
          ''
        ) : (
          <Button
            className="mb-1 w-100 custom-show-btn"
            onClick={() => {
              setSeeAllMode(false);
              actions.setPage(1);
            }}
          >
            See Less
          </Button>
        )
      ) : (
        <Button
          className="mb-1 w-100 custom-show-btn"
          onClick={() => {
            setSeeAllMode(true);
            if (totalPage > 1) {
              actions.setPage(2);
            }
          }}
        >
          <IoIosMore style={{ marginRight: "4px" }} /> See More
        </Button>
      );
    }
    return null;
  };

  return (
    <div className="frequentlyUsedAgents">
      {loading && page === 1 ? (
        <p className="frequentlyUsedAgents-loading-text">Loading...</p>
      ) : (
        <>
          {contentWrapper}
          {renderInitialButton()}
        </>
      )}
    </div>
  );
};

export default AssistantList;