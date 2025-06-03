import React from "react";

const AssistantChatLoading = () => {
    return (
        <div style={{ minHeight: '100px' }} className="d-flex justify-content-center">
            <div className="spinner-grow text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );
};

export default AssistantChatLoading;
