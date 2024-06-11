import { axiosSecureInstance } from "./axios";
import { message } from "antd";
import { GET_ALL_ASSISTANT_TYPE,GET_SINGLE_ASSISTANT_TYPE,CREATE_ASSISTANT_TYPE,UPDATE_SINGLE_ASSISTANT_TYPE,DELETE_SINGLE_ASSISTANT_TYPE,GET_ALL_ASSISTANT_TYPE_PAGINATED } from "../constants/Api_constants";


export const getAllAssistantType = async (setAssistantTypes) => {
    try {
        const response = await axiosSecureInstance.get(GET_ALL_ASSISTANT_TYPE());
        if (response.status === 200) {
            setAssistantTypes(response.data.data);
            return { success: true, data: response.data.data, message: response?.data?.message };
        }

    } catch (error) {
        return { success: false,  message: error?.response?.data?.message };

    }

};

export const getAssistantTypes = async (currentPage, limit) => {
  try {
    const response = await axiosSecureInstance.get(GET_ALL_ASSISTANT_TYPE_PAGINATED(currentPage, limit));
    const assistantTypes = response?.data?.name || [];
    const count = response?.data?.pages || 1;
    return { success: true, data: assistantTypes, pageCount: count };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const createAssistantType = async (assistantType) => {
  try {
    const response = await axiosSecureInstance.post(CREATE_ASSISTANT_TYPE(), {
      name: assistantType
    });
    return { success: true, data: response?.data?.data?.name, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const deleteAssistantType = async (assistantTypeIdToDelete) => {
  try {
    const response = await axiosSecureInstance.delete(DELETE_SINGLE_ASSISTANT_TYPE(assistantTypeIdToDelete));
    return { success: true, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const getAssistantTypeById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(GET_SINGLE_ASSISTANT_TYPE(id));
    return { success: true, data: response?.data?.data?.name, message: response?.data?.message};
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const updateAssistantType = async (assistantTypeIdToEdit, updatedData) => {
  try {
    const response = await axiosSecureInstance.patch(UPDATE_SINGLE_ASSISTANT_TYPE(assistantTypeIdToEdit), updatedData);
    return { success: true, data: response?.data?.data?.name, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};
