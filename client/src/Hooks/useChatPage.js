import React, { useState } from "react";

// libraries
import {message as AntdMessage} from "antd";
import { getChatsPerThread, getTags, getTemplates } from "../api/chat-page-api";
import { axiosSecureInstance } from "../api/axios";
import { UPDATE_LAST_PROMPT } from "../api/prompt_api_constant";

const useChatPage = () => {
  // ----- STATES ----- //
  const [chatLog, setChatLog] = useState([]);
  const [isFirstMessage, setIsFirstMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isFetchingChatLog, setIsFetchingChatLog] = useState();
  const [tagList, setTagList] = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);


// ----- HANDLE API CALLS ----- //
  
const fetchChatLogPerThread = async (thread_id) => {
    try {
      setIsFetchingChatLog(true);
      const { success, message, chats } = await getChatsPerThread(thread_id);
      console.log("UseChatPage: CHATS:", chats)
      
      if (success) {
        let formattedChatLog = chats?.map((chat, index) => {
          return {
            chatPrompt: chat.description,
            botMessage: chat.promptresponse,
            tags: chat.tags,
            msgId: chat._id,
            tokenused: chat.tokenused,
            modelused: chat.modelused,
            botProvider: chat?.botProvider,
            promptId: chat._id,
            threadId: chat.threadid
          };
        });
        //   setChatLogTimings(chatTimings);
        setChatLog(formattedChatLog);
      } else {
        AntdMessage.error(message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsFetchingChatLog(false);
    }
  };
  
  const fetchTagList = async () => {
    try {
      const { success, tags, message } = await getTags();
      if (success) {
        setTagList(tags);
      } 
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { success, message, templates } = await getTemplates();

      if(success) {
        setTemplateCategories(templates);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const updateLastPrompt = async (promptId, newPrompt) => {
    try {
      setIsGeneratingResponse(true)
      const response = await axiosSecureInstance.patch(UPDATE_LAST_PROMPT(promptId), {userPrompt: newPrompt});
      setIsGeneratingResponse(false)
      return {
        success: true,
        data: response.data?.data
      }
    } catch (error) {
      console.log(error);
      setIsGeneratingResponse(false)
      return { success: false, error };
    } finally {
      setIsGeneratingResponse(false)
    }
    
  };


  return {
    //STATES,
    chatLog,
    templateCategories,
    tagList,
    errorMessage,
    isFetchingChatLog,
    isFirstMessage,
    isGeneratingResponse,
    //SETTERS,
    setChatLog,
    setErrorMessage,
    setTagList,
    setIsFetchingChatLog,
    setIsFirstMessage,
    setIsGeneratingResponse,
    //HANDLERS,
    fetchChatLogPerThread,
    fetchTagList,
    fetchTemplates,
    updateLastPrompt
  }
}

export default useChatPage