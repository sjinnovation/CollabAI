import React, { useContext } from "react";
import { Tooltip } from "antd";
import { Select, message, Typography } from "antd";
import { PlusOutlined, SendOutlined } from "@ant-design/icons";
import { botOptions } from "../../constants/chatPageConstants";
import { ThemeContext } from "../../contexts/themeConfig";
import UsefulPromptDropdown from "./UsefulPromptDropdown";
import { RiImageAddFill } from "react-icons/ri";

const { Text } = Typography;
const SHORTCUT_PROMPT_TEXT = "Press '/' to access a list of task commands.";
const SHORTCUT_PROMPT_ERROR =
  "Please enter a prompt before selecting a command!";

const ChatPromptInputForm = ({
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
  } = states;
  const { promptInputRef } = refs;
  const {
    onSubmit,
    handleSelectTags,
    setSelectedTags,
    setSelectedChatModel,
    setInputPrompt,
    setShowPromptDropdown,
  } = actions;

  const { theme } = useContext(ThemeContext);

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
    console.log(SHORTCUT_PROMPT_TEXT);
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

  return (
    <div className="parent-container">
      <form
        className={`form-style ${theme === "dark" && "dark-mode"}`}
        onSubmit={onSubmit}
      >
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
                <Tooltip title="Choose an AI" >
                  <Select
                    mouseLeaveDelay={0.1}
                    style={{ width: "30%" }}
                    placeholder="Choose Bot"
                    onChange={handleBotChange}
                    options={botOptions}
                    defaultValue={botOptions[0].value}
                    className="custom-select-bot"
                    placement="topLeft"
                  />
                </Tooltip>

                <Tooltip title="Choose a Tag">
                  <Select
                    style={{ width: "50%" }}
                    placeholder="Choose tags"
                    showSearch
                    value={selectedTags.map((tag) => tag._id)}
                    onChange={handleTagChange}
                    options={tagOptions}
                    notFoundContent={loading ? "Loading..." : null}
                    className="custom-select-tags"
                    placement="topLeft"
                  />
                </Tooltip>
              </div>
          <div className="blurry-box"></div>
            </div>
          )}
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
            <Tooltip title="It will be available soon">
              <button className="plus-button" aria-label="Attach" disabled>
                <span className="plusbtn-icon"><RiImageAddFill /></span>
              </button>
            </Tooltip>

            <button
              disabled={loading || !inputPrompt.trim()}
              aria-label="form submit"
              className={`sendIcon ${theme === "dark" && "dark-mode"}`}
              type="button"
              onClick={onSubmit}
            >
              <SendOutlined className="send" onClick={onSubmit} />
            </button>
          </div>
        </div>
      </form>
      <div
        style={{ marginTop: "20px" }}
        className={`shortcut-text ${theme === "dark" && "dark-mode"}`}
      >
        <Text style={{color:"#717171"}}>
          Press <span className="slash-icon">/</span> to access a list of task commands.</Text>
      </div>
    </div>
  );
};

export default ChatPromptInputForm;
