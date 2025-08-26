import { DELETE_ASSISTANT_THREADS, FETCH_ALL_ASSISTANTS, FETCH_ASSISTANT_THREADS, UPDATE_ASSISTANT_THREADS, FETCH_N8N_WORKFLOWS, SAVE_SELECTED_WORKFLOWS } from "./assistant_api_constant";
import { GET_SINGLE_ASSISTANT_INFO_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { message } from "antd";
import { getUserID } from "../Utility/service";
import { getN8nWorkflows } from "./user";


export const getAssistants = async (page, setAssistants, setTotalPage, setLoading, searchQuery) => {
    try {
      setLoading(true);
      const { data } = await axiosSecureInstance.get(FETCH_ALL_ASSISTANTS(page,searchQuery ));
      if(searchQuery) {
        setAssistants(() => [ ...data?.assistantList ||[]]);
      } else {
        setAssistants((prevAssistants) => [...prevAssistants, ...data?.assistantList ||[]]);
      }
      setTotalPage(data?.totalPages);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };
  export const getAssistantsWithoutPageSetup = async (page, setAssistants, setTotalPage, setLoading, searchQuery) => {
    try {
      setLoading(true);
      const { data } = await axiosSecureInstance.get(FETCH_ALL_ASSISTANTS(page,searchQuery ));
      if(searchQuery) {
        setAssistants(() => [ ...data?.assistantList ||[]]);
      } else {
        setAssistants((prevAssistants) => [...prevAssistants, ...data?.assistantList ||[]]);
      }
      setTotalPage(data?.totalPages);
      return { success: true, data };
    } catch (error) {
      setLoading(false);
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  export const getAssistantChatThread = async (assistant_id, setChatThread, setTriggerUpdateThreads) => {
    try {
      const response = await axiosSecureInstance.get(FETCH_ASSISTANT_THREADS(assistant_id));
      if (response?.data?.data) {
        setChatThread(response.data.data);
        return { success: true, data: response?.data?.data?.prompts };

      }
    } catch (error) {
      setChatThread([]);
      return { success: false, error};

    } finally {
      setTriggerUpdateThreads(false);

    }
  };

  export const updateThread = async (thread_mongo_id, editedValue, setPromptTitle, setActiveEditPrompt, setIsPromptTitleLoading) => {
    try {
      setIsPromptTitleLoading(true);
      const response = await axiosSecureInstance.patch(UPDATE_ASSISTANT_THREADS(thread_mongo_id), {
        title: editedValue,
      });
  
      if (response.data) {
        setPromptTitle(editedValue);
        message.success('Success! Updated thread.');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setActiveEditPrompt(false);
      setIsPromptTitleLoading(false);
    }
  };


  export const deleteAssistantThread = async (thread_mongo_id, setDeletedAssistantThreadId, setIsThreadDeleting) => {
    try {
      setIsThreadDeleting(true);
      const response = await axiosSecureInstance.delete(DELETE_ASSISTANT_THREADS(thread_mongo_id));
  
      if (response.data) {
        setDeletedAssistantThreadId(thread_mongo_id);
        message.success(response.data.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsThreadDeleting(false);
    }
  };

  export const getAssistantInfo = async (userId, assistantId, setCheckUser, setIsPublic, setLoading,setIsOrganizational) => {

    try {
      const response = await axiosSecureInstance.get(GET_SINGLE_ASSISTANT_INFO_SLUG(assistantId));
      const assistant = response.data?.assistant;
  
      if (assistant) {
  
        if (assistant.category === "ORGANIZATIONAL") {
          setIsOrganizational(true);
        } else {
          setIsOrganizational(false);
        }
        if (userId) {
          setCheckUser(userId === assistant.userId?._id);
        }
  
        if (assistant.is_public) {
          setIsPublic(true);
  
          localStorage.setItem("isPublic", "true");
        } else {
          setIsPublic(false);

          localStorage.removeItem("isPublic");
        }
      } else {
        console.warn("No assistant data found.");
      }
    } catch (error) {
      console.error("Error fetching assistant info:", error);
    } finally {
      setLoading(false);
    }
  };

// n8n workflow related functions
export const fetchN8nWorkflows = async (secretKey, assistant_id, isExistingKey = false) => {
  try {
    // For existing key, use the user-based API
    if (isExistingKey) {
      const userId = getUserID();
      const response = await getN8nWorkflows(userId);
      
      if (response.data.success && Array.isArray(response.data.workflows)) {
        return { success: true, workflows: response.data.workflows };
      } else {
        return { success: false, workflows: [], message: response.data.message || 'No workflows found' };
      }
    } else {
      // For new key validation, use the assistant-based API
      const response = await axiosSecureInstance.post(FETCH_N8N_WORKFLOWS(), {
        secretKey: secretKey,
        assistant_id: assistant_id,
        isExistingKey: isExistingKey
      });
      
      if (response.data.success && Array.isArray(response.data.workflows)) {
        return { success: true, workflows: response.data.workflows };
      } else {
        return { success: false, workflows: [], message: response.data.message || 'No workflows found' };
      }
    }
  } catch (error) {
    console.error('Error fetching workflows:', error);
    if (error.response?.status === 401) {
      return { success: false, error: 'Invalid secret key. Please check your n8n API key.' };
    } else {
      return { success: false, error: error.response?.data?.message || 'Failed to fetch workflows. Please check your secret key.' };
    }
  }
};

export const saveSelectedWorkflows = async (assistant_id, workflowIds) => {
  try {
    const response = await axiosSecureInstance.post(SAVE_SELECTED_WORKFLOWS(assistant_id), {
      workflowIds: workflowIds
    });
    
    if (response.data.success) {
      message.success('Selected workflows saved successfully!');
      return { success: true };
    } else {
      return { success: false, error: 'Failed to save selected workflows' };
    }
  } catch (error) {
    console.error('Error saving selected workflows:', error);
    message.error('Failed to save selected workflows');
    return { success: false, error: 'Failed to save selected workflows' };
  }
};