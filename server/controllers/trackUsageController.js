import TrackUsage from '../models/trackUsageModel.js';
import StatusCodes from 'http-status-codes';
import { CommonMessages, TrackUsageMessage } from '../constants/enums.js';
import { BadRequest } from '../middlewares/customError.js';
import { UserRole } from '../models/user.js';
import mongoose from 'mongoose';

/**
 * Asynchronous function for getting track usage data.
 *
 * @async
 * @param {Object} req - Request object with user's role, user ID, and query parameters for filtering.
 * @param {Object} res - Response object for sending back track usage data.
 * @param {Function} next - Express.js next function for passing control to the next middleware.
 * @throws Will throw an error if it fails to retrieve track usage data due to internal server error or unauthorized access.
 *
 * @typedef {Object} TrackUsageResponse
 * @property {Array} trackUsage - List of track usage data fetched from the database.
 * @property {Array} aggregatedData - Aggregated data based on the provided filters.
 *
 * @returns {TrackUsageResponse} List of track usage data and aggregated data.
 */
export const getAllTrackUsageMonthly = async (req, res, next) => {
  const { role, _id } = req.user;
  const { userid, dateString, page = 1, limit = 10 } = req.query;

  try {
    if (role !== UserRole.SUPER_ADMIN && role !== UserRole.USER) {
      return next(BadRequest(CommonMessages.UNAUTHORIZED_ACCESS));
    }

    const filter = {};

    if (role === UserRole.USER) {
      filter.user_id = _id;
    } else if (userid) {
      filter.user_id = mongoose.Types.ObjectId(userid);
    }

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

    const [trackUsageDataList, aggregatedData] = await Promise.all([
      TrackUsage.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
      TrackUsage.aggregate([
        {
          $match: filter
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              user_id: '$user_id'
            },
            total_tokens: { $sum: '$total_tokens' },
            total_token_cost: { $sum: '$total_token_cost' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.day': 1 }
        }
      ])
    ]);

    if (trackUsageDataList.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: TrackUsageMessage.TRACK_USAGE_DATA_NOT_FOUND,
      });
    }
    
    const [aggregatedDataTotal] = await TrackUsage.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          total_cost: { $sum: '$total_token_cost' },
          total_tokens: { $sum: '$total_tokens' }
        }
      }
    ]);
    
    res.status(StatusCodes.OK).json({
      message: TrackUsageMessage.TRACK_USAGE_FETCHED_SUCCESSFULLY,
      trackUsage: trackUsageDataList,
      aggregatedData,
      aggregatedDataTotal,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllTrackUsageDaily = async (req, res, next) => {
  const { role, _id } = req.user;
  const { userid, dateString, page = 1, limit = 10 } = req.query;

  try {
    if (role !== UserRole.SUPER_ADMIN && role !== UserRole.USER) {
      return next(BadRequest(CommonMessages.UNAUTHORIZED_ACCESS));
    }

    const filter = {};

    if (role === UserRole.USER) {
      filter.user_id = _id;
    } else if (userid) {
      filter.user_id = mongoose.Types.ObjectId(userid);
    }

    let dateFilter = {};

    if (dateString) {
      const selectedDate = new Date(dateString);
      const startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1);
      dateFilter = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    } else {
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);
      dateFilter = {
        $gte: startOfDay,
        $lt: endOfDay
      };
    }

    filter.createdAt = dateFilter;

    const [trackUsageDataList, aggregatedData] = await Promise.all([
      TrackUsage.find(filter)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit)),
      TrackUsage.aggregate([
        {
          $match: filter
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' },
              user_id: '$user_id'
            },
            total_tokens: { $sum: '$total_tokens' },
            total_token_cost: { $sum: '$total_token_cost' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.day': 1 }
        }
      ])
    ]);

    if (trackUsageDataList.length === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: TrackUsageMessage.TRACK_USAGE_DATA_NOT_FOUND,
      });
    }

    const [aggregatedDataTotal] = await TrackUsage.aggregate([
      {
        $match: filter
      },
      {
        $group: {
          _id: null,
          total_cost: { $sum: '$total_token_cost' },
          total_tokens: { $sum: '$total_tokens' }
        }
      }
    ]);

    res.status(StatusCodes.OK).json({
      message: TrackUsageMessage.TRACK_USAGE_FETCHED_SUCCESSFULLY,
      trackUsage: trackUsageDataList,
      aggregatedData,
      aggregatedDataTotal,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
