import { SUPER_ADMIN_CREATE_A_PROMPT_TEMPLATE_SLUG, SUPER_ADMIN_DELETE_A_PROMPT_TEMPLATE_SLUG, SUPER_ADMIN_EDIT_A_PROMPT_TEMPLATE_SLUG, SUPER_ADMIN_FETCH_A_PROMPT_TEMPLATE_SLUG, SUPER_ADMIN_GET_ALL_PROMPT_TEMPLATES_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";



// templateApiFunctions.js

// ... (Other import statements)

export const getTemplates = async (currentPage, limit) => {
    try {
      const response = await axiosSecureInstance.post(SUPER_ADMIN_GET_ALL_PROMPT_TEMPLATES_SLUG(currentPage, limit));
      const result = response?.data?.templates;
      const count = response?.data?.pages;
    //   console.log({ success: true, data: result, pageCount: count })
      return { success: true, data: result, pageCount: count };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };
  
  export const createTemplate = async (reqBody) => {
    const { template_title, template_description, template_category } = reqBody;
    try {
      const response = await axiosSecureInstance.post(SUPER_ADMIN_CREATE_A_PROMPT_TEMPLATE_SLUG(),{
              title: template_title,
              description: template_description,
              category: template_category,
            }
        );
      console.log(response)
      return { success: true, data: response };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };
  
  export const deleteTemplate = async (templateIdToDelete) => {
    try {
      await axiosSecureInstance.delete(SUPER_ADMIN_DELETE_A_PROMPT_TEMPLATE_SLUG(templateIdToDelete));
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };
  
  export const getTemplateToEdit = async (id) => {
    try {
      const response = await axiosSecureInstance.get(SUPER_ADMIN_FETCH_A_PROMPT_TEMPLATE_SLUG(id));
      console.log("Temp to edit:", response)
      return { success: true, data: response?.data };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };
  
  export const editTemplate = async (templateIdToEdit, updatedData) => {
    const { title, description, category } = updatedData;
    try {
      await axiosSecureInstance.put(SUPER_ADMIN_EDIT_A_PROMPT_TEMPLATE_SLUG(templateIdToEdit), {
              title,
              description,
              category
            });
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  };



