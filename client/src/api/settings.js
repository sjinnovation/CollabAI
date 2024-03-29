import { getUserID } from "../Utility/service";
import {
  GET_OPEN_AI_API_KEY_SLUG,
  GET_OPEN_AI_MODEL_SLUG,
  GET_TEMPERATURE_SLUG,
} from "../constants/setting_api_constant";
import { axiosSecureInstance } from "./axios";


const userId = getUserID();

export const getConfig = async () => {
  try {
    const key = await axiosSecureInstance.get(GET_OPEN_AI_API_KEY_SLUG);
    const temp = await axiosSecureInstance.get(GET_TEMPERATURE_SLUG);
    const model = await axiosSecureInstance.get(GET_OPEN_AI_MODEL_SLUG);

    const response = {
      key: key?.data?.key?.value,
      temp: temp?.data?.temperature?.value,
      model: model?.data?.model?.value,
    };
    return response;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const updateOpenAIKey = async (key) => {
  try {
    let body = {
      key: key,
    }
    const response = await axiosSecureInstance.post(`/api/config/set-key/${userId}`, body)
    return response;
  } catch (error) {
    return error;
  }
};

export const updateTemperature = async (temperature) => {
  try {
    let body = {
      temperature: temperature,
    }
    const response = await axiosSecureInstance.post(`/api/config/set-temperature/${userId}`, body)
    return response;
  } catch (error) {
    return error;
  }
};

export const updateModel = async (model) => {
  try {
    let body = {
      model: model,
    }
    const response = await axiosSecureInstance.post(`/api/config/set-openai-model/${userId}`, body)
    return response;
  } catch (error) {
    return error;
  }
};
