import React, { useContext, useRef, useEffect } from "react";
import { Tooltip } from "antd";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { CgAttachment } from "react-icons/cg";
import { ThemeContext } from "../../../src/contexts/themeConfig";
import { MdDeleteOutline } from "react-icons/md";
import { RiImageAddFill } from "react-icons/ri";

const AssistantChatInputPrompt = ({ states, actions }) => {
  const { theme } = useContext(ThemeContext);
  const { selectedFiles, loading, inputPrompt, isUploadingFile } = states;

  const promptInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    onSubmit,
    handleKeyDown,
    onInputPromptChange,
    handleFileChange,
    handleFileRemove,
  } = actions;

  useEffect(() => {
    if (promptInputRef.current) {
      adjustTextareaHeight(); 
    }
  }, [inputPrompt]);

  const adjustTextareaHeight = () => {
    const textarea = promptInputRef.current;
    if (textarea) {
      textarea.style.height = "auto"; 
      textarea.style.height = `${textarea.scrollHeight}px`; 
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className={`form-style ${theme === "dark" && "dark-mode"}`}
    >
      <div
        className={`inputPromptTextarea-container ${
          theme === "dark" && "dark-mode"
        }`}
      >
        <textarea
          ref={promptInputRef}
          autoComplete="off"
          placeholder="Ask me anything..."
          name="inputPrompt"
          className={`inputPrompttTextarea assistantchat ${
            theme === "dark" && "dark-mode"
          }`}
          rows="2"
          value={inputPrompt}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            onInputPromptChange(e);
            adjustTextareaHeight();
          }}
          style={{
            height: "auto",
            maxHeight: "250px",
            overflowY: "auto",
            paddingTop: "20px", 
          }}
        />

        <div className="actions-container">
          <Tooltip title="Attach">
            <button
              className="plus-button"
              aria-label="Attach"
              type="button"
              onClick={() => fileInputRef.current.click()}
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
  );
};

export default AssistantChatInputPrompt;
