import { StatusCodes } from "http-status-codes";
import ServiceApi from "../../models/integration/serviceApiModel.js";
import ServiceCredentials from "../../models/integration/serviceCredentialsModel.js";
import { IntegrationMessages, ServiceMessages } from "../../constants/enums.js";
import ServiceList from "../../models/integration/serviceListModel.js";
import mongoose from "mongoose";

/**
 * @async
 * @function getServiceApis
 * @description Retrieves all API endpoints associated with a given service_id.
 * @param {Object} req - Request object containing service_id in the body.
 * @param {Object} res - Response object returning list of APIs or error message.
 * @returns {Response} 200 with API data on success, 500 on server error.
 */

export const getServiceApis = async (req,res) => {
    const { service_id } = req.body;
    try {
        const api = await ServiceApi.find({service_id});
   
        
        res.status(StatusCodes.OK).json({
            success : true,
            data : api
        
        }); 
    } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:error.message,
        });
        
    }
}


/**
 * @async
 * @function getUsersApiList
 * @description Retrieves all API endpoints for services associated with a specific user.
 * @param {Object} req - Request object containing userId in the body.
 * @param {Object} res - Response object returning the list of APIs grouped by service or an error message.
 * @returns {Response} 200 with user's service APIs on success, 500 on server error.
 */

export const getUsersApiList = async (req, res) => {
    const { userId } = req.body;
    
    try {
      // Fetch services linked to the user
      const services = await ServiceCredentials.find({ userId });
      if (!services || services.length === 0) {
        return res.status(StatusCodes.OK).json({
          success: false,
          message: IntegrationMessages.NO_SERVICE,
        });
      }
  
      // Log all services for debugging purposes
  
      // Fetch APIs for each service
      const apiPromises = services.map(async (service) => {
        const apis = await ServiceApi.find({ service_id: service.service_id });
        
        // Log each service's APIs
        
        return { service_id: service.service_id, apis };
      });
  
      // Resolve all promises
      const serviceApis = await Promise.all(apiPromises);
  
      // Send the response with all APIs for the user's services
      res.status(StatusCodes.OK).json({
        success: true,
        data: serviceApis,
      });
    } catch (error) {
      console.error("Error fetching APIs for user:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
      });
    }
  }

  /**
 * @async
 * @function checkServiceUser
 * @description Checks if the given user has credentials saved for the specified service(s).
 * Returns the names of services that are missing credentials for the user.
 * @param {Object} req - Express request object containing service_id array and userId in body.
 * @param {Object} res - Express response object used to send status and data.
 * @returns {Response} 200 with missing service names or success true if none missing,
 * 404 if no records found, or 500 on error.
 */
  export const checkServiceUser = async (req, res) => {
    const { service_id, userId } = req.body;
    
    try {
        const record = await ServiceCredentials.find({ service_id: { $in: service_id }, userId }).sort({ createdAt: -1 });
        if (!record) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: error.message,
            });
        }
        // return element from service_id array which is not present in the record
        const missingServices = service_id.filter(service => !record.some(item => item.service_id == service));
        if (missingServices.length > 0) {
          const service = await ServiceList.find({_id:{ $in: missingServices }});
          // itrate service and return array of service names
          const serviceNames = service.map(item => item.service_name);
            return res.status(StatusCodes.OK).json({
                success: false,
                data: serviceNames
            });
        }
        res.status(StatusCodes.OK).json({
            success: true,
            data: []
        });
    } catch (error) {
        console.error("Error checking service and user association:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * @async
 * @function getServiceApiDetails
 * @description Retrieves detailed information for a specific API endpoint of a service,
 * including the service icon by populating the related service document.
 * @param {Object} req - Request object containing `service_id` and `_id` as query parameters.
 * @param {Object} res - Response object with API details or an error message.
 * @returns {Response} 200 with API details, 400 on missing/invalid parameters, 500 on server error.
 */

export const getServiceApiDetails = async (req, res) => {
  try {
    const { service_id, _id } = req.query;

    if (!service_id || !_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: ServiceMessages.MISSING_REQUIRED_PARAMETERS });
    }

    if (!mongoose.Types.ObjectId.isValid(service_id) || !mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: ServiceMessages.INVALID_OBJECT_ID });
    }

    // Fetch API details with service details using populate
    const apiDetails = await ServiceApi.findOne({ _id, service_id })
      .populate({
        path: "service_id",
        select: "service_icon",
        model: ServiceList,
      })
      .select("api_name");

    if (!apiDetails) {
      console.error(ServiceMessages.API_DETAILS_NOT_FOUND);
      return res
        .status(StatusCodes.OK)
        .json({ success: false, message: ServiceMessages.API_DETAILS_NOT_FOUND });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      data: {
        ...apiDetails.toObject(),
        service_icon: apiDetails.service_id.service_icon,
      },
    });

  } catch (error) {
    console.error(ServiceMessages.UNEXPECTED_ERROR, error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: ServiceMessages.UNEXPECTED_ERROR });
  }
};