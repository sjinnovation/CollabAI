import ServiceCredentials from "../../models/integration/serviceCredentialsModel.js";
import ServiceList from "../../models/integration/serviceListModel.js";

export const github = async () => {

}

export const beanstalk = async (payload) => {
    const { username, access_token, base_url, service_id, userId } = payload;
    
    const service = await ServiceList.findById(service_id);
    if(!service){
        return {
            success: false,
            message: "Invalid service ID",
        };
    }

    const credentials = new ServiceCredentials({
        service_id,
        service_name : service.service_name,
        userId,
        credentials : {
            username,
            access_token,
            base_url
        }
    });

    const savedCredentials = await credentials.save();
    return {
        success : true,
        data : savedCredentials
    }

}

export const getServiceIdBySlug = async (slug) => {
  return await ServiceList.findOne({ slug });
};

export const getUserServiceCredentials = async (userId, service_id) => {
  return await ServiceCredentials.findOne({ userId, service_id });
};
