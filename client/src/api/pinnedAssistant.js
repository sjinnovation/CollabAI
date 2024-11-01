import { UPDATE_SINGLE_ASSISTANT_API, GET_ALL_PINNED_ASSISTANT, ADD_PINNED_ASSISTANT, SINGLE_PINNED_ASSISTANT_DETAILS, GET_SINGLE_PINNED_ASSISTANT, PUT_SINGLE_PINNED_ASSISTANT, DELETE_SINGLE_PINNED_ASSISTANT,DELETE_MANY_PINNED_ASSISTANT } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { getUserID } from "../Utility/service";
import { message, Spin } from "antd";
import { AssistantAddedToPinnedList,AssistantFailedToAddToPinList,AssistantAlreadyInPinnedList,AssistantRemovedFromPinnedList } from "../constants/PublicAndPrivateAssistantMessages";
export const fetchSinglePinnedAssistant = async (setPinnedAssistant) => {
  try {

    const response = await axiosSecureInstance.get(SINGLE_PINNED_ASSISTANT_DETAILS(getUserID()));
    const data = response.data.result;
    setPinnedAssistant(data)
    return { success: true, data: data }
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  };

};
export const deletePinnedAssistant = async (assistantId, id, userId, updatePinStatus,fromOrganizationalPage = false,fromModal = false) => {
  try {
    const checkPinnedAssistantAvailability = await axiosSecureInstance.get(GET_SINGLE_PINNED_ASSISTANT(assistantId));
    if (checkPinnedAssistantAvailability && checkPinnedAssistantAvailability?.data !== null ) {
      const endPoint = (fromOrganizationalPage == true)?DELETE_MANY_PINNED_ASSISTANT(assistantId) : DELETE_SINGLE_PINNED_ASSISTANT(assistantId,userId);
      const resp = await axiosSecureInstance.delete(endPoint);
      if(fromOrganizationalPage === false && fromModal === false){
        message.success(resp.data.message);

      }
    }

    return { success: true,message : 'unpinned' }

  } catch (error) {
    return { success: false, message: error?.response?.data?.message };

  }

};


export const addPinnedAssistant = async (assistant_id, id, users_id, updatePinStatus) => {
  try {
    const response = await axiosSecureInstance.post(ADD_PINNED_ASSISTANT(), {
      "assistantId": assistant_id,
      "userId": users_id,
    });

    if (response.status === 201 || response.status === 200) {
      message.success(response.data.message);
      return { data: response.data };
    } else if (response.status === 400) {
      message.error(AssistantAlreadyInPinnedList);
      return { error: AssistantFailedToAddToPinList };
    } else {
      message.error(AssistantAlreadyInPinnedList);
      return { error: AssistantFailedToAddToPinList };
    }
  } catch (error) {
    return { error: error?.response?.data }
  };
};



export const getPinnedAssistant = async () => {
  try {
    const response = await axiosSecureInstance.get(SINGLE_PINNED_ASSISTANT_DETAILS(getUserID()));
    if (response.data) {
      return response.data;
    }

  } catch (error) {
    throw new Error(error);
  }

};