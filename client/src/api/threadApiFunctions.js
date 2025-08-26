import { axiosSecureInstance } from "./axios";
import { DELETE_A_CHAT_THREAD, FETCH_ALL_CHAT_THREADS, UPDATE_A_CHAT_THREAD } from "./prompt_api_constant";


export const getChatThread = async (userid, setChatThread,assistantIdLinked=null,folderId=null) => {
  if (!userid) {
    return null;
}
  try {
    const response = await axiosSecureInstance.get(FETCH_ALL_CHAT_THREADS(userid,assistantIdLinked,folderId));
    console.log("response of chat thread: ",response);
    setChatThread([]);
    setChatThread(response?.data?.data?.prompts);
    return { success: true, data: response?.data?.data?.prompts };
  } catch (error) {
    console.log(error);
    setChatThread([]);
    return { success: false, error };
  }
};

export const clearConversation = async (threadId, setRemoveThreadId, navigate, setShow, setIsThreadDeleting,projectId=null) => {
  console.log(threadId)
  try {
    
    setIsThreadDeleting(true);
    const response = await axiosSecureInstance.put(DELETE_A_CHAT_THREAD(), {
      threadid: threadId,
      projectId : projectId
    });

    if (response.data) {
      console.log(response);
      setRemoveThreadId(threadId);
      if(projectId){
        
        navigate(`/projects/${projectId}`, { replace: true });

      }else{
        navigate(`/chat`, { replace: true });
      }      
    }
  } catch (error) {
    console.log(error);
  } finally {
    setIsThreadDeleting(false);
    setShow(false);
  }
};


export const updatePrompt = async (threadId, editedValue, setPromptTitle, setActiveEditPrompt) => {
  try {
    const response = await axiosSecureInstance.put(UPDATE_A_CHAT_THREAD(), {
      threadId: threadId,
      title: editedValue,
    });
    if (response?.data?.success) {
      setPromptTitle(editedValue);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setActiveEditPrompt(false);
  }
};