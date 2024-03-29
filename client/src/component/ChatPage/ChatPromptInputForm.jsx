import React from "react";

// libraries
import { FaRegWindowClose , FaRegStopCircle } from "react-icons/fa";
import { BsFillPlusSquareFill } from "react-icons/bs";

// components
import SendIcon from "../Chat/SendIcon";

const ChatPromptInputForm = ({ states, actions, refs }) => {
  const { selectedTags, tags, loading, inputPrompt } =
    states;
  const { promptInputRef } = refs;
  const {
    onSubmit,
    handleRemoveTag,
    onSelectingTag,
    handleKeyDown,
    onInputPromptChange,
    handleStopGeneratingButton,
  } = actions;

  return (
    <form onSubmit={onSubmit}>
      <div className="inputPrompttTextarea-container">
        {/* ----- SELECTED TAGS LIST ----- */}
        <div className="selectedTagContainer">
          {selectedTags.length > 0 &&
            selectedTags.map((tag) => (
              <div key={tag._id}>
                <button type="button" class="btn btn-secondary btn-sm">
                  {tag.title}
                  <FaRegWindowClose
                    style={{
                      marginLeft: "5px",
                    }}
                    onClick={() => handleRemoveTag(tag)}
                  />
                </button>
              </div>
            ))}
        </div>
        {/* ----- TAGS DROPDOWN ----- */}
        <div class="dropup-center dropstart" style={{ marginLeft: "10px" }}>
          <ul class="dropdown-menu">
            {tags?.map((tag) => (
              <li key={tag._id}>
                <a
                  style={{
                    cursor: "pointer",
                  }}
                  class="dropdown-item"
                  onClick={() => onSelectingTag(tag)}
                >
                  {tag.title ?? ''}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* ----- TAGS DROPDOWN TRIGGER BUTTON ----- */}
        <button
          style={{
            position: "absolute",
            bottom: ".5rem",
            left: ".5rem",
          }}
          class="btn btn-secondary plus-btn"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <BsFillPlusSquareFill />
        </button>

        {/* ----- CHAT PROMPT INPUT ----- */}
        <textarea
          ref={promptInputRef}
          autoComplete="off"
          placeholder="Ask me anything ..."
          name="inputPrompt"
          id=""
          className="inputPrompttTextarea"
          type="text"
          rows="2"
          value={inputPrompt}
          onKeyDown={handleKeyDown}
          onChange={onInputPromptChange}
        />

        {/* ----- PROMPT SUBMIT BUTTON HERE ----- */}
        <button
          aria-label="form submit"
          id="input-button"
          className="CustomNewButton"
          type="submit"
        > 
          <SendIcon />
          {/* {loading ? (
            <button onClick={() => handleStopGeneratingButton()}>
              <FaRegStopCircle />
            </button>
          ) : (
            <SendIcon />
          )} */}
        </button>
        
      </div>
    </form>
  );
};

export default ChatPromptInputForm;
