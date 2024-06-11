import {
  createATaskCommandCategorySlug,
  getAllTaskCommandsCategorySlug,
} from "../constants/Api_constants";
import { axiosOpen, axiosSecureInstance } from "./axios";

export const createCategory = async (
  reqBody,
  handleFetchCategories,
  setLoading
) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.post(createATaskCommandCategorySlug(), reqBody);
    handleFetchCategories();
    const successMessage = response.data.message;
    return { data: response, success: successMessage };
  } catch (error) {
      const errorMessage = error.response.data.message;
      return { error: errorMessage };
  } finally {
    setLoading(false);
  }
};

export const getCategories = async () => {
  try {
    const response = await axiosOpen.get(getAllTaskCommandsCategorySlug());
    const result = response?.data?.categories;
    return { data: result };
  } catch (error) {
    console.log(error);
  }
};