import React from "react";

// libraries
import { MdEditNote } from "react-icons/md";
// components
import UserIcon from "./UserIcon";
import BotIcon from "./BotIcon";
import Loading from "../common/Loading";
import Error from "../common/Error";
import BotResponse from "./BotResponse";

const MessageContainer = ({ states }) => {
  const { chat, idx, loading, error} = states;

  return (
    <div className="chatLog" key={idx}>
      {/* ----- USER PROMPT ----- */}
      <div className="chatPromptMainContainer">
        <div
          className="chatPromptWrapper"
          style={{
            maxWidth: "48rem",
          }}
        >
          <UserIcon />
         
            <div id="chatPrompt" className="text-wrap">
              <pre>{chat.chatPrompt}</pre>
            </div>
       
        
        </div>
        
      </div>

      {/* ----- BOT RESPONSE ----- */}
      <div className="botMessageMainContainer">
        <div
          className="botMessageWrapper"
          style={{
            maxWidth: "48rem",
          }}
        >
          <BotIcon />
          {chat.botMessage ? (
            <div id="botMessage">
              <div className="tagSection">
                {chat?.tags?.length > 0 &&
                  chat?.tags?.map((tag) => <p className="tag">{tag.title}</p>)}
              </div>
              <BotResponse response={chat.botMessage} />
            </div>
          ) : loading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : null} 
        </div>
      </div>
    </div>
  );
};

export default MessageContainer;
