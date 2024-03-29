import axios from "axios";
import { getUserToken, logoutUserAndRedirect } from "../Utility/service";
import { message } from "antd";

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

// Response Interceptor - Handling x-token-expiry
axiosSecureInstance.interceptors.response.use(
  (response) => {
    if (response.headers['x-token-expiry'] === 'true') {
      logoutUserAndRedirect();
    }
    
    return response;
  },
  (error) => {
    console.log("🚀 ~ error:", error)
    // Check for the x-token-expiry header in error response
    if (error?.response && error?.response?.headers['x-token-expiry'] === 'true') {
      message.error('Your session has expired. Please login again.');
      logoutUserAndRedirect();
    }

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
