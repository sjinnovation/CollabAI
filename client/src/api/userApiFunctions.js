import { axiosSecureInstance } from "./axios";
import { FETCH_SINGLE_USER_INFO } from "./user_api_constant";

export const getUserData = async (userId, setRole) => {
    try {
      const userid = {
        userId: userId,
      };
      const response = await axiosSecureInstance.post(FETCH_SINGLE_USER_INFO(), userid);
      setRole(response?.data?.user?.role);
      return { success: true, data: response?.data?.user?.role };
    } catch (error) {
      console.log(error);
      setRole(null);
      return { success: false, error };
    }
  };