import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Avatar ,Button} from "antd";
import { botIconsMap } from "../../constants/chatPageConstants";

const NewChatWithSameAssistant = ({ assistantName ,assistantId}) => {
    const navigate = useNavigate();
    const newChatIcon = botIconsMap.newChat.icon;

    return (
        <div
            onClick={() => {
                navigate(`/assistants/${assistantId}`, { replace: true  });
            }}
            className={`thread mb-2 d-flex justify-content-between align-items-center`}
        >
            {assistantName} &ensp;
            <Button>New Chat &ensp; <FaRegEdit className="" size={18} /></Button>
        </div>
    );
};

export default NewChatWithSameAssistant;
