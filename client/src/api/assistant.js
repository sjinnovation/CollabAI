import { axiosSecureInstance } from "./axios";
import {
  SUPER_ADMIN_GET_ALL_TEAMS_SLUG,
  USER_GET_ALL_USER_CREATED_ASSISTANTS_SLUG,
  SUPER_ADMIN_FETCH_USER_STATS_ASSISTANT_SLUG,
  SUPER_ADMIN_GET_ALL_ASSISTANTS_SLUG,
  SUPER_ADMIN_DELETE_ASSISTANT_SLUG,
} from "../constants/Api_constants";
import { getUserID } from "../Utility/service";

const Assistant = () => {

  const fetchAllAssistants = async (page, limit, successCb) => {
    try {
    
      const response = await axiosSecureInstance.get(
        SUPER_ADMIN_GET_ALL_ASSISTANTS_SLUG(page, limit)
      );
      if (response.data) {
        return successCb(response.data);
      }
    } catch (error) {
      console.log(error);
    } 
  };
  const fetchSingleUserAssistants = async (page, successCb, userId) => {
    try {
      const response = await axiosSecureInstance.get(
        USER_GET_ALL_USER_CREATED_ASSISTANTS_SLUG(userId || getUserID())
      );
      if (response.data) {
        return successCb(response.data);
      }
    } catch (error) {
      console.log(error);
    } 
  };
  

  const deleteAssistant = async (assistantId) => {
    try {
     
      const response = await axiosSecureInstance.delete(
        SUPER_ADMIN_DELETE_ASSISTANT_SLUG(assistantId)
      );
      
      if (response.status === 200) {
        return { data: response.data };
      }
    } catch (error) {
      return { error: error?.response?.data?.message }
    } 
  };

  const fetchTeams = async (successCb) => {
    try {
      const response = await axiosSecureInstance.get(
        SUPER_ADMIN_GET_ALL_TEAMS_SLUG(1, 1000)
      );
      if (response.data) {
        return successCb(response.data.teams);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchUsersAssistantsStats = async (successCb) => {
    try {
   
      const response = await axiosSecureInstance.get(
        SUPER_ADMIN_FETCH_USER_STATS_ASSISTANT_SLUG()
      );
      if (response.data) {
        return successCb(response.data);
      }
    } catch (error) {
      console.log(error);
    } 
  };

  const handleAssignTeam = async (assistantId, teamIds, successCb) => {
    try {
    
      const response = await axiosSecureInstance.patch(
        `/api/assistants/${assistantId}/teams`,
        { teamIds }
      );
      if (response.data) {
        return successCb();
      }
    } catch (error) {
      return { error: error?.response?.data?.message }
    }
  };

  const updateAssistant = async (assistantId, payload) => {
    try {
 
      const response = await axiosSecureInstance.patch(
        `/api/assistants/${assistantId}`,
        payload
      );
      if (response.status === 200) {
        return { data: response.data };
      }
    } catch (error) {
      return { error: error?.response?.data?.message }
    } 
  };


const createAssistantWithFiles = async (formData) => {
  try {
    const response = await axiosSecureInstance.post('/api/assistants', formData);
    if (response.status === 201) {
      return { data: response.data };
    } else {
      return { error: 'Assistant creation failed.' };
    }
  } catch (error) {
    return { error: error?.response?.data }
};
};

const updateAssistantWithFiles = async (formData, assistantId) => {
  try {
    const response = await axiosSecureInstance.patch(
      `/api/assistants/updatedatawithfile/${assistantId}`,
      formData
    );
    if (response.status === 201) {
      return { data: response.data };
    } else {
      return { error: 'Assistant update failed.' };
    }
  } catch (error) {
    return { error: error?.response?.data }
  }
};


  

  const toggleAssistantAccess = async (teamId, updatedValue, successCb) => {
    try {
      const response = await axiosSecureInstance.patch(`/api/teams/${teamId}`, {
        hasAssistantCreationAccess: updatedValue,
      });

      if (response.status === 200) {
        successCb(response.data);
      }
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };



  return {
    fetchAllAssistants,
    fetchSingleUserAssistants,
    fetchUsersAssistantsStats,
    fetchTeams,
    handleAssignTeam,
    deleteAssistant,
    updateAssistant,
    createAssistantWithFiles,
     updateAssistantWithFiles,
    toggleAssistantAccess
  };
};

export default Assistant;
