import { CREATE_A_PROMPT_TEMPLATE_CATEGORY_SLUG, GET_ALL_PROMPT_TEMPLATES_CATEGORY_SLUG, GET_SINGLE_PROMPT_TEMPLATES_CATEGORY_SLUG } from "../constants/Api_constants";
import { axiosOpen } from "./axios";

export const getCategories = async (setCategories) => {
    try {
      const response = await axiosOpen.get(GET_ALL_PROMPT_TEMPLATES_CATEGORY_SLUG());
      const result = response?.data?.categories;
      setCategories(result);
      return { success: true, data: result };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };


  export const createCategory = async (userid, reqBody, handleFetchCategories, setLoading) => {
    try {
      setLoading(true);
      await axiosOpen.post(CREATE_A_PROMPT_TEMPLATE_CATEGORY_SLUG(userid), reqBody);
      handleFetchCategories();
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  export const getSingleCategory = async(categoryId)=>{
    const response = await axiosOpen.get(GET_SINGLE_PROMPT_TEMPLATES_CATEGORY_SLUG(categoryId))
    return response?.data?.category
  }