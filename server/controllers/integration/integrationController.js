import { StatusCodes } from "http-status-codes";
import { IntegrationMessages } from "../../constants/enums.js";
import ServiceList from "../../models/integration/serviceListModel.js";
import ServiceCredentials from "../../models/integration/serviceCredentialsModel.js";
import ServiceApi from "../../models/integration/serviceApiModel.js";
import SpecificRefreshToken from "../../models/integration/specificRefreshToken.js";
import FunctionDefinition from "../../models/functionDefinitionModel.js";
import axios from "axios";
import FormData from "form-data";
import CryptoJS from "crypto-js";
const SECRET_KEY = process.env.SECRET_KEY || "your-strong-secret-key1234567890";
export const authenticateService = async (req, res) => {
  const { slug } = req.body;
  try {
    const response = await slug(req.body);

    if (response.data.success) {
      res.status(StatusCodes.OK).json({});
    } else {
      res.status(StatusCodes.BAD_REQUEST).json({
        message: "message",
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "message",
    });
  }
};


/**
 * @async
 * @function getServiceList
 * @description Retrieves the full list of available services from the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the list or error message.
 * @returns {Response} HTTP 200 with list of services, or 500 on server error.
 */

export const getServiceList = async (req, res) => {
  try {
    const services = await ServiceList.find();
    res.status(StatusCodes.OK).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * @async
 * @function getService
 * @description Retrieves details of a single service by its ID.
 * @param {Object} req - The request object containing service_id in params.
 * @param {Object} res - The response object to send the service data or error.
 * @returns {Response} HTTP 200 with service data, or 500 on server error.
 */

export const getService = async (req, res) => {
  try {
    const { service_id } = req.params;
    const services = await ServiceList.findOne({ _id: service_id });
    res.status(StatusCodes.OK).json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @async
 * @function deleteService
 * @description Deletes a service by ID and cleans up all related records including APIs, function definitions, and credentials.
 * @param {Object} req - Request object containing service_id in params.
 * @param {Object} res - Response object sending status, message, and updated list of services.
 * @returns {Response} 200 with updated service list on success, 404 if service not found, or 500 on error.
 */

export const deleteService = async (req, res) => {
  try {
    const { service_id } = req.params;
    const isDeleted = await ServiceList.findOneAndDelete({ _id: service_id });
    if (!isDeleted) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: IntegrationMessages.SERVICE_NOT_FOUND,
      });
    }
    // delete all service credentials and api as well
    await ServiceApi.deleteMany({ service_id });
    await FunctionDefinition.deleteMany({ service_id });
    await ServiceCredentials.deleteMany({ service_id });
    const services = await ServiceList.find();
    res.status(StatusCodes.OK).json({
      success: true,
      message: IntegrationMessages.SERVICE_DELETED,
      data: services,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * @async
 * @function addService
 * @description Adds a new service with provided details, validates required fields, parses stringified JSON fields, 
 *              checks for slug uniqueness, and saves the service including uploaded icon path.
 * @param {Object} req - Request object containing service data and optional uploaded file.
 * @param {Object} res - Response object sending success message and created service data or error.
 * @returns {Response} 201 on successful creation, 400 if required fields missing, 409 if slug exists, 500 on error.
 */

export const addService = async (req, res) => {
  try {
    let {
      name,
      slug,
      description,
      is_active,
      is_google_app,
      oauthurl,
      tokenurl,
      baseurl,
      authType,
      authFields,
      authenticateFields,
      headers,
      type,
      contentType,
      userId
    } = req.body;

    const serviceIconPath = req.file ? req.file.path : null;
    // Parse authFields and headers if they are passed as strings
    if (typeof authFields === "string") {
      authFields = JSON.parse(authFields); // Parse the string into an object/array
    }

    if (typeof headers === "string") {
      headers = JSON.parse(headers); // Parse the string into an array
    }

    if (typeof authenticateFields === "string") {
      authenticateFields = JSON.parse(authenticateFields);
    }

    // Check if a service with the same slug already exists
    const existingService = await ServiceList.findOne({ slug });
    if (existingService) {
      return res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: IntegrationMessages.SERVICE_EXISTS,
      });
    }

    // Validate that required fields are provided
    if (!name || !slug || !description || !authType || !serviceIconPath) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Missing required fields (name, slug, authType, service_icon)",
      });
    }
    const newService = new ServiceList({
      userId: userId,
      service_name: name,
      slug,
      description: description,
      is_active: false,
      is_google_app,
      service_icon: serviceIconPath,
      oauthurl: (oauthurl ?? "").replace(/\/$/, ""), // Remove trailing slash if exists
      tokenurl: (tokenurl ?? "").replace(/\/$/, ""),
      baseurl: (baseurl ?? "").replace(/\/$/, ""), // Remove trailing slash if exists
      authType,
      authFields: authFields ?? [],
      authenticateFields: authenticateFields ?? [], // Default to an empty array if authFields is not provided
      headers: headers ?? [],
      type: type ?? "",
      contentType: contentType ?? "", // Default to an empty array if headers is not provided
    });

    // Save the service to the database
    await newService.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: IntegrationMessages.SERVICE_ADDED,
      data: newService,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @async
 * @function addServiceCredentials
 * @description Adds new service credentials for a user. Validates service existence, 
 *              stores OAuth refresh token if applicable, and saves credentials to DB.
 * @param {Object} req - Request object with body containing:
 *   - service_id {string} - ID of the service.
 *   - userId {string} - ID of the user.
 *   - credentials {Object} - Credentials data, including OAuth tokens if any.
 * @param {Object} res - Response object returning status and JSON message.
 * @returns {Response}
 *   - 201: Credentials successfully added.
 *   - 400: Missing refresh token for OAuth.
 *   - 404: Service not found.
 *   - 500: Internal server error.
 */


export const addServiceCredentials = async (req, res) => {
  try {
    const { service_id, userId, credentials } = req.body;

    // Validate service_id existence
    const service = await ServiceList.findById(service_id);
    if (!service) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: IntegrationMessages.SERVICE_NOT_FOUND,
      });
    }

    const authType = credentials?.otherFields?.authType;

    if (authType === "OAuth") {
      if (!credentials.authFields?.refresh_token) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: IntegrationMessages.VALIDATE_REFRESH_TOKEN,
        });
      }

      const existingRefreshToken = await SpecificRefreshToken.findOne({
        service_id
      });
  
        if (!existingRefreshToken) {
          const newRefreshToken = new SpecificRefreshToken({
            service_id,
            refresh_token: credentials.authFields.refresh_token,
            service_name: service.service_name,
          });
          await newRefreshToken.save();
        }
      
    }

    const newServiceCredentials = new ServiceCredentials({
      service_id,
      userId,
      credentials, // Should be an object matching the format of the 'Map' in the schema
      is_active: true, // Default is true, can be omitted if required
    });

    // Save the credentials to the database
    await newServiceCredentials.save();

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: IntegrationMessages.SERVICE_CREDS_ADDED,
      data: newServiceCredentials,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @async
 * @function oauthConnect
 * @description Creates an encrypted OAuth state and returns the authorization URL for user redirection.
 * @param {Object} req - Request with OAuth details in body.
 * @param {Object} res - Response with authorization URL or error.
 * @returns {Response} 200 with URL, 500 on error.
 */

