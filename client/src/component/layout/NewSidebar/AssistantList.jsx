import Scrollbars from "rc-scrollbars";
import { IoIosMore } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Avatar, Button } from "antd";
import { PushpinOutlined } from "@ant-design/icons";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../../contexts/themeConfig";
import {
  addPinnedAssistant,
  deletePinnedAssistant,
} from "../../../api/pinnedAssistant";
import { getUserID, getUserRole } from "../../../Utility/service";
import "./AssistantList.css";
import { BsRobot } from "react-icons/bs";
import agentPlaceholder from "../../../assests/images/agents-placeholder.png";

const AssistantList = ({ propsData }) => {
  const { theme } = useContext(ThemeContext);
  const navigate = useNavigate();
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
  const { assistant_id: ast_id_from_params } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const role = getUserRole()

  const filteredAssistantListWithTrue = useMemo(
    () => assistants.filter((assistant) => assistant?.is_pinned === true),
    [assistants]
  );

  const filteredAssistantListWithFalse = useMemo(
    () => assistants.filter((assistant) => assistant?.is_pinned === false),
    [assistants]
  );

  const fullAssistantRearrangedList = useMemo(
    () => [...filteredAssistantListWithTrue, ...filteredAssistantListWithFalse],
    [filteredAssistantListWithTrue, filteredAssistantListWithFalse]
  );

  const retrievingUniqueAssistant = useMemo(
    () =>
      fullAssistantRearrangedList.filter(
        (assistant, index, self) =>
          index ===
          self.findIndex(
            (anyAssistant) => anyAssistant?.name === assistant?.name
          )
      ),

    [fullAssistantRearrangedList]
  );

  const handlePinButtonClick = async (
    assistantId,
    id,
    currentPinStatus,
    event
  ) => {
    event.preventDefault();
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

      // Update the assistants list in the parent component
      const updatedAssistants = assistants?.map((assistant) =>
        assistant?.assistant_id === assistantId
          ? { ...assistant, is_pinned: updatePinStatus }
          : assistant
      );

      setAssistants(updatedAssistants);
    } catch (error) {
      console.error("Failed to update pin status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* <Scrollbars
        autoHide
        autoHideTimeout={1000}
        autoHideDuration={200}
        style={{ width: "245px", height: "22vh", border: "none" }}
        renderThumbVertical={({ style, ...props }) => (
          <div
            style={{
              ...style,
              cursor: "pointer",
              backgroundColor: "rgba(255,255,255,.25)",
            }}
            {...props}
          ></div>
        )}
      >
       
      </Scrollbars> */}
       {loading ? (
          <p>...</p>
        ) : retrievingUniqueAssistant?.length ? (
          <>
            {retrievingUniqueAssistant?.map((assistant, index) => (
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
                  className="navPrompt assistant-list sidebar-item"
                  onMouseEnter={() => setHoveredUser(assistant)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  {assistant?.image_url ? (
                    <Avatar className="agent-image" size={20} src={assistant?.image_url} />
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

                  {hoveredUser === assistant || assistant?.is_pinned ? (
                    <PushpinOutlined
                      checked={assistant?.is_pinned}
                      onClick={(e) =>
                        handlePinButtonClick(
                          assistant?.assistant_id,
                          assistant?._id,
                          assistant?.is_pinned,
                          e
                        )
                      }
                      style={{
                        marginLeft: "5px",
                        color: assistant?.is_pinned ? "green" : "gray",
                      }}
                      disabled={loading || isLoading}
                    />
                  ) : (
                    <PushpinOutlined
                      checked={assistant?.is_pinned}
                      style={{
                        marginLeft: "5px",
                        color: assistant?.is_pinned ? "green" : "gray",
                        visibility: "hidden",
                      }}
                      disabled={loading || isLoading}
                    />
                  )}
                </div>
              </Link>
            ))}

            {page < totalPage && (
              <Button
                className="mb-1 w-100 custom-show-btn"
                // onClick={() => actions.setPage(page + 1)}
                onClick={() => {
                  navigate(role === 'superadmin' ? '/agentsList' : '/users-agents')
                }}
              >
                <IoIosMore />
                See More
              </Button>
            )}
          </>
        ) : null}
    </div>
  );
};

export default AssistantList;
