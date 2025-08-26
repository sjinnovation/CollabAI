import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit } from "react-icons/fa";
import { Avatar ,Button} from "antd";
import { botIconsMap } from "../../constants/chatPageConstants";
import { PageTitleContext } from "../../contexts/TitleContext";
import './NewChatWithSameAssistantResponsive.css';

const NewChatWithSameAssistant = ({ assistantName ,assistantId}) => {
    const navigate = useNavigate();
    const newChatIcon = botIconsMap.newChat.icon;
    const { pageTitle, setPageTitle } = useContext(PageTitleContext);
    return (
        <div>
            <div
                onClick={() => {
                    navigate(`/agents/${assistantId}`, { replace: true });
                }}
                style={{ padding: 0 }}
                className={`thread d-flex justify-content-between align-items-center responsive-assistant-container`}
            >

                <span className="header-title">
                    {assistantName} &ensp;
                </span>
                <Button size="small" className="responsive-assistant-button">New Chat<FaRegEdit className="" size={12} /></Button>

            </div>

        </div>

    );
};

export default NewChatWithSameAssistant;
