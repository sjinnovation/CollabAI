import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Avatar from "../../Prompt/Avatar";
import SvgComponent from "../../Prompt/SvgComponent";
import { FaRegEdit } from "react-icons/fa";

const AssistantNewChat = ({ setChatLog, setShowMenu }) => {
    const navigate = useNavigate();
    const { assistant_name, assistant_id } = useParams();

    return (
        <div
            onClick={() => {
                navigate(`/assistants/${assistant_name}/${assistant_id}`)}}
            className={`thread mb-2 d-flex justify-content-between align-items-center overflow-hidden`}
        >
            <div className="d-flex align-items-center gap-2 overflow-hidden me-1">
                <Avatar bg="#11a27f" className="openaiSVG">
                    <SvgComponent w={41} h={41} />
                </Avatar>
                <small className="text-white font-bold text-truncate">{assistant_name.split('-').join(' ')}</small>
            </div>
            <FaRegEdit className="text-white"  size={18} />
        </div>
    );
};

export default AssistantNewChat;
