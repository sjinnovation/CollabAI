import { axiosSecureInstance } from './axios';
import { 
    GET_USER_PROFILE_API_SLUG, 
    GET_USER_DELETED_THREADS_API_SLUG,
    USER_RECOVER_MULTI_THREADS_FROM_TRASH_API_SLUG,
    USER_PERMANENT_DELETE_THREADS_API_SLUG
} from '../constants/Api_constants';

export const retrieveUserProfile = async(userId)=>{
    const userid = { userId: userId };

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
