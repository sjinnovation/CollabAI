import { axiosSecureInstance } from "./axios";
import { compId ,loggedInUserRole } from "../constants/localStorage";
import * as ApiConstants from "../constants/Api_constants"

export const fetchUsersPrompt = async ({ page, limit, searchInputValue }) => {
    try {
      const body = {
        userRole: loggedInUserRole,
        compid: compId,
      };
  
      const query = ApiConstants.USER_PROMPTS_API_SLUG(page, limit, searchInputValue);
  
      const response = await axiosSecureInstance.get(query, body);
  
      const data = response?.data?.user;
      const pagination = response?.data?.page;
      const totalPages = response?.data?.nbhits;
  
      return {
        prompt: data,
        pagination: pagination,
        totalcount: totalPages,
      };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };
  
  export const fetchSingleUserPrompts = async ({ id,page, date, initFetch, limit }) => {
    try {
      const query = ApiConstants.SINGLE_USER_PROMPTS_API_SLUG(id,page, limit);
  
      const response = await axiosSecureInstance.post(query, { date: date, initFetch: initFetch });

      const totalCount = response?.data?.nbhits
      const pagination = response?.data?.page;
      const result = response?.data?.prompts;
  
      return {
        prompt: result,
        pagination: pagination,
        totalCount: totalCount,
      };
    } catch (error) {
      console.log(error, "error");
      throw error;
    }
  };


