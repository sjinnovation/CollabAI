import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "./Avatar";
import SvgComponent from "./SvgComponent";
import { FaRegEdit } from "react-icons/fa";

const NewChat = ({ setChatLog, setShowMenu }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => {
                navigate("/chat", { replace: true  });
            }}
            className={`thread mb-2 d-flex justify-content-between align-items-center`}
        >
            <div className="d-flex align-items-center gap-2">
                <Avatar bg="#11a27f" className="openaiSVG">
                    <SvgComponent w={41} h={41} />
                </Avatar>
                <p className="text-white font-bold">New Chat</p>
            </div>
            <FaRegEdit className="text-white" size={18} />
        </div>
    );
};

export default NewChat;
