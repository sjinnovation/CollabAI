import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SidebarContext } from "../../contexts/SidebarContext";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { MdOutlineEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { Dropdown, Modal } from "antd";
import ConfirmationModal from "./ConfirmationModal";
import { getPromptTitle } from "../../api/promptApiFunctions";
import { clearConversation, updatePrompt } from "../../api/threadApiFunctions";
import {
  deleteAssistantThread,
  updateThread,
} from "../../api/assistantApiFunctions";
import { AssistantContext } from "../../contexts/AssistantContext";
import { PageTitleContext } from "../../contexts/TitleContext";

const NavPrompt = ({
  chatPrompt,
  setShowMenu,
  threadId,
  threadIndex,
  assistantId,
  assistantThreadId,
  assistantName,
  thread_mongo_id,
}) => {
  const [editPrompt, setEditPrompt] = useState(false);
  const [activeEditPrompt, setActiveEditPrompt] = useState(false);
  const [deleteThread, setDeleteThread] = useState(false);
  const [activeDeleteThread, setActiveDeleteThread] = useState(0);
  const [promptTitle, setPromptTitle] = useState(chatPrompt);
  const [isPromptTitleLoading, setIsPromptTitleLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [isThreadDeleting, setIsThreadDeleting] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const { pageTitle, setPageTitle } = useContext(PageTitleContext);
  const { setDeletedAssistantThreadId } = useContext(AssistantContext);

  const textAreaRef = useRef(null);
  const navigate = useNavigate();

  // context values
  const { setRemoveThreadId } = useContext(SidebarContext);

  // get currently selected thread id
  const { thread_id: currentThreadId } = useParams();

  const onClick = (e) => {};

  const items = [
    {
      label: (
        <button
          onClick={() => setActiveEditPrompt(true)}
          className="dropdown-item"
        >
          <MdOutlineEdit />
          <span className="ms-1">Rename</span>
        </button>
      ),
      key: "1",
    },
    {
      label: (
        <button
          onClick={() => setConfirmationModalOpen(true)}
          className="dropdown-item text-error"
        >
          <MdDeleteOutline />
          <span className="ms-1 text-error">Delete</span>
        </button>
      ),
      key: "2",
      danger: true,
    },
  ];

  // -------------------------------- API Calls ----------------------------

  const handleEditPrompt = async () => {
    const editedValue = textAreaRef.current.value;
    console.log(editedValue);
    try {
      await updatePrompt(
        threadId,
        editedValue,
        setPromptTitle,
        setActiveEditPrompt
      );
    } catch (error) {
      console.error("Error saving prompt:", error);
    }
  };

  const handleClearConversation = async () => {
    try {
      await clearConversation(
        threadId,
        setRemoveThreadId,
        navigate,
        setShow,
        setIsThreadDeleting
      );
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  const handleUpdateThread = async () => {
    const editedValue = textAreaRef.current.value;
    console.log(editedValue);
    try {
      await updateThread(
        thread_mongo_id,
        editedValue,
        setPromptTitle,
        setActiveEditPrompt,
        setIsPromptTitleLoading
      );
    } catch (error) {
      console.error("Error updating thread:", error);
    }
  };

  const handleDeleteThread = async () => {
    try {
      await deleteAssistantThread(
        thread_mongo_id,
        setDeletedAssistantThreadId,
        setIsThreadDeleting
      );
      setShow(false);
      setConfirmationModalOpen(false);
    } catch (error) {
      console.error("Error deleting thread:", error);
    }
  };

  //----------------------- side effects -----------------------------

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside the form and textAreaRef
      if (
        activeEditPrompt &&
        textAreaRef.current &&
        !textAreaRef.current.contains(event.target)
      ) {
        // Submit the form
        if (assistantThreadId) {
          handleUpdateThread();
        } else {
          handleEditPrompt();
        }
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
  }, [activeEditPrompt, handleEditPrompt, handleUpdateThread]);

  // --------------------- local logics and functions ------------------

  const handleLinkClick = (e) => {
    e.stopPropagation();
    if ((assistantId, assistantThreadId)) {
      setPageTitle((prevState) => ({
        ...prevState,
        [`/agents/${assistantId}/${assistantThreadId}`]: assistantName 
      }))
      navigate(
        `/agents/${assistantId}/${assistantThreadId}`
      );
    } else {
      navigate(`/chat/${threadId}`);
    }
  };

  const isCurrentThreadActive = currentThreadId
    ? currentThreadId === threadId || currentThreadId === assistantThreadId
      ? true
      : false
    : false;

  const handleCancel = () => {
    setConfirmationModalOpen(false);
  };

  return (
    <div
      key={threadId}
      onClick={handleLinkClick}
      className={`display-block thread ${
        isCurrentThreadActive ? "active_thread" : ""
      }`}
    >
      {activeEditPrompt ? (
        <form
          className="w-100"
          onSubmit={(e) => {
            e.preventDefault();
            if (assistantThreadId) {
              handleUpdateThread();
            } else {
              handleEditPrompt();
            }
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
            <p class="display-block w-100 placeholder-glow">
              <span class="placeholder col-8 rounded"></span>
            </p>
          ) : (
            <>
              <p >{promptTitle || chatPrompt}</p>
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
          onConfirm={
            assistantThreadId ? handleDeleteThread : handleClearConversation
          }
          onCancel={handleCancel}
          content="Are you sure! you want to delete this thread?"
          loading={isThreadDeleting}
        />
      </>
    </div>
  );
};

export default NavPrompt;
