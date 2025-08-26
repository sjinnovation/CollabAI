import { Button, Input, message, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { retrieveUserProfile } from "../../api/profile";
import { getUserID } from "../../Utility/service";
import { updateUserPreference } from "../../api/user";
import ProfileHeader from "../../component/Proflie/ProfileHeader";

const { TextArea } = Input;

const CustomizeChat = () => {
  const [data, setData] = useState({
    userPreferences: "",
    desiredAiResponse: "",
  });
  const [tempData, setTempData] = useState({
    userPreferences: "",
    desiredAiResponse: "",
  });
  const userId = getUserID();

  const getDetails = () => {
    retrieveUserProfile(userId).then((user) => {
      let temp = {
        userPreferences: user.userPreferences,
        desiredAiResponse: user.desiredAiResponse,
      };
      setData(temp);
      setTempData(temp);
    });
  };

  const updatePreference = async () => {
    let response = await updateUserPreference(userId, data);
    message.success("Your Preferences have been updated successfully")
    if (response.status == 200) {
      getDetails();
      window.dispatchEvent(new Event('userDataChanged'));
    }
  };

  useEffect(() => {
    getDetails();
  }, [userId]);

  return (
    <div className="d-flex flex-column customize-chat-container">
      <ProfileHeader title="Customize Chat" subHeading="Customize how AI understands and interacts with you. Set your preferences and desired response style for more personalized conversations." />
      <div className="d-flex justify-content-end">
        <div className="customize-chat-action">
        <Button
          className="m-1"
          onClick={() => setData(tempData)}
          disabled={JSON.stringify(data) == JSON.stringify(tempData)}
        >
          Cancel
        </Button>
        <Button
          className="m-1"
          onClick={updatePreference}
          disabled={JSON.stringify(data) == JSON.stringify(tempData)}
          type="primary"
        >
          Update
        </Button>
        </div>
      </div>
      <div className="mb-3 mt-3">
        <Typography.Title level={5}>
          What would you like AI to know about you to provide better responses?
        </Typography.Title>
        <TextArea
          value={data.userPreferences}
          onChange={(e) =>
            setData({ ...data, userPreferences: e.target.value })
          }
          rows={5}
          placeholder="Type Here..."
        />
      </div>
      <div className="mb-3">
        <Typography.Title level={5}>
          How would you like AI to respond?
        </Typography.Title>
        <TextArea
          value={data.desiredAiResponse}
          onChange={(e) =>
            setData({ ...data, desiredAiResponse: e.target.value })
          }
          rows={5}
          placeholder="Type Here..."
        />
      </div>
      
    </div>
  );
};

export default CustomizeChat;
