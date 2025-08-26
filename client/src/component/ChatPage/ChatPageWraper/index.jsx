import React from "react";
const ChatBoxWrapper = ({ children }) => {
  return (
    <div className="parent-container">
      <div className="form-style">
        <div className="inputPromptTextarea-container"> {children}</div>
      </div>
    </div>
  );
};

export default ChatBoxWrapper;
