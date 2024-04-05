import React from 'react';

// libraries
import { MdEditNote } from 'react-icons/md';
// components
import UserIcon from './UserIcon';
import BotIcon from './BotIcon';
import Loading from '../common/Loading';
import Error from '../common/Error';
import BotResponse from './BotResponse';

const MessageContainer = ({ states }) => {
  const { chat, idx, loading, error } = states;
  
  return (
    <div className="chatLog" key={chat.msg_id || idx}>
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
                  chat?.tags?.map((tag, tagIdx) => <p key={tagIdx} className="tag">{tag.title}</p>)}
              </div>
              <BotResponse response={chat.botMessage} />
              <div className="model-token-container">
                {
                  chat.modelUsed ? <p>Model : {chat?.modelUsed}</p> : null
                }
                {
                  chat.tokenUsed ? <p>Token : {chat?.tokenUsed}</p> : null
                }
              </div>
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
