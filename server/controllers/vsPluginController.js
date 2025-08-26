import User from '../models/user.js';
import VsPluginTrackUsage from '../models/vsPluginTrackUsageModel.js';
import { generateToken } from '../utils/vsPluginValidation.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';
import { AuthMessages, UserMessages, PromptMessages,TrackUsageMessage, CommonMessages } from '../constants/enums.js';
import { auth } from 'google-auth-library';
import { StatusCodes } from 'http-status-codes';
import { generateThreadId } from '../utils/generateUuid.js';
import promptVSCodeModel from '../models/promptModelVSCode.js';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

/**
 * Handles user signup by registering an existing user, verifying their email, 
 * generating a session token, and managing the OpenAI API key.
 * 
 * @param {Object} req - The request object containing the user signup data.
 * @param {Object} res - The response object used to send responses back to the client.
 * 
 * @returns {Promise<void>}
 */
export const signup = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: AuthMessages.EMPTY_EMAIL_OR_PASSWORD });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            console.error('User not found:', email);
            return res.status(StatusCodes.NOT_FOUND).json({ error: UserMessages.USER_NOT_FOUND });
        }

        // Declare variables outside the inner try block
        let vsCodeClaudeApiKey, vsCodeOpenaikey, vsCodeClaudeTemperature, vsCodeClaudeMaxToken, vsCodeOpenaiTemperature, vsCodeOpenaiMaxToken;

        // Retrieve API keys from config helper
        try {
            [vsCodeClaudeApiKey, vsCodeOpenaikey, vsCodeClaudeTemperature, vsCodeClaudeMaxToken, vsCodeOpenaiTemperature, vsCodeOpenaiMaxToken] = await Promise.all([
                getOpenAiConfig('vsCodeClaudeApiKey'), // Fixed key name
                getOpenAiConfig('vsCodeOpenaikey'),
                getOpenAiConfig('vsCodeClaudeTemperature'),
                getOpenAiConfig('vsCodeClaudeMaxToken'),
                getOpenAiConfig('vsCodeOpenaiTemperature'),
                getOpenAiConfig('vsCodeOpenaiMaxToken')
            ]);

            
        } catch (error) {
            console.error('Error retrieving API keys:', error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Failed to retrieve API keys.' });
        }

        // Check if API keys exist after retrieval
        if (!vsCodeOpenaikey) {
            console.error('OpenAI API key not found');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: PromptMessages.OPENAI_KEY_NOT_FOUND });
        }

        if (!vsCodeClaudeApiKey) {
            console.error('Claude API key not found');
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: PromptMessages.CLAUDE_KEY_NOT_FOUND });
        }

        // Generate a JWT session token with both API keys
        const sessionToken = generateToken({
            userId: user._id,
            email: user.email,
            vsCodeClaudeApiKey,
            vsCodeOpenaikey,
            vsCodeClaudeTemperature,
            vsCodeClaudeMaxToken,
            vsCodeOpenaiTemperature,
            vsCodeOpenaiMaxToken,
            promptThreshold: 5
        });

        return res.status(StatusCodes.CREATED).json({ 
            message: AuthMessages.USER_REGISTERED_SUCCESSFULLY, 
            sessionToken 
        });

    } catch (error) {
        console.error('Signup error:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: PromptMessages.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Tracks the number of prompts and tokens used by a user.
 * Creates usage entry in the database.
 * 
 * @param {Object} req - The request object containing authenticated user and usage data.
 * @param {Object} res - The response object to return tracking status.
 * 
 * @returns {Promise<void>}
 */
export const trackUsage = async (req, res) => {
    try {
        const { email } = req.user;
        let { usage, tokenCount, openaiUsage, claudeUsage } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: UserMessages.USER_NOT_FOUND });
        }

        // Ensure proper data types and valid values
        usage = typeof usage === 'number' && usage > 0 ? usage : 0;
        tokenCount = typeof tokenCount === 'number' && tokenCount >= 0 ? tokenCount : 0;
        openaiUsage = typeof openaiUsage === 'number' && openaiUsage >= 0 ? openaiUsage : 0;
        claudeUsage = typeof claudeUsage === 'number' && claudeUsage >= 0 ? claudeUsage : 0;

        // creates new entry for tracking usage
        let trackUsageEntry = await VsPluginTrackUsage.create({
                user_id: user._id,
                total_tokens: tokenCount,
                total_prompt_count: usage,
                openAi_count: openaiUsage,
                claude_count: claudeUsage,
            });

        return res.json({
            message: TrackUsageMessage.TRACK_USAGE_FETCHED_SUCCESSFULLY,
            currentPromptCount: trackUsageEntry.total_prompt_count || 0,
            currentTokenCount: trackUsageEntry.total_tokens || 0,
            currentOpenAiUsage: trackUsageEntry.openAi_count || 0,
            currentClaudeUsage: trackUsageEntry.claude_count || 0,
            threshold: 5, // Static threshold, can be made configurable
        });

    } catch (error) {
        console.error('Error tracking usage:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: PromptMessages.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Retrieves usage statistics either for a specific user or as a paginated list.
 * Supports filtering by date, user email, and sorting.
 * Aggregates multiple entries per user into a single row.
 * 
 * @param {Object} req - The request object containing query params for filter, pagination, and sorting.
 * @param {Object} res - The response object to return usage data.
 * 
 * @returns {Promise<void>}
 */
export const getUsage = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            date,
            sortBy = 'updatedAt',
            sortOrder = 'desc',
            search = '',
            userId
        } = req.query;

        // If querying a specific user by ID
        if (userId) {
            const user = await User.findById(userId);
            if (!user) return res.status(StatusCodes.NOT_FOUND).json({ error: UserMessages.USER_NOT_FOUND });

            // Aggregate usage data for specific user
            const aggregatedData = await VsPluginTrackUsage.aggregate([
                { $match: { user_id: user._id } },
                {
                    $group: {
                        _id: '$user_id',
                        total_prompt_count: { $sum: '$total_prompt_count' },
                        total_tokens: { $sum: '$total_tokens' },
                        updatedAt: { $max: '$updatedAt' },
                        openAi_count: { $sum: '$openAi_count' },
                        claude_count: { $sum: '$claude_count' }, 
                        // deepseek_count: { $sum: '$deepseek_count' },
                    }
                }
            ]);

            if (!aggregatedData || aggregatedData.length === 0) {
                return res.status(StatusCodes.NOT_FOUND).json({ error: TrackUsageMessage.TRACK_USAGE_DATA_NOT_FOUND });
            }

            const usageData = aggregatedData[0];
            return res.status(StatusCodes.OK).json({
                success: true,
                data: {
                    user_id: user._id,
                    email: user.email,
                    total_prompt_count: usageData.total_prompt_count || 0,
                    total_tokens: usageData.total_tokens || 0,
                    updatedAt: usageData.updatedAt,
                },
            });
        }

        // Build aggregation pipeline for list mode
        const pipeline = [];

        // Match stage for filtering
        const matchConditions = {};
        
        // Filter by month/year if provided
        if (date) {
            const [year, month] = date.split('-').map(Number);
            const startDate = new Date(Date.UTC(year, month - 1, 1));
            const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            matchConditions.updatedAt = { $gte: startDate, $lte: endDate };
        }

        // Filter users by email (search term)
        if (search) {
            const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
            const userIds = users.map(user => user._id);
            matchConditions.user_id = { $in: userIds };
        }

        if (Object.keys(matchConditions).length > 0) {
            pipeline.push({ $match: matchConditions });
        }

        // Group by user_id and sum the usage data
        pipeline.push({
            $group: {
                _id: '$user_id',
                total_prompt_count: { $sum: '$total_prompt_count' },
                total_tokens: { $sum: '$total_tokens' },
                updatedAt: { $max: '$updatedAt' },
                openAi_count: { $sum: '$openAi_count' },
                claude_count: { $sum: '$claude_count' },
                // deepseek_count: { $sum: '$deepseek_count' },
            }
        });

        // Lookup user details
        pipeline.push({
            $lookup: {
                from: 'users',
                localField: '_id',
                foreignField: '_id',
                as: 'user'
            }
        });

        // Unwind user array
        pipeline.push({ $unwind: '$user' });

        // Project final structure
        pipeline.push({
            $project: {
                user_id: '$_id',
                email: '$user.email',
                total_prompt_count: 1,
                total_tokens: 1,
                updatedAt: 1,
                openAi_count: 1,
                claude_count: 1,
                // deepseek_count: 1,
            }
        });

        // Determine sorting field and order
        const sortField =
            sortBy === 'totalPromptCount' ? 'total_prompt_count' :
            sortBy === 'totalTokenCount' ? 'total_tokens' :
            sortBy === 'openAiUsage' ? 'openAi_count' :
            sortBy === 'claudeUsage' ? 'claude_count' :
            // sortBy === 'deepseekUsage' ? 'deepseek_count' :
            sortBy;

        const sortStage = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
        pipeline.push({ $sort: sortStage });

        // Get total count for pagination
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await VsPluginTrackUsage.aggregate(countPipeline);
        const totalDataCount = countResult.length > 0 ? countResult[0].total : 0;

        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limitNum });

        // Execute aggregation
        const usageData = await VsPluginTrackUsage.aggregate(pipeline);

        // Format for frontend consumption
        const formattedData = usageData.map(entry => ({
            user_id: entry.user_id,
            email: entry.email || 'Unknown User',
            total_prompt_count: entry.total_prompt_count || 0,
            total_tokens: entry.total_tokens || 0,
            updatedAt: entry.updatedAt,
            openAi_count: entry.openAi_count || 0,
            claude_count: entry.claude_count || 0,
            // deepseek_count: entry.deepseek_count || 0,
        }));

        return res.status(StatusCodes.OK).json({
            success: true,
            data: formattedData,
            totalDataCount,
        });

    } catch (error) {
        console.error('Error retrieving usage data:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: PromptMessages.INTERNAL_SERVER_ERROR });
    }
};



