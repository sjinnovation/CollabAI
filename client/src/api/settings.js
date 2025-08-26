import {
  API_SETTINGS_BRAND_LOGO,
  API_SETTINGS_ENABLE_PERSONALIZE_ASSISTANT,
  API_SETTINGS_SLUG,
  DELETE_BRAND_LOGO,
  FETCH_COMPANY_INFO,
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
export const getPersonalizeAssistantSetting = async () => {
  try {
    const response = await axiosSecureInstance.get(API_SETTINGS_ENABLE_PERSONALIZE_ASSISTANT);
    return response?.data;
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

export const uploadBrandLogo = async (data) => {
  const companyId = localStorage.getItem("compId");
  try {
    const response = await axiosSecureInstance.post(API_SETTINGS_BRAND_LOGO(companyId), data);
    return response;
  } catch (error) {
    return error?.response?.data;
  }
};

export const fetchCompanyInfo = async () => {
  const companyId = localStorage.getItem("compId");
  try {
    const response = await axiosSecureInstance.get(FETCH_COMPANY_INFO(companyId));
    return response;
  } catch (error) {
    return error?.response?.data; 
  }
};

export const deleteBrandLogo = async () => {
  const companyId = localStorage.getItem("compId");
  try {
    const response = await axiosSecureInstance.post(DELETE_BRAND_LOGO(companyId));
    return response;
  } catch (error) {
    return error?.response?.data;
  }
};
