
import { GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

export const getGoogleAuthCredentials = async (userId,setIsConnected,setToken)=>{
    const isGoogleAuthCredentialsExist = await axiosSecureInstance.get(GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS(userId));
    if(isGoogleAuthCredentialsExist && isGoogleAuthCredentialsExist?.data?.data?.length > 0){
        if(isGoogleAuthCredentialsExist?.data?.data[0]?.accessToken){
            setToken(isGoogleAuthCredentialsExist.data.data[0].accessToken);
            setIsConnected(true);
        }

    }else{
        setIsConnected(false);
    }
    return isGoogleAuthCredentialsExist?.data?.data || [];
}