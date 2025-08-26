import { axiosSecureInstance } from "./axios";

export const checkModelFieldAvailability = async (field, value) => {
  try {
    const encodedValue = encodeURIComponent(value);
    const response = await axiosSecureInstance.get(`/api/models/check-field/${field}/${encodedValue}`);
    return response.data;
  } catch (error) {
    return { error: error.response?.data?.msg || "Error checking availability" };
  }
};