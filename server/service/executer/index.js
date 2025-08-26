import { dynamicApiHandler } from './IntegrateApps.js';

export const Executer = async (
    slug,
    endpoint,
    method,
    credentials,
    argument,
    service_id,
    creds_id,
    userId
  ) => {
    try {
      const result = await dynamicApiHandler(
        endpoint,
        method,
        credentials,
        argument,
        service_id,
        creds_id,
        userId
      );
      // Convert data to string to measure size
      let dataString = JSON.stringify(result.data);
      const maxSize = 524288; // 512 KB in bytes
  
      if (new TextEncoder().encode(dataString).length > maxSize) {
        // Trim the data
        dataString = dataString.slice(0, maxSize) + '... [Data trimmed due to size limit]';
      }
  
      // Parse the trimmed string back to JSON (if possible) before returning
      try {
        return JSON.parse(dataString);
      } catch {
        return { message: 'Data trimmed and cannot be parsed to JSON' };
      }
    } catch (error) {
      console.error(`Error executing slug "${slug}": ${error.message}`);
      throw error;
    }
  };
  