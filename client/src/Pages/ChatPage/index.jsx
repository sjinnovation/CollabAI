import { useContext, useEffect, useRef, useState } from "react";

// libraries
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowDown } from "react-icons/fa";
import { message } from "antd";

// components
import ChatSkeleton from "../../component/Chat/ChatSkeleton";
import PromptTemplatesIntro from "../../component/ChatPage/PromptTemplatesIntro";
import ChatPromptInputForm from "../../component/ChatPage/ChatPromptInputForm";
import MessageContainer from "../../component/Chat/MessageContainer";
import HuggingFaceIcon from "../../assests/images/huggingface.png";

// hooks & contexts
import useChatPage from "../../Hooks/useChatPage";
import { PromptTemplateContext } from "../../contexts/PromptTemplateContext";
import { SidebarContext } from "../../contexts/SidebarContext";

// services & helpers
import {
  generateThreadId, inputElementAutoGrow, scrollToBottomForRefElement
} from "../../Utility/chat-page-helper";
import { getGptResponse } from "../../api/chat-page-api";
import useSocket from "../../Hooks/useSocket";
import { CHAT_EVENTS } from "../../constants/sockets/chat";
import { axiosSecureInstance } from "../../api/axios";
import { HfMessages } from "../../constants/huggingfaceConstants";
import useSocketMonitor from "../../logger/socketLog";
import SocketStatus from "../../component/Chat/SocketStatus";
import AiRecommendationsAndSuggestions from "../../component/ChatPage/AiRecommendationsAndSuggestions";

