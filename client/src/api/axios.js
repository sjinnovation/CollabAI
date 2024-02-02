import axios from "axios";
import { getUserToken } from "../Utility/service";

export const getAuthorizationHeader = () => `Bearer ${getUserToken()}`;

export const axiosSecureInstance = axios.create({ baseURL: process.env.REACT_APP_BASE_URL });
// export const axiosNonSecureInstance = axios.create({ baseURL: process.env.REACT_APP_BASE_URL });

axiosSecureInstance.interceptors.request.use(
  config => {
    const userToken = localStorage.userToken ? localStorage.getItem("userToken") :  null;
    config.headers.Authorization = `Bearer ${userToken}`
    return config;
  },
  error => {
    // Handle request error
    return Promise.reject(error);
  }
);

export const axiosSecure = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': getAuthorizationHeader(),
  },
});

export const axiosOpen = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
