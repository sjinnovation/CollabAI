import { SUPER_ADMIN_CREATE_NEW_TEAM_SLUG, SUPER_ADMIN_DELETE_A_TEAM_SLUG, SUPER_ADMIN_EDIT_A_TEAM_SLUG, SUPER_ADMIN_FETCH_A_TEAM_SLUG, SUPER_ADMIN_GET_ALL_TEAMS_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";


export const getTeams = async (currentPage, limit) => {
  try {
    const response = await axiosSecureInstance.get(SUPER_ADMIN_GET_ALL_TEAMS_SLUG(currentPage, limit));
    const teams = response?.data?.teams || [];
    const count = response?.data?.pages || 1;
    return { success: true, data: teams, pageCount: count };
  } catch (error) {
    console.log("🚀 ~ getTeams ~ error:", error)
    return { success: false, message: error?.response?.data?.message };
  }
};

export const createTeam = async (title) => {
  try {
    const response = await axiosSecureInstance.post(SUPER_ADMIN_CREATE_NEW_TEAM_SLUG(), {
      teamTitle: title,
    });
    return { success: true, data: response?.data?.createdTeam, message: response?.data?.message };
  } catch (error) {
    console.log("🚀 ~ createTeam ~ error:", error)
    return { success: false, message: error?.response?.data?.message };
  }
};

export const deleteTeam = async (teamIdToDelete) => {
  try {
    const response = await axiosSecureInstance.delete(SUPER_ADMIN_DELETE_A_TEAM_SLUG(teamIdToDelete));
    return { success: true, message: response?.data?.message };
  } catch (error) {
    console.log("🚀 ~ deleteTeam ~ error:", error)
    return { success: false, message: error?.response?.data?.message };
  }
};

export const getTeamById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(SUPER_ADMIN_FETCH_A_TEAM_SLUG(id));
    return { success: true, data: response?.data?.team, message: response?.data?.message};
  } catch (error) {
    console.log("🚀 ~ getTeamById ~ error:", error)
    return { success: false, message: error?.response?.data?.message };
  }
};

export const updateTeam = async (teamIdToEdit, updatedData) => {
  try {
    const response = await axiosSecureInstance.patch(SUPER_ADMIN_EDIT_A_TEAM_SLUG(teamIdToEdit), updatedData);
    return { success: true, data: response?.data?.updatedTeam, message: response?.data?.message };
  } catch (error) {
    console.log("🚀 ~ updateTeam ~ error:", error)
    return { success: false, message: error?.response?.data?.message };
  }
};
