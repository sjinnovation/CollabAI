import {
  createATaskCommandSlug,
  deleteATaskCommandSlug,
  editATaskCommandSlug,
  fetchATaskCommandSlug,
  getAllTaskCommandsSlug,
  getTaskCommandsGroupedByCategorySlug,
} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

export const getTaskCommands = async (currentPage, limit) => {
  try {
    const response = await axiosSecureInstance.get(
      getAllTaskCommandsSlug(currentPage, limit)
    );

    const result = response?.data?.taskCommands;
    const count = response?.data?.page;
    return { success: true, data: result, pageCount: count };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
};

export const createTaskCommand = async (reqBody) => {
  const { label, icon, commandsCategoryName } = reqBody;

  try {
    const response = await axiosSecureInstance.post(createATaskCommandSlug(), {
      label,
      icon,
      commandsCategoryName,
    });
    
    const successMessage = response.data.message;
    return { success: successMessage, data: response };
  } catch (error) {
    console.log(error);
    const errorMessage = error.response.data.message;
    return { error: errorMessage };
  }
};

export const deleteTaskCommand = async (taskCommandIdToDelete) => {
  try {
    const response = await axiosSecureInstance.delete(
      deleteATaskCommandSlug(taskCommandIdToDelete)
    );
    const successMessage = response.data.message;
    return { success: successMessage };
  } catch (error) {
    console.log(error);
    const errorMessage = error.response.data.message;
    return { error: errorMessage };
  }
};

export const getTaskCommandToEdit = async (id) => {
  try {
    const response = await axiosSecureInstance.get(fetchATaskCommandSlug(id));

    return { success: true, data: response?.data };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
};

export const editTaskCommand = async (taskCommandIdToEdit, updatedData) => {
  const { label, icon, commandsCategoryName } = updatedData;

  try {
    const response = await axiosSecureInstance.patch(editATaskCommandSlug(taskCommandIdToEdit), {
      label,
      icon,
      commandsCategoryName,
    });
    const successMessage = response.data.message;
    return { success: successMessage };
  } catch (error) {
    console.log(error);
    const errorMessage = error.response.data.message;
    return { error: errorMessage };
  }
};

export const getTaskCommandsGroupedByCategory = async () => {
  try {
    const response = await axiosSecureInstance.get(getTaskCommandsGroupedByCategorySlug());

    const result = response?.data;
    return { success: true, data: result };
  } catch (error) {
    console.log(error);
    return { success: false, error };
  }
};