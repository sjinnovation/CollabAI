import { GET_ALL_ASSISTANT_TYPE,GET_ALL_ASSISTANT_IDS } from "../constants/Api_constants"
import { axiosSecureInstance } from "./axios";
import { message } from "antd";
export const getAllAssistantType = async (setAssistantTypes) => {
    try {
        const response = await axiosSecureInstance.get(GET_ALL_ASSISTANT_TYPE());
        if (response.status === 200) {
            setAssistantTypes(response.data.data);
            return response.data.data;
        }

    } catch (error) {
        return {message : "Something went Wrong"};

    }

};

export const getAllAssistantsIds = async (userId) => {
    try {
        const response = await axiosSecureInstance.get(GET_ALL_ASSISTANT_IDS(userId));
        if (response.status === 200) {
            return response.data.allAgents;
          } else {
            throw new Error(`Unexpected response status: ${response.status}`);
          }
        } catch (error) {
          // Use optional chaining to safely access nested properties
          const errorMessage = error.response?.data?.error || error.message || "An error occurred while fetching Agents data.";
          message.error(errorMessage);
          throw error; 
        }

};