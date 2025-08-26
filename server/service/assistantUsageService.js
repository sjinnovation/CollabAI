import AssistantUsage from "../models/assistantUsageModel.js";
import Assistant from "../models/assistantModel.js";
export const getAllAssistantUsageMonthly = async (
  dateString,
  page = 1,
  limit = 10
) => {
  const filter = {};
  let dateFilter = {};
  if (dateString) {
    const startOfMonth = new Date(dateString + "-01");
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      1
    );
    dateFilter = {
      $gte: startOfMonth,
      $lt: endOfMonth,
    };
  } else {
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      1
    );
    dateFilter = {
      $gte: startOfMonth,
      $lt: endOfMonth,
    };
  }

  // filter.createdAt = dateFilter;
  try {
    const assistantUsageSummary = await AssistantUsage.aggregate([
      {
        $match: filter,
      },
      // since userid can be guest, handling that case
      {
        $group: {
          _id: "$assistantId",
          totalUsageCount: { $sum: "$usageCount" },
          uniqueUsers: {
            $addToSet: {
              $cond: [{ $ne: ["$userId", null] }, "$userId", null],
            },
          },
          createdAt: { $first: "$createdAt" },
        },
      },
      {
        $project: {
          assistantId: "$_id",
          _id: 0,
          totalUsageCount: 1,
          uniqueUserCount: { $size: "$uniqueUsers" },
          createdAt: 1,
        },
      },
      {
        $lookup: {
          from: "assistants",
          localField: "assistantId",
          foreignField: "assistant_id",
          as: "assistant",
        },
      },
      {
        $unwind: "$assistant",
      },
      {
        $project: {
          assistantId: 1,
          totalUsageCount: 1,
          uniqueUserCount: 1,
          assistantName: "$assistant.name",
          createdAt: 1,
        },
      },
      { $sort: { totalUsageCount: -1 } }
    ]);

    const totalCountPipeline = [
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$assistantId",
        },
      },
      {
        $count: "totalCount",
      },
    ];

    const totalDataCountResult = await AssistantUsage.aggregate(
      totalCountPipeline
    );
    const totalDataCount =
      totalDataCountResult.length > 0 ? totalDataCountResult[0].totalCount : 0;

    return {
      assistantUsageSummary,
      totalDataCount,
    };
  } catch (error) {
    throw new Error(error);
  }
};


export const getPaginatedAssistantsWithUsageCount = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // Count total documents matching the criteria
  const totalDataCount = await Assistant.countDocuments({
    $or: [
      { category: "PERSONAL", is_public: true },
      { category: "ORGANIZATIONAL" }
    ],
    is_active: true,
    is_deleted: false
  });

  // Aggregate query with modified match conditions
  const assistantsWithUsage = await Assistant.aggregate([
    {
      $match: {
        $or: [
          { category: "PERSONAL", is_public: true },
          { category: "ORGANIZATIONAL" } // No is_public restriction for ORGANIZATIONAL
        ],
        is_active: true,
        is_deleted: false
      }
    },
    {
      $lookup: {
        from: "assistantusages",
        localField: "assistant_id",
        foreignField: "assistantId",
        as: "usageInfo"
      }
    },
    {
      $addFields: {
        totalUsage: {
          $cond: {
            if: { $gt: [{ $size: "$usageInfo" }, 0] },
            then: { $sum: "$usageInfo.usageCount" },
            else: 0
          }
        },
        totalUsers: {
          $cond: {
            if: { $gt: [{ $size: "$usageInfo" }, 0] },
            then: { $size: { $setUnion: "$usageInfo.userId" } }, // Count unique userIds
            else: 0
          }
        }
      }
    },
    { $project: { usageInfo: 0 } },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit }
  ]);

  return {
    totalDataCount,
    currentPage: page,
    totalPages: Math.ceil(totalDataCount / limit),
    data: assistantsWithUsage
  };
};