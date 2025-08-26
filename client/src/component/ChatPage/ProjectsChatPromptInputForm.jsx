import React, { useContext, useEffect, useMemo, useState } from "react";
import { Button, Card, Col, Dropdown, Menu, Modal, Row, Spin, Switch, Tooltip, Upload, Badge } from "antd";

import { Select, message, Typography } from "antd";
import {
  PlusOutlined,
  SendOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
  GlobalOutlined,
  UploadOutlined,
  GoogleOutlined,
  CloseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { botOptions } from "../../constants/chatPageConstants";
import { ThemeContext } from "../../contexts/themeConfig";
import UsefulPromptDropdown from "./UsefulPromptDropdown";
import { FaArrowUp, FaRegStopCircle, FaCheckCircle } from "react-icons/fa";
import { getProjectInfo, handleFileSubmit, handleWaitingFileSubmit, updateProjectInfo } from "../../api/projects";
import { useParams } from "react-router";
import "./ChatPagePlusButton.css";
import doc from "../../assests/images/file-icons/doc.png";
import pdf from "../../assests/images/file-icons/pdf.png";
import ppt from "../../assests/images/file-icons/ppt.png";
import txt from "../../assests/images/file-icons/txt.png";
import xls from "../../assests/images/file-icons/xls.png";
import cvs from "../../assests/images/file-icons/csv-file.png";
import json from "../../assests/images/file-icons/json.png";
import ai from "../../assests/images/file-icons/ai.png";
import img from "../../assests/images/file-icons/image.png";
import googleDriveImage from "./../../assests/images/google-drive.png";
import { BsFileEarmarkImage } from "react-icons/bs";

import workBoardIcon from "../../assests/images/knowledge-base-menu/workboard_icon.svg";
import { axiosSecureInstance } from "../../api/axios";
import {
  DELETE_THREAD_FILES_DURING_UPLOAD,
  SINGLE_PROJECT_DELETE_SLUG,
} from "../../constants/Api_constants";
import { IoIosImages } from "react-icons/io";
import { LuFileText } from "react-icons/lu";
import ReasoningEffortPicker from "./ReasoningEffortPicker";
import { getUserRole } from "../../Utility/service";
const role = getUserRole()

const { Text } = Typography;
const SHORTCUT_PROMPT_TEXT = "Press '/' to access a list of task commands.";
const SHORTCUT_PROMPT_ERROR =
  "Please enter a prompt before selecting a command!";
const SEPARATOR_TIP =
  "Tip: Use exactly 4 dashes '----' as the separator to queue more than one message in one go";
const ProjectsChatPromptInputForm = ({
  states,
  actions,
  refs,
  showSelectors = true,
}) => {
  const {
    selectedTags,
    tags,
    loading = false,
    inputPrompt,
    showPromptDropdown,
    showMassage,
    setShowMassage,
    uploadedFiles = [],
    setUploadedFiles = () => {},
    setBase64String = () => {},
    chatLog = [],
    isFetchingChatLog = false,
    threadFilesNames,
  } = states;
  const { promptInputRef } = refs;
  const {
    onSubmit,
    handleSelectTags,
    setSelectedTags,
    setSelectedChatModel,
    setInputPrompt,
    setShowPromptDropdown,
    handleStopGeneratingButton,
    fetchFolderData,
    folderData
  } = actions;

  const [isWebSearchActive, setIsWebSearchActive] = useState(false);
  const [uploadedFilesInThread, setUploadedFilesInThread] = useState(false);
  const { theme } = useContext(ThemeContext);
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState(null);
  const [isUploadMenuVisible, setIsUploadMenuVisible] = useState(false);
  const [uploadedWaitingFiles, setUploadedWaitingFiles] = useState([]);
  const [uploadedFileIds, setUploadedFileIds] = useState([]);
  const [formSubmit, setFormSubmit] = useState(false);

  const [modelChangeLoading, setModelChangeLoading] = useState(false);

  const handleFileUpload = async (file) => {
    if (threadFilesNames.includes(file.name)) {
      return message.error(`${file.name} already uploaded in this thread`);
    }
    let uploadedHere = false;

    uploadedFiles.map((ufile) => {
      if (ufile.name === file.name) {
        uploadedHere = true;
      }
      return;
    });
    if (uploadedHere) {
      return message.error(`${file.name} already uploaded Here`);
    }
    const fileList = [file];
    setUploadedFiles((prev) => [...prev, file]);
    const base64 = await convertImageToBase64(file);
    setBase64String(base64);
    setIsUploadMenuVisible(false);
    const showUploadMassage = false;
    const threadId = null;
    const msgId = null;
    const waitingFile = true;
    const fileUploadResponse = await handleWaitingFileSubmit(
      projectId,
      fileList,
      setUploadedFiles,
      threadId,
      msgId,
      showUploadMassage
    );
    if (fileUploadResponse.status === 200) {
      setUploadedFileIds((prev) => [...prev, file.uid]);
    } else {
      setUploadedFileIds((prev) => prev.filter((uid) => uid !== file.uid));
    }
    return false; // Prevent default upload behavior
  };
  const handleSubmit = (e) => {
    setFormSubmit(true);
    onSubmit(e);
  };

  useEffect(() => {}, [isFetchingChatLog]);

  const reasoningEffortOptions = [
    { value: "low", label: "Low (Favors speed and economical reasoning)" },
    {
      value: "medium",
      label: "Medium (Balance between speed and reasoning accuracy)",
    },
    { value: "high", label: "High (Favors more complete reasoning)" },
  ];

  const models = useMemo(() => {
    const baseModels = [
      {
        value: "gpt-4.1-mini",
        label: "GPT-4.1-mini",
        description: "Great for most tasks",
        badge: "NEW",
      },
      {
        value: "gpt-4.1-nano",
        label: "GPT-4.1-nano",
        description: "Great for most tasks (Doesn't support web search)",
        badge: "NEW",
      },
      {
        value: "gpt-4o",
        label: "GPT-4o",
        description: "Great for most tasks",
        // badge: "NEW",
      },
      {
        value: "gpt-4o-mini",
        label: "GPT-4o-mini",
        description: "Great for most tasks",
        // badge: "NEW",
      },
      {
        value: "gpt-4",
        label: "GPT-4",
        description: "Great for most tasks (Doesn't support image input and web search and file search)",
        // badge: "NEW",
      },
      {
        value: "gpt-3.5-turbo",
        label: "GPT-3.5-turbo", 
        description: "It's not recommended. cause it will be deprecated soon. (Doesn't support image input and web search and file search)",
        // badge: "NEW",
      },
      // {
      //   value: "gpt-4.5",
      //   label: "GPT-4.5",
      //   description: "Good for writing and exploring ideas",
      //   badge: "RESEARCH PREVIEW",
      // },
    ]
    const adminModel = {
      value: "gpt-4.1",
      label: "GPT-4.1",
      description: "Flagship GPT model for complex tasks", 
      badge: "NEW",
    };

    if (role === "admin" || role === "superadmin") {
      return [adminModel, ...baseModels];
    }
    return baseModels;
  }, [role]);

  const [selectedEffort, setSelectedEffort] = useState("medium");

  const handleChange = (value) => {
    setSelectedEffort(value);
  };

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result); // Resolve the promise with the Base64 string
      };
      reader.onerror = reject; // Reject the promise on error
      reader.readAsDataURL(file); // Read the file as a data URL
    });
  };

  const uploadMenuItems = [
    {
      key: "device",
      label: (
        <Upload
          beforeUpload={handleFileUpload}
          showUploadList={false}
          multiple={true}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <UploadOutlined />
            <span>Upload from Device</span>
          </div>
        </Upload>
      ),
    },
    {
      key: "drive",
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            opacity: 0.5,
          }}
        >
          <img
            style={{ height: "18px", width: "18px" }}
            src={googleDriveImage}
            alt=""
          />
          <span>Upload from Google Drive</span>
        </div>
      ),
      disabled: true,
    },
  ];
  const iconFile = {
    txt: txt,
    pptx: ppt,
    pdf: pdf,
    xlsx: xls,
    docx: doc,
    csv: cvs,
    ai: ai,
    json: json,
    jpg: img,
    jpeg: img,
    png: img,
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split(".")[1];
    if (iconFile.hasOwnProperty(ext)) {
      return iconFile[ext];
    }
  };
  useEffect(() => {
    if (projectId) {
      getProjectInfo(projectId).then((response) => {
        setProjectName(response?.data?.folderName);
        setIsWebSearchActive(response?.data?.webSearch);
      });
    }
  }, [projectId, loading]);

  const tagOptions = tags?.map((tag) => ({
    value: tag._id,
    label: tag.title,
  }));
  const handleBotChange = (selectedBot) => {
    setSelectedChatModel(selectedBot);
  };
  const handleTagChange = (selectedValues) => {
    const updatedSelectedTags = tags.filter((tag) =>
      selectedValues.includes(tag._id)
    );
    setSelectedTags(updatedSelectedTags);
    handleSelectTags(updatedSelectedTags);
  };
  const handleKeyDown = (event) => {
    if (loading) return;
    if (event.key === "/") {
      setShowPromptDropdown(true);
    }
    if (event.key !== "/" && showPromptDropdown) {
      setShowPromptDropdown(false);
    }
    if (event.key === "Enter" && event.shiftKey) {
      setInputPrompt((prevValue) => prevValue);
    } else if (event.key === "Enter") {
      event.preventDefault();
      event.target.style.height = "51px";
      onSubmit(event);
    }
  };

  const onInputPromptChange = (event) => {
    setInputPrompt(event.target.value);
    // Show message if there are separators in the text
    setShowMassage(event.target.value.includes("----"));
  };
  const handleUsefulPromptSelection = (selectedPrompt) => {
    const lastSlashRemoved = inputPrompt.replace(/\/$/, "");
    if (!lastSlashRemoved.trim()) {
      return message.warning(SHORTCUT_PROMPT_ERROR);
    }
    if (selectedPrompt && selectedPrompt?.label) {
      let userInputtedPrompt = `${lastSlashRemoved} ${selectedPrompt.label}`;
      setInputPrompt(userInputtedPrompt);
      setShowPromptDropdown(false);
      onSubmit(null, userInputtedPrompt);
    }
  };
  const scrollUp = () => {
    const textarea = promptInputRef.current;
    if (textarea) {
      textarea.scrollBy(0, -30);
    }
  };
  const scrollDown = () => {
    const textarea = promptInputRef.current;
    if (textarea) {
      textarea.scrollBy(0, 30);
    }
  };

  const handleWebSearchToggle = async (checked) => {
    setIsWebSearchActive(checked);
    const updatedProjectData = { webSearch: checked };
    const updateWebSearch = await updateProjectInfo(projectId, updatedProjectData)
    setIsWebSearchActive(updateWebSearch?.data?.data?.webSearch);

  };
  const handleModelChange = async (value) => {
    try {
      setModelChangeLoading(true);
      // setSelectedChatModel(value);
      const updatedProjectData = { model: value };
      const updatedModel = await updateProjectInfo(projectId, updatedProjectData);
      fetchFolderData(projectId)
      if (updatedModel?.data?.success) {
        message.success('Model updated successfully');
      }
    } catch (error) {
      message.error('Failed to update model');
      // setSelectedChatModel(models[0].value); // Reset to default on error
    } finally {
      setModelChangeLoading(false);
    }
  };
  const handleProjectFileDelete = async (uid) => {
    const requestBody = {
      projectId: projectId,
      uid: uid,
    };
    const deleteResponse = await axiosSecureInstance.post(
      DELETE_THREAD_FILES_DURING_UPLOAD,
      requestBody
    );
  };

  const truncateFileName = (name, max = 32) => {
    if (name.length <= max) return name;
    const ext = name.split(".").pop();
    const base = name.slice(0, max - ext.length - 5);
    return `${base}...${ext}`;
  };

  return (
    <div>
      <div className="parent-container">
        <form
          className={`form-style ${theme === "dark" && "dark-mode"}`}
          onSubmit={handleSubmit}
        >
          {chatLog?.length <= 0 && isFetchingChatLog === false ? (
            <h4
              className={`chatbox-above-title ${
                theme === "dark" && "dark-mode"
              }`}
            >
              What's on your mind today?
            </h4>
          ) : null}
          {showMassage && (
            <div className="query-massage">
              <p>
                <InfoCircleOutlined />
                <b className="ms-2 queue-title">
                  {
                    inputPrompt.split("----").filter((part) => part.trim())
                      .length
                  }{" "}
                  messages will be queued{" "}
                </b>
                <br />
                <small className="ms-4 queue-desc">{SEPARATOR_TIP}</small>
              </p>
            </div>
          )}

        <div
          className={`inputPromptTextarea-container ${
            theme === "dark" && "dark-mode"
          }`}
        >
          {showSelectors && (
            <div
              className={`select-container-whole ${
                theme === "dark" && "dark-mode"
              }`}
            >
              <div className="select-container">
                <Tooltip title="Choose an AI Model">
                  <Select
                    style={{ width: "150px", minWidth: "150px" }}
                    placeholder="Choose Model"
                    onChange={handleModelChange}
                    options={models}
                    defaultValue={folderData?.model || models[0].value}
                    value={folderData?.model || models[0].value}
                    className="custom-select-bot"
                    placement="topLeft"
                    loading={modelChangeLoading}
                    disabled={modelChangeLoading}
                    dropdownStyle={{ minWidth: "330px", margin:"8px" }}
                    optionRender={(option) => (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        width: '100%', 
                        minWidth: '250px',
                        padding: '4px 0' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 500 }}>{option.data.label}</span>
                            {option.data.badge && (
                              <Badge 
                                count={option.data.badge}
                                style={{ 
                                  backgroundColor: theme === 'dark' ? '#177ddc' : '#1890ff',
                                  fontSize: '10px',
                                  padding: '0 6px',
                                  height: '18px',
                                  borderRadius: '9px',
                                  minWidth: 'fit-content'
                                }}
                              />
                            )}
                          </div>
                          {option.selected && (
                            <FaCheckCircle style={{ 
                              color: theme === 'dark' ? '#1890ff' : '#1890ff',
                              fontSize: '14px',
                              marginLeft: '8px'
                            }} />
                          )}
                        </div>
                        <span 
                          style={{ 
                            fontSize: '12px', 
                            color: theme === 'dark' ? '#a6a6a6' : '#8c8c8c',
                            whiteSpace: 'normal',
                            lineHeight: '1.3',
                            marginTop: '2px'
                          }}
                        >
                          {option.data.description}
                        </span>
                      </div>
                    )}
                  />
                </Tooltip>
              </div>
              <div className="blurry-box"></div>
            </div>
          )}

            {uploadedFiles.map((file, index) => {
              const ext = file.name.split(".").pop().toLowerCase();
              const isImage = /(jpg|jpeg|png|gif|webp|svg)/i.test(ext);

              return (
                <Col key={index}>
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    {/* IMAGE Preview */}
                    {isImage ? (
                      <div
                        className="image-preview-wrapper"
                        style={{
                          width: 56,
                          height: 56,
                          marginLeft: "10px",
                          borderRadius: "16px",
                          background: theme === "dark" ? "#2a2b32" : "#f5f5f5",
                          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <img
                          src={URL.createObjectURL(file.originFileObj || file)}
                          alt="preview"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: uploadedFileIds.includes(file.uid)
                              ? 1
                              : 0.2,
                            transition: "opacity 0.3s",
                          }}
                        />
                        {!uploadedFileIds.includes(file.uid) && (
                          <div
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              background: "rgba(0, 0, 0, 0.2)",
                            }}
                          >
                            <Spin indicator={<LoadingOutlined spin />} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        style={{
                          width: 320,
                          padding: "10px 12px",
                          marginLeft: "10px",
                          background: theme === "dark" ? "#1e1e1e" : "#fafafa",
                          borderRadius: "16px",
                          border: `1px solid ${
                            theme === "dark" ? "#444" : "#ddd"
                          }`,
                          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {/* Red rounded icon container */}
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            backgroundColor: "#FF5588",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <LuFileText
                            style={{
                              color: "white",
                              width: "20px",
                              height: "20px",
                            }}
                          />
                        </div>

                        <div style={{ overflow: "hidden" }}>
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: theme === "dark" ? "#fff" : "#000",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "200px",
                            }}
                          >
                            {truncateFileName(file.name)}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: theme === "dark" ? "#aaa" : "#666",
                            }}
                          >
                            {file.name.split(".").pop().toUpperCase()}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Cross button - floats outside top right */}
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={async () => {
                        setUploadedFiles((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                        setUploadedFileIds((prev) =>
                          prev.filter((uid) => uid !== file.uid)
                        );
                        await handleProjectFileDelete(file.uid);
                      }}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 18,
                        height: 18,
                        padding: 2,
                        borderRadius: "50%",
                        color: "#fff",
                        border:
                          theme === "dark"
                            ? "2px solid #212121"
                            : "2px solid #fff",
                        background: theme === "dark" ? "#212121" : "#212121",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                      }}
                    />
                  </div>
                </Col>
              );
            })}

            <UsefulPromptDropdown
              isVisible={showPromptDropdown}
              onSelection={handleUsefulPromptSelection}
            >
              <textarea
                ref={promptInputRef}
                autoComplete="off"
                placeholder="Ask me anything..."
                name="inputPrompt"
                className={`inputPrompttTextarea ${
                  theme === "dark" && "dark-mode"
                }`}
                rows="2"
                value={inputPrompt}
                onKeyDown={handleKeyDown}
                onChange={onInputPromptChange}
                style={{ height: "auto" }}
                onInput={(e) => {
                  const textarea = e.target;
                  textarea.style.height = "auto";
                  textarea.style.height = `${textarea.scrollHeight}px`;
                }}
              />
            </UsefulPromptDropdown>
            <div className="actions-container">
              <div className="upload-container">
                {isUploadMenuVisible && (
                  <>
                    <div
                      className="menu-overlay"
                      onClick={() => setIsUploadMenuVisible(false)}
                    />
                    <div className="upload-menu-container">
                      <Menu
                        items={uploadMenuItems}
                        className={`upload-menu ${
                          theme === "dark" ? "dark" : "light"
                        }`}
                      />
                    </div>
                  </>
                )}
                <div className="chatbox-leftside-elements">
                  <div>
                    <Dropdown
                      overlay={<Menu items={uploadMenuItems} />}
                      placement="topLeft" // popover will open above/left of the button
                      trigger={["click"]} // open on click
                    >
                      <Tooltip title="Attach files" disabled={!projectId}>
                        <Button
                          className="plus-button"
                          type="text"
                          icon={<BsFileEarmarkImage />}
                          disabled={!projectId}
                          style={{ fontSize: 17 }}
                        />
                      </Tooltip>
                    </Dropdown>
                  </div>
                  <div>
                    {projectId && (
                      <Tooltip title="Search the Web">
                        <Button
                          type="text"
                          icon={<GlobalOutlined />}
                          onClick={() =>
                            handleWebSearchToggle(!isWebSearchActive)
                          }
                          className={`web-search-button ${
                            isWebSearchActive ? "active" : ""
                          } ${theme === "dark" ? "dark" : ""}`}
                        >
                          Search
                        </Button>
                      </Tooltip>
                    )}
                  </div>
                  <div>
                    <button
                      disabled={loading || !inputPrompt.trim()}
                      aria-label="Insert separator"
                      className={`sendIcon-outline ${
                        theme === "dark" && "dark-mode"
                      }`}
                      type="button"
                      onClick={() => {
                        setInputPrompt((prev) => `${prev}\n----\n`);
                        setShowMassage(true);
                      }}
                    >
                      <UnorderedListOutlined /> Queue
                    </button>
                  </div>
                </div>
              </div>

              <div className="d-flex">
                <button
                  disabled={loading || !inputPrompt.trim()}
                  aria-label="form submit"
                  className={`sendIcon-project ${
                    theme === "dark" && "dark-mode"
                  }`}
                  type="submit"
                >
                  <FaArrowUp className="send" />
                </button>
              </div>
            </div>
          </div>
        </form>
        {loading ? (
          <div className="stop-generating-btn-container multi-provider-area-stop-btn">
            <Button
              danger
              type="primary"
              onClick={handleStopGeneratingButton}
              style={{ width: "160px" }}
              icon={<FaRegStopCircle />}
              size={30}
            >
              Stop Generating
            </Button>
          </div>
        ) : (
          <></>
        )}
        <div
          style={{ marginTop: "20px" }}
          className={`shortcut-text ${theme === "dark" && "dark-mode"}`}
        >
          <Text style={{ color: "#717171" }}>
            Press{" "}
            <span className={`slash-icon ${theme === "dark" && "dark-mode"}`}>
              /
            </span>{" "}
            to access a list of task commands.
          </Text>
        </div>
      </div>
    </div>
  );
};
export default ProjectsChatPromptInputForm;
