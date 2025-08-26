import { 
  GET_AI_SUGGESTION_SETTINGS, 
  UPDATE_AI_SUGGESTION_SETTINGS, 
  GET_AI_SUGGESTION_BATCH_PROCESSING, 
  UPDATE_AI_SUGGESTION_BATCH_PROCESSING, 
  RUN_AI_SUGGESTION_BATCH_PROCESSING, 
  GET_AI_SUGGESTIONS_FOR_USER,
  GET_ASSISTANT_SUGGESTIONS_FOR_USER
} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { message } from "antd";

// Get AI Suggestion Settings
export const getAISuggestionSettings = async (setSettings, setLoading) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.get(GET_AI_SUGGESTION_SETTINGS());
    
    if (response.data) {
      setSettings(response.data.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error fetching AI suggestion settings:", error);
    message.error("Failed to fetch AI suggestion settings");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Update AI Suggestion Settings
export const updateAISuggestionSettings = async (settings, setLoading, onSuccess) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.patch(UPDATE_AI_SUGGESTION_SETTINGS(), settings);
    
    if (response.data.data) {
      message.success("AI suggestion settings updated successfully");
      if (onSuccess) onSuccess(response.data.data);
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    console.error("Error updating AI suggestion settings:", error);
    message.error("Failed to update AI suggestion settings");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Get AI Suggestion Batch Processing
export const getAISuggestionBatchProcessing = async (setBatchProcessing, setLoading) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.get(GET_AI_SUGGESTION_BATCH_PROCESSING());
    
    if (response.data) {
      setBatchProcessing(response.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error fetching AI suggestion batch processing:", error);
    console.error("error.response.data.message ", error.response.data.message);
    message.error(error.response.data.message || "Failed to fetch batch processing data");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Update AI Suggestion Batch Processing
export const updateAISuggestionBatchProcessing = async (batchId, updates, setLoading, onSuccess) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.patch(UPDATE_AI_SUGGESTION_BATCH_PROCESSING(), {
      batchId,
      updates
    });
    
    if (response.data) {
      message.success("Batch processing updated successfully");
      if (onSuccess) onSuccess(response.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error updating AI suggestion batch processing:", error);
    message.error("Failed to update batch processing");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Run AI Suggestion Batch Processing
export const runAISuggestionBatchProcessing = async (setLoading, onSuccess) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.get(RUN_AI_SUGGESTION_BATCH_PROCESSING());
    
    if (response.data) {
      message.success("Batch processing started successfully");
      if (onSuccess) onSuccess(response.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error running AI suggestion batch processing:", error);
    // message.error("Failed to start batch processing");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
}; 

export const getAIUserSuggestions = async (userId, setLoading) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.get(GET_AI_SUGGESTIONS_FOR_USER(userId));
    
    if (response.data) {
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error fetching AI suggestions for user:", error);
    message.error("Failed to fetch AI suggestions for user");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

export const getAIUserAgentSuggestions = async (userId, setLoading) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.get(GET_ASSISTANT_SUGGESTIONS_FOR_USER(userId));
    if (response?.data) {
      return { success: true, data: response?.data?.data || [] };
    }
  } catch (error) {
    console.error("Error fetching AI suggestions for user:", error);
    message.error(error.response?.data?.message || "Failed to fetch AI suggestions for user");
    return { success: false, data: [], error };
  } finally {
    setLoading(false);
  }
};