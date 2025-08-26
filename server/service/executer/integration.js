import axios, { formToJSON } from 'axios';
import ServiceList from '../../models/integration/serviceListModel.js';
import ServiceCredentials from '../../models/integration/serviceCredentialsModel.js';
const getNewAccessToken = async (refreshToken, url, type, service_id, id) => {
    try {
        const service = await ServiceList.findOne({_id : service_id});
        const authenticateFields = service.authenticateFields;
            const formattedAuthenticateFields = authenticateFields.reduce((acc, field) => {
                acc[field.keyName] = field.keyValue;
                return acc;
              }, {});
        if(type == 'Basic'){
            
            const body = {
                client_id : formattedAuthenticateFields.client_id,
                client_secret : formattedAuthenticateFields.client_secret,
                grant_type : 'refresh_token',
                refresh_token : refreshToken
            }
            const response = axios.post(service.tokenurl,body,{
                headers : { 'Content-Type': `${service.contentType}`}
            })
            let data;

            // Determine the type of response.data
            if (typeof response.data === 'string') {
            // If response.data is a string, try parsing it as JSON
            try {
                data = JSON.parse(response.data);
            } catch (err) {
                throw new Error('Failed to parse response data string as JSON');
            }
            } else if (typeof response.data === 'object' && response.data !== null) {
            // If response.data is an object, use it directly
            data = response.data;
            } else {
            throw new Error('Unexpected data type for response.data');
            }

            // Extract required fields or set to null if not available
            const access_token = data.access_token || null;
            const refresh_token = data.refresh_token || null;
            const expires_in = data.expires_in || null;

            if (!access_token && !refresh_token) {
            console.warn('Both access_token and refresh_token are missing in the response. They are being saved as null.');
            }

            // Calculate expiration time (only if expires_in is available)
            let expirationTimestamp = null;
            if (expires_in) {
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            expirationTimestamp = currentTime + expires_in; // Expiration time in seconds
            }

            const filter = { _id : id };
            const update = {
                $set: {
                  'credentials.authFields': {
                    access_token: access_token,
                    refresh_token : refreshToken, // Replace with actual token or null if not available
                    expires_in: expires_in, // Replace with actual value or null if not available
                    expiration_time: expirationTimestamp, // Replace with calculated expiration time or null
                  },
                },
              };

              const result = await ServiceCredentials.updateOne(filter, update);
              return access_token;
        }else {
                
              const client_id = formattedAuthenticateFields.client_id;
              const client_secret = formattedAuthenticateFields.client_secret;
              const base64token = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
              
              const updatedAuthenticateFields = {
                ...formattedAuthenticateFields,
                grant_type: 'refresh_token', // Override the value of grant_type
            };
              const params = new URLSearchParams({
                ...updatedAuthenticateFields,
                refresh_token : refreshToken
              });
              
              let formData = new FormData();
                    for (const [key, value] of params.entries()) {
                        
                        formData.append(key, value); // Append each key-value pair to form-data
                    }

              const response = await axios.post(
                service.tokenurl,
                formData,
                {
                    headers: {
                        'Content-Type': `${service.contentType}`, // Automatically sets the correct Content-Type for form-data
                        'Authorization': `Basic ${base64token}`,
                    },
                }
            );

            let data;

            // Determine the type of response.data
            if (typeof response.data === 'string') {
            // If response.data is a string, try parsing it as JSON
            try {
                data = JSON.parse(response.data);
            } catch (err) {
                throw new Error('Failed to parse response data string as JSON');
            }
            } else if (typeof response.data === 'object' && response.data !== null) {
            // If response.data is an object, use it directly
            data = response.data;
            } else {
            throw new Error('Unexpected data type for response.data');
            }

            // Extract required fields or set to null if not available
            const access_token = data.access_token || null;
            const refresh_token = data.refresh_token || null;
            const expires_in = data.expires_in || null;

            if (!access_token && !refresh_token) {
            console.warn('Both access_token and refresh_token are missing in the response. They are being saved as null.');
            }

            // Calculate expiration time (only if expires_in is available)
            let expirationTimestamp = null;
            if (expires_in) {
            const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
            expirationTimestamp = currentTime + expires_in; // Expiration time in seconds
            }
            
            const filter = { _id : id };
            const update = {
                $set: {
                  'credentials.authFields': {
                    access_token: access_token, 
                    refresh_token: refreshToken,// Replace with actual token or null if not available
                    expires_in: expires_in, // Replace with actual value or null if not available
                    expiration_time: expirationTimestamp, // Replace with calculated expiration time or null
                  },
                },
              };

              const result = await ServiceCredentials.updateOne(filter, update);
              return access_token;
        }
    } catch (error) {
        console.error(`Error in refresh token API request: ${error.message}`);
            throw error;
    }
}

export const dynamicApiHandler = async (endpoint, method, credentials, argument, service_id, id) => {
    
    const interpolatedEndpoint = endpoint.includes('{')
        ? endpoint.replace(/\{(\w+)\}/g, (_, key) => {
            if (argument[key] !== undefined) {
                return argument[key];
            } else {
                console.error(`Missing value for placeholder: ${key}`);
                throw new Error(`Missing value for placeholder: ${key}`);
            }
        })
        : endpoint;

    let url;
    let baseurl = credentials.get('otherFields').baseUrl;
    url = baseurl + interpolatedEndpoint;
    let authType = credentials.get('otherFields').authType;

    if(authType == 'OAuth'){
        // make function for below code to use it again
        let access_token;
        let expiration_time = credentials.get('authFields').expiration_time;
        const currentTime = Math.floor(Date.now() / 1000);

        if (expiration_time && expiration_time < currentTime) {
            const refresh_token = credentials.get('authFields').refresh_token;
            const refresh_tokenurl = credentials.get('otherFields').refresh_tokenurl;
            const type = credentials.get('otherFields').authorization_type;
            access_token = await getNewAccessToken(refresh_token, refresh_tokenurl, type, service_id, id);
        }
        else {
         access_token = credentials.get('authFields').access_token;
        }

        const headers = {
            Authorization: `Bearer ${access_token}`, // Make sure to replace access_token with your actual token
        }

        try {
            switch (method.toUpperCase()) {
                case 'GET':
                    return await axios.get(url, 
                        { 
                            headers 
                        }
                    );
    
                case 'POST':
                    
                    return await axios.post(url, argument, { headers });
    
                case 'PUT':
                    return await axios.put(url, argument, { headers });
    
                case 'DELETE':
                    return await axios.delete(url, { headers });
    
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        } catch (error) {
            console.error(`Error in API request: ${error.message}`);
            throw error;
        } 
    }
    else{
        let headers = credentials.get('headers');
        let authFields = credentials.get('authFields');

        try {
            // console.log(`Executing ${method.toUpperCase()} request to URL: ${url}`);
            switch (method.toUpperCase()) {
                case 'GET':
                   
                    return await axios.get(url, 
                        { headers ,
                        auth: authFields
                        });
    
                case 'POST':
                    return await axios.post(url, argument, { headers });
    
                case 'PUT':
                    return await axios.put(url, argument, { headers });
    
                case 'DELETE':
                    return await axios.delete(url, { headers });
    
                default:
                    throw new Error(`Unsupported method: ${method}`);
            }
        } catch (error) {
            console.error(`Error in API request: ${error.message}`);
            throw error;
        }
    }
};