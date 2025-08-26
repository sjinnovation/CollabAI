import { getGeminiAIInstance } from "../config/geminiAi.js";
import { tokenPrices } from "../constants/tokenPrices.js";
import { encoding_for_model } from 'tiktoken';
import TrackUsage from "../models/trackUsageModel.js";
import Teams from "../models/teamModel.js";
import AssistantUsage from "../models/assistantUsageModel.js";

/**
 * Creates a track usage document and saves it to the database.
 * @param {Object} payload - The payload object.
 * @param {string} payload.userId - The user's ID.
 * @param {number} payload.inputTokenCount - The count of input tokens.
 * @param {number} payload.outputTokenCount - The count of output tokens.
 * @param {string} payload.modelUsed - The model used.
 * @param {number} payload.inputTokenPrice - The price of input tokens.
 * @param {number} payload.outputTokenPrice - The price of output tokens.
 * @param {number} payload.totalTokens - The total count of tokens.
 * @param {number} payload.totalCost - The total cost.
 * @returns {Promise<Object>} The created track usage document.
 */
export const createTrackUsage = async (payload) => {
    const trackUsageDoc = await TrackUsage.create({
        user_id: payload.userId,
        input_token: payload.inputTokenCount,
        output_token: payload.outputTokenCount,
        model_used: payload.modelUsed,
        input_token_price: payload.inputTokenPrice,
        output_token_price: payload.outputTokenPrice,
        total_tokens: payload.totalTokens,
        total_token_cost: payload.totalCost,
    });

    await trackUsageDoc.save();

    return trackUsageDoc;
}

export const calculateTokenAndCost = async (input_token, output_token, model_used, botProvider) => {
    
    const { input: inputTokenPrice, output: outputTokenPrice } = tokenPrices[model_used] || { input: 0.01, output: 0.01 };

    const flattenOutputToken = flattenOutputTokenStructure(output_token);

    let inputTokens = 0;
    let outputTokens = 0;

    if (botProvider == "openai") {
      const encoder = encoding_for_model(model_used);
      inputTokens = encoder.encode(input_token);
      outputTokens = encoder.encode(flattenOutputToken);
    }
    else if(botProvider == "gemini"){
        const geminiAi = await getGeminiAIInstance();
        const model = geminiAi.getGenerativeModel({ model: model_used });
        inputTokens = await model.countTokens(input_token);
        outputTokens = await model.countTokens(output_token);
    }

    let totalInputToken = 0;
    let totalOutputToken = 0;
    let totalCost = 0;
    if(botProvider == 'openai'){
        totalInputToken = inputTokens.length;
        totalOutputToken = outputTokens.length;
        totalCost = (Number(totalInputToken) * inputTokenPrice + Number(totalOutputToken) * outputTokenPrice) / 1000;
    } else if(botProvider == 'gemini'){
        totalInputToken = inputTokens.totalTokens;
        totalOutputToken = outputTokens.totalTokens;
        totalCost = (Number(totalInputToken) * inputTokenPrice) + (Number(totalOutputToken) * outputTokenPrice)  / 1000;
    }else if(botProvider == 'claude'){
        //For now since we don't have any  api or  method to calculate  the cost we are setting it to zero  this can be considered  in future scope 
        totalInputToken = 0;
        totalOutputToken = 0;
        totalCost = 0
    }

    const totalTokens = Number(totalInputToken) + Number(totalOutputToken);
    return {
        inputTokenPrice,
        outputTokenPrice,
        inputTokenCount: totalInputToken,
        outputTokenCount: totalOutputToken,
        totalCost,
        totalTokens,
    };
};

