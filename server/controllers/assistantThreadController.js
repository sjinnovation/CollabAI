import {
  deleteOpenAiThreadById,
  getAssistantThreadById,
  getAssistantThreadsByQuery,
} from "../service/assistantService.js";
import { StatusCodes } from "http-status-codes";
import { authorizeUserAction } from "../middlewares/login.js";
import { AssistantThreadMessages } from "../constants/enums.js";
import {
  BadRequest,
  InternalServer,
  NotFound,
  Unauthorized,
} from "../middlewares/customError.js";

/**
 * Asynchronous function to retrieve assistant threads for a specific user.
 * @param {Object} req - Request object, expected to contain 'user._id' for the user ID and 'query.assistant_id' for the assistant ID in the query parameters.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a list of assistant threads for the specified user if successful, otherwise an error message.
 */
export const getAssistantThreadsPerUser = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { assistant_id } = req.query;

  try {
    let query = {
      user: userId,
      assistant_id,
      is_deleted: false,
    };

    const threads = await getAssistantThreadsByQuery(query);

    return res.status(StatusCodes.OK).json({
      message: AssistantThreadMessages.RETRIEVED_SUCCESSFULLY,
      data: threads,
    });
  } catch (error) {
    return next(InternalServer(AssistantThreadMessages.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Asynchronous function to update an assistant thread.
 * @param {Object} req - Request object, expected to contain 'params.id' for the thread ID and 'body.title' for the new title in the request body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message and the updated thread if successful, otherwise an error message.
 */
export const updateAssistantThread = async (req, res, next) => {
  const { id: thread_id } = req.params;
  const { title } = req.body; // add more value as per the requirements

  try {
    const isExistingAssistantThread = await getAssistantThreadById(thread_id);

    if (isExistingAssistantThread) {
      isExistingAssistantThread.title =
        title ?? isExistingAssistantThread.title;

      const result = await isExistingAssistantThread.save();

      return res.status(StatusCodes.OK).json({
        message: AssistantThreadMessages.THREAD_UPDATED_SUCCESSFULLY,
        thread: result,
      });
    } else {
      return next(
        NotFound(AssistantThreadMessages.ASSISTANT_THREAD_NOT_FROUND)
      );
    }
  } catch (error) {
    return next(InternalServer(AssistantThreadMessages.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Asynchronous function to delete an assistant thread.
 * @param {Object} req - Request object, expected to contain 'params.id' for the thread ID.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if the assistant thread is deleted successfully, otherwise an error message.
 */
export const deleteAssistantThread = async (req, res, next) => {
  const { id: thread_id } = req.params;

  try {
    const existingAsstThread = await getAssistantThreadById(thread_id);

    if (!existingAsstThread) {
      return next(
        NotFound(AssistantThreadMessages.ASSISTANT_THREAD_NOT_FROUND)
      );
    }

    if (!authorizeUserAction(existingAsstThread.user, req.user)) {
      return next(Unauthorized(AssistantThreadMessages.UNAUTHORIZED_ACTION));
    }

    const isDeletedFromOpenAI = await deleteOpenAiThreadById(
      existingAsstThread.thread_id
    );

    if (isDeletedFromOpenAI) {
      const result = await existingAsstThread.remove();

      return res.status(StatusCodes.OK).json({
        message: AssistantThreadMessages.DELETED_SUCCESSFULLY,
      });
    } else {
      return next(BadRequest(AssistantThreadMessages.SOMETHING_WENT_WRONG));
    }
  } catch (error) {
    return next(InternalServer(AssistantThreadMessages.INTERNAL_SERVER_ERROR));
  }
};
