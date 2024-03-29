import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";

// libraries
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowDown } from "react-icons/fa";

// components
import ChatSkeleton from "../../component/Chat/ChatSkeleton";
import PromptTemplatesIntro from "../../component/ChatPage/PromptTemplatesIntro";
import ChatPromptInputForm from "../../component/ChatPage/ChatPromptInputForm";
import MessageContainer from "../../component/Chat/MessageContainer";

// hooks & contexts
import useChatPage from "../../Hooks/useChatPage";
import { PromptTemplateContext } from "../../contexts/PromptTemplateContext";
import { SidebarContext } from "../../contexts/SidebarContext";

// services & helpers
import { generateThreadId, getIdsFromItems, getItemsFromIds, inputElementAutoGrow, scrollToBottomForRefElement } from "../../Utility/chat-page-helper";
import { getGptResponse } from "../../api/chat-page-api";

// api

const ChatPage = () => {
  // ----- STATES ----- //
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputPrompt, setInputPrompt] = useState("");
    const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(true);

  // ----- REFS ----- //
  const chatLogWrapperRef = useRef(null);
  const promptInputRef = useRef(null);
  const cancelTokenSourceRef = useRef();

  // ----- HOOK & CONTEXT VARIABLES ----- //
  const { currentPromptTemplate } = useContext(
      PromptTemplateContext
  );
  const {
    chatLog,
    templateCategories,
    tagList,
    errorMessage,
    isFetchingChatLog,
    isFirstMessage,
    isGeneratingResponse,
    setChatLog,
    setErrorMessage,
    setIsFirstMessage,
    setIsGeneratingResponse,
    fetchChatLogPerThread,
    fetchTagList,
    fetchTemplates,
      setEditedPrompt,
      editedPrompt,
      handleEdit,
      handleCancelClick,
      handleSaveClick
   
  } = useChatPage();
  const { thread_id } = useParams();
  const navigate = useNavigate();
  const { setTriggerNavContent } = useContext(SidebarContext);
  // ----- SIDE EFFECTS ----- //
  useEffect(() => {
    if (thread_id && !isFirstMessage) {
      // not first message and thread_id exists -> empty chat-log and fetch new chat-log
      setChatLog([]);
      fetchChatLogPerThread(thread_id);
    } else if (thread_id && isFirstMessage) {
      // is first message -> no need to fetch chat-log, thread_id has been added to url
      setIsFirstMessage(false);
    } else if (!thread_id) {
      // new thread created exception -> empty chat-log and set isFirstMessage to false
      setChatLog([]);
      setIsFirstMessage(false);
    }

    return () => {
      // cleanup function
    };
  }, [thread_id]);

  useEffect(() => {
    const scrollableDiv = chatLogWrapperRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", handleScrollToBottomButton);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", handleScrollToBottomButton);
      }
    };
  }, [chatLogWrapperRef.current]);

  useEffect(() => {
    fetchTagList();
    fetchTemplates();

    if (promptInputRef.current) {
      inputElementAutoGrow(promptInputRef.current);
    }
  }, []);

  useEffect(() => {
    if(currentPromptTemplate) {
      setInputPrompt(currentPromptTemplate)
    }
  }, [currentPromptTemplate]);

  useEffect(() => {
    inputElementAutoGrow(promptInputRef.current);
  }, [inputPrompt])



  // ----- HANDLE API CALLS ----- //
  // [TODO] - change the way tags are getting sent to the backend
  const handlePromptSubmit = async (e) => {
    e.preventDefault();

    cancelTokenSourceRef.current = axios.CancelToken.source();

    try {
      scrollToBottomForRefElement(chatLogWrapperRef);
      setErrorMessage(null);
      setIsGeneratingResponse(true);

      const tagIds = getIdsFromItems(selectedTags);
      setSelectedTags([]);

      const threadId = thread_id ? thread_id : generateThreadId();
      let isFistThreadMessage = thread_id ? false : true;

      if (!isGeneratingResponse && inputPrompt.trim() !== "") {
        setChatLog([...chatLog, { chatPrompt: inputPrompt }]);

        const temp = inputPrompt;
        setInputPrompt("");
        promptInputRef.current.style.height = "51px";

        const compid = localStorage.getItem("compId");
        const body = {
          threadId,
          // userPrompt: temp,
          temp,
          chatLog,
          compId: compid,
          tags: tagIds,
        };

        // [TODO] - change WHEN STREAM API is RESTORED
        // const response = await fetch(
        //   `${process.env.REACT_APP_BASE_URL}api/prompt/stream`,
        //   generateFetchConfig("POST", body, getUserToken())
        // );
        const { success, promptResponse, message } = await getGptResponse(body,cancelTokenSourceRef.current);

        let tagsList = [];
        if (tagIds.length) {
          tagsList = getItemsFromIds(tagList, tagIds);
        }

        if(success) {
          setChatLog([
            ...chatLog,
            {
              chatPrompt: inputPrompt,
              botMessage: promptResponse,
              tags: tagsList,
              msg_id: Date.now(),
            },
          ]);
          // scroll to bottom
          scrollToBottomForRefElement(chatLogWrapperRef);
        } else {
          return setErrorMessage(message);
        }

        // let message = "";
        // const reader = response.body
        //   .pipeThrough(new TextDecoderStream())
        //   .getReader();

        // while (true) {
        //   const { value, done } = await reader.read();
        //   if (done) break;
        //   message += value;
        //   setChatLog([
        //     ...chatLog,
        //     { chatPrompt: inputPrompt, botMessage: message, tags: tagsList, msg_id: Date.now() },
        //   ]);
        //   // scroll to bottom
        //   scrollToBottomForRefElement(chatLogWrapperRef);
        // }

        // if user is making the first message in the thread -> trigger threads api
        if (isFistThreadMessage) {
          setIsFirstMessage(true);
          setTimeout(() => {
            setTriggerNavContent((state) => state + 1);
          }, 1000);
          navigate(`${threadId}`);
        }
        e.target.blur();
      }
    } catch (error) {
      console.log("🚀 ~ handleSubmit ~ error:", error);
      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.message ||
          "Something went wrong, please reload!"
      );
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  // ----- LOCAL HANDLERS ----- //
  const handleInputPromptChange = (event) => {
    setInputPrompt(event.target.value);
  };

  const handleKeyDown = (event) => {
    if (isGeneratingResponse) return;

    if (event.key === "Enter" && event.shiftKey) {
      setInputPrompt((prevValue) => prevValue);
    } else if (event.key === "Enter") {
      event.preventDefault();
      event.target.style.height = "51px";
      handlePromptSubmit(event);
    }
  };

  const handleStopGeneratingButton = async () => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel('Canceled.!! Ask a new question.');
    }
    setIsGeneratingResponse(false)
  };

  const handleRemoveTag = (obj) => {
    setSelectedTags((prevSelected) =>
      prevSelected.filter((selectedObj) => selectedObj._id !== obj._id)
    );
  };

  const handleSelectTag = (obj) => {
    // Check if the object is already selected
    const isSelected = selectedTags.some(
      (selectedObj) => selectedObj._id === obj._id
    );

    // If not selected, add it to the array
    if (!isSelected) {
      setSelectedTags((prevSelected) => [
        ...prevSelected,
        { _id: obj._id, title: obj.title },
      ]);
    }
  };

  const handleScrollToBottomButton = () => {
    const scrollableDiv = chatLogWrapperRef.current;

    if (scrollableDiv) {
      const isScrolledUp = scrollableDiv.scrollTop >= 0;
      const isAtBottom = scrollableDiv.scrollTop + scrollableDiv.clientHeight >= scrollableDiv.scrollHeight - 1;
  
      setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
    }
  };

  // ----- LOCAL LOGICS ----- //
  let isChatLogEmpty = chatLog.length === 0 ? true : false;

  return (
    <section className="chat-box">
      {/* chatLogWrapper */}
      <div
        className="chat-list-container"
        ref={chatLogWrapperRef}
      >
        {/* if chats loading, show skeleton */}
        {isFetchingChatLog ? (
          <ChatSkeleton />
        ) : (
          <>
            {isChatLogEmpty ? (
              <>
                {/* ----- TEMPLATE LIST ----- */}
                <PromptTemplatesIntro
                  templateCategories={templateCategories}
                  setInputPrompt={setInputPrompt}
                />
              </>
            ) : (
              <>
                {/* ----- CHAT LIST ----- */}
                {chatLog.map((chat, idx) => (
                  <MessageContainer
                    key={idx}
                    states={{
                      chat,
                      idx,
                      loading: isGeneratingResponse,
                      error: errorMessage,
                    }}
                  />
                ))}
                 {showScrollToBottomButton && (
                <button
                  onClick={() => scrollToBottomForRefElement(chatLogWrapperRef)}
                  className="GptScrollUpButton"
                >
                  <FaArrowDown />
                </button>
              )}
              </>
            )}
          </>
        )}
      </div>

      {/* ----- CHAT INPUT -----  */}
      <ChatPromptInputForm
        states={{
          selectedTags,
          tags: tagList,
          loading: isGeneratingResponse,
          inputPrompt,
        }}
        refs={{ promptInputRef }}
        actions={{
          onSubmit: handlePromptSubmit,
          handleRemoveTag,
          onSelectingTag: handleSelectTag,
          handleKeyDown,
          onInputPromptChange: handleInputPromptChange,
          handleStopGeneratingButton,
        }}
      />
    </section>
  );
};

export default ChatPage;
