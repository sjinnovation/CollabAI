import { axiosSecureInstance } from "./axios";
import {
  SUPER_ADMIN_GET_ALL_TEAMS_SLUG,
  USER_GET_ALL_USER_CREATED_ASSISTANTS_SLUG,
  SUPER_ADMIN_FETCH_USER_STATS_ASSISTANT_SLUG,
  SUPER_ADMIN_GET_ALL_ASSISTANTS_SLUG,
  SUPER_ADMIN_DELETE_ASSISTANT_SLUG,
  UPDATE_ASSISTANT_TEAM_LIST_API,
  UPDATE_SINGLE_ASSISTANT_API,
  CREATE_SINGLE_ASSISTANT_API,
  UPDATE_ASSISTANT_WITH_FILES_API,
  UPDATE_ASSISTANT_ACCESS_FOR_TEAM_API,
} from "../constants/Api_constants";
import { getUserID } from "../Utility/service";

export const fetchAllAssistants = async (page, limit, orgAssistantSearchQuery) => {
  const response = await axiosSecureInstance.get(SUPER_ADMIN_GET_ALL_ASSISTANTS_SLUG(page, limit, orgAssistantSearchQuery));

  return {
    assistants: response.data.assistants,
    message: response.data.message,
    meta: {
      total: response.data.totalAssistantCount
    }
  };
};

// fetchSingleUserAssistants
export const fetchAssistantsCreatedByUser = async (page, userId, personalAssistantSearchQuery) => {
  const LIMIT = 10;
  const response = await axiosSecureInstance.get(
    USER_GET_ALL_USER_CREATED_ASSISTANTS_SLUG(userId || getUserID(), page, LIMIT, personalAssistantSearchQuery)
  );

  return {
    data: response.data.assistants,
    message: response.data.message,
    meta: {
      total: response.data.totalCount
    }
  }; // The consumer will handle the error.
};

export const deleteAssistant = async (assistantId) => {
  const response = await axiosSecureInstance.delete(SUPER_ADMIN_DELETE_ASSISTANT_SLUG(assistantId));

  return {
    message: response.data.message
  }
};

export const fetchTeams = async () => {
  const response = await axiosSecureInstance.get(SUPER_ADMIN_GET_ALL_TEAMS_SLUG(1, 1000));
  return {
    data: response.data.teams,
    message: response.data.message
  };
};

export const fetchAssistantStatisticsForUser = async () => {
  const response = await axiosSecureInstance.get(SUPER_ADMIN_FETCH_USER_STATS_ASSISTANT_SLUG());

  return {
    data: response.data.userStats,
    message: response.data.message
  }
};

// handleAssignTeam
export const updateAssistantTeams = async (assistantId, payload) => {
  const { data } = await axiosSecureInstance.patch(
    UPDATE_ASSISTANT_TEAM_LIST_API(assistantId),
    payload
  );


  return { data: data?.result, message: data.message };
};

export const updateAssistant = async (assistantId, payload) => {
  const response = await axiosSecureInstance.patch(
    UPDATE_SINGLE_ASSISTANT_API(assistantId),
    payload
  );

  return {
    message: response.data.message
  };
};

export const createAssistantWithFiles = async (payload) => {
  const response = await axiosSecureInstance.post(
    CREATE_SINGLE_ASSISTANT_API,
    payload
  );

  return {
    data: response.data.assistant,
    message: response.data.message
  };
};

export const updateAssistantWithDetailsAndFiles = async (assistantId, payload) => {
  const response = await axiosSecureInstance.patch(
    UPDATE_ASSISTANT_WITH_FILES_API(assistantId),
    payload
  );

  return { data: response?.data?.assistant, message: response?.data?.message };
};

export const updateAssistantAccessForTeam = async (teamId, payload) => {
  const response = await axiosSecureInstance.patch(UPDATE_ASSISTANT_ACCESS_FOR_TEAM_API(teamId), payload);

  return {
    message: response.data.message,
  };
};