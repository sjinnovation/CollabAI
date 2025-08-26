import { StatusCodes } from "http-status-codes";
import AssistantUsage from "../models/assistantUsageModel.js";
import { AssistantTrackUsage, CommonMessages } from "../constants/enums.js";
import { getAssistantUsageMonthly } from "../service/assistantControllerService.js";
import {getPaginatedAssistantsWithUsageCount} from "../service/assistantUsageService.js";

export const createAssistantUsage = async (req, res, next) => {
  const { assistantId } = req.params;
  const { userId } = req.body;

  try {
    let assistantUsed = await AssistantUsage.findOne({ assistantId, userId })

    if (assistantUsed) {
      assistantUsed.usageCount += 1;
    } else {
      assistantUsed = new AssistantUsage({ assistantId, userId })
    }
    await assistantUsed.save();
    res.status(StatusCodes.CREATED).json({
      message: AssistantTrackUsage.ASSISTANT_USAGE_CREATED_SUCCESSFULLY,
      assistantUsed
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * API: Get All Assistant Usage Monthly
 * Retrieves monthly usage data for assistants.
 * Query Parameters: dateString, page, limit, search, ownerName, sortBy, sortOrder
 * Returns:
 * - Success (200): Assistant usage summary and total data count
 * - Error (500): Internal server error message
 */
export const getAllAssistantUsageMonthly = async (req, res) => {
  const {
    dateString,
    page = 1,
    limit = 10,
    search = "",
    ownerName = "",
    sortBy = "updatedAt",
    sortOrder = "desc",
  } = req.query;

  try {
    const { assistantUsageSummary, totalDataCount } =
      await getAssistantUsageMonthly({
        dateString,
        page,
        limit,
        search,
        ownerName,
        sortBy,
        sortOrder,
      });

    res.status(StatusCodes.OK).json({
      success: true,
      message: AssistantTrackUsage.ASSISTANT_TRACK_USAGE_FETCHED_SUCCESSFULLY,
      assistantUsageSummary,
      totalDataCount,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
export const getAllUsersForAnAssistant = async (req, res) => {
  const { assistantId } = req.params;
  let { dateString } = req.query;

  let dateFilter = {};
  // Date filter setup for the given month
  if (dateString) {
    const startOfMonth = new Date(dateString + '-01');  // Start of the month
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);  // End of the month
    dateFilter = {
      $gte: startOfMonth,
      $lt: endOfMonth
    };
  } else {
    // If no date is provided, you could default to the current month
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0, 23, 59, 59, 999);
    dateFilter = {
      $gte: startOfMonth,
      $lt: endOfMonth
    };
  }

  try {
    const allUniqueUsers = await AssistantUsage.aggregate([
      {
        $match: {
          assistantId,
          createdAt: dateFilter 
        }
      },
      {
        $group: {
          _id: "$userId"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          userId: "$user._id",
          fname: "$user.fname",
          lname: "$user.lname",
          userEmail: "$user.email"
        }
      }
    ]);

    res.status(200).json({
      message: AssistantTrackUsage.ALL_USERS_FETCHED_FOR_ASSISTANT,
      allUniqueUsers
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
}

export const getAllAssistantsWithUsageCount = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await getPaginatedAssistantsWithUsageCount(page, limit);

    res.status(StatusCodes.OK).json({
      success: true,
      message: AssistantTrackUsage.ASSISTANT_TRACK_USAGE_FETCHED_SUCCESSFULLY,
      ...result
    });
  } catch (error) {
    console.error("Error in getAllAssistantsWithUsageCount:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
