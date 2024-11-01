import { Card, Checkbox, Button, Progress, Tooltip } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { retrieveUserProfile } from "../../api/profile";
import { getUserID } from "../../Utility/service";
import { BellFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import "./welcomeCard.css";

const USER_DATA_CHANGED_EVENT = 'userDataChanged';


const WelcomeCard = () => {
  // show card will hide and show depends on the user filed
  const [showCard, setShowCard] = useState(false);
  const [animateOut, setAnimateOut] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const navigate = useNavigate();
  const userId = getUserID();

  useEffect(() => {
    const getUserInfo = () => {
      retrieveUserProfile(userId).then((user) => {
        setUserInfo(user);
        updateChecklist(user);
      });
    };
  
    getUserInfo(); // Initial call to get user info
  
    const handleUserDataChange = () => {
      getUserInfo();
    };
  
    window.addEventListener(USER_DATA_CHANGED_EVENT, handleUserDataChange);
  
    return () => {
      window.removeEventListener(USER_DATA_CHANGED_EVENT, handleUserDataChange);
    };
  }, [userId]);


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

  const updateChecklist = (user) => {
    const updatedChecklist = initialChecklist.map((item) => {
      if (item.text === "Update Your Information") {
        return {
          ...item,
          completed: Boolean(user.fname && user.lname && user.email),
        };
      } else if (item.text === "Update Customize Chat") {
        return {
          ...item,
          completed: Boolean(user.desiredAiResponse && user.userPreferences),
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

  const completedCount = checklist.filter((item) => item.completed).length;
  const completionRate = Math.round((completedCount / checklist.length) * 100);
  const allCompleted = checklist.every((item) => item.completed);

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
              <span style={{ fontSize: '12px', marginBottom: '5px'}}>
                Complete the following steps to update your information
              </span>
            </div>
          }
          bordered={true}
        >
          <Progress percent={completionRate} className="progress-bar"/>
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
                    checked={item.completed}
                    style={{
                      textDecoration: item.completed ? "line-through" : "none",
                      color: item.completed ? "#888" : "inherit",
                      opacity: item.completed ? 0.7 : 1,
                    }}
                  >
                    {item.text}
                  </Checkbox>

                  {!item.completed && (
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
        !allCompleted && (
         
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