export const calculateCostFromTokenCounts = (inputTokenCount = 100, outputTokenCount= 150, modelUsed, botProvider='openai') => {
    const { input: inputTokenPrice, output: outputTokenPrice } = tokenPrices[modelUsed] || { input: 0.01, output: 0.01 };
    
    let totalCost = 0;

    if (botProvider === 'openai') {
        // If the botProvider is 'openai', divide the total by 1000 (assuming this is a pricing rule for 'openai')
        totalCost = (Number(inputTokenCount) * inputTokenPrice + Number(outputTokenCount) * Number(outputTokenPrice)) / 1000;
    } else if (botProvider === 'gemini') {
        // If the botProvider is 'gemini', sum up the costs without division
        totalCost = (Number(inputTokenCount) * inputTokenPrice) + (Number(outputTokenCount) * outputTokenPrice) / 1000;
    }

    return {
        inputTokenPrice,
        outputTokenPrice,
        inputTokenCount,
        outputTokenCount,
        totalCost,
        totalTokens: inputTokenCount + outputTokenCount
    };
};

const flattenOutputTokenStructure = (output_token) => {
    if (Array.isArray(output_token)) {
        return output_token.map(flattenOutputTokenStructure).join('');
    } else if (typeof output_token === 'object' && output_token !== null) {
        return Object.values(output_token).map(flattenOutputTokenStructure).join('');
    } else {
        return output_token?.toString();
    }
};

