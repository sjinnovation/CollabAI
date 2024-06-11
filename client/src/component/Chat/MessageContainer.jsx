import React, { useState } from 'react';

// libraries
import { MdEditNote } from 'react-icons/md';
import { Avatar, Form, Input, Button } from 'antd';
import { AiOutlineEdit } from "react-icons/ai";

// components
import Loading from '../common/Loading';
import Error from '../common/Error';
import BotResponse from './BotResponse';
import { botIconsMap } from '../../constants/chatPageConstants';
import CodeInterPreterOutput from './CodeInterPreterOutput';
import UserPrompt from './UserPrompt';

const MessageContainer = ({ states }) => {
  const { chat, idx, loading, error} = states;

  const botProviderIcon = chat?.botProvider ? botIconsMap[chat.botProvider]?.icon : botIconsMap?.openai?.icon;
  const userIcon = botIconsMap.user.icon;

  const isBotMessageReceived = chat?.botMessage || false;
  const isCodeInterpreterOutputReceived = chat?.codeInterpreterOutput || false;


  const isPropsExistForEdit = states.hasOwnProperty('editProps') || false;
  
  
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
          <Avatar src={userIcon} className='userIcon' />
         

          <UserPrompt 
           states={{
            chat,
            ...(isPropsExistForEdit && { editProps: states.editProps })
          }} 
          />
       </div>
      </div>

      {/* ----- BOT RESPONSE ----- */}
      <div className="botMessageMainContainer">
        <div
          className="botMessageWrapper mb-3"
          style={{
            maxWidth: "48rem",
          }}
        >
          <div>
            <Avatar src={botProviderIcon} />
          </div>
          {isBotMessageReceived || isCodeInterpreterOutputReceived ? (
            <>
              <div id="botMessage">
                <div className="tagSection">
                  {chat?.tags?.length > 0 &&
                    chat?.tags?.map((tag, tagIdx) => (
                      <p key={tagIdx} className="tag">
                        {tag.title}
                      </p>
                    ))}
                </div>

                {isCodeInterpreterOutputReceived ? (
                  <CodeInterPreterOutput output={chat.codeInterpreterOutput} />
                ) : null}
                {isBotMessageReceived ? (
                  <BotResponse
                    chatPrompt={chat?.chatPrompt}
                    response={chat.botMessage}
                  />
                ) : null}
                <div className="model-token-container">
                  {chat.modelUsed ? <p>Model : {chat?.modelUsed}</p> : null}
                  {chat.tokenUsed ? <p>Token : {chat?.tokenUsed}</p> : null}
                </div>
              </div>
            </>
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
