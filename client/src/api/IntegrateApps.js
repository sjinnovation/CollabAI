import { getUserID } from "../Utility/service";
import { INTEGRATED_APPS_API_STORE_CREDS, INTEGRATED_APPS_API_DELETE_CREDS, INTEGRATED_APPS_API_GET_CREDS} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";

const userId = getUserID();

export const storeIntegrateAppsCredsToDB = async (credential, service_id)=>{
    const body = {
        service_id : service_id,
        userId : userId,
        credentials : credential
    }
    const responseOfIntegrateAppsCredsStore = await axiosSecureInstance.post(INTEGRATED_APPS_API_STORE_CREDS,body);
    return responseOfIntegrateAppsCredsStore;
};

export const deleteIntegrateAppsCredsFromDB = async (service_id, deleteAll = false) => {
    const body = {
        service_id: service_id,
        userId: userId,
        deleteAll: deleteAll  
    };

    const responseOfIntegratedappsCredsDelete = await axiosSecureInstance.post(INTEGRATED_APPS_API_DELETE_CREDS, body);
    return responseOfIntegratedappsCredsDelete;
};

export const getIntegrateAppsCredentials = async (userId,setIsIntegrateAppsConnected)=>{
    const body = {
        userId : userId,
    }
    
    const responseOfIntegrateAppsCreds = await axiosSecureInstance.post(INTEGRATED_APPS_API_GET_CREDS,body);
   
    if(responseOfIntegrateAppsCreds.data.success){
        setIsIntegrateAppsConnected(true);
    }else{
        setIsIntegrateAppsConnected(false);
    }
}

export const fetchIntegrateAppsCreds = async (userId, serviceId) => {
    try {
        const body = {
            userId: userId,
            service_id: serviceId,
        };
        const response = await axiosSecureInstance.post(INTEGRATED_APPS_API_GET_CREDS, body);
        if (response.data.success) {
            return {
                success: true,
                credentials: response.data.data,
            };
        } else {
            return {
                success: false,
                credentials: null,
                message: response.data.message,
            };
        }
    } catch (err) {
        return {
            success: false,
            credentials: null,
            message: err.message,
        };
    }
};


export const getConnectionStatus = async(service_id) => {
    const body = {
        userId : userId,
        service_id : service_id
    }
    const status = await axiosSecureInstance.post(INTEGRATED_APPS_API_GET_CREDS,body);
    
    if(status.data.success){
        return true
    }else{
        return false;
    }
}