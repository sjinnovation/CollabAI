import React, { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// libraries
import { useLocation, useNavigate } from 'react-router-dom';

// hooks & contexts
import { AssistantContext } from '../contexts/AssistantContext';

import useSocket from '../Hooks/useSocket';
import { ASSISTANT_EVENTS } from '../constants/sockets/assistant';

// api
import {
	createChatPerAssistant,
	getAssistantChatsPerThread,
	getSingleAssistant,
	stopGeneratingResponseForAssistant,
	uploadFilesForAssistant,
} from '../api/assistantChatPageApi';
import { insertDataToAssistantUsage } from '../api/track-usage-api-functions';
import { FileContext } from '../contexts/FileContext';
import { SidebarContext } from '../contexts/SidebarContext';

// init constants
const initialChatMetaData = {
	has_more: false,
	first_id: false,
	last_id: false,
};
const initialAppValues ={
  "appName":'',
  "fileIdOrUrl":'',
  "fileName" :'',
}

const useAssistantsChatPage = ({ assistant_id=null, thread_id=null, scrollToBottom=null }) => {
  const prevThreadId = thread_id;
  // ----- STATES ----- //
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadingFile, SetIsUploadingFile] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatMetaData, setChatMetaData] = useState(initialChatMetaData);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [assistantData, setAssistantData] = useState(null);
  const [assistantAllInfo, setAssistantAllInfo] = useState(null);
  const [assistantAllData, setAssistantAllData] = useState(null);
  // loading states
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isMessageFetching, setIsMessageFetching] = useState(false);
  const {selectedFileAppWithFileId,setSelectedFileAppWithFileId}= useContext(FileContext);
  const {setShowMenu} = useContext(SidebarContext)

  const [runIdToStopRun, setRunIdToStopRun] = useState("");
  const [threadIdToStopRun, setThreadIdToStopRun] = useState("");

  
  const navigate = useNavigate();
  const location = useLocation();
  const { triggerUpdateThreads, setTriggerUpdateThreads } =
    useContext(AssistantContext);

  // Get a ref to the socket instance
  const chatSocketRef = useSocket(ASSISTANT_EVENTS.ASSISTANT_NAMESPACE);

  useEffect(() => {
    console.log("[MOUNT] assistants");
    if (thread_id && !isFirstMessage) {
      setChatLog([]);
      setChatMetaData(initialChatMetaData);
      handleFetchAssistantChats(false, false, thread_id);
    } else if (thread_id && isFirstMessage) {
      setIsFirstMessage(false);
    } else if (!thread_id) {
      setChatLog([]);
      setChatMetaData(initialChatMetaData);
      setIsFirstMessage(false);
    }
    if(assistant_id){
      handleFetchAssistantInfo(assistant_id);

    }

    return () => {
      console.log("[UNMOUNT] assistants");
    };
  }, [thread_id]);

  // [SOCKET] - setting listener for sockets
  useEffect(() => {
    const bindSocketEvents = () => {
      const chatSocket = chatSocketRef.current;
      chatSocket?.on(
        ASSISTANT_EVENTS.CREATED_ASSISTANT_CHAT,
        onChatCreatedEvent
      );
    };

    const unbindSocketEvents = () => {
      const chatSocket = chatSocketRef.current;
      chatSocket?.off(
        ASSISTANT_EVENTS.CREATED_ASSISTANT_CHAT,
        onChatCreatedEvent
      );
    };

    bindSocketEvents();
    return unbindSocketEvents;
  }, [chatSocketRef.current]);

  // ----- HANDLE API CALLS ----- //
  const handleFetchAssistantChats = async (
    limit = false,
    after = false,
    threadId
  ) => {
    if (!threadId) return;
    try {
      setIsMessageFetching(true);

      const asstArguments = {
        assistant_id,
        threadId,
        limit,
        after,
      };

      const response = await getAssistantChatsPerThread(asstArguments);
      if (response.messages) {
        setChatLog((prevChatLog) => {
          if (prevChatLog.length) {
            if (chatMetaData?.first_id !== response.metadata?.first_id) {
              return [...prevChatLog, ...response.messages];
            } else {
              return prevChatLog;
            }
          } else {
            return response.messages;
          }
        });
        setChatMetaData(response.metadata);
      }
    } catch (error) {
      console.log("🚀 ~ useAssistantsChatPage ~ error:", error)
    } finally {
      setIsMessageFetching(false);
    }
  };

  const handleFetchAssistantInfo = async (assistant_id) => {
    try {
      const response = await getSingleAssistant(assistant_id);
      setAssistantData(response?.assistant?.static_questions);
      setAssistantAllInfo(response?.assistant);
      setAssistantAllData(response?.assistant);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCreateAssistantChat = async (event) => {
    try {
      event.preventDefault();
      let userPrompt = inputPrompt.trim();
      const pattern = /\[\[comment:\s*([^\]]+)\]\]/g;
      const checkPrompt = userPrompt

      let matchedComments = '';
      let cleanText = checkPrompt.replace(pattern, (match, p1) => {
        matchedComments = p1.trim(); // Capture the comment part (p1) and trim any extra spaces
        return ''; // Removing the matched portion from the text
      });

      let promptWithFileIdOrUrl = '';

      if(selectedFileAppWithFileId.appName !== '' && selectedFileAppWithFileId.appName === 'WorkBoard'){
        if(matchedComments !== ''){
          promptWithFileIdOrUrl = selectedFileAppWithFileId.fileName !==''?'WorkBoardUpdateComment :'+matchedComments+',appName : '+selectedFileAppWithFileId.appName+',fileIdOrUrl :'+selectedFileAppWithFileId.fileIdOrUrl+' ,fileName :'+selectedFileAppWithFileId.fileName +' : '+' show me the latest comments only':userPrompt;
        }else{
          promptWithFileIdOrUrl = selectedFileAppWithFileId.fileName !==''?'WorkBoardUpdateComment :'+matchedComments+',appName : '+selectedFileAppWithFileId.appName+',fileIdOrUrl :'+selectedFileAppWithFileId.fileIdOrUrl+' ,fileName :'+selectedFileAppWithFileId.fileName +' : '+userPrompt :userPrompt;

        }

      }else if(selectedFileAppWithFileId.appName !== '' && selectedFileAppWithFileId.appName === 'GoogleDrive'){
        promptWithFileIdOrUrl = 'appName : '+selectedFileAppWithFileId.appName+',fileIdOrUrl : https://drive.google.com/file/d/1JYFyZnVjx9CD8yx3U6aHsQcmoK7kAJ3a/view ,fileName :cdfhdghyer5y45 : '+userPrompt ;
      }else if(selectedFileAppWithFileId.appName !== '' && selectedFileAppWithFileId.appName === 'ImportWebPages'){
        promptWithFileIdOrUrl = selectedFileAppWithFileId.fileName !==''?'appName : '+selectedFileAppWithFileId.appName+',fileIdOrUrl :'+selectedFileAppWithFileId.fileIdOrUrl+' ,fileName :'+selectedFileAppWithFileId.fileName +' : '+userPrompt :userPrompt;
      }else{
        promptWithFileIdOrUrl = userPrompt;
      }

      userPrompt = selectedFileAppWithFileId.fileName !==''?selectedFileAppWithFileId.fileName +' : '+userPrompt :userPrompt;
      
      // default terminations
      if (isGeneratingResponse || !userPrompt) return;

      setIsGeneratingResponse(true);
      const msg_id = uuidv4();
      setInputPrompt("");
      prependToChatLog(userPrompt, msg_id);
      await insertDataToAssistantUsage(assistant_id)
      const reqBody = { question: promptWithFileIdOrUrl, msg_id };      
      if (thread_id) reqBody.thread_id = thread_id;

      if (assistant_id) reqBody.assistant_id = assistant_id;
      // Access the chat namespace socket if needed
      const chatSocket = chatSocketRef.current;
      if (chatSocket) {
        chatSocket.emit(ASSISTANT_EVENTS.CREATE_ASSISTANT_CHAT, reqBody);
      } else {
        const { success, chat, message } = await createChatPerAssistant(
          assistant_id,
          reqBody
        );

        if (success) {
          onChatCreatedEvent({
            ...reqBody,
            success,
            promptResponse: chat?.response,
            isCompleted: true,
            thread_id: chat?.thread_id,
          });
					event.target.blur();
        } else {
          setErrorMessage(
            message || "An unexpected error occurred. Please reload the page."
          );
        }
      }
    } catch (error) {
      console.log("🚀 ~ handleCreateAssistantChat ~ error:", error)
      setIsGeneratingResponse(false);
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

	const onChatCreatedEvent = (response) => {
    const {
      success,
      message,
      question,
      promptResponse,
      codeInterpreterOutput,
      msg_id,
      thread_id: ast_thread_id,
      isCompleted,
      assistant_id,
      runId
    } = response;
    console.log("🚀 ~ onChatCreatedEvent ~ response:", response)
    if (success) {
      setRunIdToStopRun(runId)
      setThreadIdToStopRun(ast_thread_id)
      const chat = {
        userPrompt: question,
     		response: promptResponse,
      	msg_id,
				thread_id: ast_thread_id,
				codeInterpreterOutput,
        assistant_id
      };

      appendBotResponseToChat(chat);

			if(isCompleted) {
				if (!thread_id || (prevThreadId !== ast_thread_id)) handleFirstThreadMessage(chat);
      setRunIdToStopRun('')
      setThreadIdToStopRun('')
			}
    } else {
      setRunIdToStopRun('')
      setThreadIdToStopRun('')
      setIsGeneratingResponse(false);
      return setErrorMessage(message);
    }

    isCompleted && setIsGeneratingResponse(false);
  };

  const prependToChatLog = (userPrompt, id) => {
    setChatLog([{ chatPrompt: userPrompt, msg_id:id, botMessage: "" }, ...chatLog]);
  };

	const appendBotResponseToChat = (chat) => {
		setChatLog(prevChatLog => {
			const index = prevChatLog.findIndex(message => message.msg_id === chat.msg_id);
	
			if (index !== -1) {
				const newChatLog = [...prevChatLog];
				newChatLog[index] = {
					...newChatLog[index],
					botMessage: chat.response,
					codeInterpreterOutput: chat.codeInterpreterOutput
				};
				return newChatLog;
			}
	
			// If the message is not found, just return the previous chat log
			return prevChatLog;
		});

    // after updating, scroll to bottom
    scrollToBottom();
	};

  const handleFirstThreadMessage = (chat) => {
    setIsFirstMessage(true);
    setTriggerUpdateThreads(true);
    const currentSearch = location.search;
    if (location.pathname.startsWith("/agents/")) { 
      setShowMenu(true)
    }
    navigate(`/agents/${chat.assistant_id}/${chat.thread_id}${currentSearch}`, { replace: true });
  };

  // [POST] - @desc: handles uploading files to the assistant
  const handleUploadFilesForAssistant = async (e) => {
    e.stopPropagation();
    if (!selectedFiles.length) return;
    try {
      SetIsUploadingFile(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await uploadFilesForAssistant(assistant_id, formData);

      setSelectedFiles([]);
      // toast("Files uploaded to the assistant successfully.");
    } catch (error) {
      console.error("Error uploading files:", error.message);
      // toast(error.message
    } finally {
      SetIsUploadingFile(false);
    }
  };

  const stopGeneratingResponse = async() => {
    const payload = {
      threadId: threadIdToStopRun,
      runId: runIdToStopRun
    }
    const response = await stopGeneratingResponseForAssistant(payload)
    return response
  };

  return {
    // STATES,
    chatLog,
    chatMetaData,
    assistantData,
    selectedFiles,
    inputPrompt,
    assistantAllInfo,
    assistantAllData,
    selectedFileAppWithFileId,
    runIdToStopRun,
    threadIdToStopRun,
    // BOOLEANS
    isMessageFetching,
    isFirstMessage,
    isGeneratingResponse,
    isUploadingFile,
    errorMessage,
    // SETTERS,
    setErrorMessage,
    setChatLog,
    setChatMetaData,
    setAssistantData,
    setSelectedFiles,
    SetIsUploadingFile,
    setInputPrompt,
    setSelectedFileAppWithFileId,
    // API CALLS,
    handleFetchAssistantChats,
    handleFetchAssistantInfo,
    handleCreateAssistantChat,
    handleUploadFilesForAssistant,
    stopGeneratingResponse
    // HANDLERS,
  };
};

export default useAssistantsChatPage;
