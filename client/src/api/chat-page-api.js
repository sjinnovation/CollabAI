import { getUserID } from "../Utility/service";
import { axiosSecureInstance } from "./axios";

export const getGptResponse = async (body) => {

  try {
    const response = await axiosSecureInstance.post(
      `api/prompt/getprompt/${getUserID()}`,
      body
    );

    return {
      success: true,
      promptResponse: response.data?.data?.promptResponse || "",
      modelUsed: response.data?.data?.modelUsed,
      tokenUsed: response.data?.data?.tokenUsed,
      message: response?.data?.message,
    };
  } catch (error) {
    console.log("🚀 ~ getGptResponse ~ error:", error);
    return { success: false, message: error?.response?.data?.message };
  }
};


export const getChatsPerThread = async (thread_id) => {
  try {
    const response = await axiosSecureInstance.get(
      `api/prompt/fetchprompts/${thread_id}`
    );

    return { success: true, chats: response.data?.data || [] };
  } catch (error) {
    console.log("🚀 ~ getChatsPerThread ~ error:", error);
    return { success: false,  message: error?.response?.data?.message };
  }
}

export const getTags = async () => {
  try {
    const response = await axiosSecureInstance.get(
      `/api/meetingTypes/get-all`
    );

    return { success: true, tags: response.data?.meetingTypes || [] } || [];
  } catch (error) {
    console.log("🚀 ~ getTags ~ error:", error);
    return { success: false,  message: error?.response?.data?.message };
  }
}

export const getTemplates = async () => {
  try {
    const response = await axiosSecureInstance.get(
      "/api/template/get-templates"
    );

    return { success: true, templates: response?.data?.templates || [] }
  } catch (error) {
    console.log("🚀 ~ getTemplates ~ error:", error);
    
    return { success: false,  message: error?.response?.data?.message };
  }
 };