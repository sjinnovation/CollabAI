import { getUserID } from "../Utility/service";
import {
  GET_OPEN_AI_API_KEY_SLUG,
  GET_OPEN_AI_MODEL_SLUG,
  GET_TEMPERATURE_SLUG,
} from "../constants/setting_api_constant";
import { axiosOpen } from "./axios";

const userId = getUserID();

export const getConfig = async () => {
  try {
    const key = await axiosOpen.get(GET_OPEN_AI_API_KEY_SLUG());
    const temp = await axiosOpen.get(GET_TEMPERATURE_SLUG());
    const model = await axiosOpen.get(GET_OPEN_AI_MODEL_SLUG());

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
    const response = await axiosOpen.post(`/api/config/addkey/${userId}`, body)
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
    const response = await axiosOpen.post(`/api/config/settemperature/${userId}`, body)
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
    const response = await axiosOpen.post(`/api/config/setopenaimodel/${userId}`, body)
    return response;
  } catch (error) {
    return error;
  }
};
