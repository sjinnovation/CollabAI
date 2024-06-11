import Scrollbars from "rc-scrollbars";
import { IoIosMore } from "react-icons/io";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button } from "antd";
import { PushpinOutlined } from '@ant-design/icons';
import React, { useContext, useEffect, useMemo, useState } from "react";
import { ThemeContext } from "../../../contexts/themeConfig";
import { addPinnedAssistant, deletePinnedAssistant } from "../../../api/pinnedAssistant";
import { getUserID } from "../../../Utility/service";
import "./AssistantList.css";
import { BsRobot } from "react-icons/bs";

const AssistantList = ({ propsData }) => {
  const { theme } = useContext(ThemeContext);
  const { assistants, setAssistants, actions, page, totalPage, loading, setAssistantSelected, setAssistantIdLinked ,handleFetchAssistants} = propsData;
  const { assistant_id: ast_id_from_params } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);


  const filteredAssistantListWithTrue = useMemo(() => 
    assistants.filter(assistant => assistant?.is_pinned === true), [assistants]);

  const filteredAssistantListWithFalse = useMemo(() => 
    assistants.filter(assistant => assistant?.is_pinned === false), [assistants]);

  const fullAssistantRearrangedList = useMemo(() => 
    [...filteredAssistantListWithTrue, ...filteredAssistantListWithFalse], 
    [filteredAssistantListWithTrue, filteredAssistantListWithFalse]);

  const retrievingUniqueAssistant = useMemo(() => 
    fullAssistantRearrangedList.filter((assistant, index, self) =>
      index === self.findIndex(anyAssistant => anyAssistant?.name === assistant?.name)), 
      
    [fullAssistantRearrangedList]);

    const handlePinButtonClick = async (assistantId, id, currentPinStatus,event) => {
      event.preventDefault();
      setIsLoading(true);
      const updatePinStatus = !currentPinStatus;
      try {
        if (updatePinStatus) {
          await addPinnedAssistant(assistantId, id, getUserID(), updatePinStatus);
        } else {
          await deletePinnedAssistant(assistantId, id, getUserID(), updatePinStatus);
        }
  
        // Update the assistants list in the parent component
        const updatedAssistants = assistants?.map((assistant) =>
          assistant?.assistant_id === assistantId ? { ...assistant, is_pinned: updatePinStatus } : assistant
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
      <Scrollbars
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
        {loading ? <p>...</p> : retrievingUniqueAssistant?.length ? (
          <>
            {retrievingUniqueAssistant?.map((assistant, index) => (
              <Link
                to={`/assistants/${assistant?.assistant_id}`}
                onClick={() => {
                  setAssistantIdLinked(assistant?.assistant_id);
                  setAssistantSelected(true);
                }}
                rel="noreferrer"
                key={index}
                style={{ textDecoration: "none" }}
              >
                <div
                  className="navPrompt"
                  onMouseEnter={() => setHoveredUser(assistant)}
                  onMouseLeave={() => setHoveredUser(null)}
                >
                  {assistant?.image_url ? (
                    <Avatar size={26} src={assistant?.image_url} />
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        color: theme === "light" ? "#000" : "#fff",
                      }}
                      width="1.5em"
                      height="1.5em"
                      fill="none"
                      className="bi bi-robot"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5ZM3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.58 26.58 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.933.933 0 0 1-.765.935c-.845.147-2.34.346-4.235.346-1.895 0-3.39-.2-4.235-.346A.933.933 0 0 1 3 9.219V8.062Zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a24.767 24.767 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25.286 25.286 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135Z" />{" "}
                      <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2V1.866ZM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5Z" />{" "}
                    </svg>
                  )}

                  <p>{assistant?.name}</p>

                  {hoveredUser === assistant || assistant?.is_pinned ? (
                    <PushpinOutlined
                      checked={assistant?.is_pinned}
                      onClick={(e) => handlePinButtonClick(assistant?.assistant_id, assistant?._id, assistant?.is_pinned,e)}
                      style={{ marginLeft: '5px', color: assistant?.is_pinned ? 'green' : 'gray' }}
                      disabled={loading || isLoading}
                    />
                  ) : (
                    <PushpinOutlined
                      checked={assistant?.is_pinned}
                      style={{ marginLeft: '5px', color: assistant?.is_pinned ? 'green' : 'gray', visibility: 'hidden' }}
                      disabled={loading || isLoading}
                    />
                  )}
                </div>
              </Link>
            ))}

            {page < totalPage && (
              <Button
                className="mb-1 w-100 custom-show-btn"
                onClick={() => actions.setPage(page + 1)}
              >
                <IoIosMore />
                Load More
              </Button>
            )}
          </>
        ) : null}
      </Scrollbars>
    </div>
  );
};

export default AssistantList;
