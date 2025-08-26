import { message } from "antd";
import { CREATE_NEW_AI_PERSONA_SLUG, DELETE_A_AI_PERSONA_SLUG, EDIT_A_AI_PERSONA_SLUG, FETCH_A_AI_PERSONA_SLUG, GET_ALL_AI_PERSONAS_SLUG, GET_ALL_AI_PERSONAS_WITH_PERSONAL_PERSONAS_SLUG } from "../constants/Api_constants.js";
import { axiosSecureInstance } from "./axios";


export const getAiPersonas = async (currentPage, limit) => {
  try {
    const response = await axiosSecureInstance.get(GET_ALL_AI_PERSONAS_SLUG(currentPage, limit));
    // const teams = response?.data?.teams || [];
    // const count = response?.data?.pages || 1;
    return { success: true, data: response?.data?.allPersona, message: response?.data?.message};
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const createAiPersona = async ({personaName, avatar, description, createdAs, isFeatured }) => {
  try {
    const formData = new FormData();
    formData.append('personaName', personaName);
    if (avatar) {
      // If it has fileList property, it's from Ant Design Upload
      if (avatar.fileList && avatar.fileList.length > 0) {
        formData.append('avatar', avatar.fileList[0].originFileObj);
      } 
      // If it's already a File object
      else if (avatar instanceof File) {
        formData.append('avatar', avatar);
      }
    }
    formData.append('description', description);
    formData.append('createdAs', createdAs);
    formData.append('isFeatured', isFeatured === undefined ? false : isFeatured);
    const response = await axiosSecureInstance.post(CREATE_NEW_AI_PERSONA_SLUG(), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return { success: true, data: response?.data?.createdAiPersona, message: response?.data?.message };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const deleteAiPersona= async (personaIdToDelete) => {
  try {
    const response = await axiosSecureInstance.delete(DELETE_A_AI_PERSONA_SLUG(personaIdToDelete));
    return { success: true, responseMessage: response?.data?.message };
  } catch (error) {
    return { success: false, responseMessage: error?.response?.data?.message };
  }
};

export const getAiPersonaById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(FETCH_A_AI_PERSONA_SLUG(id));
    return { success: true, data: response?.data?.persona, responseMessage: response?.data?.message};
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const updateAiPersona = async (aiPersonaIdToEdit, updatedData) => {
  try {
    const formData = new FormData();
    
    // Append all updatedData fields to formData
    if (updatedData.personaName) {
      formData.append('personaName', updatedData.personaName);
    }
    
    if (updatedData.description) {
      formData.append('description', updatedData.description);
    }

    if (updatedData.isFeatured !== undefined) {
      formData.append('isFeatured', updatedData.isFeatured);
    }
    
    // Handle avatar properly whether it's a direct File or from Ant Design Upload
    if (updatedData.avatar) {
      // If it has fileList property, it's from Ant Design Upload
      if (updatedData.avatar.fileList && updatedData.avatar.fileList.length > 0) {
        formData.append('avatar', updatedData.avatar.fileList[0].originFileObj);
      } 
      // If it's already a File object
      else if (updatedData.avatar instanceof File) {
        formData.append('avatar', updatedData.avatar);
      }
    }
    
    // Append other fields if they exist
    if (updatedData.isActive !== undefined) {
      formData.append('isActive', updatedData.isActive);
    }
    
    if (updatedData.isDeleted !== undefined) {
      formData.append('isDeleted', updatedData.isDeleted);
    }

    const response = await axiosSecureInstance.patch(EDIT_A_AI_PERSONA_SLUG(aiPersonaIdToEdit), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return { success: true, data: response?.data?.updatedAiPersona, responseMessage: response?.data?.message };
  } catch (error) {
    return { success: false, responseMessage: error?.response?.data?.message };
  }
};

export const getAllAiPersonasWithPersonalPersonas = async () => {
  try {
    const response = await axiosSecureInstance.get(GET_ALL_AI_PERSONAS_WITH_PERSONAL_PERSONAS_SLUG());
    
    return { 
      success: true, 
      data: response?.data?.allPersona, 
      message: response?.data?.message
    };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};
