import { axiosSecureInstance } from "./axios";

export const logClientEvent = async (logData) => {
  try {
    const response = await axiosSecureInstance.post('/api/log/socket', {
      ...logData,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to log to server:', error);
    // Don't throw error to prevent breaking the main app
    return null;
  }
};