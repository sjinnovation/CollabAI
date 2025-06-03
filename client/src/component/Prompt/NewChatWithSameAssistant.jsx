import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Avatar ,Button} from "antd";
import { botIconsMap } from "../../constants/chatPageConstants";
import { PageTitleContext } from "../../contexts/TitleContext";
import { Outlet, useLocation } from "react-router-dom";

const NewChatWithSameAssistant = ({ assistantName ,assistantId}) => {
    const navigate = useNavigate();
    const newChatIcon = botIconsMap.newChat.icon;
    const { pageTitle, setPageTitle } = useContext(PageTitleContext);
    const location = useLocation();

    return (
        <div
            onClick={() => {
                if (location.pathname.includes("/voice_agents/")) {
                    navigate(`/voice_agents/${assistantId}`);
                    window.location.reload();
                } else {
                    navigate(`/agents/${assistantId}`, { replace: true  });
                }
            }}
            style={{ padding: 0}}
            className={`thread d-flex justify-content-between align-items-center`}
        >
            <spam className="header-title">
                {assistantName} &ensp;
            </spam>
            <Button size="small" >New Chat<FaRegEdit className="" size={12} /></Button>
        </div>
    );
};

export default NewChatWithSameAssistant;
