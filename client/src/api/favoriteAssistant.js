import { GET_ALL_FAVORITE_ASSISTANT, ADD_FAVORITE_ASSISTANT, SINGLE_FAVORITE_ASSISTANT_DETAILS, GET_SINGLE_FAVORITE_ASSISTANT, PUT_SINGLE_FAVORITE_ASSISTANT, DELETE_SINGLE_FAVORITE_ASSISTANT, UPDATE_ASSISTANT_PUBLIC_STATE_CHECK, UPDATE_SINGLE_PUBLIC_ASSISTANT, GET_ALL_FAVORITE_ASSISTANT_BY_USER } from "../constants/Api_constants";

import { axiosSecureInstance } from "./axios";
import { getUserID } from "../Utility/service";
import { message, Spin } from "antd";

export const fetchSingleFavoriteAssistant = async (setFavoriteAssistant,setIsLoading,setTotalCount,page,searchQuery) => {
  setIsLoading(true);
  try {
    const pageSize = 10;

    const response = await axiosSecureInstance.get(SINGLE_FAVORITE_ASSISTANT_DETAILS(getUserID(),page,pageSize,searchQuery));
    const data = response.data.result;
    setTotalCount(response.data.totalCount);
    setFavoriteAssistant(data)
    return { success: true, data: data }
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }finally{
    setIsLoading(false);

  }

};

export const fetchFavoriteAssistantByUser = async (setFavoriteAssistant,setIsLoading,setTotalCount,page, pageSize = 10) => {
  setIsLoading(true);
  try {
    const pageSize = 10;

    const response = await axiosSecureInstance.get(GET_ALL_FAVORITE_ASSISTANT_BY_USER(getUserID(),page,pageSize));
    const data = response.data.result;
    setTotalCount(response.data.totalCount);
    setFavoriteAssistant(data)
    return { success: true, data: data }
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }finally{
    setIsLoading(false);
  }
};

export const deleteFavoriteAssistant = async (assistantId) => {
  try {
    const resp = await axiosSecureInstance.delete(DELETE_SINGLE_FAVORITE_ASSISTANT(assistantId));
    if (resp.status === 200 || resp.status === 201) {
      message.success(resp.data.message);
      return { success: true, message: resp.data.message }
    }
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };

  }

};


export const addFavoriteAssistant = async (assistantId, users_id) => {
  try {
    const response = await axiosSecureInstance.post(ADD_FAVORITE_ASSISTANT(), {
      "assistant_id": assistantId,
      "user_id": users_id
    });

    const resp = await axiosSecureInstance.patch(UPDATE_SINGLE_PUBLIC_ASSISTANT(assistantId), {
      assistant_id: assistantId,
      count: 1,
    });

    if (response.status === 201 || response.status === 200) {
      message.success("Added to your favorite list");
      return { data: response.data };
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      message.error("It's already in your favorite List");
    } else {
      message.error("Assistant adding failed.");
    }
    return { error: error?.response?.data }
  };
};



export const getFavoriteAssistant = async () => {
  try {
    const response = await axiosSecureInstance.get(SINGLE_FAVORITE_ASSISTANT_DETAILS(getUserID()));
    if (response.data) {

      return response.data;

    }

  } catch (error) {
    throw new Error(error);
  }

};