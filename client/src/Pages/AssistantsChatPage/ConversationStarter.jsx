import React from 'react'
import { IoArrowUpCircle } from "react-icons/io5";

const ConversationStarter = ({ states }) => {
    const {
        StarterQuestions,
        handleSelectStarter
    } = states
    return (
      <div className='assistantsConversationStarterWrapper'>
        <div className="conversation-starter-box">
          {StarterQuestions?.length > 0 &&
            StarterQuestions.map((question, index) => (
                <div
                key={index}
                className='conversation-starter'
                onClick={() => handleSelectStarter(question)}
              >
                <div className='conversation-contents'>
                  <p>
                    {question.length > 30
                      ? `${question.slice(0, 30)} ...`
                      : question}
                  </p>
                  <IoArrowUpCircle className='conversation-starter-icon' />
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

export default ConversationStarter

