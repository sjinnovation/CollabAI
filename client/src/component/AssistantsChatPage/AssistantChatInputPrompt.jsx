import React, { useContext, useRef, useEffect, useState } from "react";
import { Button, Select, Tooltip, message, Modal, Form, Input } from "antd";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { CgAttachment } from "react-icons/cg";
import { ThemeContext } from "../../../src/contexts/themeConfig";
import { MdDeleteOutline } from "react-icons/md";
import useAssistantsChatPage from "../../Hooks/useAssistantsChatPage";
import { getWorkBoardActionItems } from "../../api/workBoard";
import { FileContext } from "../../contexts/FileContext";
import { fetchN8nWorkflows, saveSelectedWorkflows } from "../../api/assistantApiFunctions";
import { getN8nWorkflows } from "../../api/user";
import { getUserID } from "../../Utility/service";
import { RiImageAddFill } from "react-icons/ri";
import { FaRegStopCircle } from "react-icons/fa";
import ChatBoxWrapper from "../ChatPage/ChatPageWraper";
import ConversationStarter from "../../Pages/AssistantsChatPage/ConversationStarter";
import N8nWorkflowDropdown from "./N8nWorkflowDropdown";
import './AssistantChatInputPromptResponsive.css'

const AssistantChatInputPrompt = ({ states, actions }) => {
  const { theme } = useContext(ThemeContext);
  const {
    selectedFiles,
    loading,
    inputPrompt,
    isUploadingFile,
    isGeneratingResponse,
    assistant_id,
    connectedApps,
    selectedFileAppWithFileId,
    assistantData,
    handleSelectStarter,
    isChatLogEmpty,
    assistantAllInfo
  } = states;
  const [selectedApp, setSelectedApp] = useState("");
  const [appFileList, setAppFileList] = useState([]);
  const { workBoardToken, setWorkBoardToken } = useContext(FileContext);
  const promptInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const {
    onSubmit,
    onInputPromptChange,
    handleFileChange,
    handleFileRemove,
    setSelectedFileAppWithFileId,
    stopGeneratingResponse,
  } = actions;

  // n8n workflow dropdown states
  const [showN8nDropdown, setShowN8nDropdown] = useState(false);
  const [workflows, setWorkflows] = useState([]);
  const [isLoadingWorkflows, setIsLoadingWorkflows] = useState(false);

  useEffect(() => {
    if (promptInputRef.current) {
      adjustTextareaHeight();
    }
  }, [inputPrompt]);
  useEffect(() => {
    if (promptInputRef.current) {
      adjustTextareaHeight();
    }
  }, [inputPrompt]);
  useEffect(() => {
    if (selectedApp === "WorkBoard") {
      if (
        workBoardToken !== "" &&
        workBoardToken !== null &&
        workBoardToken !== undefined
      ) {
        getWorkBoardActionItems().then((response) => {
          if (response !== "") {
            setAppFileList(response);
          } else {
            message.error("Please Sync Your workBoard ActionItems");
          }
        });
      } else {
        setAppFileList([]);
        message.error("Please Connect Your WorkBoard");
      }
    } else if (selectedApp === "GoogleDrive") {
      setAppFileList([]);
    }
  }, [selectedApp]);

  // Load n8n workflows when component mounts
  useEffect(() => {
    if (assistant_id && assistantAllInfo) {
      loadN8nWorkflows();
    }
  }, [assistant_id, assistantAllInfo]);

  // Load n8n workflows from user's account
  const loadN8nWorkflows = async () => {
    try {
      setIsLoadingWorkflows(true);
      const userId = getUserID();
      const response = await getN8nWorkflows(userId);
      
      if (response.data.success) {
        setWorkflows(response.data.workflows || []);
      } else {
        setWorkflows([]);
      }
    } catch (error) {
      console.error('Error loading n8n workflows:', error);
      setWorkflows([]);
    } finally {
      setIsLoadingWorkflows(false);
    }
  };

  // Handle key events for n8n dropdown
  const handleKeyDown = (event) => {
    if (loading) return;

    // Handle Enter key
    if (event.key === "Enter" && event.shiftKey) {
      // Allow Shift+Enter for new line
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (inputPrompt.trim()) {
        onSubmit(event);
      }
    }
  };

  // Handle n8n workflow selection
  const handleN8nWorkflowSelection = (selectedWorkflow) => {
    console.log("selectedWorkflow in handleN8nWorkflowSelection", selectedWorkflow);
    if (selectedWorkflow && selectedWorkflow.label) {
      // Replace "@n8n @" with "@n8n @{workflow name}"
      const newPrompt = inputPrompt.replace(/@n8n @$/, `@n8n @{${selectedWorkflow.label}}`);
      console.log("newPrompt in handleN8nWorkflowSelection", newPrompt);
      onInputPromptChange({ target: { value: newPrompt } });
      setShowN8nDropdown(false);
      
      // Focus back to textarea
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 100);
    }
  };

  // Handle input change
  const handleInputChange = (event) => {
    onInputPromptChange(event);
    adjustTextareaHeight();
    
    // Check for "@n8n @" pattern to show dropdown
    const currentValue = event.target.value;
    const cursorPosition = event.target.selectionStart;
    const textBeforeCursor = currentValue.substring(0, cursorPosition);
    
    // Check if user typed "@n8n @" (immediately after second @)
    if (textBeforeCursor.endsWith("@n8n @")) {
      setShowN8nDropdown(true);
    } else if (showN8nDropdown && !textBeforeCursor.includes("@n8n @")) {
      setShowN8nDropdown(false);
    }
  };
  
  const adjustTextareaHeight = () => {
    const textarea = promptInputRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const formatKey = (key) => {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    const formattedLabel = formattedKey.replace(/([A-Z])/g, " $1").trim();
    return {
      value: formattedKey,
      label: <span>{formattedLabel}</span>,
    };
  };
  const handleAppSelect = async (appName) => {
    if (appName === undefined) {
      setSelectedApp("");
      setAppFileList([]);
      setSelectedFileAppWithFileId({
        appName: "",
        fileIdOrUrl: "",
        fileName: "",
      });
    } else {
      setSelectedApp(appName);
      if (selectedApp === "GoogleDrive") {
        setSelectedFileAppWithFileId({
          appName: selectedApp,
          fileIdOrUrl: "",
          fileName: "",
        });
      }
    }
  };
  // if(!connectedApps.some(app=>app==null)){
  // let appFilteredList = connectedApps
  //   ?.filter((app) => Object?.values(app)[0] === true)
  //   ?.map((app) => formatKey(Object?.keys(app)[0]));
  // }
  let fileNameLists = [
    ...(appFileList?.personal
      ? appFileList?.personal?.map((file) => ({
          label: file?.description,
          value: file?.url,
        }))
      : []),
    ...(appFileList?.inLoop
      ? appFileList?.inLoop?.map((file) => ({
          label: file?.description,
          value: file?.url,
        }))
      : []),
  ];
  const handleFileNameChange = (fileId) => {
    const selectedFile = fileNameLists?.find(
      (option) => option?.value === fileId
    );
    const fileName = selectedFile ? selectedFile?.label : "";
    setSelectedFileAppWithFileId({
      appName: selectedApp,
      fileIdOrUrl: fileId,
      fileName: fileName,
    });
    return;
  };
  
  return (
    <div className="parent-container">

      <form
        className={`form-style-assistant ${theme === "dark" && "dark-mode"} responsive-form`}
      >
       { isChatLogEmpty ? (
        <ConversationStarter
        states={{
          assistant_id,
          StarterQuestions: assistantData,
          handleSelectStarter,
        }}
      />
       ) : <></> }
        {
          isGeneratingResponse ?
            <div className="stop-generating-btn-container assistant-stop-btn">
             <Button danger type="primary" onClick={stopGeneratingResponse} style={{ width: "160px", }} icon={<FaRegStopCircle />} size={30}>
                Stop Generating
              </Button>
            </div>
            :
            ""
        }
        <div
          className={`inputPromptTextarea-container-assistant ${
            theme === "dark" && "dark-mode"
          } assistant-textarea-container`}
        >
          <div
            className={`select-container-whole ${
              theme === "dark" && "dark-mode"
            } assistant-select-whole`}
          >
            <div className="select-container">
              {/* <Tooltip title="Choose an App">
                <Select
                  style={{ width: "30%" }}
                  placeholder="Choose an App"
                  onChange={handleAppSelect}
                  options={appFilteredList}
                  defaultValue={[]}
                  allowClear
                  className="custom-select-bot"
                  placement="topLeft"
                />
              </Tooltip> */}
              {/* <Tooltip title="Choose a File">
                <Select
                  style={{ width: "70%" }}
                  placeholder="Choose File"
                  showSearch
                  onChange={handleFileNameChange}
                  options={fileNameLists}
                  allowClear
                  notFoundContent={loading ? "Loading..." : null}
                  className="custom-select-file"
                  placement="topLeft"
                  filterOption={(input, option) =>
                    option?.label.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Tooltip> */}
            </div>
          </div>
          <N8nWorkflowDropdown
            isVisible={showN8nDropdown}
            onSelection={handleN8nWorkflowSelection}
            workflows={workflows}
            selectedWorkflowIds={assistantAllInfo?.selectedWorkflowIds || []}
          >
            <textarea
              ref={promptInputRef}
              autoComplete="off"
              placeholder="Ask me anything..."
              name="inputPrompt"
              className={`inputPrompttTextarea-assistant assistantchat ${
                theme === "dark" && "dark-mode"
              }`}
              rows="1"
              value={inputPrompt}
              onKeyDown={handleKeyDown}
              onChange={handleInputChange}
              style={{
                height: "auto",
                maxHeight: "250px",
                overflowY: "auto",
                paddingTop: "16px",
              }}
            />
          </N8nWorkflowDropdown>
          <div className="actions-container">
            <Tooltip title="It will be available soon">
              <button
                className="plus-button"
                aria-label="Attach"
                type="button"
                onClick={() => fileInputRef.current.click()}
                disabled
              >
                <RiImageAddFill />
              </button>
            </Tooltip>
            <input
              type="file"
              accept="pdf/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
              ref={fileInputRef}
            />
            {/*      Commenting for now. will remove this later if not needed
                  <button
                    // disabled={loading || !inputPrompt.trim()}
                    // aria-label="Stop response"
                    className="stopIcon"
                    type="button"
                    onClick={stopGeneratingResponse}
                  >
                    <FaRegStopCircle />
                  </button>
          */}
            <button
              disabled={loading || !inputPrompt.trim()}
              aria-label="form submit"
              className="sendIcon"
              type="button"
              onClick={onSubmit}
            >
              <SendOutlined />
            </button>
          </div>
        </div>
        {selectedFiles.length > 0 && (
          <div className="assistantInputFilesContainer">
            {selectedFiles.map((file, index) => (
              <div key={index} className="assistantInputFile">
                <small className="text-truncate">{file.name}</small>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileRemove(file);
                  }}
                  disabled={isUploadingFile}
                >
                  <MdDeleteOutline />
                </button>
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};
export default AssistantChatInputPrompt;