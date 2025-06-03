import { axiosOpen, axiosSecureInstance, axiosSecure } from "./axios";
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

// [POST] - @desc: handles saving interview data
export const submitInterview = async (assistant_id, thread_id, body) => {
  try {
    // Input validation
    if (!assistant_id || !thread_id) {
      throw new Error('Assistant ID and Thread ID are required');
    }

    if (!body || !body.content) {
      throw new Error('Interview content is required');
    }

    const response = await axiosSecureInstance.post(
      `api/assistants/${assistant_id}/${thread_id}/interview/`,
      body,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300;
        }
      }
    );

    return { 
      success: true, 
      data: response.data,
      message: response.data.message || 'Interview submitted successfully'
    };

  } catch (error) {
    let errorMessage = 'Failed to submit interview';
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timeout. Please try again.';
    } else if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const serverMessage = error.response.data?.message || error.response.data?.errorMessage;
      
      switch (status) {
        case 400:
          errorMessage = serverMessage || 'Invalid interview data provided';
          break;
        case 401:
          errorMessage = serverMessage || 'Authentication required. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to submit this interview';
          break;
        case 404:
          errorMessage = 'Interview or assistant not found';
          break;
        case 429:
          errorMessage = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = serverMessage || `Server error (${status})`;
      }
    } else if (error.request) {
      // Network error
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Return error object instead of throwing
    return { 
      success: false, 
      message: errorMessage,
      error: error.response?.data || error.message
    };
  }
};