import { getUserID } from "../Utility/service";
import { WORKBOARD_ACTION_ITEM_SLUG, WORKBOARD_AUTH_SLUG } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

const userId= getUserID();

export const createWorkBoardCredentials =async (code,redirectUri)=>{
    return await axiosSecureInstance.post(WORKBOARD_AUTH_SLUG(userId), {
        code: code,
        redirectUri: redirectUri,
        userId : userId,
      });
};

export const getWorkBoardCredentials = async ()=>{
    return await axiosSecureInstance.get(WORKBOARD_AUTH_SLUG(userId));
}
export const getWorkBoardActionItems = async ()=>{
    const actionItemList = await axiosSecureInstance.get(WORKBOARD_ACTION_ITEM_SLUG(userId));
    return actionItemList.data.data !==null ? actionItemList?.data?.data[0] : '';
}

export const getWorkBoardAuthCredentials = async (userIdPassed,setIsWorkBoardConnected,setWorkBoardToken)=>{
    if(userId){
        const isWorkBoardCredentialsExist = await axiosSecureInstance.get(WORKBOARD_AUTH_SLUG(userId));
        if(isWorkBoardCredentialsExist?.data){
            setWorkBoardToken(isWorkBoardCredentialsExist?.data?.accessToken);
            setIsWorkBoardConnected(true);
        }else{
            setIsWorkBoardConnected(false);
            setWorkBoardToken('')
        }
        return isWorkBoardCredentialsExist?.data?.data || [];
    }
    return [];

}