import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarContext } from "../../contexts/SidebarContext";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdOutlineEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { Dropdown, Modal, } from 'antd';
import ConfirmationModal from "./ConfirmationModal";
import { getPromptTitle } from "../../api/promptApiFunctions";
import { clearConversation, updatePrompt } from "../../api/threadApiFunctions";



const NavPrompt = ({ chatPrompt, setShowMenu, threadId, threadIndex }) => {
    const [editPrompt, setEditPrompt] = useState(false);
    const [activeEditPrompt, setActiveEditPrompt] = useState(false);
    const [deleteThread, setDeleteThread] = useState(false);
    const [activeDeleteThread, setActiveDeleteThread] = useState(0);
    const [promptTitle, setPromptTitle] = useState("");
    const [isPromptTitleLoading, setIsPromptTitleLoading] = useState(false);
    const [show, setShow] = useState(false);
    const [isThreadDeleting, setIsThreadDeleting] = useState(false);
    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    

    const textAreaRef = useRef(null);
    const navigate = useNavigate();

    // context values
    const { setRemoveThreadId } = useContext(SidebarContext);

    // get currently selected thread id
    const { thread_id: currentThreadId } = useParams();

    const onClick = (e) => { };

    const items = [
        {
            label: (
                <button
                    onClick={() => setActiveEditPrompt(true)}
                    className="dropdown-item"
                >
                    <MdOutlineEdit color="white" />
                    <span className="ms-1" style={{ color: "white" }}>Rename</span>
                </button>
            ),
            key: "1",
        },
        {
            label: (
                <button
                    onClick={()=> setConfirmationModalOpen(true)}
                    className="dropdown-item text-error"
                >
                    <MdDeleteOutline color="white" />
                    <span className="ms-1 text-error" style={{ color: "white" }}>Delete</span>
                </button>
            ),
            key: "2",
            danger: true,
        },
    ];


     

    // -------------------------------- API Calls ----------------------------

    const handleFetchPromptTitle = async () => {
        const { success, data, error } = await getPromptTitle(threadId, setIsPromptTitleLoading);

        if(success) {
            setPromptTitle(data);
        } else {
            console.log(error);
        }
    };


   const handleEditPrompt = async () => {
        const editedValue = textAreaRef.current.value;
        console.log(editedValue);
        try {
          await updatePrompt(threadId, editedValue, setPromptTitle, setActiveEditPrompt);
        } catch (error) {
         console.error("Error saving prompt:", error);
        }
      };


    const handleClearConversation = async () => {
        try {
          await clearConversation(threadId, setRemoveThreadId, navigate, setShow, setIsThreadDeleting);
        } catch (error) {
          console.error("Error clearing conversation:", error);
        }
      };


    //----------------------- side effects -----------------------------
    useEffect(() => {
        handleFetchPromptTitle();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is outside the form and textAreaRef
            if (
                activeEditPrompt &&
                textAreaRef.current &&
                !textAreaRef.current.contains(event.target)
            ) {
                // Submit the form
                handleEditPrompt();
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
    }, [activeEditPrompt, handleEditPrompt]);
   

    // --------------------- local logics and functions ------------------

    const handleLinkClick = (e) => {
        e.stopPropagation();
        navigate(`/chat/${threadId}`);
        
    };

    const isCurrentThreadActive = currentThreadId === threadId ? true : false;

    const handleCancel = () => {
        setConfirmationModalOpen(false);
      };

    return (
        <div
            key={threadId}
            onClick={handleLinkClick}
            className={`display-block thread ${isCurrentThreadActive ? "active_thread" : ""
                }`}
        >
            {activeEditPrompt ? (
                <form
                    className="w-100"
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleEditPrompt();
                    }}
                >
                    <input
                        defaultValue={promptTitle || chatPrompt}
                        ref={textAreaRef}
                        style={{ width: "100%" }}
                        className="editPromptTextArea"
                    />
                </form>
            ) : (
                <>
                    {isPromptTitleLoading ? (
                        <p class="display-block w-100 placeholder-glow  text-light">
                            <span class="placeholder col-8 rounded"></span>
                        </p>
                    ) : (
                        <>
                            <p>{promptTitle || chatPrompt}</p>
                        </>
                    )}

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
                    open={confirmationModalOpen}
                    onConfirm={handleClearConversation}
                    onCancel={handleCancel}
                    content="Are you sure! you want to delete this thread?"
                    loading={isThreadDeleting}
                />
            </>
        </div>
    );
};

export default NavPrompt;
