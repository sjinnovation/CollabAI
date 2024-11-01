import { GET_ALL_ASSISTANT_TYPE } from "../constants/Api_constants"
import { axiosSecureInstance } from "./axios";
import { message } from "antd";
export const getAllAssistantType = async (setAssistantTypes) => {
    try {
        const response = await axiosSecureInstance.get(GET_ALL_ASSISTANT_TYPE());
        if (response.status === 200) {
            setAssistantTypes(response.data.data);
            return response.data.data;
        }

    } catch (error) {
        return {message : "Something went Wrong"};

    }

};
