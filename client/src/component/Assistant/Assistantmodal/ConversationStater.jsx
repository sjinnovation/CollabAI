import React, { useState, useEffect } from "react";
import "./ConvoStarter.css";

//libraries
import {
   Input, 
  Button,
   List, 
   Space 
  } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { FaTimes } from "react-icons/fa";


const QuestionList = ({ questions, onRemove }) => (
  <>
    {questions.length > 0 ? (
      <List
        dataSource={questions}
        renderItem={(item, index) => (
          <List.Item className="listItem border border-secondary">
            <Space className="spaceContainer">
              <span className="spanContainer">{item}</span>
              <div className="crossButtonContainer">
                <Button
                  onClick={() => onRemove(index)}
                  icon={<FaTimes />}
                  size="small"
                  danger
                >
                </Button>
              </div>
            </Space>
          </List.Item>
        )}
      />
    ) : null}
  </>
);

const ConversationStater = ({
  staticQuestions,
  onAddQuestion,
  setAssistantData,
}) => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  useEffect(() => {
    if (staticQuestions && staticQuestions.length > 0) {
      setQuestions(staticQuestions);
    } else {
      setQuestions([]);
    }
    setCurrentQuestion("");
  }, [staticQuestions]);
  

  const handleAddQuestionToParent = () => {
    if (currentQuestion.trim() !== "") {
      onAddQuestion(currentQuestion);
      setQuestions((prevQuestions) => [...prevQuestions, currentQuestion]);
      setCurrentQuestion("");
    }
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prevQuestions) =>
      prevQuestions.filter((_, i) => i !== index)
    );
    setAssistantData((prevData) => ({
      ...prevData,
      static_questions: prevData.static_questions.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="question-container">
      <div className="question-input-button">
        <Input.TextArea
          className="textarea-container"
          autoSize={{ minRows: 2, maxRows: 3 }}
          size="medium"
          value={currentQuestion}
          onChange={(e) => setCurrentQuestion(e.target.value)}
          placeholder="Type your question"
          allowClear
        />
        <Button
          onClick={handleAddQuestionToParent}
          icon={ <PlusOutlined/>}
          // size="large"
        >
         
        </Button>
      </div>

      <QuestionList questions={questions} onRemove={handleRemoveQuestion} />
    </div>
  );
};

export default ConversationStater;
