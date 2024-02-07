import { axiosSecureInstance } from "./axios";
import { FETCH_PROMPT_TITLE } from "./prompt_api_constant";

export const getPromptTitle = async (threadId, setIsPromptTitleLoading) => {
    try {
      setIsPromptTitleLoading(true);
      const response = await axiosSecureInstance.post(FETCH_PROMPT_TITLE, {
        threadId: threadId,
      });
      
      return { success: true, data: response?.data?.data?.prompttitle };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    } finally {
      setIsPromptTitleLoading(false);
    }
  };