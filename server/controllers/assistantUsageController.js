import { StatusCodes } from "http-status-codes";
import AssistantUsage from "../models/assistantUsageModel.js";
import { AssistantTrackUsage, CommonMessages } from "../constants/enums.js";

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





export const getAllAssistantUsageMonthly = async (req, res) => {
  let { dateString, page = 1, limit = 10 } = req.query;
  const filter = {};
  let dateFilter = {};

  if (dateString) {
    const startOfMonth = new Date(dateString + '-01');
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1);
    dateFilter = {
      $gte: startOfMonth,
      $lt: endOfMonth
    };
  } else {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 1);
    dateFilter = {
      $gte: startOfMonth,
      $lt: endOfMonth
    };
  }

  filter.createdAt = dateFilter;
  try {

    const assistantUsageSummary = await AssistantUsage.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: "$assistantId",
          totalUsageCount: { $sum: "$usageCount" },
          uniqueUsers: { $addToSet: "$userId" },
          createdAt: { $first: "$createdAt" }
        }
      },
      {
        $project: {
          assistantId: "$_id",
          _id: 0,
          totalUsageCount: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          createdAt: 1
        }
      },
      {
        $lookup: {
          from: "assistants",
          localField: "assistantId",
          foreignField: "assistant_id",
          as: "assistant"
        }
      },
      {
        $unwind: "$assistant"
      },
      {
        $project: {
          assistantId: 1,
          totalUsageCount: 1,
          uniqueUserCount: 1,
          assistantName: "$assistant.name",
          createdAt: 1
          }
      },
      { $sort: { totalUsageCount: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    ]);

    const totalCountPipeline = [
      {
        $match: filter
      },
      {
        $group: {
          _id: "$assistantId"
        }
      },
      {
        $count: "totalCount"
      }
    ];

    const totalDataCountResult = await AssistantUsage.aggregate(totalCountPipeline);
    const totalDataCount = totalDataCountResult.length > 0 ? totalDataCountResult[0].totalCount : 0;


    res.status(200).json({
      message: AssistantTrackUsage.ASSISTANT_TRACK_USAGE_FETCHED_SUCCESSFULLY,
      assistantUsageSummary,
      totalDataCount
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};


export const getAllUsersForAnAssistant = async (req, res) => {
  const { assistantId } = req.params;
  try {
    const allUniqueUsers = await AssistantUsage.aggregate([
      {
        $match: {
          assistantId
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