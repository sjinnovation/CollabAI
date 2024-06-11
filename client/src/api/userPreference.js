import {
    API_USER_PREFERENCE_SLUG,
  } from "../constants/Api_constants";
  import { axiosSecureInstance } from "./axios";
  
  export const getUserPreferenceConfig = async () => {
    try {
      const response = await axiosSecureInstance.get(API_USER_PREFERENCE_SLUG);
      return response?.data?.configValues;
    } catch (error) {
      console.log(error);
      return;
    }
  };
  
  export const updateUserPreferenceConfig = async (data) => {
    try {
      const response = await axiosSecureInstance.patch(API_USER_PREFERENCE_SLUG, data);
      return { message: response?.data?.message };
    } catch (error) {
      return error.response.data;
    }
  };
  