import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { PiChatsCircleBold } from "react-icons/pi";
import { Dropdown, Menu, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BsThreeDots } from 'react-icons/bs';

import ChatPageCustomInstructions from './ChatPageCustomInstructions';
import ChatPageFolder from './ChatPageFolder';
import { clearConversation, getChatThread, updatePrompt } from '../../../api/threadApiFunctions';
import "./ChatPageCustomInstructions.css";
import { Card, Input, List, Modal } from 'antd';

const InstructionsAndFolder = ({ propsData, states }) => {
    const location = useLocation();
    const [showInstructions, setShowInstructions] = useState(true);
    const [showFolder, setShowFolder] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeKeyOfKnowledgeBase, setActiveKeyOfKnowledgeBase] = useState("1");
    const [chatThread, setChatThread] = useState([]);
    const [chatThreadResult, setChatThreadResult] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        // Check if we're coming from new chat button
        if (location.state?.isNewChat) {
            setShowInstructions(true);
            setShowFolder(false);
            setIsModalOpen(false);
        }
    }, [location]);

    const {
        projectId,
        folderData,
        fetchFolderData,
        formattedRAGdData,
        formattedPublicFilesData,
        attachedFiles,
        fetchPersonas,
        allPersonasWithPersonalPersonas,
        userId
    } = propsData;
    const { setFolderData } = states;

    const handleFolderClick = () => {
        setShowInstructions(false);
        setShowFolder(true);
        setIsModalOpen(true);
    };

    const handleGetChatThread = async () => {
      try {
        let folderId = projectId;
        let assistantIdLinked = null;
        const result = await getChatThread(
          userId,
          setChatThread,
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

    useEffect(() => {
      handleGetChatThread();
    }, [userId, projectId]);

    const menu = (item) => {
      return (
        <Menu
          items={[
            {
              key: "rename",
              icon: <EditOutlined />,
              label: "Rename",
              onClick: () => {
                let newTitle =
                  item.prompttitle || item.description || "Untitled Chat";
                let modal;

                const handleInputChange = (e) => {
                  newTitle = e.target.value;
                };

                modal = Modal.confirm({
                  title: "Rename Chat",
                  content: (
                    <Input
                      autoFocus
                      defaultValue={newTitle}
                      onChange={handleInputChange}
                      onPressEnter={() =>
                        modal?.update({ okButtonProps: { loading: true } })
                      }
                    />
                  ),
                  onOk: async () => {
                    const trimmed = newTitle?.trim();
                    if (!trimmed) return;

                    try {
                      await updatePrompt(
                        item.threadid,
                        trimmed,
                        () => {},
                        () => {}
                      );
                      handleGetChatThread();
                      message.success("Thread renamed successfully.");
                    } catch (err) {
                      message.error("Failed to rename chat thread. Please try again.");
                    }
                  },
                });
              },
            },
            {
              key: "delete",
              icon: <DeleteOutlined style={{ color: "#ff4d4f" }} />,
              label: <span style={{ color: "#ff4d4f" }}>Delete</span>,
              onClick: () => {
                Modal.confirm({
                  title: "Are you sure you want to delete this chat?",
                  onOk: async () => {
                    try {
                      await clearConversation(
                        item.threadid || item._id,
                        () => {},
                        () => {},
                        () => {},
                        () => {},
                        item.folderId
                      );
                      handleGetChatThread();
                      message.success("Chat thread deleted successfully.");
                    } catch (err) {
                      message.error("Failed to delete chat. Please try again.");
                    }
                  },
                  okButtonProps: { danger: true },
                  okText: "Delete",
                });
              },
            },
          ]}
        />
      );
    };

    const formatText = (text, maxLength = 60, toTitleCaseFlag = false) => {
      if (!text) return "";

      let formattedText = text;

      if (toTitleCaseFlag) {
        formattedText = formattedText
          .toLowerCase()
          .split(" ")
          .filter(Boolean)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      if (formattedText.length > maxLength) {
        return formattedText.slice(0, maxLength) + "...";
      }

      return formattedText;
    };

    return (
        <div>
            {showInstructions && <ChatPageCustomInstructions propsData={{
                folderId: projectId,
                folderData,
                fetchFolderData,
                fetchPersonas,
                allPersonasWithPersonalPersonas,
                userId,
                handleFolderClick,
            }} />}

            {chatThreadResult.length > 0 && (
              <div className="chat-thread-list">
                <h6 className="mx-2">Chats in this project</h6>
                <div className="chat-thread-list-container">
                  <List
                    dataSource={chatThreadResult}
                    renderItem={(item) => (
                      <List.Item key={item._id} className="chat-thread-item">
                        <List.Item.Meta
                          onClick={() =>
                            navigate(
                              `/projects/${item?.folderId}/${item?.threadid}`
                            )
                          }
                          role="link"
                          tabIndex={0}
                          avatar={
                            <PiChatsCircleBold className="chat-thread-item-icon" />
                          }
                          title={
                            <span>
                              {formatText(
                                item?.prompttitle ||
                                  item?.description ||
                                  "Untitled Chat",
                                70,
                                true
                              )}
                            </span>
                          }
                          description={formatText(
                            item?.promptresponse || item?.description || "",
                            110,
                            false
                          )}
                        />
                        <div className="more-icon-wrapper">
                          <Dropdown overlay={menu(item)} trigger={["click"]}>
                            <BsThreeDots className="more-icon" />
                          </Dropdown>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              </div>
            )}

            {isModalOpen && <ChatPageFolder props={{
                setShowFolder,
                setShowInstructions,
                activeKeyOfKnowledgeBase,
                setActiveKeyOfKnowledgeBase,
                formattedRAGdData,
                formattedPublicFilesData,
                folderData,
                fetchFolderData,
                attachedFiles
            }} states={{ setFolderData }} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />}
        </div>
    );
};

export default InstructionsAndFolder;