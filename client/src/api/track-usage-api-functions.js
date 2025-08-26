import { async } from "q";
import { axiosSecureInstance } from "./axios";
import { FETCH_ALL_USER_LIST_FOR_AN_ASSISTANT, FETCH_DAILY_USAGE_REPORT, FETCH_MONTHLY_ASSISTANT_USAGE_REPORT, FETCH_MONTHLY_USAGE_REPORT, INSERT_DATA_TO_ASSISTANT_USAGE, FETCH_VS_PLUGIN_USAGE_REPORT } from "./track-usage-api-slug";
import { getUserID } from "../Utility/service";

export const getMonthlyUsageReport = async(userid, selectedMonth)=>{
    try {
        const response = await axiosSecureInstance.get(FETCH_MONTHLY_USAGE_REPORT(userid, selectedMonth));
        const allReport = response.data;
        return {
          success: true,
          trackUsage: allReport?.trackUsage,
          aggregatedDataTotal: allReport?.aggregatedDataTotal,
          aggregatedData: allReport?.aggregatedData
        }
       
      } catch (error) {
        console.log("🚀 ~ error fetching monthly track usage:", error)
        return { success: false, message: error?.response?.data?.message };
    }
}



export const getDailyUsageReport = async(userid, dateString)=>{
  try {
      const response = await axiosSecureInstance.get(FETCH_DAILY_USAGE_REPORT(userid, dateString));
      const allReport = response.data;
        console.log("Daily Report:", allReport)
        return {
          success: true,
          trackUsage: allReport?.trackUsage,
          aggregatedDataTotal: allReport?.aggregatedDataTotal,
          aggregatedData: allReport?.aggregatedData
        }
    } catch (error) {
      console.log("🚀 ~ error fetching daily track usage:", error)
      return { success: false, message: error?.response?.data?.message };
  }
}

export const getAssistantMonthlyUsageReport = async (
  selectedMonth,
  page,
  limit = 10,
  ownerName = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  search = ""
) => {
  try {
    const response = await axiosSecureInstance.get(
      `${FETCH_MONTHLY_ASSISTANT_USAGE_REPORT(
        selectedMonth,
        page,
        limit
      )}&ownerName=${encodeURIComponent(
        ownerName
      )}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(
        search
      )}`
    );
    const allReport = response.data?.assistantUsageSummary;
    const totalDataCount = response.data?.totalDataCount;
    return {
      success: true,
      data: allReport,
      totalDataCount,
    };
  } catch (error) {
    return { success: false, message: error?.response?.data?.message };
  }
};

export const getUsersListForAnAssistant = async(selectedMonth='',assistantId)=>{
  try {
      const response = await axiosSecureInstance.get(FETCH_ALL_USER_LIST_FOR_AN_ASSISTANT(selectedMonth,assistantId));
      const userList = response.data?.allUniqueUsers;
      return {
        success: true,
        data: userList
      }
    } catch (error) {
      return { success: false, message: error?.response?.data?.message };
  }
}

export const insertDataToAssistantUsage = async(assistantId)=>{
  const userId = getUserID()
  if(!userId) {
    return null
  }
  try {
      const response = await axiosSecureInstance.post(INSERT_DATA_TO_ASSISTANT_USAGE(assistantId), {userId});
      const insertedData = response.data;
      return {
        success: true,
        data: insertedData
      }
     
    } catch (error) {
      return { success: false, message: error?.response?.data?.message };
  }
}
 

export const getVsPluginUsageReport = async (  
  selectedMonth,
  page,
  limit = 10,
  sortBy = "updatedAt",
  sortOrder = "desc",
  search = ""

) => {
  try {
    const response = await axiosSecureInstance.get(
      `${FETCH_VS_PLUGIN_USAGE_REPORT}?page=${page}&limit=${limit}&date=${selectedMonth || ""}&sortBy=${sortBy}&sortOrder=${sortOrder}&search=${encodeURIComponent(search)}`,

    );

    const allReport = response.data?.data;
    const totalDataCount = response.data?.totalDataCount;

    return {
      success: true,
      data: allReport,
      totalDataCount,
    };
  } catch (error) {
    console.error("Error fetching VS Plugin usage report:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch VS Plugin usage data",
    };
  }
};

export const getVsPluginUserUsage = async (userId) => {
  try {
    const response = await axiosSecureInstance.get(`${FETCH_VS_PLUGIN_USAGE_REPORT}?userId=${userId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error fetching VS Plugin user usage:", error);
    return {
      success: false,
      message: error?.response?.data?.message || "Failed to fetch VS Plugin user usage",
    };
  }
};