export const oauthConnect = async (req, res) => {
  try {
    const {
      service_id,
      userId,
      authFields,
      authenticateFields,
      oauthurl,
      tokenurl,
      baseurl,
      type,
      contentType,
    } = req.body;

    const stateObject = {
      service_id,
      userId,
      authFields,
      authenticateFields,
      tokenurl,
      baseurl,
      type,
      contentType,
    };

    const encryptedState = CryptoJS.AES.encrypt(
      JSON.stringify(stateObject),
      SECRET_KEY,
    ).toString();

    // const state = JSON.stringify({service_id,userId,authFields, authenticateFields, tokenurl,baseurl, type, contentType});
    // Step 1: Redirect the user to the OAuth URL to get authorization code
    const queryParamsObject = authFields.reduce((acc, field) => {
      acc[field.keyName] = field.keyValue; // Use keyName as the key and keyValue as the value
      return acc;
    }, {});

    const queryParams = new URLSearchParams({
      ...queryParamsObject,
      state: encryptedState, // Add the state parameter
    }).toString();

    const authorizationUrl = `${oauthurl}?${queryParams}`;

    // Step 2: Respond with the authorization URL for the client to redirect the user
    res.status(200).json({
      message: "Redirect the user to this URL to get the authorization code",
      authorizationUrl,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function handleRedirect
 * @description Handles OAuth redirect by exchanging authorization code for tokens,
 * decrypting the state parameter, saving credentials to database, and redirecting to frontend.
 * @param {Object} req - Express request object containing query params: code, state.
 * @param {Object} res - Express response object used for sending responses or redirects.
 * @returns {Response} Redirects to frontend profile on success, or sends error JSON on failure.
 */
export const handleRedirect = async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code) {
      return res.status(400).json({ message: "Authorization code is missing" });
    }

    // Decrypt state parameter
    const bytes = CryptoJS.AES.decrypt(state, SECRET_KEY);
    const decryptedState = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const {
      service_id,
      userId,
      authFields,
      authenticateFields,
      tokenurl,
      baseurl,
      type,
      contentType,
    } = decryptedState;
    // Convert authFields and authenticateFields to key-value pairs
    const formattedAuthFields = authFields.reduce((acc, field) => {
      acc[field.keyName] = field.keyValue;
      return acc;
    }, {});

    const formattedAuthenticateFields = authenticateFields.reduce(
      (acc, field) => {
        acc[field.keyName] = field.keyValue;
        return acc;
      },
      {},
    );

    const commonKey = Object.keys(formattedAuthenticateFields).find((key) =>
      Object.keys(formattedAuthFields).includes(key)
    );
    // Determine client_id and client_secret
    const client_id = commonKey ? formattedAuthenticateFields[commonKey] : null;
    const client_secret = Object.entries(formattedAuthenticateFields).find(
      ([key, value]) => key !== commonKey
    )?.[1];

    if (!client_id || !client_secret) {
      return res.status(400).json({ message: "Missing Client ID or Secret" });
    }

    // Prepare token request parameters
    const params = new URLSearchParams({
      ...formattedAuthenticateFields,
      code,
    });

    let response;
    if (type === "Basic") {
      const body = Object.fromEntries(params);
      response = await axios.post(tokenurl, body, {
        headers: { "Content-Type": `${contentType}` },
      });
    } else {
      // Encode client_id and client_secret to Base64
      const base64token = Buffer.from(`${client_id}:${client_secret}`).toString(
        "base64",
      );

      // Create form-data for the request
      let formData = new FormData();
      for (const [key, value] of params.entries()) {
        formData.append(key, value);
      }

      // Make the POST request
      response = await axios.post(tokenurl, formData, {
        headers: {
          "Content-Type": `${params.contentType}`,
          Authorization: `Basic ${base64token}`,
        },
      });
    }
    if (!response.data) {
      throw new Error("Response data is undefined or null");
    }
    const extractLatestAccessToken = (data) => {
      if (typeof data !== "object" || data === null) return null;
    
      let latestToken = null;
      const stack = [data]; // Initialize stack with response data
    
      while (stack.length > 0) {
        const currentObj = stack.pop(); // Get the last object from stack
    
        for (const key in currentObj) {
          if (key === "access_token" && typeof currentObj[key] === "string") {
            latestToken = currentObj[key]; // Always store the latest token found
          } else if (typeof currentObj[key] === "object" && currentObj[key] !== null) {
            stack.push(currentObj[key]); // Add nested objects to stack
          }
        }
      }
    
      return latestToken;
    };
    

    let data;
    if (typeof response.data === "string") {
      try {
        data = JSON.parse(response.data);
      } catch (err) {
        throw new Error("Failed to parse response data string as JSON");
      }
    } else if (typeof response.data === "object" && response.data !== null) {
      data = response.data;
    } else {
      throw new Error("Unexpected data type for response.data");
    }

    // Extract token details
    const access_token = extractLatestAccessToken(data) || null;
    const refresh_token = data.refresh_token || null;
    const expires_in = data.expires_in || null;

    let expirationTimestamp = null;
    if (expires_in) {
      const currentTime = Math.floor(Date.now() / 1000);
      expirationTimestamp = currentTime + expires_in;
    }

    // Save credentials to database
    const credentials = new ServiceCredentials({
      service_id,
      userId,
      credentials: {
        authFields: {
          access_token,
          refresh_token,
          expires_in,
          expiration_time: expirationTimestamp,
        },
        otherFields: {
          authType: "OAuth",
          baseUrl: baseurl,
          refresh_tokenurl: tokenurl,
          authorization_type: type,
        },
      },
      is_active: true,
    });

    await credentials.save();

    // Handle refresh token for Google Apps
    const service = await ServiceList.findById(service_id);
    if (service.is_google_app && refresh_token) {
      const existingRefreshToken = await SpecificRefreshToken.findOne({
        service_id,
        userId,
      });

      if (!existingRefreshToken) {
        const newRefreshToken = new SpecificRefreshToken({
          service_id,
          userId,
          refresh_token,
          service_name: service.service_name,
        });
        await newRefreshToken.save();
      }
    }

    // Redirect user to frontend
    const frontendRedirectUrl = `${process.env.CLIENT_URL}/profile`;
    return res.redirect(frontendRedirectUrl);
  } catch (error) {
    console.error("Error during token exchange:", error);
    return res.status(500).json({
      message: "Error exchanging authorization code for tokens",
    });
  }
};


/**
 * @async
 * @function getServiceCredentials
 * @description Retrieves service credentials for a specified user and service.
 * @param {Object} req - Request object containing userId and service_id in the body.
 * @param {Object} res - Response object to send back success or error messages.
 * @returns {Response} HTTP 200 with credentials found or not found message, 500 for server errors.
 */

export const getServiceCredentials = async (req, res) => {
  try {
    const { userId, service_id } = req.body;

    // Validate service_id existence
    const service = await ServiceCredentials.findOne({
      userId,
      service_id,
    });
    if (!service) {
      return res.status(StatusCodes.OK).json({
        success: false,
        message: IntegrationMessages.SERVICE_NOT_FOUND,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: service,
      message: IntegrationMessages.GET_SERVICE_CREDS,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * @async
 * @function deleteServiceCreds
 * @description Deletes service credentials for a given service ID. Can delete credentials for a specific user or all users depending on the deleteAll flag.
 * @param {Object} req - Request object containing service_id, userId, and deleteAll flag in the body.
 * @param {Object} res - Response object used to send success or error messages.
 * @returns {Response} HTTP 200 with success or failure message, 404 if the service does not exist, 500 for server errors.
 */

export const deleteServiceCreds = async (req, res) => {
  try {
    const { service_id, userId, deleteAll } = req.body;

    // Validate service_id existence
    const service = await ServiceList.findById(service_id);
    if (!service) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: IntegrationMessages.SERVICE_NOT_FOUND,
      });
    }

    let deletedCredentials;

    if (deleteAll) {
      // Delete all credentials associated with the service_id
      deletedCredentials = await ServiceCredentials.deleteMany({ service_id });
    } else {
      // Delete only the credential associated with service_id and userId
      deletedCredentials = await ServiceCredentials.findOneAndDelete({ service_id, userId });
    }

    if (!deletedCredentials || (deletedCredentials.deletedCount === 0)) {
      return res.status(StatusCodes.OK).json({
        success: false,
        message: IntegrationMessages.SERVICE_CREDS_NOT_FOUND,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: IntegrationMessages.SERVICE_CREDS_DELETED,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};


/**
 * @async
 * @function addApiEndpoint
 * @description Validates input, processes parameters, creates and saves a new API endpoint and its corresponding function definition.
 * @param {Object} req - Request object containing service_id, api_name, api_endpoint, method, description, and parameters in body.
 * @param {Object} res - Response object returning success status, created API endpoint data, or error message.
 * @returns {Response} 201 with new API endpoint on success, 400 for validation errors, 404 if service not found, 500 on server error.
 */

export const addApiEndpoint = async (req, res) => {
  try {
    const {
      service_id,
      api_name,
      api_endpoint,
      method,
      description,
      parameters,
    } = req.body;

    // Validate the service_id
    const service = await ServiceList.findById(service_id);
    if (!service) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: IntegrationMessages.SERVICE_NOT_FOUND,
      });
    }

    // Validate the method
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    if (!allowedMethods.includes(method)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: `Invalid method. Allowed methods are: ${allowedMethods.join(", ")}.`,
      });
    }

    // Process and validate parameters
    let processedParameters = [];
    if (parameters && Array.isArray(parameters)) {
      processedParameters = parameters.map((param) => {
        const [key, value] = Object.entries(param)[0]; // Get key-value pair from object
        return {
          name: key,
          type: value.type || "string", // Default to string if type is missing
          description: value.description || "", // Default to empty if description is missing
          required: value.required || false, // Default to false if required is missing
        };
      });
    } else if (parameters) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: IntegrationMessages.INVALID_PARAMS,
      });
    }

    // Create a new API endpoint record
    const newServiceApi = new ServiceApi({
      service_id,
      api_name,
      api_endpoint,
      method,
      description: description || "No description provided", // Default description
      parameters: processedParameters, // Processed parameters
      is_allowed: true, // Default value
    });

    // Save the new API endpoint to the database
    await newServiceApi.save();
    const newFunction = new FunctionDefinition({
      title: api_name,
      name: api_name,
      definition: api_endpoint,
      instruction: description,
      description: description,
      parameters: processedParameters || "no params",
      service_id: service_id,
    });
    await newFunction.save();
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: IntegrationMessages.API_ENDPOINT_ADDED,
      data: newServiceApi,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @async
 * @function deleteApiEndpoint
 * @description Deletes a specific API endpoint by its ID and returns the updated list of APIs for the associated service.
 * @param {Object} req - Request object containing api_id in the URL parameters.
 * @param {Object} res - Response object with success status, message, and updated API list or error message.
 * @returns {Response} 200 with updated API list on success, 404 if API not found, 500 on server error.
 */

export const deleteApiEndpoint = async (req, res) => {
  const { api_id } = req.params;
  try {
    const api = await ServiceApi.findOne({ _id: api_id });
    if (!api) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: IntegrationMessages.API_NOT_FOUND,
      });
    }
    const service_id = api.service_id;
    await ServiceApi.deleteOne({ _id: api_id });
    const remainingApi = await ServiceApi.find({ service_id });

    res.status(StatusCodes.OK).json({
      success: true,
      message: IntegrationMessages.API_DELETED,
      data: remainingApi,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * @async
 * @function updateServiceStatus
 * @description Updates the active status (is_active) of a service by its ID.
 * @param {Object} req - Request object containing service_id in URL parameters and is_active in the body.
 * @param {Object} res - Response object with success message and updated service data, or error message.
 * @returns {Response} 200 on successful update, 404 if service not found, 500 on server error.
 */

export const updateServiceStatus = async (req, res) => {
  const { service_id } = req.params;
  const { is_active } = req.body;
  try {
    const updatedService = await ServiceList.findOneAndUpdate(
      { _id: service_id },
      { is_active },
      { new: true },
    );

    if (!updatedService) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: "Service not found",
      });
    }

    res.status(StatusCodes.OK).json({
      message: "Service status updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service status:", error);

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Error updating service status",
    });
  }
};

