import React, { useContext } from "react";
import { Select, message, Typography } from "antd";
import SendIcon from "../Chat/SendIcon";
import {
  botOptions,
} from "../../constants/chatPageConstants";

// contexts
import { ThemeContext } from "../../contexts/themeConfig";
import UsefulPromptDropdown from "./UsefulPromptDropdown";

// constants
const { Text } = Typography;
const SHORTCUT_PROMPT_TEXT = "Press '/' to access a list of task commands.";
const SHORTCUT_PROMPT_ERROR = "Please enter a prompt before selecting a command!";

const ChatPromptInputForm = ({ states, actions, refs }) => {
  const {
    selectedTags,
    tags,
    loading = false,
    inputPrompt,
    showPromptDropdown
  } = states;
  const { promptInputRef } = refs;
  const {
    onSubmit,
    handleSelectTags,
    setSelectedTags,
    setSelectedChatModel,
    setInputPrompt,
    setShowPromptDropdown
  } = actions;

  const { theme } = useContext(ThemeContext);

  const tagOptions = tags?.map(tag => ({
    value: tag._id,
    label: tag.title,
  }));

  // ----------- Local Function ----------------//
  const handleChange = selectedValues => {
    setSelectedChatModel(selectedValues);
    const updatedSelectedTags = tags.filter(tag =>
      selectedValues.includes(tag._id)
    );
    setSelectedTags(updatedSelectedTags);
    handleSelectTags(updatedSelectedTags);
  };

  const handleKeyDown = (event) => {
		if (loading) return;

		if (event.key === "/") {
      // Set useful prompt dropdown to true when "/" is pressed
      setShowPromptDropdown(true);
    }

    if(event.key !== '/' && showPromptDropdown) {
      setShowPromptDropdown(false);
    }

		if (event.key === 'Enter' && event.shiftKey) {
			setInputPrompt((prevValue) => prevValue);
		} else if (event.key === 'Enter') {
			event.preventDefault();
			event.target.style.height = '51px';
			onSubmit(event);
		}
	};

  const onInputPromptChange = (event) => {
		setInputPrompt(event.target.value);
	};

  const handleUsefulPromptSelection = (selectedPrompt) => {
    // Note: we only need to remove last occurrence of "/".
    const lastSlashRemoved = inputPrompt.replace(/\/([^\/]*)$/, '$1');
  
    if (!lastSlashRemoved.trim()) {
      return message.warning(SHORTCUT_PROMPT_ERROR);
    }
    
    // check if user has selected any shortcut prompt
    if (selectedPrompt && selectedPrompt?.label) {
      let userInputtedPrompt = `${lastSlashRemoved}`;
      setInputPrompt(userInputtedPrompt);
      setShowPromptDropdown(false);
      onSubmit(null, userInputtedPrompt);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className="inputPrompttTextarea-container">
        <UsefulPromptDropdown
          isVisible={showPromptDropdown}
          onSelection={handleUsefulPromptSelection}
        >
          <textarea
            ref={promptInputRef}
            autoComplete="off"
            placeholder="Ask me anything ..."
            name="inputPrompt"
            id=""
            className={`inputPrompttTextarea ${
              theme === "dark" && "dark-mode"
            }`}
            type="text"
            rows="2"
            // disabled={loading}
            value={inputPrompt}
            onKeyDown={handleKeyDown}
            onChange={onInputPromptChange}
          />
        </UsefulPromptDropdown>
        <button
          disabled={loading}
          aria-label="form submit"
          id="input-button"
          className="CustomNewButton"
          type="submit"
        >
          <SendIcon />
        </button>

        <div
          style={{
            position: "relative",
            bottom: "37px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Select
            style={{
              width: "200px",
            }}
            placeholder="Choose Bot"
            onChange={handleChange}
            options={botOptions}
            defaultValue={botOptions[0].value}
            className="no-focus"
          />

          <Select
            style={{
              width: "auto",
              minWidth: "200px",
            }}
            placeholder="Choose tags"
            showSearch
            value={selectedTags.map((tag) => tag._id)}
            onChange={handleChange}
            options={tagOptions}
            notFoundContent={loading ? "Loading..." : null}
          />

           <Text style={{ fontSize: '14px' }} className="ms-auto" type="secondary" >{SHORTCUT_PROMPT_TEXT}</Text>
        </div>
      </div>
    </form>
  );
};

export default ChatPromptInputForm;
