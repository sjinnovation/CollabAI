import { async } from "q";
import { axiosSecureInstance } from "./axios";
import { FETCH_DAILY_USAGE_REPORT, FETCH_MONTHLY_USAGE_REPORT } from "./track-usage-api-slug";

export const getMonthlyUsageReport = async(userid, selectedMonth)=>{
    try {
        const response = await axiosSecureInstance.get(FETCH_MONTHLY_USAGE_REPORT(userid, selectedMonth));
        const allReport = response.data;
        console.log("allReport:", allReport)
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