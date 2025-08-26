import { Card, Checkbox, Button, Progress, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { retrieveUserProfile } from "../../api/profile";
import { getUserID } from "../../Utility/service";
import { BellFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./welcomeCard.css";

const USER_DATA_CHANGED_EVENT = "userDataChanged";

const WelcomeCard = () => {
  // show card will hide and show depends on the user filed
  const [showCard, setShowCard] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [showButton, setShowButton] = useState(false);
  const navigate = useNavigate();
  const userId = getUserID();
  

  const fetchLatestUserData = useCallback(() => {
    return retrieveUserProfile(userId).then((user) => {
      setUserInfo(user);
      updateChecklist(user);
      return user;
    });
  }, [userId]);

  useEffect(() => {
    fetchLatestUserData();
  
    const handleUserDataChange = () => {
      fetchLatestUserData();
    };
  
    window.addEventListener(USER_DATA_CHANGED_EVENT, handleUserDataChange);
  
    return () => {
      window.removeEventListener(USER_DATA_CHANGED_EVENT, handleUserDataChange);
    };
  }, [fetchLatestUserData]);

  const initialChecklist = [
    {
      id: 1,
      text: "Update Your Information",
      completed: false,
      path: "/profile",
      keyPath: "1",
    },
    {
      id: 2,
      text: "Update Customize Chat",
      completed: false,
      path: "/profile",
      keyPath: "4",
    },
  ];

  const [checklist, setChecklist] = useState(initialChecklist);

  const updateChecklist = (user = {}) => {
    // Assign a default name if fname is undefined
    if (!user) {
      return null;
  }
    const profileFieldsToCheck = ['fname', 'lname', 'email', 'designation', 'responsibility', 'companyInformation'];
    const chatFieldsToCheck = ['desiredAiResponse', 'userPreferences'];
  
    const calculatePercentage = (filledFields, totalFields) => {
      const rawPercentage = (filledFields / totalFields) * 100;
      return Math.ceil(rawPercentage / 10) * 10;
    };
  
    const profileFilledFields = profileFieldsToCheck.filter(field => Boolean(user[field])).length;
    const profileCompletionPercentage = calculatePercentage(profileFilledFields, profileFieldsToCheck.length);
  
    const chatFilledFields = chatFieldsToCheck.filter(field => Boolean(user[field])).length;
    const chatCompletionPercentage = calculatePercentage(chatFilledFields, chatFieldsToCheck.length);

    const updatedChecklist = initialChecklist.map((item) => {
      if (item.text === "Update Your Information") {
        return {
          ...item,
          completed: profileCompletionPercentage,
        };
      } else if (item.text === "Update Customize Chat") {
        return {
          ...item,
          completed: chatCompletionPercentage,
        };
      } else {
        return item;
      }
    });
    setChecklist(updatedChecklist);
 
  };

  const handleSkip = () => {
    setAnimateOut(true);

    setTimeout(() => {
      setShowCard(false);
    }, 500);
  };

  const handleShowCard = () => {
    setShowCard(true);

    setTimeout(() => {
      setAnimateIn(true);
    }, 10);
  };

  const handleNavigate = (path, key) => {
    navigate(path, { state: { activeTabKey: key } });
  };


  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);

    return () => clearTimeout(timer); 
  }, []);

  const completedCount = checklist.reduce((sum, item) => sum + item.completed, 0);
  const completionRate = Math.round(completedCount / checklist.length);
  const allCompleted = checklist.every(item => item.completed === 100);

  return (
    <div className="background-color-card">
      {showCard ? (
        <Card
          className={`card-container ${animateOut ? "slide-out" : ""} ${
            animateIn ? "slide-in" : ""
          }`}
          title={
            <div className="card-title">
              <h5>Welcome to CollabAI</h5>
              <span style={{ fontSize: "12px", marginBottom: "5px" }}>
                Complete the following steps to update your information
              </span>
            </div>
          }
          bordered={true}
        >
          <Progress percent={completionRate} className="progress-bar" />
          {allCompleted ? (
            <>
              <p>Thank You For Updating All Your Information!</p>
              <Button type="primary" onClick={handleSkip}>
                Done
              </Button>
            </>
          ) : (
            <>
              {checklist.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <Checkbox
                    checked={item.completed === 100}
                    style={{
                      textDecoration:
                        item.completed === 100 ? "line-through" : "none",
                      color: item.completed === 100 ? "#888" : "inherit",
                      opacity: item.completed === 100 ? 0.7 : 1,
                    }}
                  >
                    {item.text}
                  </Checkbox>

                  {item.completed < 100 && (
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => handleNavigate(item.path, item.keyPath)}
                    >
                      Update
                    </Button>
                  )}
                </div>
              ))}
              <Button type="primary" onClick={handleSkip} className={"mt-2"}>
                Skip
              </Button>
            </>
          )}
        </Card>
      ) : (
       !allCompleted && showButton && (
          <Button type={"primary"} onClick={handleShowCard}>
            Update Information
            <BellFilled style={{ color: "white", marginLeft: "8px" }} />
          </Button>
        )
      )}
    </div>
  );
};

export default WelcomeCard;
