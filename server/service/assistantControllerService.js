import mongoose from "mongoose";
import Assistant from "../models/assistantModel.js";
import AssistantUsage from "../models/assistantUsageModel.js";

const buildAssistantPipeline = (
  matchConditions,
  userObjectId,
  pinnedAssistantIds,
  { filterByUsage = false, pageSize, currentPage }
) => {
  const pipeline = [
    { $match: matchConditions },
    {
      $lookup: {
        from: "assistantusages",
        let: { assistantId: "$assistant_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$assistantId", "$$assistantId"] },
                  { $eq: ["$userId", userObjectId] },
                ],
              },
            },
          },
          {
            $group: {
              _id: null,
              usageCount: { $sum: "$usageCount" },
              lastUsed: { $max: "$updatedAt" },
            },
          },
          { $project: { _id: 0, usageCount: 1, lastUsed: 1 } },
        ],
        as: "usageData",
      },
    },
    // Filter only assistants with usage if filterByUsage is true
    ...(filterByUsage
      ? [{ $match: { "usageData.0": { $exists: true } } }]
      : []),
    {
      $lookup: {
        from: "favourite_assistants",
        let: { assistantId: "$assistant_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$assistant_id", "$$assistantId"] },
                  { $eq: ["$user_id", userObjectId] },
                ],
              },
            },
          },
          { $project: { _id: 0 } },
        ],
        as: "favoriteData",
      },
    },
    {
      $addFields: {
        usageCount: {
          $ifNull: [{ $arrayElemAt: ["$usageData.usageCount", 0] }, 0],
        },
        lastUsed: { $arrayElemAt: ["$usageData.lastUsed", 0] },
        isFavorite: { $gt: [{ $size: "$favoriteData" }, 0] },
        isPinned: { $in: ["$assistant_id", pinnedAssistantIds] },
      },
    },
    {
      $addFields: {
        priority: {
          $cond: [{ $eq: ["$isPinned", true] }, 1, 2],
        },
        pinnedIndex: {
          $cond: [
            { $eq: ["$isPinned", true] },
            { $indexOfArray: [pinnedAssistantIds, "$assistant_id"] },
            99999,
          ],
        },
        // Check if the assistant was used in the last 24 hours
        usedInLast24Hours: {
          $cond: [
            {
              $gte: ["$lastUsed", new Date(Date.now() - 24 * 60 * 60 * 1000)],
            },
            true,
            false,
          ],
        },
      },
    },
    {
      $sort: {
        priority: 1,
        pinnedIndex: 1,
        usedInLast24Hours: -1,
        usageCount: -1,
        lastUsed: -1,
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: (currentPage - 1) * pageSize }, { $limit: pageSize }],
      },
    },
    {
      $project: {
        assistantList: "$data",
        total: { $arrayElemAt: ["$metadata.total", 0] },
      },
    },
  ];

  return pipeline;
};

export const getAssistantsBySearchQuery = async (
  searchConditionOnName,
  userObjectId,
  authenticatedUser,
  pinnedAssistantIds,
  pageSize,
  currentPage
) => {
  const teamObjectIds = (authenticatedUser?.teams || []).map(
    (teamId) => new mongoose.Types.ObjectId(teamId)
  );

  // Build match conditions with the search query on name.
  let matchConditions = {
    is_deleted: false,
    is_active: true,
    name: searchConditionOnName,
  };

  if (authenticatedUser?.role !== "superadmin") {
    matchConditions.$or = [
      { is_public: true },
      { userId: authenticatedUser._id, category: "PERSONAL" },
      { teamId: { $in: teamObjectIds }, category: "ORGANIZATIONAL" },
    ];
  }

  const pipeline = buildAssistantPipeline(
    matchConditions,
    userObjectId,
    pinnedAssistantIds,
    { filterByUsage: false, pageSize, currentPage }
  );

  const aggregatedResult = await Assistant.aggregate(pipeline);
  const result = aggregatedResult[0] || {};
  const total = result?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    assistantList: result?.assistantList || [],
    totalPages,
  };
};

export const getAssistantsWithUsage = async (
  userObjectId,
  authenticatedUser,
  pinnedAssistantIds,
  pageSize,
  currentPage
) => {
  const teamObjectIds = (authenticatedUser?.teams || []).map(
    (teamId) => new mongoose.Types.ObjectId(teamId)
  );

  // Build match conditions without the search condition.
  let matchConditions = {
    is_deleted: false,
    is_active: true,
  };

  if (authenticatedUser?.role !== "superadmin") {
    matchConditions.$or = [
      { is_public: true },
      { userId: authenticatedUser._id, category: "PERSONAL" },
      { teamId: { $in: teamObjectIds }, category: "ORGANIZATIONAL" },
    ];
  }

  const pipeline = buildAssistantPipeline(
    matchConditions,
    userObjectId,
    pinnedAssistantIds,
    { filterByUsage: true, pageSize, currentPage }
  );

  const aggregatedResult = await Assistant.aggregate(pipeline);
  const result = aggregatedResult[0] || {};
  const total = result?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  return {
    assistantList: result?.assistantList || [],
    totalPages,
  };
};

