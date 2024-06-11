import { axiosSecureInstance } from "./axios";
import { FETCH_SINGLE_USER_INFO } from "./user_api_constant";
import { GET_SINGLE_USER_PROFILE_API_SLUG,GET_USER_PROFILE_API_SLUG } from "../constants/Api_constants";

export const getUserData = async (userId, setRole) => {
    try {
      const userid = {
        userId: userId,
      };
      const response = await axiosSecureInstance.post(FETCH_SINGLE_USER_INFO(), userid);
      setRole(response?.data?.user?.role);
      return { success: true, data: response?.data?.user?.role };
    } catch (error) {
      setRole(null);
      return { success: false, error };
    }
  };

  export const getRoleOfUser = async (userId, userRole, setUserRole, setIsPublic) => {
    if (userId === null) {
      setUserRole("user");
      setIsPublic(false);
      return <p>Loading...</p>;
    } else {
      try {
        const response = await axiosSecureInstance.post(GET_USER_PROFILE_API_SLUG,{
          "userId" : userId
      });
        const userInfo = response.data.user.role;
        setUserRole(userInfo);
      } catch (error) {
        throw new Error(error);
      }
    }
  };