export const getTrackUsages = async ({ page, limit }) => {
  // Ensure page and limit are positive integers
  page = Math.max(1, parseInt(page));
  limit = Math.max(1, parseInt(limit));

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Define date ranges for today, this month, and last month (in IST)
  const now = new Date();
  now.setUTCHours(now.getUTCHours() + 5, now.getUTCMinutes() + 30); // Adjust to IST

  const dateRanges = [
    // Today: June 18, 2025
    {
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
      },
    },
    // This Month: June 1, 2025 - June 30, 2025
    {
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
        $lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
    },
    // Last Month: May 1, 2025 - May 31, 2025
    {
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: new Date(now.getFullYear(), now.getMonth(), 1),
      },
    },
  ];

  // Aggregation pipeline
  const pipeline = [
    // Match non-deleted TrackUsage records within today, this month, or last month
    {
      $match: {
        isDeleted: false,
        $or: dateRanges,
      },
    },
    // Sort by createdAt descending
    { $sort: { createdAt: -1 } },
    // Skip and limit for pagination
    { $skip: skip },
    { $limit: limit },
    // Lookup User data
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user_id',
      },
    },
    // Unwind user_id array
    { $unwind: { path: '$user_id', preserveNullAndEmptyArrays: true } },
    // Lookup Teams data for user_id.teams
    {
      $lookup: {
        from: 'teams',
        localField: 'user_id.teams',
        foreignField: '_id',
        as: 'teams',
      },
    },
    // Project the desired fields
    {
      $project: {
        id: { $toString: '$_id' },
        user: {
          $cond: {
            if: { $eq: ['$user_id', null] },
            then: null,
            else: {
              id: { $toString: '$user_id._id' },
              firstName: '$user_id.fname',
              lastName: '$user_id.lname',
              username: '$user_id.username',
              email: '$user_id.email',
              status: '$user_id.status',
            },
          },
        },
        team: {
          $map: {
            input: '$teams',
            as: 'team',
            in: {
              id: { $toString: '$$team._id' },
              name: { $ifNull: ['$$team.teamTitle', 'Unknown Team'] },
            },
          },
        },
        inputToken: '$input_token',
        outputToken: '$output_token',
        modelUsed: '$model_used',
        inputTokenPrice: '$input_token_price',
        outputTokenPrice: '$output_token_price',
        totalTokenCost: '$total_token_cost',
        totalTokens: '$total_tokens',
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  // Execute aggregation
  const docs = await TrackUsage.aggregate(pipeline).exec();

  // Count total documents for pagination metadata
  const totalDocs = await TrackUsage.countDocuments({
    isDeleted: false,
    $or: dateRanges,
  });

  // Debug: Check Teams collection directly
  const teamIds = docs
    .filter(doc => Array.isArray(doc.team))
    .flatMap(doc => doc.team.map(team => team.id));
  const teamsCheck = await Teams.find({ _id: { $in: teamIds } })
    .select('teamTitle isDeleted')
    .lean()
    .exec();

  // Calculate total pages
  const totalPages = Math.ceil(totalDocs / limit);

  return {
    docs,
    totalDocs,
    page,
    totalPages,
  };
};





export const getAssistantUsages = async ({ page, limit }) => {
  // Ensure page and limit are positive integers
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, parseInt(limit));

  // Calculate skip value for pagination
  const skip = (pageNum - 1) * limitNum;

  // Aggregation pipeline
  const pipeline = [
    // Match non-deleted AssistantUsage records
    { $match: { isDeleted: { $ne: true } } },
    // Lookup Assistant data
    {
      $lookup: {
        from: 'assistants',
        let: { assistantId: '$assistantId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$assistant_id', '$$assistantId'] }, is_deleted: false } },
        ],
        as: 'assistant',
      },
    },
    // Unwind assistant array
    { $unwind: { path: '$assistant', preserveNullAndEmptyArrays: true } },
    // Lookup User data for userId (also used as owner)
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user',
      },
    },
    // Unwind user array
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    // Lookup Teams data for user.teams
    {
      $lookup: {
        from: 'teams',
        localField: 'user.teams',
        foreignField: '_id',
        as: 'userTeams',
      },
    },
    // Lookup Teams data for assistant.teamId
    {
      $lookup: {
        from: 'teams',
        localField: 'assistant.teamId',
        foreignField: '_id',
        as: 'assistantTeams',
      },
    },
    // Sort by createdAt descending
    { $sort: { createdAt: -1 } },
    // Skip and limit for pagination
    { $skip: skip },
    { $limit: limitNum },
    // Project the desired fields
    {
      $project: {
        id: { $toString: '$_id' },
        assistant: {
          id: '$assistant.assistant_id',
          name: '$assistant.name',
          model: '$assistant.model',
          description: '$assistant.description',
          assistantTypes: '$assistant.assistantTypes',
        },
        user: {
          id: { $toString: '$user._id' },
          firstName: '$user.fname',
          lastName: '$user.lname',
          username: '$user.username',
          email: '$user.email',
          status: '$user.status',
        },
        owner: {
          id: { $toString: '$user._id' },
          name: { $concat: ['$user.fname', ' ', '$user.lname'] },
        },
        userTeams: {
          $map: {
            input: '$userTeams',
            as: 'team',
            in: {
              id: { $toString: '$$team._id' },
              name: { $ifNull: ['$$team.teamTitle', 'Unknown Team'] },
            },
          },
        },
        assistantTeams: {
          $map: {
            input: '$assistantTeams',
            as: 'team',
            in: {
              id: { $toString: '$$team._id' },
              name: { $ifNull: ['$$team.teamTitle', 'Unknown Team'] },
            },
          },
        },
        usageCount: 1,
        usageDate: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];

  // Execute aggregation
  const docs = await AssistantUsage.aggregate(pipeline).exec();

  // Count total documents
  const totalItems = await AssistantUsage.countDocuments({ isDeleted: { $ne: true } });

  // Debug: Check Teams collection
  const teamIds = docs
    .flatMap(doc => [
      ...(doc.userTeams || []).map(team => team.id),
      ...(doc.assistantTeams || []).map(team => team.id),
    ])
    .filter(id => id);
  const teamsCheck = await Teams.find({ _id: { $in: teamIds } })
    .select('teamTitle isDeleted')
    .lean()
    .exec();

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limitNum);
  const hasNextPage = pageNum < totalPages;
  const hasPrevPage = pageNum > 1;
  const nextPage = hasNextPage ? pageNum + 1 : null;
  const prevPage = hasPrevPage ? pageNum - 1 : null;

  return {
    docs,
    pagination: {
      totalItems,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      hasNextPage,
      hasPrevPage,
      nextPage,
      prevPage,
    },
  };
};
