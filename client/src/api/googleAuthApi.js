
import { GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS, GOOGLE_DRIVE_FILE_SYNC } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { getUserID } from "../Utility/service";
import { message } from "antd";
const userIdFromLocal = getUserID();
export const getGoogleAuthCredentials = async (userId,setIsConnected,setToken,setIsLoading = () => {})=>{
    setIsLoading(true);
    if(userIdFromLocal){
        const isGoogleAuthCredentialsExist = await axiosSecureInstance.get(GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS(userIdFromLocal));
        if(isGoogleAuthCredentialsExist?.data){
            setToken(isGoogleAuthCredentialsExist?.data?.newAccessToken);
            setIsConnected(true);
        }else{
            setIsConnected(false);
        }
        setIsLoading(false);
        return isGoogleAuthCredentialsExist?.data?.data || []; 
    }
    setIsLoading(false);

    return [];

}
export const syncGoogleDriveFiles = async (fileId)=>{
    const syncRequestBody = {
        userId : userIdFromLocal,
        fileId: fileId
    }
    const responseOfGoogleDriveFileSync = await axiosSecureInstance.post(GOOGLE_DRIVE_FILE_SYNC,syncRequestBody);
    if(responseOfGoogleDriveFileSync.data.success){
        message.success(responseOfGoogleDriveFileSync.data.message);
    }else{
        message.error(responseOfGoogleDriveFileSync.error.data.message);

    }

};