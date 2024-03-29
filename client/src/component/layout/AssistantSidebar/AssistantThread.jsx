import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { SidebarContext } from "../../../contexts/SidebarContext";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdOutlineEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { Dropdown } from "antd";
import { AssistantContext } from "../../../contexts/AssistantContext";
import ConfirmationModal from "./ConfirmationModal";
import { deleteAssistantThread, updateThread } from "../../../api/assistantApiFunctions";



const AssistantThread = ({
    assistant_id,
    thread_id,
    title,
    thread_mongo_id,
}) => {
    const {
        assistant_name,
        assistant_id: currentAssistantId,
        thread_id: currentThreadId,
    } = useParams();

    const [activeEditPrompt, setActiveEditPrompt] = useState(false);
    const [promptTitle, setPromptTitle] = useState("");
    const [isPromptTitleLoading, setIsPromptTitleLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [isThreadDeleting, setIsThreadDeleting] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);

  

    const threadInputRef = useRef(null);
    const navigate = useNavigate();

    // context values
    const { setDeletedAssistantThreadId } = useContext(AssistantContext);

    // ----------- API Call ----------

    const handleUpdateThread = async () => {
        const editedValue = threadInputRef.current.value;
        console.log(editedValue);
        try {
          await updateThread(thread_mongo_id, editedValue, setPromptTitle, setActiveEditPrompt, setIsPromptTitleLoading);
        } catch (error) {
          console.error("Error updating thread:", error);
        }
      };
    

    const handleDeleteThread = async () => {
        try {
          await deleteAssistantThread(thread_mongo_id, setDeletedAssistantThreadId, setIsThreadDeleting);
        } catch (error) {
          console.error("Error deleting thread:", error);
        }
      };


    const handleLinkClick = (e) => {
        e.stopPropagation();
        navigate(
            `/assistants/${assistant_name}/${currentAssistantId}/${thread_id}`
        );
        
    };

    const onClick = (e) => { };

    // side effects
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the form and threadInputRef
            if (
                activeEditPrompt &&
                threadInputRef.current &&
                !threadInputRef.current.contains(event.target)
            ) {
                // Submit the form
                handleUpdateThread();
            }
        };

        // Add the event listener only when activeEditPrompt is true
        if (activeEditPrompt) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Remove the event listener when the component unmounts or changes are saved
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeEditPrompt]);

    const items = [
        {
            label: (
                <button
                    onClick={() => setActiveEditPrompt(true)}
                    className="dropdown-item thread_drop_button"
                >
                    <MdOutlineEdit color="white"/>
                    <span className="ms-1" style={{ color: "white" }}>Rename</span>
                </button>
            ),
            key: "1",
        },
        {
            label: (
                <button
                    onClick={() => setConfirmationModalOpen(true)}
                    className="dropdown-item thread_drop_button text-error"
                >
                    <MdDeleteOutline color="white"/>
                    <span className="ms-1 text-error" style={{ color: "white" }}>Delete</span>
                </button>
            ),
            key: "2",
            danger: true,
        },
    ];

    // local logics
    const isCurrentThreadActive = currentThreadId === thread_id ? true : false;

    const handleCancel = () => {
        setConfirmationModalOpen(false);
    };

    return (
        <div
            key={thread_id}
            onClick={handleLinkClick}
            className={`display-block thread ${isCurrentThreadActive ? "active_thread" : ""
                }`}
        >
            {activeEditPrompt ? (
                <>
                    {!isPromptTitleLoading ? (
                        <form
                            className="w-100"
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleUpdateThread();
                            }}
                        >
                            <input
                                defaultValue={promptTitle || title}
                                ref={threadInputRef}
                                style={{ width: "100%" }}
                                className="editPromptTextArea"
                            />
                        </form>
                    ) : (
                        <p class="display-block w-100 placeholder-glow  text-light">
                            <span class="placeholder col-8 rounded"></span>
                        </p>
                    )}
                </>
            ) : (
                <>
                    <p>{promptTitle || title}</p>

                    {isCurrentThreadActive ? (
                        <Dropdown
                            menu={{
                                items,
                                onClick,
                            }}
                        >
                            <button
                                className="thread_icon_button"
                                onClick={(e) => e.preventDefault()}
                            >
                                <HiOutlineDotsHorizontal size={18} />
                            </button>
                        </Dropdown>
                    ) : null}
                </>
            )}

            <>
                <ConfirmationModal
                    loading={isThreadDeleting}
                    open={confirmationModalOpen}
                    onConfirm={handleDeleteThread}
                    onCancel={handleCancel}
                    content="Are you sure! you want to delete this thread?"
                />
              
            </>
        </div>
    );
};

export default AssistantThread;
