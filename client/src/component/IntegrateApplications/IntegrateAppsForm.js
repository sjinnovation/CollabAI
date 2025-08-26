import { getService, initOauth } from "../../api/api_endpoints";
import axios from 'axios';

export const AddIntegrateAppsCredsFormData = async (serviceId) => {
    try {
        // Call the API with the serviceId
        const response = await getService(serviceId);

        const { authType, authFields, headers } = response.data.data;
        // Generate form data dynamically based on API response
        let authData = [];
        if(authFields && authFields.length > 0) {
            authData = authFields.map((field) => ({
            label: field.keyName, // Label for the form field
            name: field.keyName, // Name attribute for the form field
            rules: [
                {
                    required: field.required || true, // Use the 'required' property from the API
                    message: field.errorMessage || `Please input ${field.keyName}!`, // Custom error message
                },
            ],
            group: 'authFields'
        }));
        }

        let headerData = [];
        if (headers && headers.length > 0) {
            headerData = headers.map((field) => ({
                label: field.headerKey, // Label for the form field
                name: field.headerKey, // Name attribute for the form field
                rules: [
                    {
                        required: field.required || true, // Use the 'required' property from the API
                        message: field.errorMessage || `Please input ${field.headerKey}!`, // Custom error message
                    },
                ],
                group:'headers'
            }));
        }

        // Add the authType field as a disabled field
        let authTypeField = {
            label: "Authorization Type",
            name: "authType", // Use a fixed name for this field
            rules: [],
            value : authType,
            initialValue: authType, // Display the authType value
            disabled: true, // Make the field read-only
        };
        let baseurl = {
            label: "Base URL",
            name: "baseUrl", // Use a fixed name for this field
            rules: [
            {
                required: true, // Use the 'required' property from the API
                message: "Please input Base URL!", // Custom error message
            },
            {
                type: 'url', // Validate for URL format
                message: "Please enter a valid URL!", // Custom error message for invalid URL
            },
            {
                validator: (_, value) => {
                if (value && value.endsWith('/')) {
                    return Promise.reject(new Error("Base URL should not end with a forward slash!"));
                }
                return Promise.resolve();
                },
            },
            ],
        }
        const formData = [...authData, ...headerData, authTypeField, baseurl];
        return formData;
    } catch (error) {
        console.error("Error fetching form data:", error);
        throw new Error("Failed to fetch form configuration.");
    }
};

export const OauthConnect = async(service_id,authFields, authenticateFields, oauthurl, tokenurl, baseurl, type, contentType) => {
    try {
        const response = await initOauth(service_id,authFields,authenticateFields,oauthurl,tokenurl, baseurl, type, contentType);
        return response.data;
        
    } catch (error) {
        return error.message
    }
}

 export const validateAndRedirect= async(url) => {
    try {
        new URL(url); // Validate URL format

        // Try a lightweight HEAD request to check the server response
        const response = await axios.get(url);
        // Redirect only if HEAD request succeeds
         return response;
        // window.location.href = url;
    } catch (error) {
        console.error("Redirection failed:", error.message);
        return error.message;
    }
}