const ChatPage = () => {
  const { thread_id } = useParams();
  //***** STATES***** //
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedChatModel, setSelectedChatModel] = useState("openai");
  const [selectedModel, setSelectedModel] = useState(null);
  const [showScrollToBottomButton, setShowScrollToBottomButton] = useState(true);
  const [showPromptDropdown, setShowPromptDropdown] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [showQMessage, setShowQMessage] = useState(false);

  //***** REFS***** //
  const chatLogWrapperRef = useRef(null);
  const promptInputRef = useRef(null);
  const cancelTokenSourceRef = useRef();
  const timeOutIds = [];

  //***** HOOK & CONTEXT VARIABLES***** //
  const { currentPromptTemplate } = useContext(PromptTemplateContext);
  const {
    chatLog,
    templateCategories,
    errorMessage,
    isFetchingChatLog,
    isFirstMessage,
    isGeneratingResponse,
    setChatLog,
    setErrorMessage,
    setIsFirstMessage,
    setIsGeneratingResponse,
    fetchChatLogPerThread,
    fetchTemplates,
    updateLastPrompt,
  } = useChatPage();
  const location = useLocation();
  const [assistantId,setAssistantId] = useState(null);
  const [dynamicBotOptions, setDynamicBotOptions] = useState([]);
  const navigate = useNavigate();
  const { setTriggerNavContent, setShowMenu } = useContext(SidebarContext);

  // Get a ref to the socket instance
  const chatSocketRef = useSocket(CHAT_EVENTS.CHAT_NAMESPACE);
  const { resetStreamCounters, updateChatContext, monitorEmit } = useSocketMonitor(chatSocketRef);

  const handleScrollToBottomButton = () => {
    const scrollableDiv = chatLogWrapperRef.current;
    if (scrollableDiv) {
      const isScrolledUp = scrollableDiv.scrollTop >= 0;
      const isAtBottom = scrollableDiv.scrollTop + scrollableDiv.clientHeight >=
        scrollableDiv.scrollHeight - 1;

      setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
    }
  };

  useEffect(() => {
    const fetchHuggingFaceModels = async () => {
      try {
        const response = await axiosSecureInstance.get(`${process.env.REACT_APP_BASE_URL}api/models`);
        const models = response.data.data;

        const huggingFaceOptions = models.map((model) => ({
          value: `${model.name}-hf`,
          label: (
            <div className="d-flex align-items-center gap-2">
              <span className="model-label">
                <img
                  src={model.image_url || HuggingFaceIcon}
                  alt="HuggingFaceIcon"
                  style={{ width: "20px", height: "20px" }}
                />
                {model.nickname}
              </span>
            </div>
          ),
          inputOutputType: model.inputOutputType,
          image_url: model.image_url,
        }));

        setDynamicBotOptions(huggingFaceOptions);
      } catch (error) {
        message.error(HfMessages.HF_FETCH_MODL_FAIL);
      }
    };

    fetchHuggingFaceModels();
  }, []);

  // ***** SIDE EFFECTS **** //
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
    setCurrentThreadId(thread_id);
    // setting prompt input in focus
    if (promptInputRef.current) {
      promptInputRef.current.focus();
    }
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
    fetchTemplates();

    if (promptInputRef.current) {
      inputElementAutoGrow(promptInputRef.current);
    }

    return () => {
      if (timeOutIds.length) {
        timeOutIds.forEach((id) => clearTimeout(id));
      }
    };
  }, []);

  useEffect(() => {
    if (currentPromptTemplate) {
      setInputPrompt(currentPromptTemplate);
    }
  }, [currentPromptTemplate]);

  useEffect(() => {
    inputElementAutoGrow(promptInputRef.current);
  }, [inputPrompt]);

  // [SOCKET] - setting listener for sockets
  useEffect(() => {
    const bindSocketEvents = () => {
      const chatSocket = chatSocketRef.current;
      chatSocket?.on(CHAT_EVENTS.CREATED_CHAT, onChatCreatedEvent);
      chatSocket?.on(CHAT_EVENTS.EDITED_PROMPT, onChatEditedEvent);
    };

    const unbindSocketEvents = () => {
      const chatSocket = chatSocketRef.current;
      chatSocket?.off(CHAT_EVENTS.CREATED_CHAT, onChatCreatedEvent);
      chatSocket?.off(CHAT_EVENTS.EDITED_PROMPT, onChatEditedEvent);
    };

    bindSocketEvents();
    return unbindSocketEvents;
  }, [chatSocketRef.current]);

  //***** Edit last Prompt ******//
  const onChatEditedEvent = (response) => {
    const {
      success,
      userPrompt,
      promptResponse,
      promptId,
    } = response;

    if (success) {
      setChatLog((prevChatLog) => {
        const index = prevChatLog.findIndex(
          (chat) => chat.promptId === promptId
        );
        if (index !== -1) {
          const newChatLog = [...prevChatLog];
          newChatLog[index] = {
            ...newChatLog[index],
            chatPrompt: userPrompt,
            botMessage: promptResponse,
          };
          return newChatLog;
        }
        // If the message is not found, just return the previous chat log
        return prevChatLog;
      });
    }
  };

  const emitUpdateLastPrompt = async (payload, promptId, newPrompt) => {
    const payloadData = {
      ...payload,
      chatLog,
    };

    const chatSocket = chatSocketRef.current;

    if (chatSocket) {
      // Monitor the emit event
      //monitorEmit(CHAT_EVENTS.EDIT_LAST_CHAT, payloadData);
      chatSocket.emit(CHAT_EVENTS.EDIT_LAST_CHAT, payloadData);
    } else {
      const { success, data } = await updateLastPrompt(promptId, newPrompt);

      if (success) {
        onChatEditedEvent({
          ...payload,
          success,
          promptResponse: data?.promptResponse,
          isCompleted: true,
          promptId: data.promptId,
        });
      } else {
        setErrorMessage(
          "An unexpected error occurred. Please reload the page."
        );
      }
    }
  };

  const handleNewThreadException = (threadId) => {
    setIsFirstMessage(true);
    // will navigate only if url is not already set with thread_id
    if (!thread_id || thread_id !== threadId) {
      if (location.pathname.startsWith("/chat")) {
        setShowMenu(true);
      }
      navigate(`/chat/${threadId}`, { replace: true });
    }
    setTriggerNavContent((state) => state + 1);
  };

  const onChatCreatedEvent = (response) => {
    const {
      success,
      message,
      userPrompt,
      promptResponse,
      msg_id,
      threadId,
      botProvider,
      isFistThreadMessage,
      isCompleted,
      promptId,
    } = response;

    if (success) {
      // Update only the specific message
      setChatLog(prevLog => prevLog.map(msg => 
        msg.msgId === msg_id 
          ? {
              ...msg,
              chatPrompt: userPrompt,
              botMessage: promptResponse,
              botProvider,
              promptId,
            }
          : msg
      ));

      // scroll to bottom
      scrollToBottomForRefElement(chatLogWrapperRef);
    } else {
      setIsGeneratingResponse(false);
      return setErrorMessage(message);
    }

    // Handle first message in thread
    if (isFistThreadMessage && isCompleted) {
      handleNewThreadException(threadId);
    }

    // Only set generating response to false when explicitly told
    if (isCompleted) {
      setIsGeneratingResponse(false);
    }
  };

  /**
   * Handles the submission of a prompt in the chat page.
   *
   * @param {Event} e - The event object.
   * @param {boolean} [prompt=null] - If `true`, the `prompt` parameter is used as the main user prompt. Otherwise, the `inputPrompt` state is considered.
   * @returns {Promise<void>} - A promise that resolves when the submission is handled.
   */
  const handlePromptSubmit = async (e, prompt = null) => {
    e?.preventDefault();
    if (isGeneratingResponse) return;
    setShowQMessage(false);

    try {
      scrollToBottomForRefElement(chatLogWrapperRef);
      setErrorMessage(null);
      setIsGeneratingResponse(true);

      const threadId = currentThreadId ? currentThreadId : generateThreadId();
      let isFistThreadMessage = currentThreadId ? false : true;

      // Update monitoring context
      updateChatContext(threadId, selectedChatModel);
      resetStreamCounters();

      if (inputPrompt.trim() !== "") {
        const prompts = (prompt ?? inputPrompt).split('----').map(p => p.trim()).filter(Boolean);
        setInputPrompt("");
        promptInputRef.current.style.height = "51px";

        let previousResponse = "";

        for (const [index, currentPrompt] of prompts.entries()) {
          const msgId = `${new Date().getTime()}-${index}`;

          // Update monitoring context with message ID
          updateChatContext(threadId, selectedChatModel, msgId);
          
          // Combine previous response with current prompt if not the first prompt
          const enhancedPrompt = index === 0 ? currentPrompt 
            : `Previous response: ${previousResponse}\n\nNew prompt: ${currentPrompt}`;
          
          // Add user message to chat log immediately
          setChatLog( prevLog => [...prevLog,
            {
              chatPrompt: currentPrompt, // Show original prompt to user
              msgId,
              botProvider: selectedChatModel,
            },
          ]);

          const compid = localStorage.getItem("compId");
          const body = {
            threadId,
            botProvider: selectedChatModel,
            userPrompt: enhancedPrompt, // Send enhanced prompt to backend
            temp: enhancedPrompt,
            chatLog,
            compId: compid,
            msg_id: msgId,
            isFistThreadMessage: index === 0 && isFistThreadMessage,
            selectedmodel: selectedModel,
          };

          const chatSocket = chatSocketRef.current;
          if (chatSocket) {
            // Monitor the emit event
            monitorEmit(CHAT_EVENTS.CREATE_CHAT, body);

            await new Promise((resolve) => {
              const handleResponse = (response) => {
                if (response.msg_id === msgId) {
                  if (response.isCompleted) {
                    chatSocket.off(CHAT_EVENTS.CREATED_CHAT, handleResponse);
                    previousResponse = response.promptResponse; // Store response for next prompt
                    resolve();
                  }
                  
                  setChatLog(prevLog => prevLog.map(msg => 
                    msg.msgId === msgId 
                      ? {
                          ...msg,
                          chatPrompt: currentPrompt, // Keep original prompt
                          botMessage: response.promptResponse,
                          botProvider: response.botProvider,
                          promptId: response.promptId,
                        }
                      : msg
                  ));
                }
              };

              const handleChatDone = () => {
                console.log("Chat done event received");
                setIsGeneratingResponse(false);
                chatSocket.off(CHAT_EVENTS.CHAT_DONE, handleChatDone); 
              };
              
              chatSocket.on(CHAT_EVENTS.CREATED_CHAT, handleResponse);

              chatSocket.on(CHAT_EVENTS.CHAT_DONE, handleChatDone);
              
              chatSocket.emit(CHAT_EVENTS.CREATE_CHAT, body);
            });
          } else {
            const { success, promptResponse, message, promptId } = await getGptResponse(body, cancelTokenSourceRef.current);

            if (success) {
              onChatCreatedEvent({
                ...body,
                success,
                promptResponse,
                isCompleted: true,
                promptId,
              });
            } else {
              setIsGeneratingResponse(false);
              return setErrorMessage(message);
            }
          }
        }
        
        setIsGeneratingResponse(false);
      }
    } catch (error) {
      setIsGeneratingResponse(false);
      setErrorMessage(
        error?.response?.data?.message || error?.response?.message ||
          "Something went wrong, please reload!"
      );
    }
  };

  const handleStopGeneratingButton = async () => {
    const chatSocket = chatSocketRef.current;
    if (chatSocket) {
      // Monitor the emit event
      monitorEmit(CHAT_EVENTS.STOP_CHAT, {});
      chatSocket.emit(CHAT_EVENTS.STOP_CHAT, {});
    }
    setIsGeneratingResponse(false);
  };

  return (
    <>
      {/* <SocketStatus socketRef={chatSocketRef} /> */}
      <section className="chat-box">
      <div className={`chat-list-container ${isGeneratingResponse ? 'chat-list-container-for-generate' : ''}`} ref={chatLogWrapperRef}>
        {/* if chats loading, show skeleton */}
        {isFetchingChatLog ? (
          <ChatSkeleton />
        ) : (
          <>
            {chatLog.length === 0 ? (
              <>
                {/****** TEMPLATE LIST***** */}
                {/* <PromptTemplatesIntro
                  templateCategories={templateCategories}
                  setInputPrompt={setInputPrompt}
                /> */}
                <AiRecommendationsAndSuggestions
                />
              </>
            ) : (
              <>
                {/****** CHAT LIST***** */}
                {chatLog.map((chat, idx) => (
                  <MessageContainer
                    key={chat.msg_id || idx}
                    dynamicBotOptions={dynamicBotOptions}
                    states={{
                      chat,
                      idx,
                      loading: isGeneratingResponse,
                      error: errorMessage,
                      editProps: {
                        emitUpdateLastPrompt,
                        isLastItem: idx === chatLog.length - 1,
                      },
                    }}
                  />
                ))}
                {showScrollToBottomButton && (
                  <button className="GptScrollUpButton" onClick={
                      () => scrollToBottomForRefElement(chatLogWrapperRef)
                    }
                  >
                    <FaArrowDown />
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/****** CHAT INPUT*****  */}
      <ChatPromptInputForm
        states={{
          loading: isGeneratingResponse,
          setLoading: setIsGeneratingResponse,
          inputPrompt,
          showPromptDropdown,
          showMessage : showQMessage,
          dynamicBotOptions,
          setShowMessage : setShowQMessage,
          selectedModel,
          setSelectedModel,
        }}
        refs={{ promptInputRef }}
        actions={{
          onSubmit: handlePromptSubmit,
          handleStopGeneratingButton,
          setSelectedChatModel,
          setInputPrompt,
          setShowPromptDropdown,
        }}
      />
      </section>
    </>
  );
};

export default ChatPage;