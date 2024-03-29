import React from 'react'
import { useState } from 'react';
import { IoArrowUpCircle } from "react-icons/io5";
import { getSingleAssistant } from '../../api/assistant-chat-page-api';
import { useEffect } from 'react';

const ConversationStarter = ({ states }) => {
    const {
       assistant_id,
       StarterQuestions,
       handleSelectStarter
    } = states
    const [starterQuestions, setStarterQuestions]= useState([])

    const fetchAssistantStarterQuestions = async()=>{
      const response = await getSingleAssistant(assistant_id)
      setStarterQuestions(response?.assistant?.static_questions)
  }

  useEffect(()=>{
    fetchAssistantStarterQuestions()
  },[assistant_id]);


    return (
      <div className='assistantsConversationStarterWrapper'>
        <div className="conversation-starter-box">
          {starterQuestions?.length > 0 &&
            starterQuestions.map((question, index) => (
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

