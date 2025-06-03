// VoiceAgentPage.jsx
import React, { useEffect, useRef, useState, useMemo, useContext } from "react";

// libraries
import { useParams } from "react-router-dom";
import { CheckCircleOutlined,CloseCircleOutlined } from '@ant-design/icons';

// components 
import VoiceAgentChatInputPrompt from "../../component/VoiceAgentChatPage/VoiceAgentChatInputPrompt";
// hooks & contexts
import useVoiceAgentPage from "../../Hooks/useVoiceAgentPage";

// services & helpers
import { getUserRole } from "../../Utility/service"; 
import { getSingleAssistant } from "../../api/assistantChatPageApi"; 
import { getAssistantInfo } from "../../Utility/assistant-helper";
import { PageTitleContext } from "../../contexts/TitleContext";
import vid from '../../assests/videos/ava.mp4';
import TalkingAvatarVideo from '../../component/VoiceAgentChatPage/TalkingAvatarVideo';
import './index.css';

// api

const VoiceAgentPage = () => {
  const { assistant_id, thread_id } = useParams();
  const [assistantName, setAssistantName] = useState("");
  const { pageTitle, setPageTitle } = useContext(PageTitleContext);
  const [isInterview, setIsInterview] = useState(false);

  // ----- STATES ----- //
  const [showScrollToBottomButton, setShowScrollToBottomButton] =
    useState(false); 
  const [agentType, setAgentType] = useState(null);
  // ----- REFS ----- //
  const fileInputRef = useRef(null);
  const chatLogWrapperRef = useRef(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  //  ----- REF HANDLERS ----- //
  const scrollToBottom = () => {
    if (chatLogWrapperRef.current) {
      chatLogWrapperRef.current.scrollTo({
        top: chatLogWrapperRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // ----- HOOK & CONTEXT VARIABLES ----- //
  const {
    // STATES,
    chatLog,
    chatMetaData,
    assistantData,
    selectedFiles,
    inputPrompt,
    assistantAllInfo,
    newResponse,
    errorMessage,
    isSuccessInterview,

    // BOOLEANS
    isMessageFetching,
    isFirstMessage,
    isGeneratingResponse,
    isUploadingFile,
    isSubmitted,
    isSpeaking,
    isSubmittingInterview,
    // SETTERS,
    setChatLog,
    setChatMetaData,
    setAssistantData,
    setSelectedFiles,
    SetIsUploadingFile,
    setInputPrompt,
    setNewResponse,
    setIsSubmitted,
    setErrorMessage,
    setIsSuccessInterview,
    // API CALLS,
    handleFetchAssistantChats,
    handleFetchAssistantInfo,
    handleCreateAssistantChat,
    handleUploadFilesForAssistant,
    handleFinishInterview,
    // HANDLERS,
  } = useVoiceAgentPage({ assistant_id, thread_id, scrollToBottom });

  // ---------- constants ---------
  const userRole = getUserRole();
  const [isAssistantExistInOpenAI,setIsAssistantExistInOpenAI] = useState(false);

  const fetchAssistantData = async (assistant_id) => {
    const response = await getSingleAssistant(assistant_id);
    setAssistantName(response?.assistant.name);
    setIsInterview(response?.assistant.assistantTypes?.toLowerCase().match(/\binterview\b/) !== null);
  };

  useEffect(() => {
  }, [assistantAllInfo]);

  useEffect(() => {
	setAssistantName('');
	handleFetchAssistantInfo();
	fetchAssistantData(assistant_id);
  if(getAssistantInfo(assistant_id)){
    setIsAssistantExistInOpenAI(true);    
  }else{
    setIsAssistantExistInOpenAI(false);

  }
  }, [assistant_id]);
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

  // ----- SIDE EFFECTS ----- //

  const chatLogMemo = useMemo(() => [...chatLog], [chatLog]);

  // local logics
  const handleFileChange = (e) => {
    e.stopPropagation();
    const files = e.target.files;
    const newFiles = Array.from(files);
    setSelectedFiles([...newFiles]);
  };

  const handleFileRemove = (file) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((f) => f.name !== file.name)
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      return setInputPrompt((prevText) => prevText + "\n");
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateAssistantChat(e);
    }
  };

  // ----- LOCAL HANDLERS ----- //
  const handleInputPromptChange = (event) => {
    setInputPrompt(event);
  };

  const handleSelectStarter = (starter) => {
    setInputPrompt(starter);
  };

  const handleScrollToBottomButton = () => {
    const scrollableDiv = chatLogWrapperRef.current;

    if (scrollableDiv) {
      const isScrolledUp = scrollableDiv.scrollTop < 0;
      const isAtBottom = scrollableDiv.scrollTop === 0;

      setShowScrollToBottomButton(isScrolledUp && !isAtBottom);
    }
  };

  // determines access scope for attachments
  const hasFileAttachmentAccess = userRole === "superadmin" ? true : false;

  let isChatLogEmpty = chatLog.length === 0 ? true : false;

  useEffect(() => {
    setPageTitle((prevState) => ({
        ...prevState,
        [`/voice_agents/${assistant_id}`]: assistantName 
    }))
    if(thread_id) {
      setPageTitle((prevState) => ({
        ...prevState,
        [`/voice_agents/${assistant_id}/${thread_id}`]: assistantName 
    }))
    }
  }, [assistant_id, assistantName, setPageTitle, thread_id]);
  
  return (
    <>
      {errorMessage && (
        <div className="error-message">
          <CloseCircleOutlined className="error-icon" onClick={() => setErrorMessage(null)} />
          <div style={{ flex: 1 }}>{errorMessage}</div>
        </div>
      )}

      {isSuccessInterview && (
        <div className="success-message">
          <CheckCircleOutlined className="success-icon" onClick={() => setIsSuccessInterview(null)} />
          <div style={{ flex: 1 }}>{isSuccessInterview}</div>
        </div>
      )}

      {isSubmittingInterview && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-title">
            Processing Interview...
          </div>
          <div className="loading-subtitle">
            Please wait while we analyze your responses and submit to HR team
          </div>
        </div>
      )}

      <section className="assistantChatBox d-flex flex-column justify-content-between full-chat-area">
        <TalkingAvatarVideo 
          videoSrc={vid} 
          isSpeaking={isSpeaking}
          setIsVideoPlaying={setIsVideoPlaying}
        />
        {/* -----[START] CHAT BOX - SUBMIT INPUT ----- */}
        <VoiceAgentChatInputPrompt
          states={{
            selectedFiles,
            isUploadingFile,
            isMessageFetching,
            isGeneratingResponse,
            hasFileAttachmentAccess,
            inputPrompt,
            isVideoPlaying,
            isSubmitted,
            assistant_id,
            isSubmittingInterview,
            isInterview
          }}
          refs={{ fileInputRef }}
          actions={{
            onSubmit: handleCreateAssistantChat,
            onFileUpload: handleUploadFilesForAssistant,
            handleKeyDown,
            setSelectedFiles,
            handleFileRemove,
            handleFileChange,
            onInputPromptChange: handleInputPromptChange,
            onHandleFinishInterview: handleFinishInterview,
          }}
        />
        {/* -----[END] CHAT BOX - SUBMIT INPUT ----- */}
      </section>
    </>
  );
};

export default React.memo(VoiceAgentPage);