/**
 * Retrieves usage statistics either for a specific user or as a paginated list.
 * Supports optional filtering by date and user email.
 *
 * @param {Object} req - Express request object. Accepts the following query parameters:
 *   @param {number} [page=1] - Page number for pagination.
 *   @param {number} [limit=10] - Number of records per page.
 *   @param {string} [date] - Filter by month/year in format YYYY-MM.
 *   @param {string} [search] - Search term for user email.
 *   @param {string} [userId] - If provided, returns usage for the specific user.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} - Returns JSON response with either specific user usage or paginated results.
 */
export const getUsageForTower = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            date,
            search = '',
            userId
        } = req.query;

        // If querying a specific user by ID
        if (userId) {
            const user = await User.findById(userId).select('email fname lname');
            if (!user) return res.status(StatusCodes.NOT_FOUND).json({ error: UserMessages.USER_NOT_FOUND });

            const usageData = await VsPluginTrackUsage.findOne({ user_id: user._id });
            if (!usageData) return res.status(StatusCodes.NOT_FOUND).json({ error: TrackUsageMessage.TRACK_USAGE_DATA_NOT_FOUND });

            return res.status(StatusCodes.OK).json({
                success: true,
                data: {
                    user_id: user._id,
                    email: user.email,
                    fname: user.fname,
                    lname: user.lname,
                    total_prompt_count: usageData.total_prompt_count || 0,
                    total_tokens: usageData.total_tokens || 0,
                    updatedAt: usageData.updatedAt,
                    openAi_count: usageData.openAi_count || 0,
                    claude_count: usageData.claude_count || 0,
                    // deepseek_count: usageData.deepseek_count || 0,
                },
            });
        }

        // Build query for list mode
        const conditions = {};

        // Filter by month/year if provided
        if (date) {
            const [year, month] = date.split('-').map(Number);
            const startDate = new Date(Date.UTC(year, month - 1, 1));
            const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
            conditions.updatedAt = { $gte: startDate, $lte: endDate };
        }

        // Filter users by email (search term)
        if (search) {
            const users = await User.find({ email: { $regex: search, $options: 'i' } }).select('_id');
            const userIds = users.map(u => u._id);
            conditions.user_id = { $in: userIds };
        }

        // Pagination setup
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Fetch paginated usage data
        const [usageData, totalRecords] = await Promise.all([
            VsPluginTrackUsage.find(conditions)
                .populate('user_id', 'email fname lname')
                .skip(skip)
                .limit(limitNum)
                .lean(),
            VsPluginTrackUsage.countDocuments(conditions)
        ]);

        // Format for frontend consumption
        const formattedData = usageData.map(entry => ({
            user_id: entry.user_id._id,
            email: entry.user_id.email || 'Unknown User',
            fname: entry.user_id.fname || '',
            lname: entry.user_id.lname || '',
            total_prompt_count: entry.total_prompt_count || 0,
            total_tokens: entry.total_tokens || 0,
            updatedAt: entry.updatedAt,
            openAi_count: entry.openAi_count || 0,
            claude_count: entry.claude_count || 0,
            // deepseek_count: entry.deepseek_count || 0,
        }));

        // Build pagination info
        const totalPages = Math.ceil(totalRecords / limitNum);
        const pagination = {
            total_records: totalRecords,
            current_page: pageNum,
            total_pages: totalPages,
        };

        return res.status(StatusCodes.OK).json({
            success: true,
            data: formattedData,
            pagination,
        });

    } catch (error) {
        console.error('Error retrieving usage data:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: PromptMessages.INTERNAL_SERVER_ERROR });
    }
};

