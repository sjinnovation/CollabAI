import { getUserID } from "../Utility/service";
import { SERVICE_GET_ALL, SERVICE_UPDATE_API_BY_ID , SERVICE_ADD_ENDPOINTS,CHECKING_IF_SERVICEID_AND_USERID_EXISTS, SERVICE_GET_ALL_EXISTING_ENDPOINTS, SERVICE_DELETE_API_BY_ID, GET_SERVICE, SERVICE_UPDATE_BY_ID,SERVICE_ADD_ENDPOINT,SERVICE_IS_ACTIVE_BY_ID, GET_SERVICE_API_DETAILS, INTEGRATED_APPS_API_GET_ID } from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
const userId = getUserID();

export const getAllServices = async() => {
    try {
        const data = await axiosSecureInstance.get(SERVICE_GET_ALL);
        return data;
    } catch (error) {
        return error;
    }
}

export const getService = async(service_id) => {
    try {
        
        const data = await axiosSecureInstance.get(`api/integration/service/${service_id}`);
        return data;
    } catch (error) {
        return error;
    }
}

export const deleteService = async(service_id) => {
    try {
        
        const data = await axiosSecureInstance.delete(`api/integration/service/${service_id}`);
        return data;
    } catch (error) {
        return error;
    }
}

export const initOauth = async(service_id, authFields, authenticateFields, oauthurl,tokenurl, baseurl, type, contentType) => {
    try {
        
        const body = {
            service_id,
            userId,
            authFields,
            authenticateFields,
            oauthurl,
            tokenurl,
            baseurl,
            type,
            contentType
        }
        
        
        const data = await axiosSecureInstance.post(`api/integration/service/oauth/connect`,body);
        return data;
       
    } catch (error) {
        return error;
    }
}

export const addApiEndpoint = async(payload) => {
    try {
        const data = await axiosSecureInstance.post(SERVICE_ADD_ENDPOINTS, payload);
        return data;
    } catch (error) {
        return error;
    }
}

export const getExistingApis = async(service_id) => {
    try {
        const data = await axiosSecureInstance.post(SERVICE_GET_ALL_EXISTING_ENDPOINTS, {service_id});
        return data;
    } catch (error) {
        return error;
    }

}

export const deleteApiEndpoint = async(api_id) => {
    try {
        const data = await axiosSecureInstance.delete(`${SERVICE_DELETE_API_BY_ID}/${api_id}`);
        return data;
    } catch (error) {
        return error;
    }
}
export const checkServiceUser = async (service_id) => {
    try {
        const response = await axiosSecureInstance.post(CHECKING_IF_SERVICEID_AND_USERID_EXISTS, {
            service_id,
            userId
        });
        return response;
    } catch (error) {
        return error;
    }
};

export const updateApiEndpoint = async (api_id, payload) => {
    try {
        const data = await axiosSecureInstance.put(`${SERVICE_UPDATE_API_BY_ID}/${api_id}`, payload);
        return data;
    } catch (error) {
        return error;
    }
};
export const updateService = async (appData, formData) => {
    try {
        return await axiosSecureInstance.patch(
            `${SERVICE_UPDATE_BY_ID}/${appData._id}`,
            formData
        );
    } catch (error) {
        return error;
    }
};

export const addService = async (formData) => {
    try {
        return await axiosSecureInstance.post(
            `${SERVICE_ADD_ENDPOINT}`,
            formData
        );
    } catch (error) {
        return error;
    }
};

export const updateServiceStatus = async (serviceId, isActive) => {
    try {
        const response = await axiosSecureInstance.patch(
            `${SERVICE_IS_ACTIVE_BY_ID}/${serviceId}`,
            { is_active: isActive }
        );
        return response;
    } catch (error) {
        throw error;
    }
};

export const getServiceApiDetails = async (service_id, _id) => {
    try {
        if (!service_id || !_id) {
            throw new Error("Missing required parameters");
        }

        const response = await axiosSecureInstance.get(GET_SERVICE_API_DETAILS, {
            params: { service_id, _id },
        });

        return response.data;
    } catch (error) {
        throw error;
    }
};


export const getAllServicesData = async () => {
  try {
    const response = await axiosSecureInstance.get(SERVICE_GET_ALL);
    if (response.data.success) {
      return response.data.data;
    } else {
      console.error("Failed to get services, response:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

export const fetchIntegrateAppsId = async (userId, identifier, isSlug = false) => {
    try {
        const body = {
            userId: userId,
        };

        if (isSlug) {
            body.slug = identifier;
        } else {
            body.service_id = identifier;
        }
        const response = await axiosSecureInstance.post(INTEGRATED_APPS_API_GET_ID, body);

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