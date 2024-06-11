import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Avatar } from "antd";
import { botIconsMap } from "../../constants/chatPageConstants";

const NewChat = ({ setChatLog, setShowMenu }) => {
    const navigate = useNavigate();
    const newChatIcon = botIconsMap.newChat.icon;

    return (
        <div
            onClick={() => {
                navigate("/chat", { replace: true  });
            }}
            className={`thread mb-2 d-flex justify-content-between align-items-center`}
        >
            <div className="d-flex align-items-center gap-2">
                <Avatar style={{ width: 41, height: 41 }} src={newChatIcon} /> 
                <p className="fw-bold">New Chat</p>
            </div>
            <FaRegEdit className="" size={18} />
        </div>
    );
};

export default NewChat;
