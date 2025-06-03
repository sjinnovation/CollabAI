import React, { useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// libraries
import { useNavigate } from 'react-router-dom';

// hooks & contexts
import { AssistantContext } from '../contexts/AssistantContext';

import useSocket from './useSocket';
import { ASSISTANT_EVENTS } from '../constants/sockets/assistant';

// api
import {
	createChatPerAssistant,
	getAssistantChatsPerThread,
	getSingleAssistant,
	uploadFilesForAssistant,
  submitInterview,
} from '../api/assistantChatPageApi';
import { insertDataToAssistantUsage } from '../api/track-usage-api-functions';

// init constants
const initialChatMetaData = {
	has_more: false,
	first_id: false,
	last_id: false,
};

const useVoiceAgentPage = ({ assistant_id, thread_id, scrollToBottom }) => {
  // ----- STATES ----- //
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploadingFile, SetIsUploadingFile] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [chatMetaData, setChatMetaData] = useState(initialChatMetaData);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSuccessInterview, setIsSuccessInterview] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [assistantData, setAssistantData] = useState(null);
  const [assistantAllInfo, setAssistantAllInfo] = useState(null);
  // loading states
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isMessageFetching, setIsMessageFetching] = useState(false);
  const [newResponse, setNewResponse] = useState('');
	const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [isSubmittingInterview, setIsSubmittingInterview] = useState(false);
  
  const navigate = useNavigate();
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
    handleFetchAssistantInfo(assistant_id);

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
      console.log("🚀 ~ useVoiceAgentPage ~ error:", error)
    } finally {
      setIsMessageFetching(false);
    }
  };

  const handleFetchAssistantInfo = async (assistant_id) => {
    try {
      const response = await getSingleAssistant(assistant_id);
      setAssistantData(response?.assistant?.static_questions);
      setAssistantAllInfo(response?.assistant);
    } catch (error) {
      console.log("🚀 ~ handleFetchAssistantInfo ~ error:", error)
    }
  };

  const handleCreateAssistantChat = async (event) => {
    try {
      event.preventDefault();
      setIsSubmitted(true);
      
      // Get the input value from the form event
      const userPrompt = event.target.elements.inputPrompt.value.trim();
      
      // default terminations
      if (isGeneratingResponse || !userPrompt) return;

      setIsGeneratingResponse(true);
      const msg_id = uuidv4();
      setInputPrompt("");
      prependToChatLog(userPrompt, msg_id);
      await insertDataToAssistantUsage(assistant_id);
      
      const reqBody = { 
        question: userPrompt, 
        msg_id 
      };
      
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
        } else {
          setErrorMessage(
            message || "An unexpected error occurred. Please reload the page."
          );
        }
      }
    } catch (error) {
      setIsGeneratingResponse(false);
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  // Simplified speakResponse function
  const speakResponse = (text) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Basic settings
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Simple event handlers
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsSubmitted(false);
    };
    
    // Start speaking
    window.speechSynthesis.cancel(); // Cancel any ongoing speeches
    window.speechSynthesis.speak(utterance);
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
      assistant_id
    } = response;

    if (success) {
      const chat = {
        userPrompt: question,
        response: promptResponse,
        msg_id,
        thread_id: ast_thread_id,
        codeInterpreterOutput,
        assistant_id
      };

      appendBotResponseToChat(chat);

      if (isCompleted) {
        setNewResponse(promptResponse);
        // Start speaking the response
        speakResponse(promptResponse);
        
        if (!thread_id) {
          handleFirstThreadMessage(chat);
        }
      }
    } else {
      setIsGeneratingResponse(false);
      return setErrorMessage(message);
    }

    if (isCompleted) {
      setIsGeneratingResponse(false);
    }
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
    navigate(`/voice_agents/${chat.assistant_id}/${chat.thread_id}`, { replace: true });
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
      console.error("🚀 ~ handleUploadFilesForAssistant ~ Error uploading files:", error.message);
    } finally {
      SetIsUploadingFile(false);
    }
  };

  const handleFinishInterview = async (e) => {
    try {
      setIsSubmittingInterview(true);
      setErrorMessage(null); 
      setIsSuccessInterview(null);
      
      // Validation
      if (!thread_id) {
        setErrorMessage('Please start the interview first before finishing');
        setTimeout(() => setErrorMessage(null), 5000);
        return;
      }
  
      const asstArguments = {
        assistant_id,
        threadId: thread_id,
        limit: 50,
        after: false,
      };
  
      // Fetch chat messages
      const getChat = await getAssistantChatsPerThread(asstArguments);
  
      if (!getChat || !getChat.messages || getChat.messages.length === 0) {
        throw new Error('No interview messages found. Please ensure you have completed the interview.');
      } 
  
      // Format chat content
      const chatContent = getChat.messages.map(msg => 
        `User: ${msg.chatPrompt || 'No message'}\nBot: ${msg.botMessage || 'No response'}`
      ).join('\n\n');
  
      // Create structured prompt for AI analysis
      let userPrompt = `'''
        ${chatContent}
        '''
        Please make a summary for this in a json array where the json will be:
        {
          "name": "Get it from the upper ''' '''",
          "appliedPosition": "Get it from the upper ''' '''",
          "summary": "Make a summary of the upper ''' '''" in a prefessional way by which hr team can get proper idea about the interview ,
          "expertise": "Make a comma separated expertise from of the upper ''' '''",      
          "marks": "from the upper chat how much out of total",
          "recommendable": "Yes/No depend on the marks. If he/she copmlete the most of the interview part and got at least 33% marks, give 'Yes' otherwise 'No'",
        }         
      Just give a json array only and do not add anything else`;
  
      const msg_id = uuidv4();
      const reqBody = { 
        question: userPrompt, 
        msg_id 
      };
  
      // Generate AI summary
      const { success, chat, message } = await createChatPerAssistant(assistant_id, reqBody);
  
      if (!success) {
        throw new Error(message || 'Failed to generate interview summary');
      }
  
      if (!chat || !chat.response) {
        throw new Error('Invalid response received from AI analysis');
      }
  
      // Submit to HR
      const submitBody = { 
        content: chat.response,
        chatCount: getChat.messages.length
      };
      
      const response = await submitInterview(assistant_id, thread_id, submitBody);
      
      // Check if response exists and has success property
      if (response && response.success === false) {
        throw new Error(response.message || 'Failed to submit interview to HR');
      }
      
      // If we get here, the submission was successful
      setErrorMessage(null);
      setIsSuccessInterview('Interview is submitted Successfully!'); 
 
      
      // Hide popup after 5 seconds 
      setTimeout(() => setIsSuccessInterview(null), 5000);

    } catch (error) {
      setIsSuccessInterview(null);
      
      // User-friendly error messages
      let userMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message.includes('No interview messages')) {
        userMessage = 'No interview content found. Please complete the interview before submitting.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        userMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('AI response') || error.message.includes('summary format')) {
        userMessage = 'There was an issue processing your interview. Please try again in a moment.';
      } else if (error.message) {
        userMessage = error.message;
      }
  
      setErrorMessage(userMessage); 
      
      // Clear error after 8 seconds
      setTimeout(() => setErrorMessage(null), 8000);
    } finally {
      setIsSubmittingInterview(false);
    }
  };

  return {
    // STATES,
    chatLog,
    chatMetaData,
    assistantData,
    selectedFiles,
    inputPrompt,
    assistantAllInfo,
    newResponse,
    // BOOLEANS
    isMessageFetching,
    isFirstMessage,
    isGeneratingResponse,
    isUploadingFile,
    errorMessage,
    isSuccessInterview,
    isSubmitted,
    isSpeaking,
    isSubmittingInterview, 
    // SETTERS,
    setErrorMessage,
    setIsSuccessInterview,
    setChatLog,
    setChatMetaData,
    setAssistantData,
    setSelectedFiles,
    SetIsUploadingFile,
    setInputPrompt,
    setNewResponse,
    setIsSubmitted, 
    // API CALLS,
    handleFetchAssistantChats,
    handleFetchAssistantInfo,
    handleCreateAssistantChat,
    handleUploadFilesForAssistant,
    handleFinishInterview
    // HANDLERS,
  };
};

export default useVoiceAgentPage;
