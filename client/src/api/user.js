import { axiosOpen, axiosSecureInstance } from "./axios";
import { getCompId, getUserRole } from "../Utility/service";
import { USER_AC_TOKEN_UPDATE, N8N_CONNECT_SLUG, N8N_DISCONNECT_SLUG, N8N_CONNECTION_STATUS_SLUG, N8N_WORKFLOWS_SLUG, USER_API_KEY_GENERATE_SLUG } from "../constants/Api_constants";
import { message } from "antd";

export const getTeams = async () => {
    try {
      const response = await axiosSecureInstance.get(`/api/teams`);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
};

export const getCompany = async () => {
    try {
      const response = await axiosOpen.get(`api/company/get/${getCompId()}`);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
};

export const addUser = async (userData) => {
    try {
        let response = await axiosOpen.post("api/auth/admin", { ...userData });
        return response;
    } catch (err) {
        if(err && err.response.status === 400 ){
            return err;
        }
    }
};

export const editUser = async (id, userData) => {
    try {
        let response = await axiosSecureInstance.patch(`/api/user/update-user/${id}`, {...userData});
        return response;
    } catch (err) {
        if(err && err.response.status === 400 ){
            return err;
        }
    }
};

export const updateUserPreference = async (id, userData) => {
    try {
        let response = await axiosSecureInstance.patch(`/api/user/update-preference/${id}`, {...userData});
        return response;
    } catch (err) {
        if(err && err.response.status === 400 ){
            return err;
        }
    }
};

export const getUser = async (id) => {
    try {
        const response = await axiosSecureInstance.post(`/api/user/get-single-user`,
            { 
                userId: id 
            }
        );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
};

export const getAllUsers = async (page , limit) => {
    try {
        const body = {
            compid: getCompId(),
            userRole: getUserRole(),
        };
        const response = await axiosSecureInstance.get(
            `/api/user/get-all-users?page=${page}&limit=${limit}`,
            body
        );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
};

export const deleteUser = async (userId) => {
    try {
        const response = await axiosSecureInstance.patch(
            `/api/user/softdelete/${userId}`
        );
        return response;
    } catch (error) {
        console.log(error);
        return;
    }
};

export const searchUsers = async (page , limit, searchQuery) => {
    try {
        const body = {
            compid: getCompId(),
            userRole: getUserRole(),
        };
        const response = await axiosSecureInstance.get(
            `/api/user/get-all-users?page=${page}&limit=${limit}&search=${searchQuery}`,
            body
        );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
};

export const assignTeam = async (teamData) => {
    try {
        const response = await axiosSecureInstance.patch(`/api/user/team-assign`, {...teamData});
        return response;
    } catch (error) {
        console.log(error);
        return;
    }
};

export const updateUserAcToken = async (id, userData) => {
    try {
        let response = await axiosSecureInstance.patch(USER_AC_TOKEN_UPDATE(id), {...userData});
        return response;
    } catch (err) {
        if(err && err.response.status === 400 ){
            return err;
        }
    }
};
export const usersAPIKeyGenerate = async (userId) => {
    try {
        const baseUrlBE = process.env.REACT_APP_BASE_URL;
        const response = await axiosSecureInstance.post(USER_API_KEY_GENERATE_SLUG(userId),{
            baseUrlBE: baseUrlBE
        });
        if (response.status === 200) {
            message.success(response.data.message || "API Key generated successfully");
        } else {
            message.error("Failed to generate API Key");
        }
        return response;
    } catch (error) {
        console.log(error);
        message.error(error?.response?.data?.message || "Failed to generate API Key");
        return;
    }
};
// n8n integration functions
export const connectN8n = async (userId, secretKey) => {
    try {
        const response = await axiosSecureInstance.post(N8N_CONNECT_SLUG(userId), {
            secretKey: secretKey
        });
        return response;
    } catch (error) {
        console.error('Error connecting n8n:', error);
        throw error;
    }
};

export const disconnectN8n = async (userId) => {
    try {
        const response = await axiosSecureInstance.delete(N8N_DISCONNECT_SLUG(userId));
        return response;
    } catch (error) {
        console.error('Error disconnecting n8n:', error);
        throw error;
    }
};

export const getN8nConnectionStatus = async (userId) => {
    try {
        const response = await axiosSecureInstance.get(N8N_CONNECTION_STATUS_SLUG(userId));
        return response;
    } catch (error) {
        console.error('Error getting n8n connection status:', error);
        throw error;
    }
};

export const getN8nWorkflows = async (userId) => {
    try {
        const response = await axiosSecureInstance.get(N8N_WORKFLOWS_SLUG(userId));
        return response;
    } catch (error) {
        console.error('Error fetching n8n workflows:', error);
        throw error;
    }
};
