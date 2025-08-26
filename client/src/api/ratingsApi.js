import { CREATE_ASSISTANTS_RATINGS_SLUG, GET_USER_RATINGS_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

export const fetchRatingByAssistants = async (assistantId) => {
    try {
        const response = await axiosSecureInstance.get(CREATE_ASSISTANTS_RATINGS_SLUG(assistantId));
        return {
            ratings: response.data.data,
            message: response.data.message
        }
    } catch (error) {
        console.error("Error fetching assistants ratings:", error);
        throw error;
    }

  };

export const fetchRatingByUser = async (userId) => {
    try {
        const response = await axiosSecureInstance.get(GET_USER_RATINGS_SLUG(userId));
        return {
            ratings: response.data.data.assistantRating,
            message: response.data.message
        }
    } catch (error) {
        console.error("Error fetching assistants ratings:", error);
        throw error;
    }
}

export const createRating = async (assistantId, payload) => {
    try {

        const response = await axiosSecureInstance.post(CREATE_ASSISTANTS_RATINGS_SLUG(assistantId), payload);
        return response.data;
    } catch (error) {
        console.error("Error creating rating:", error);
        throw error;
    }
}