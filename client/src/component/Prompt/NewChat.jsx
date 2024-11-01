import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { Button, ConfigProvider, Flex } from "antd";

const NewChat = ({ setChatLog, setShowMenu }) => {
  const navigate = useNavigate();

  return (
    <div className={`new-chat-btn`}>
      <ConfigProvider
        theme={{
          token: {
            // Seed Token
            colorPrimary: "#2952BF",

            borderRadius: 6,
            algorithm: true,
          },
        }}
      >
        <Button
          size="medium"
          onClick={() => {
            navigate("/chat", { replace: true });
          }}
          type="primary"
          block
          icon={<FaPlus />}
          style={{ backgroundColor: "#2952BF", borderColor: "#2952BF" }}
        >
          New Chat
        </Button>
      </ConfigProvider>
    </div>
  );
};

export default NewChat;
