import {
  SUPER_ADMIN_CREATE_NEW_TAG_SLUG,
  SUPER_ADMIN_DELETE_A_TAG_SLUG,
  SUPER_ADMIN_EDIT_A_TAG_SLUG,
  SUPER_ADMIN_FETCH_A_TAG_SLUG,
  SUPER_ADMIN_GET_ALL_TAGS_SLUG,
} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

export const getTags = async (currentPage, limit) => {
  try {
    const response = await axiosSecureInstance.get(
      SUPER_ADMIN_GET_ALL_TAGS_SLUG(currentPage, limit)
    );
    const tags = response?.data?.meetingTypes || [];
    return { success: true, data: tags, message: response?.data?.message, count: response?.data?.count };
  } catch (error) {
    console.log("🚀 ~ getTags ~ error:", error);
    return { success: false, message: error?.response?.data?.message };
  }
};

export const createTag = async (data) => {
  try {
    const response = await axiosSecureInstance.post(SUPER_ADMIN_CREATE_NEW_TAG_SLUG(), data);
    return {
      success: true,
      message: response?.data?.message,
      data: response?.data?.meetingType,
    };
  } catch (error) {
    console.log("🚀 ~ createTag ~ error:", error);
    return { success: false, message: error?.response?.data?.message };
  }
};

export const getSingleTagById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(
      SUPER_ADMIN_FETCH_A_TAG_SLUG(id)
    );
    const tag = response?.data?.meetingType || {};
    return { success: true, data: tag, message: response?.data?.message };
  } catch (error) {
    console.log("🚀 ~ getTagToEdit ~ error:", error);
    return { success: false, message: error?.response?.data?.message };
  }
};

export const updateTag = async (tagIdToEdit, updatedData) => {
  const { title } = updatedData;
  try {
    const response = await axiosSecureInstance.patch(SUPER_ADMIN_EDIT_A_TAG_SLUG(tagIdToEdit), {
      meetingTitle: title,
    });
    return { success: true, data: response?.data?.updatedMeetingType, message: response?.data?.message };
  } catch (error) {
    console.log("🚀 ~ updateTag ~ error:", error);
    return { success: false, message: error?.response?.data?.message };
  }
};

export const deleteTag = async (tagIdToDelete) => {
  try {
    const response = await axiosSecureInstance.delete(
      SUPER_ADMIN_DELETE_A_TAG_SLUG(tagIdToDelete)
    );
    return { success: true, message: response?.data?.message };
  } catch (error) {
    console.log("🚀 ~ deleteTag ~ error:", error);
    return { success: false, message: error?.response?.data?.message };
  }
};
