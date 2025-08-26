import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Select, Typography } from "antd";

// libraries
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowDown } from "react-icons/fa";

import { message } from "antd";

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
import {
  generateThreadId,
  getIdsFromItems,
  getItemsFromIds,
  inputElementAutoGrow,
  scrollToBottomForRefElement,
} from "../../Utility/chat-page-helper";
import { getGptResponse } from "../../api/chat-page-api";
import useSocket from "../../Hooks/useSocket";
import { PROJECT_EVENTS } from "../../constants/sockets/projects";
import { FaRegFolderClosed } from "react-icons/fa6";
import InstructionsAndFolder from "../ChatPage/CustomInstructions/InstructionsAndFolder";
import { axiosSecureInstance } from "../../api/axios";
import { getProjectInfo, handleFileSubmit } from "../../api/projects";
import ProjectsChatPromptInputForm from "../../component/ChatPage/ProjectsChatPromptInputForm";
import { getAllKnowledgeBase } from "../../api/knowledgeBase";
import { getAllAiPersonasWithPersonalPersonas } from "../../api/aiPersona";
import { getUserID, getUserRole } from "../../Utility/service";
const role = getUserRole()

// api

const Projects = () => {
  const { projectId,thread_id } = useParams();
  // ----- STATES ----- //
  const [selectedTags, setSelectedTags] = useState([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [selectedChatModel, setSelectedChatModel] = useState("openai");
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(true);
  const [showPromptDropdown, setShowPromptDropdown] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [showQMassage, setShowQMassage] = useState(false);
  const [formattedRAGdData, setFormattedRAGdData] = useState([]);
  const [formattedPublicFilesData, setFormattedPublicFilesData] = useState([]);
  const [threadFilesNames,setThreadFilesNames] = useState([]);

  // ----- REFS ----- //
  const chatLogWrapperRef = useRef(null);
  const promptInputRef = useRef(null);
  const cancelTokenSourceRef = useRef();
  const timeOutIds = [];
  const userId = getUserID(); 

  // ----- HOOK & CONTEXT VARIABLES ----- //
  const { currentPromptTemplate } = useContext(PromptTemplateContext);
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
    fetchTemplates,
    updateLastPrompt,
  } = useChatPage();

  const [assistantId,setAssistantId] = useState(null);
  const [folderData, setFolderData] = useState(null);
  const [loadingFolder, setLoadingFolder] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeKeyOfKnowledgeBase, setActiveKeyOfKnowledgeBase] = useState('1');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [allPersonasWithPersonalPersonas, setAllPersonasWithPersonalPersonas] = useState(null);

  const location = useLocation();
  const folderId = location.state?.folderId;
  const showInstruction = location.state?.showInstructions;

  useEffect(() => {
    const url = window.location.href;
    const regex = /agents\/(asst_[A-Za-z0-9]+)/;
    const match = url.match(regex);
    if (match) {
      setAssistantId(match[1]);
    }
  }, []);


  const navigate = useNavigate();
  const { setTriggerNavContent, setShowMenu, setShowProjectSidebar } = useContext(SidebarContext);
  // Get a ref to the socket instance
  const chatSocketRef = useSocket(PROJECT_EVENTS.CHAT_NAMESPACE);

  //----- Edit last Prompt --------//
  const emitUpdateLastPrompt = async (payload, promptId, newPrompt) => {
    const payloadData = {
      ...payload,
      chatLog,
    };

    const chatSocket = chatSocketRef.current;

    if (chatSocket) {
      chatSocket.emit(PROJECT_EVENTS.EDIT_LAST_CHAT, payloadData);
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

  const onChatEditedEvent = (response) => {
    const {
      success,
      message,
      userPrompt,
      promptResponse,
      botProvider,
      promptId,
      threadId,
      isCompleted,
      chatLog,
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

  // ----- SIDE EFFECTS ----- //

  useEffect(() => {
    if (thread_id && !isFirstMessage) {
      // not first message and thread_id exists -> empty chat-log and fetch new chat-log
      setChatLog([]);
      fetchChatLogPerThread(thread_id,projectId);
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

  useEffect(() => {
    fetchPersonas();
  }, []);

  // [SOCKET] - setting listener for sockets
  useEffect(() => {
    const bindSocketEvents = () => {
      const chatSocket = chatSocketRef.current;
      chatSocket?.on(PROJECT_EVENTS.CREATED_CHAT, onChatCreatedEvent);
      chatSocket?.on(PROJECT_EVENTS.EDITED_PROMPT, onChatEditedEvent);
    };

    const unbindSocketEvents = () => {
      const chatSocket = chatSocketRef.current;
      chatSocket?.off(PROJECT_EVENTS.CREATED_CHAT, onChatCreatedEvent);
      chatSocket?.off(PROJECT_EVENTS.EDITED_PROMPT, onChatEditedEvent);
    };

    bindSocketEvents();
    return unbindSocketEvents;
  }, [chatSocketRef.current]);

  const onChatCreatedEvent = (response) => {
    const {
      tags,
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
      let tagsList = [];
      if (tags?.length) {
        tagsList = getItemsFromIds(tagList, tags);
      }

      // Update only the specific message
      setChatLog(prevLog => prevLog.map(msg => 
        msg.msgId === msg_id 
          ? {
              ...msg,
              chatPrompt: userPrompt,
              botMessage: promptResponse,
              tags: tagsList,
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

  const handleNewThreadException = (threadId) => {
    setIsFirstMessage(true);
    // will navigate only if url is not already set with thread_id
    if (!thread_id || thread_id !== threadId) {
      const localProjectId = localStorage.getItem("projectId");
      if (location.pathname.startsWith("/projects/")) {
        setShowProjectSidebar(false)
        setShowMenu(true);
      }
      navigate(`/projects/${localProjectId}/${threadId}`, { replace: true });
    }
    setTriggerNavContent((state) => state + 1);
  };

  const convertImageToBase64 =  (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            resolve(reader.result); // Resolve the promise with the Base64 string
        };
        reader.onerror = reject; // Reject the promise on error
        reader.readAsDataURL(file); // Read the file as a data URL
    });
};

const [base64String, setBase64String] = useState('');

  // ----- HANDLE API CALLS ----- //
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
    setShowQMassage(false);

    try {
      scrollToBottomForRefElement(chatLogWrapperRef);
      setErrorMessage(null);
      setIsGeneratingResponse(true);

      const tagIds = getIdsFromItems(selectedTags);
      setSelectedTags([]);
      const threadId = currentThreadId ? currentThreadId : generateThreadId();
      let isFistThreadMessage = currentThreadId ? false : true;

      if (inputPrompt.trim() !== "") {
        const prompts = (prompt ?? inputPrompt).split('----').map(p => p.trim()).filter(Boolean);
        setInputPrompt("");
        promptInputRef.current.style.height = "51px";

        let previousResponse = ""; // Store the previous response

        for (const [index, currentPrompt] of prompts.entries()) {
          const msgId = `${new Date().getTime()}-${index}`;
          // Combine previous response with current prompt if not the first prompt
          const enhancedPrompt = index === 0 
            ? currentPrompt 
            : `Previous response: ${previousResponse}\n\nNew prompt: ${currentPrompt}`;
          
          // Add user message to chat log immediately
          setChatLog(prevLog => [
            ...prevLog,
            {
              chatPrompt: currentPrompt, // Show original prompt to user
              msgId,
              botProvider: selectedChatModel,
              files : uploadedFiles?.length > 0?uploadedFiles.map((file)=>{
                return {fileName : file.name}
              }) : [],
              base64Url: base64String,
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
            tags: tagIds,
            msg_id: msgId,
            isFistThreadMessage: index === 0 && isFistThreadMessage,
            folderId : projectId? projectId : null,
            uploadedFiles : uploadedFiles.map((file)=> {return {name : file.name,uid : file.uid}})
          };
          setUploadedFiles([]);
          const chatSocket = chatSocketRef.current;
          if (chatSocket) {
            await new Promise((resolve) => {
              const handleResponse = (response) => {
                if (response.msg_id === msgId) {
                  if (response.isCompleted) {
                    chatSocket.off(PROJECT_EVENTS.CREATED_CHAT, handleResponse);
                    previousResponse = response.promptResponse; // Store response for next prompt
                    resolve();
                  }
                  
                  setChatLog(prevLog => prevLog.map(msg => 
                    msg.msgId === msgId 
                      ? {
                          ...msg,
                          chatPrompt: currentPrompt, // Keep original prompt
                          botMessage: response.promptResponse,
                          tags: response.tags?.length ? getItemsFromIds(tagList, response.tags) : [],
                          botProvider: response.botProvider,
                          promptId: response.promptId,
                          base64: response.base64Images,
                        }
                      : msg
                  ));
                }
              };
              
              chatSocket.on(PROJECT_EVENTS.CREATED_CHAT, handleResponse);
              chatSocket.emit(PROJECT_EVENTS.CREATE_CHAT, body);
            });
          } else {
            const { success, promptResponse, message, promptId } =
              await getGptResponse(body, cancelTokenSourceRef.current);

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
        error?.response?.data?.message ||
          error?.response?.message ||
          "Something went wrong, please reload!"
      );
    }
  };

  // ----- LOCAL HANDLERS ----- //
  const handleStopGeneratingButton = async () => {
    const chatSocket = chatSocketRef.current;
    if (chatSocket) {
      chatSocket.emit(PROJECT_EVENTS.STOP_CHAT, {});
    }
    setIsGeneratingResponse(false);
  };

  const handleSelectTags = (selectedTags) => {
    setSelectedTags(selectedTags);
  };

  const handleScrollToBottomButton = () => {
    const scrollableDiv = chatLogWrapperRef.current;

    if (scrollableDiv) {
      const isScrolledUp = scrollableDiv.scrollTop >= 0;
      const isAtBottom =
        scrollableDiv.scrollTop + scrollableDiv.clientHeight >=
        scrollableDiv.scrollHeight - 1;

      setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchFolderData(projectId);
    }

    fetchPersonas()
    //fetch all KnowledgeBases
    getAllKnowledgeBase()
      .then(response => {
        const fetchedRAGData = response;
        if (fetchedRAGData?.treeData) {
          setFormattedRAGdData(fetchedRAGData?.treeData);

        } else {
          console.warn("Formatted RAG Files are empty or undefined");
        }

        if (fetchedRAGData?.publicTreeData) {
          setFormattedPublicFilesData(fetchedRAGData?.publicTreeData);

        } else {
          console.warn("Formatted Public Files are empty or undefined");
        }

      })
      .catch(error => {
        console.error('Error fetching files:', error);
      });
  }, [projectId]);

 const fetchFolderData = async (projectId) => {
    try {
      const response = await getProjectInfo(projectId);
      if(response.data.model === 'gpt-4.1' && role === 'user'){
        setFolderData({...response.data, model : 'gpt-4o'})
      }
      else {
        setFolderData(response.data);
      }
      setAttachedFiles(response.data.fileInfo);
      const threadFiles = response.data.threadFilesInfo
      const threadsAllFiles = []
      if(thread_id){
        threadFiles.map((file)=>{
          if(file.threadId === thread_id){
            threadsAllFiles.push(file.fileName)
          }
        })
        setThreadFilesNames([...threadsAllFiles]);
      }
    } catch (error) {
      setErrorMessage("Failed to load folder data.");
    } finally {
      setLoadingFolder(false);
    }
  };

  const fetchPersonas = async () => {
    const response = await getAllAiPersonasWithPersonalPersonas();
    setAllPersonasWithPersonalPersonas(response?.data);
  };
  const getTransparentColor = (colorName, alpha = 0.3) => {
    const colorMap = {
      red: "rgba(255, 0, 0, ALPHA)",
      green: "rgba(0, 128, 0, ALPHA)",
      blue: "rgba(0, 0, 255, ALPHA)",
      yellow: "rgba(255, 255, 0, ALPHA)",
      orange: "rgba(255, 165, 0, ALPHA)",
      purple: "rgba(128, 0, 128, ALPHA)",
      pink: "rgba(255, 192, 203, ALPHA)",
      brown: "rgba(165, 42, 42, ALPHA)",
      gray: "rgba(128, 128, 128, ALPHA)",
      black: "rgba(0, 0, 0, ALPHA)",
      white: "rgba(255, 255, 255, ALPHA)",
      cyan: "rgba(0, 255, 255, ALPHA)",
      magenta: "rgba(255, 0, 255, ALPHA)",
      lime: "rgba(0, 255, 0, ALPHA)",
      teal: "rgba(0, 128, 128, ALPHA)",
      navy: "rgba(0, 0, 128, ALPHA)",
    };

    return colorMap[colorName]?.replace("ALPHA", alpha) || "rgba(0, 0, 0, 0.3)";
  };

  
  
  return (
    <section className="chat-box">
      <div className={`chat-list-container ${isGeneratingResponse ? 'chat-list-container-for-generate' : ''}`} ref={chatLogWrapperRef}>
        {/* if chats loading, show skeleton */}
        {isFetchingChatLog ? (
          <ChatSkeleton />
        ) : (
          <>

              {!thread_id && projectId && !isGeneratingResponse ? <>
                <InstructionsAndFolder propsData={{
                  projectId,
                  folderData,
                  fetchFolderData,
                  activeKeyOfKnowledgeBase,
                  setActiveKeyOfKnowledgeBase,
                  formattedRAGdData,
                  formattedPublicFilesData,
                  attachedFiles,
                  fetchPersonas,
                  allPersonasWithPersonalPersonas,
                  userId
                }} 
                states={{setFolderData}}/>
              </> :
                <> {chatLog?.length > 0 && (
                  <>
                    {/* ----- CHAT LIST ----- */}

                    {chatLog?.map((chat, idx) => (

                      <MessageContainer
                        key={chat.msg_id || idx}
                        states={{
                          chat,
                          idx,
                          loading: isGeneratingResponse,
                          error: errorMessage,
                          editProps: {
                            emitUpdateLastPrompt,
                            isLastItem: idx === chatLog.length - 1,
                          },
                          folderId: projectId ? projectId : null

                        }}
                      />
                    ))}
                    {showScrollToBottomButton && (
                      <button
                        onClick={() =>
                          scrollToBottomForRefElement(chatLogWrapperRef)
                        }
                        className="GptScrollUpButton"
                      >
                        <FaArrowDown />
                      </button>
                    )}
                  </>
                )}
                </>
              }

          </>
        )}
      </div>

      {/* ----- CHAT INPUT -----  */}
      <ProjectsChatPromptInputForm
        states={{
          selectedTags,
          tags: tagList,
          loading: isGeneratingResponse,
          inputPrompt,
          showPromptDropdown,
          showMassage : showQMassage,
          setShowMassage : setShowQMassage,
          uploadedFiles, 
          setUploadedFiles,
          threadFilesNames,
          setUploadedFiles,
          setBase64String,
          chatLog,
          isFetchingChatLog
        }}
        refs={{ promptInputRef }}
        actions={{
          onSubmit: handlePromptSubmit,
          handleStopGeneratingButton,
          handleSelectTags,
          setSelectedTags,
          setSelectedChatModel,
          setInputPrompt,
          setShowPromptDropdown,
          fetchFolderData,
          folderData
        }}
      />
    </section>
  );
};

export default Projects;