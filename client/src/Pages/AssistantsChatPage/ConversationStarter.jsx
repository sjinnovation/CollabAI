import React from "react";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { getSingleAssistant } from "../../api/assistantChatPageApi";
import { useEffect } from "react";
import { getAssistantInfo } from "../../Utility/assistant-helper";
import { Alert, Tooltip } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { AiFillMessage } from "react-icons/ai";
import { MdOutlineModeEditOutline } from "react-icons/md";
const ConversationStarter = ({ states }) => {
  const { assistant_id, StarterQuestions, handleSelectStarter } = states;
  const [starterQuestions, setStarterQuestions] = useState([]);
  const [isAssistantExistInOpenAI, setIsAssistantExistInOpenAI] =
    useState(false);

  const fetchAssistantStarterQuestions = async () => {
    const response = await getSingleAssistant(assistant_id);
    setStarterQuestions(response?.assistant?.static_questions);
  };

  useEffect(() => {
    fetchAssistantStarterQuestions();
    if (getAssistantInfo(assistant_id)) {
      setIsAssistantExistInOpenAI(true);
    } else {
      setIsAssistantExistInOpenAI(false);
    }
  }, [assistant_id]);

  return (
    <div className="assistantsConversationStarterWrapper">
      <div className="conversation-starter-box">
        <div className="conversation-starters">
          {starterQuestions?.length > 0 &&
            starterQuestions.slice(-4).map((question, index) => (
              <div
                key={index}
                className="conversation-starter"
                onClick={() => handleSelectStarter(question)}
              >
                <div className="conversation-contents">
                  <div
                    style={{ padding: "2px" }}
                    className="conversation-first"
                  >
                    <AiFillMessage />
                    <b>
                      {question.length > 45
                        ? `${question.slice(0, 45)} ...`
                        : question}
                    </b>
                  </div>
                  <div className="conversation-second">
                    <Tooltip
                      title="Edit this message"
                      mouseEnterDelay={0.2} 
                      mouseLeaveDelay={0.1} 
                    >
                      <MdOutlineModeEditOutline className="conversation-starter-icon" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationStarter;