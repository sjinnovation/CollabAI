import {
  API_SETTINGS_SLUG,
} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

export const getConfig = async () => {
  try {
    const response = await axiosSecureInstance.get(API_SETTINGS_SLUG);
    return response?.data?.configValues;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const updateConfig = async (data) => {
  try {
    const response = await axiosSecureInstance.patch(API_SETTINGS_SLUG, data);
    return response.data;
  } catch (error) {
    return error.response.data;
  }
};
