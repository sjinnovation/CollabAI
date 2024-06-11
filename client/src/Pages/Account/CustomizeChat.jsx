import { Button, Input, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { retrieveUserProfile } from "../../api/profile";
import { getUserID } from "../../Utility/service";
import { updateUserPreference } from "../../api/user";

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
    if (response.status == 200) {
      getDetails();
    }
  };

  useEffect(() => {
    getDetails();
  }, [userId]);

  return (
    <div className="d-flex flex-column">
      <div className="m-3">
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
      <div className="m-3">
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
      <div className="d-flex justify-content-end">
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
  );
};

export default CustomizeChat;
