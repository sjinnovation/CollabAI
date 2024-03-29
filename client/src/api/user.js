import { axiosOpen, axiosSecureInstance } from "./axios";
import { getCompId, getUserRole } from "../Utility/service";

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


