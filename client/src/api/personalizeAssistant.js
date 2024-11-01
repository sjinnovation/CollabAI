import { CREATE_A_CLONE_OF_AN_ASSISTANT } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { getUserID } from "../Utility/service";
import { message } from "antd";
const userId = getUserID();
export const personalizeAssistant = async (assistantId) => {
    const response = await axiosSecureInstance.post(CREATE_A_CLONE_OF_AN_ASSISTANT(assistantId),{
        assistantId:assistantId,userId:userId
    });

    if(response.status === 201){
        message.success(response.data.message);

        return {
            message: response.data.message,
            success : true
        }
    }else{
        message.error(response.data.message);

        return {
            message: response.data.message,
            success : false
        }
    }

  };