export const getAssistantUsageMonthly = async ({
  dateString,
  page = 1,
  limit = 10,
  search = "",
  ownerName = "",
  sortBy = "updatedAt",
  sortOrder = "desc",
}) => {
  page = Number(page);
  limit = Number(limit);
  sortOrder = sortOrder === "asc" ? 1 : -1;

  const filter = {};
  let dateFilter = {};

  if (dateString) {
    const startOfMonth = new Date(`${dateString}-01`);
    const endOfMonth = new Date(
      startOfMonth.getFullYear(),
      startOfMonth.getMonth() + 1,
      1
    );
    dateFilter = { $gte: startOfMonth, $lt: endOfMonth };
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
    dateFilter = { $gte: startOfMonth, $lt: endOfMonth };
  }
  filter.createdAt = dateFilter;

  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: { assistantId: "$assistantId", userId: "$userId" },
        userUsageCount: { $sum: "$usageCount" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$_id.assistantId",
        totalUsageCount: { $sum: "$userUsageCount" },
        userUsageDetails: {
          $push: {
            userId: "$_id.userId",
            usageCount: "$userUsageCount",
          },
        },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "assistants",
        localField: "_id",
        foreignField: "assistant_id",
        as: "assistant",
      },
    },
    { $unwind: "$assistant" },
    {
      $addFields: {
        ownerId: { $ifNull: ["$assistant.createdBy", "$assistant.userId"] },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "ownerId",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        assistantId: "$_id",
        totalUsageCount: 1,
        userUsageDetails: 1,
        assistantName: "$assistant.name",
        createdAt: 1,
        ownerName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$owner.fname", ""] },
                " ",
                { $ifNull: ["$owner.lname", ""] },
              ],
            },
          },
        },
      },
    },
    {
      $addFields: {
        assistantNameLower: { $toLower: "$assistantName" },
        ownerNameLower: { $toLower: "$ownerName" },
      },
    },
    ...(ownerName
      ? [
          {
            $match: {
              ownerName: { $regex: ownerName, $options: "i" },
            },
          },
        ]
      : []),
    {
      $match: {
        $or: [
          { assistantName: { $regex: search, $options: "i" } },
          { ownerName: { $regex: search, $options: "i" } },
        ],
      },
    },
    {
      $sort: {
        [sortBy === "assistantName"
          ? "assistantNameLower"
          : sortBy === "ownerName"
          ? "ownerNameLower"
          : sortBy]: sortOrder,
      },
    },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ];

  const totalDataCountPipeline = [
    { $match: filter },
    {
      $group: {
        _id: { assistantId: "$assistantId", userId: "$userId" },
        userUsageCount: { $sum: "$usageCount" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$_id.assistantId",
        totalUsageCount: { $sum: "$userUsageCount" },
        createdAt: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "assistants",
        localField: "_id",
        foreignField: "assistant_id",
        as: "assistant",
      },
    },
    { $unwind: "$assistant" },
    {
      $addFields: {
        ownerId: { $ifNull: ["$assistant.createdBy", "$assistant.userId"] },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "ownerId",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        assistantId: "$_id",
        assistantName: "$assistant.name",
        ownerName: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$owner.fname", ""] },
                " ",
                { $ifNull: ["$owner.lname", ""] },
              ],
            },
          },
        },
      },
    },
    ...(ownerName
      ? [
          {
            $match: {
              ownerName: { $regex: ownerName, $options: "i" },
            },
          },
        ]
      : []),
    {
      $match: {
        $or: [
          { assistantName: { $regex: search, $options: "i" } },
          { ownerName: { $regex: search, $options: "i" } },
        ],
      },
    },
    { $group: { _id: "$assistantId" } },
    { $count: "totalCount" },
  ];

  const [assistantUsageSummary, totalDataCountResult] = await Promise.all([
    AssistantUsage.aggregate(pipeline),
    AssistantUsage.aggregate(totalDataCountPipeline),
  ]);

  const totalDataCount =
    totalDataCountResult.length > 0 ? totalDataCountResult[0].totalCount : 0;

  return { assistantUsageSummary, totalDataCount };
};
