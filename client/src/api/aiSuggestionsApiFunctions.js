import { 
  GET_USERS_WITH_AI_SUGGESTIONS, 
  TOGGLE_USER_AI_SUGGESTIONS, 
  BULK_TOGGLE_AI_SUGGESTIONS, 
  EXPORT_AI_SUGGESTIONS_REPORT 
} from "../constants/Api_constants";
import { axiosSecureInstance } from "./axios";
import { message } from "antd";

// Get users with AI suggestions (with pagination, search, filters)
export const getUsersWithAISuggestions = async (params, setUsers, setPagination, setLoading) => {
  try {
    setLoading(true);
    const { page = 1, limit = 10, search = "", role = "all", status = "all", sortBy = "name", sortOrder = "asc" } = params;
    
    const response = await axiosSecureInstance.get(
      GET_USERS_WITH_AI_SUGGESTIONS(page, limit, search, role, status, sortBy, sortOrder)
    );
    
    if (response.data) {
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error fetching users with AI suggestions:", error);
    message.error("Failed to fetch users with AI suggestions");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Toggle AI suggestions for a single user
export const toggleUserAISuggestions = async (userId, enabled, setLoading, onSuccess) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.patch(TOGGLE_USER_AI_SUGGESTIONS(userId), {
      enabled
    });
    
    if (response.data) {
      message.success(response.data.message || `AI suggestions ${enabled ? 'enabled' : 'disabled'} for user`);
      if (onSuccess) onSuccess(response.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error toggling user AI suggestions:", error);
    message.error("Failed to update user AI suggestions");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Bulk toggle AI suggestions for multiple users
export const bulkToggleAISuggestions = async (userIds, enabled, setLoading, onSuccess) => {
  try {
    setLoading(true);
    const response = await axiosSecureInstance.patch(BULK_TOGGLE_AI_SUGGESTIONS(), {
      userIds,
      enabled
    });
    
    if (response.data) {
      message.success(response.data.message || `AI suggestions ${enabled ? 'enabled' : 'disabled'} for ${userIds.length} users`);
      if (onSuccess) onSuccess(response.data);
      return { success: true, data: response.data };
    }
  } catch (error) {
    console.error("Error bulk toggling AI suggestions:", error);
    message.error("Failed to update users");
    return { success: false, error };
  } finally {
    setLoading(false);
  }
};

// Export AI suggestions report
export const exportAISuggestionsReport = async (format = 'json', search = "", role = "all", status = "all", setLoading, onSuccess) => {
    try {
        setLoading(true);
        const response = await axiosSecureInstance.get(EXPORT_AI_SUGGESTIONS_REPORT(format, search, role, status), {
            responseType: format === 'csv' ? 'blob' : 'json'
        });
        
        if (response.data) {
            if (format === 'csv') {
                // Handle CSV download
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'ai-suggestions-report.csv');
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
                message.success("Report downloaded successfully");
            } else {
                // Handle JSON response
                message.success("Report generated successfully");
                if (onSuccess) onSuccess(response.data);
            }
            return { success: true, data: response.data };
        }
    } catch (error) {
        console.error("Error exporting AI suggestions report:", error);
        message.error("Failed to export report");
        return { success: false, error };
    } finally {
        setLoading(false);
    }
}; 