/**
 * @async
 * @function updateService
 * @description Updates an existing service by ID with provided fields, parses JSON fields if needed, 
 *              handles optional service icon update, and saves changes to the database.
 * @param {Object} req - Request object with service ID in params and updated fields in body, plus optional file upload.
 * @param {Object} res - Response object returning success status, updated service data, or error message.
 * @returns {Response} 200 with updated service on success, 404 if service not found, 500 on server error.
 */

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    let {
      name,
      slug,
      description,
      is_active,
      is_google_app,
      oauthurl,
      tokenurl,
      baseurl,
      authType,
      authFields,
      authenticateFields,
      headers,
      type,
      contentType,
      userId
    } = req.body;
    const serviceIconPath = req.file ? req.file.path : null;

    // Parse JSON fields if they are strings
    if (typeof authFields === "string") authFields = JSON.parse(authFields);
    if (typeof authenticateFields === "string") authenticateFields = JSON.parse(authenticateFields);
    if (typeof headers === "string") headers = JSON.parse(headers);

    // Find service by ID
    const existingService = await ServiceList.findById(id);
    if (!existingService) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: IntegrationMessages.API_NOT_FOUND,
      });
    }

    // Update fields
    existingService.userId = userId ?? existingService.userId;
    existingService.service_name = name ?? existingService.service_name;
    existingService.slug = slug ?? existingService.slug;
    existingService.description = description ?? existingService.description;
    existingService.is_active = false;
    existingService.is_google_app = is_google_app ?? existingService.is_google_app;
    existingService.oauthurl = oauthurl ? oauthurl.replace(/\/$/, "") : existingService.oauthurl;
    existingService.tokenurl = tokenurl ? tokenurl.replace(/\/$/, "") : existingService.tokenurl;
    existingService.baseurl = baseurl ? baseurl.replace(/\/$/, "") : existingService.baseurl;
    existingService.authType = authType ?? existingService.authType;
    existingService.authFields = authFields ?? existingService.authFields;
    existingService.authenticateFields = authenticateFields ?? existingService.authenticateFields;
    existingService.headers = headers ?? existingService.headers;
    existingService.type = type ?? existingService.type;
    existingService.contentType = contentType ?? existingService.contentType;

    // Update service icon if a new file is uploaded
    if (serviceIconPath) {
      existingService.service_icon = serviceIconPath;
    }

    // Save updated service
    await existingService.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: IntegrationMessages.API_UPDATED,
      data: existingService,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};

export const getServiceCredentialsId = async (req, res) => {
  try {
    const { userId, service_id, slug } = req.body;
    if (!service_id && !slug) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Either service_id or slug must be provided",
      });
    }

    let actualServiceId = service_id;
    if (!actualServiceId && slug) {
      const serviceConfig = await ServiceList.findOne({ slug });
      
      if (!serviceConfig) {
        return res.status(StatusCodes.OK).json({
          success: false,
          message: `Service with slug '${slug}' not found`,
        });
      }
      actualServiceId = serviceConfig._id;
    }
    const serviceCredentials = await ServiceCredentials.findOne({
      userId,
      service_id: actualServiceId,
    });

    if (!serviceCredentials) {
      return res.status(StatusCodes.OK).json({
        success: false,
        message: IntegrationMessages.SERVICE_NOT_FOUND,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: serviceCredentials,
      message: IntegrationMessages.GET_SERVICE_CREDS,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message,
    });
  }
};
