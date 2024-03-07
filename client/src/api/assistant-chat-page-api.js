import { axiosOpen, axiosSecureInstance } from "./axios";
import axios from "axios";
// [POST] - @desc: handles creating a new chat per assistant
export const createChatPerAssistant = async (assistant_id, body) => {
  try {
    const response = await axiosSecureInstance.post(
      `api/assistants/${assistant_id}/chats`,
      body,
     
    );

    return { success: true, chat: response.data };
  } catch (error) {
    console.log("🚀 ~ createChatPerAssistant ~ error:", error);
    return { success: false, message: error?.response?.data?.errorMessage || error?.response?.data?.message };
  }
};

// [GET] - @desc: handles fetching assistant chats per thread
export const getAssistantChatsPerThread = async ({
  assistant_id,
  threadId,
  limit = 30,
  after = false,
}) => {
  try {
    let query = `thread_id=${threadId}&limit=${limit || 30}`;

    if (after) {
      query += `&after=${after}`;
    }

    const response = await axiosSecureInstance.get(
      `api/assistants/${assistant_id}/chats?${query}`
    );
    console.log("🚀 ~ getAssistantChatsPerThread ~ response:", response);

    return {
      messages: response.data.messages || [],
      metadata: response.data.metadata || {},
    };
  } catch (error) {
    console.log("🚀 ~ getAssistantChatsPerThread ~ error:", error);
    return;
  }
};

// [GET] - @desc: handles fetching single assistant info
export const getSingleAssistant = async (assistant_id) => {
  try {
    const response = await axiosSecureInstance.get(
      `api/assistants/${assistant_id}/info`
    );
    return { assistant: response.data.assistant };
  } catch (error) {
    console.log("🚀 ~ getSingleAssistant ~ error", error);
    return;
  }
};

// [POST] - @desc: handles uploading files to an assistant
export const uploadFilesForAssistant = async (assistant_id, body) => {
  try {
    const response = await axiosOpen.post(
      `api/assistants/${assistant_id}/files`,
      body,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return { success: response.data ? true : false };
  } catch (error) {
    console.log("🚀 ~ uploadFilesForAssistant ~ error:", error);
    return;
  }
};