/**
 * Saves a prompt to the database. 
 * Generates a new thread ID if not provided.
 * 
 * @param {Object} req - Express request object. Accepts the following query parameters:YYYY-MM.
 *  specific user.
 * @param {Object} res - Express response object.
 * 
 * @returns {Promise<void>} - Returns JSON response with either specific user usage or paginated results.
 */

export const savePrompt = async (req, res) => {
    try {
      const {userId} = req.user;
      let firstMessage = false;
      if (!userId) {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: PromptMessages.USER_ID_REQUIRED });
      }
      const { threadid, promptresponse, description, modelused } = req.body;
  
      let threadId = threadid || null;
  
      if (!userId || !promptresponse, !description || !modelused) {
        return res.status(400).json({ error: PromptMessages.THREAD_ID_PROMPT_REQUIRED });
      }
  
      if(!threadId) {
        threadId = generateThreadId();
          if(threadId) {
              firstMessage = true;
          }
      }
  
      const newPrompt = new promptVSCodeModel({
        threadid: threadId,
        userid: userId,
        promptresponse,
        description,
        modelused,
        firstMessage: firstMessage,
      });
  
      await newPrompt.save();
      return res.status(StatusCodes.CREATED).json(newPrompt);
  
    } catch (error) {
      console.error('Error saving prompt:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: CommonMessages.INTERNAL_SERVER_ERROR });
    }
  }
  
  /**
   * get thread list from the database. 
   * 
   * 
   * @param {Object} req - Express request object. Accepts the following query parameters:YYYY-MM.
   *   @param {string} [userId] - If provided, returns usage for the specific user.
   * @param {Object} res - Express response object.
   * 
   * @returns {Promise<void>} - Returns JSON response with either specific user usage or paginated results.
   */
  
  export const getThreadList = async (req, res) => { 
      try {
          const {userId} = req.user;
  
          if (!userId) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error: PromptMessages.USER_ID_REQUIRED });
          }
          const pipeline = [
              {
                  $match: {
                  userid: new mongoose.Types.ObjectId(userId),
                  firstMessage: true, // Only first message in each thread
                  },
              },
              {
                  $group: {
                  _id: "$threadid",
                  description: { $first: "$description" }, // Description from the first message
                  createdAt: { $first: "$createdAt" },    // Optional: for sorting
                  },
              },
              {
                  $sort: { createdAt: -1 }, // Latest threads first (optional)
              },
          ];
  
          const threads = await promptVSCodeModel.aggregate(pipeline).exec();
  
          if (threads.length === 0) {
              return res.status(StatusCodes.NOT_FOUND).json({ message: PromptMessages.THREAD_NOT_FOUND });
          }
  
          return res.status(StatusCodes.OK).json(threads);
      } catch (error) {
          console.error('Error retrieving thread list:', error);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: CommonMessages.INTERNAL_SERVER_ERROR });
      }
  }
  
  /**
   * get thread by id threadid  from the database. 
   * 
   * 
   * @param {Object} req - Express request object. Accepts the following query parameters:YYYY-MM.
   *   @param {string} [userId] - If provided, returns usage for the specific user.
   *   @param {string} threadid - The ID of the thread to retrieve.
   * @param {Object} res - Express response object.
   * 
   * @returns {Promise<void>} - Returns JSON response with either specific user usage or paginated results.
   */
  
  
  export const getThreadsById = async (req, res) => {
      try {
          const { threadid, pageSize = 5, page = 1 } = req.query;
          const { userId } = req.user;
  
          if (!threadid) {
              return res.status(StatusCodes.BAD_REQUEST).json({ error: PromptMessages.THREAD_ID_REQUIRED });
          }
  
          const threads = await promptVSCodeModel.find({ threadid: threadid, userid: userId })
          .skip((page - 1) * pageSize)
          .limit(pageSize)
          .sort({ createdAt: -1 });
  
          const totalCount = await promptVSCodeModel.countDocuments({ threadid: threadid, userid: userId });
  
          if (!threads) {
              return res.status(StatusCodes.NOT_FOUND).json({ error: PromptMessages.THREAD_NOT_FOUND });
          }
  
          return res.status(StatusCodes.OK).json({
              threads: threads.reverse(),
              totalCount,
              page,
              pageSize,
          });
      } catch (error) {
          console.error('Error retrieving thread:', error);
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: CommonMessages.INTERNAL_SERVER_ERROR });
      }
  }