import { DELETE_ASSISTANT_THREADS, FETCH_ALL_ASSISTANTS, FETCH_ASSISTANT_THREADS, UPDATE_ASSISTANT_THREADS } from "./assistant_api_constant";
import { GET_SINGLE_ASSISTANT_INFO_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { message } from "antd";
import { getUserID } from "../Utility/service";


export const getAssistants = async (page, setAssistants, setTotalPage, setLoading, searchQuery) => {
    try {
      setLoading(true);
      const { data } = await axiosSecureInstance.get(FETCH_ALL_ASSISTANTS(page,searchQuery ));
      if(searchQuery) {
        setAssistants(() => [ ...data?.assistants ||[]]);
      } else {
        setAssistants((prevAssistants) => [...prevAssistants, ...data?.assistants ||[]]);
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
        setAssistants(() => [ ...data?.assistants ||[]]);
      } else {
        setAssistants((prevAssistants) => [...prevAssistants, ...data?.assistants ||[]]);
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
  
    if (userId === null) {
      return <p>Loading...</p>;
  
    } else {
      try {
        const response = await axiosSecureInstance.get(GET_SINGLE_ASSISTANT_INFO_SLUG(assistantId));
        const checkPublic = await response.data?.assistant?.is_public
        const userIdFromResponse = await response.data?.assistant?.userId?._id
        const findOrganizational = await response.data?.assistant?.category ;

        if(findOrganizational ==="ORGANIZATIONAL" ){
          setIsOrganizational(true);

        }

        if (userId == userIdFromResponse) {
          setCheckUser(true);
        }
        setIsPublic(checkPublic);
        setLoading(false);
      } catch (error) {
        throw new Error(error);
      }
    }
  
  };