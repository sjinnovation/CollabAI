import { StatusCodes } from "http-status-codes";
import {
  createAssistantRatingService,
  getAllAssistantRatingService,
  getAssistantRatingByUserIdService,
  getAssistantRatingService,
} from "../service/assistantRatingService.js";
import { AssistantMessages, AssistantRatingMessages, CommonMessages } from "../constants/enums.js";
import Agent from "../models/assistantModel.js";


/**
 * @async
 * @function createAssistantRating
 * @description Creates or updates a rating for a specific assistant by a user.
 * @param {Object} req - Request object; expects 'assistantId' in params, and 'user_id' and 'rating' in the body.
 * @param {Object} res - Returns success message and rating data, or error if assistant not found.
 * @throws {Error} If internal server error occurs.
 * @returns {Response} 
 *  - 200: Rating created or updated successfully.
 *  - 404: Assistant not found.
 *  - 500: Internal server error.
 */

export const createAssistantRating = async (req, res) => {
  try {
    const assistantId = req.params.assistantId;
    const { user_id, rating } = req.body;
    const assistant = await Agent.findOne({ assistant_id: assistantId });

    if (!assistant) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: AssistantMessages.ASSISTANT_NOT_FOUND });
    }

    const { assistantRating, isUserAlreadyRated } =
      await createAssistantRatingService(
        assistant?._id,
        user_id,
        rating,
        assistantId
      );
    if (isUserAlreadyRated) {
      res.status(StatusCodes.OK).json({
        message: AssistantRatingMessages.AGENT_RATING_UPDATED_SUCCESSFULLY,
        data: {
          assistantRating,
        },
      });
    } else {
      res.status(StatusCodes.OK).json({
        message: AssistantRatingMessages.AGENT_RATING_CREATED_SUCCESSFULLY,
        data: {
          assistantRating,
        },
      });
    }
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};

/**
 * @async
 * @function getAssistantRating
 * @description Retrieves the rating details for a specific assistant by ID.
 * @param {Object} req - Request object; expects 'assistantId' in the route parameters.
 * @param {Object} res - Returns assistant rating data.
 * @throws {Error} If internal server error occurs.
 * @returns {Response}
 *  - 200: Rating fetched successfully.
 *  - 500: Internal server error.
 */
export const getAssistantRating = async (req, res) => {
  try {
    const assistantId = req.params.assistantId;
    const assistantRating = await getAssistantRatingService(assistantId);
    
    res.status(200).json({
      message: AssistantRatingMessages.AGENT_RATING_FETCHED_SUCCESSFULLY,
      data: {
        assistantRating,
      },
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};
/**
 * @async
 * @function getAllAssistantRating
 * @description Fetches ratings for all assistants.
 * @param {Object} req - Request object (no params or body needed).
 * @param {Object} res - Returns all assistant ratings.
 * @throws {Error} If internal server error occurs.
 * @returns {Response}
 *  - 200: Ratings fetched successfully.
 *  - 500: Internal server error.
 */

export const getAllAssistantRating = async (req, res) => {
  try {
    const assistantRating = await getAllAssistantRatingService();
    res.status(StatusCodes.OK).json({
      message: AssistantRatingMessages.ALL_AGENT_RATING_FETCHED_SUCCESSFULLY,
      data: {
        assistantRating,
      },
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};
/**
 * @async
 * @function getAssistantRatingByUserId
 * @description Retrieves the rating a specific user gave to a specific assistant.
 * @param {Object} req - Request object; expects authenticated user info in `req.user._id` and `assistantId` in params.
 * @param {Object} res - Returns the assistant rating by the user.
 * @throws {Error} If internal server error occurs.
 * @returns {Response}
 *  - 200: Rating fetched successfully.
 *  - 500: Internal server error.
 */

export const getAssistantRatingByUserId = async (req, res) => {
  try {
    const userId = req.user._id;
    const assistantId = req.params.assistantId;
    const assistantRating = await getAssistantRatingByUserIdService(
      userId,
      assistantId
    );
    res.status(StatusCodes.OK).json({
      message: AssistantRatingMessages.AGENT_RATING_FETCHED_SUCCESSFULLY,
      data: {
        assistantRating,
      },
    });
  } catch (error) {
    console.log("error", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};