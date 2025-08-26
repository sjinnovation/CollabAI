import { axiosSecureInstance } from './axios';
import { 
    GET_USER_PROFILE_API_SLUG, 
    GET_USER_DELETED_THREADS_API_SLUG,
    USER_RECOVER_MULTI_THREADS_FROM_TRASH_API_SLUG,
    USER_PERMANENT_DELETE_THREADS_API_SLUG,
    USER_PASSWORD_CHECKING_SLUG,
    USER_PASSWORD_UPDATE_SLUG,
    UPLOAD_USER_PROFILE_PHOTO,
    DELETE_USER_PROFILE_PHOTO,
    SSO_USER_PASSWORD_UPDATE_SLUG,
    USER_AC_TOKEN_UPDATE_SLUG,
} from '../constants/Api_constants';

export const retrieveUserProfile = async(userId)=>{
    if (!userId) {
        return null;
    }
    const userid = { userId: userId };
    if (!userId) {
        return null;
    }
    try {
        const response = await axiosSecureInstance.post(
            GET_USER_PROFILE_API_SLUG,
            userid
        );
        return response.data.user;
    } catch (error) {
        console.log(error);
    }
}

export const fetchUserDeletedThreads = async() => {
    try {
        const response = await axiosSecureInstance.get(
            GET_USER_DELETED_THREADS_API_SLUG,
        );
        return response.data.data.prompts;
    } catch (error) {
        console.log(error);
        return [];
    }
}

export const handleRecovery = async (requestBody) => {
    try {
        await axiosSecureInstance.patch(USER_RECOVER_MULTI_THREADS_FROM_TRASH_API_SLUG, { ...requestBody });
        return {
            success: true,
            message: 'Threads recovered successfully',
        };
    } catch (error) {
        return {
            success: false,
            message: 'Failed to recover threads',
        };
    }
};

export const handlePermanentDelete = async (requestBody) => {
    try {
        await axiosSecureInstance.delete(USER_PERMANENT_DELETE_THREADS_API_SLUG, {
            data: requestBody,
        });
        return {
            success: true,
            message: 'Threads deleted permanently',
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: 'Failed to delete threads',
        };
    }
};

export const checkingCurrentPassword = async (userId, password) => {
    try {
        const response = await axiosSecureInstance.post(
            USER_PASSWORD_CHECKING_SLUG,
            {
              id: userId,
              password: password,
            }
          );
        return response;
    } catch (error) {
        console.log(error);
        return error
    }
}

export const changePassword = async (userId, newPassword, confirmPassword) => {
    try {
        const response = await axiosSecureInstance.post(
            USER_PASSWORD_UPDATE_SLUG,
            {
              id: userId,
              newPassword: newPassword,
              confirmPassword: confirmPassword,
            }
          );
        return response;
    } catch (error) {
        console.log(error);
        return error
    }
}

export const userSSOPasswordUpdate = async (userId, newPassword) => {
    try {
        const response = await axiosSecureInstance.put(
            SSO_USER_PASSWORD_UPDATE_SLUG,
            {
              id: userId,
              newPassword: newPassword
            }
          );
        return response;
    } catch (error) {
        console.log(error);
        return error
    }
}

export const uploadUserPhoto = async (userId, formData) => {
    try {
        const response = await axiosSecureInstance.post(
            UPLOAD_USER_PROFILE_PHOTO(userId),
            formData
          );
        return response;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const deleteUserPhoto = async (userId) => {
    try {
        const response = await axiosSecureInstance.delete(
            DELETE_USER_PROFILE_PHOTO(userId)
          );
        return response;
    } catch (error) {
        console.log(error);
        return error;
    }
}

export const updateUserAcToken = async (userId, userAcToken) => {
    try {
        const response = await axiosSecureInstance.post(
            USER_AC_TOKEN_UPDATE_SLUG,
            {
              id: userId,
              userAcToken: userAcToken,
            }
          );
        return response;
    } catch (error) {
        return error;
    }
}
