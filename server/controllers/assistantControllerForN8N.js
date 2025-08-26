/**
 * @async
 * @function createChatPerAssistant
 * @description Create a new chat for an assistant
 * @param {Object} req - Request object. Should contain the following parameters in body: { question, thread_id [= false] }
 * @param {Object} res - Response object
 * @param {function} next - Next middleware function
 * @returns {Response} 201 - Returns created chat and thread ID
 * @throws {Error} Will throw an error if chat creation failed
 */

import { StatusCodes } from "http-status-codes";
import { getOpenAIInstance } from "../config/openAI.js";
import { createAssistantThread, createMessageInThread, createRunInThread, isOpenAIFileObjectExist, messageListFromThread, retrieveOpenAIFileObject, retrieveRunFromThread, submitToolOutputs } from "../lib/openai.js";
import { BadRequest, NotFound } from "../middlewares/customError.js";
import { createAssistantThreadInDb, getAssistantByAssistantID } from "../service/assistantService.js";
import { calculateCostFromTokenCounts, createTrackUsage } from "../service/trackUsageService.js";
import { getUserIdFromApiKey } from "../service/userService.js";
import { onToolCalls, processAssistantMessage } from "../utils/assistant.js";
import { createChatPerAssistantSchema } from "../utils/validations.js";
import { AssistantMessages } from "../constants/enums.js";
import { handleOpenAIError } from "../utils/openAIErrors.js";
import OpenAI from "openai";
import Assistant from "../models/assistantModel.js";
import n8nAgentInfoModel from "../models/n8nAgentInfoModel.js";
import { mongo } from "mongoose";

export const createChatPerAssistantOFn8nNode = async (req, res, next) => {
  const { assistant_id } = req.params;
  const { question, thread_id = false, apiKey } = req.body;
  let userId = await getUserIdFromApiKey(apiKey);

  // Find agent info for this user/assistant
  let isExistingN8nAgent = await n8nAgentInfoModel.findOne({
    userId: userId,
    agentId: assistant_id,
  });

  // If no agent info, create it (with no threadId yet)
  if (!isExistingN8nAgent) {
    await n8nAgentInfoModel.create({
      userId: userId,
      threadId: null,
      agentId: assistant_id,
    });
    isExistingN8nAgent = await n8nAgentInfoModel.findOne({
      userId: userId,
      agentId: assistant_id,
    });
  }

  let threadId = null;
  // 1. Use thread_id from request if provided
  if (thread_id) {
    threadId = thread_id;
  } 
  // 2. Else use threadId from DB if it exists
  else if (isExistingN8nAgent.threadId) {
    threadId = isExistingN8nAgent.threadId;
  } 
  // 3. Else create a new thread and save it
  else {
    const openai = await getOpenAIInstance();
    const thread = await createAssistantThread(openai);
    if (thread) {
      await createAssistantThreadInDb(assistant_id, userId, thread.id, question);
      threadId = thread.id;
      isExistingN8nAgent.threadId = threadId;
      await isExistingN8nAgent.save();
    } else {
      return res.status(500).json({ message: "Failed to create thread." });
    }
  }

  // Validate request
  const validationResult = createChatPerAssistantSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });
  if (validationResult.error) {
    return next(
      BadRequest(
        "The message you submitted was too long, please reload the conversation and submit something shorter."
      )
    );
  }

  try {
    const openai = await getOpenAIInstance();

    // Check if assistant exists in database
    const existingAssistant = await getAssistantByAssistantID(assistant_id);
    if (!existingAssistant) {
      return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
    }

    // Create a message in the thread
    await createMessageInThread(openai, assistant_id, threadId, question, userId);

    // Create a run and poll for completion
    const run = await createRunInThread(openai, threadId, assistant_id);
    let runId = run.id;
    let retrieveRun = await retrieveRunFromThread(openai, threadId, runId);
    let openAIErrorFlag = false;
    while (retrieveRun.status !== "completed") {
      if (retrieveRun.status === "requires_action") {
        let retrieveRuntwo = await retrieveRunFromThread(openai, threadId, runId);
        let toolOutputs = [];
        const toolCalls = retrieveRuntwo.required_action.submit_tool_outputs.tool_calls;
        toolOutputs = await onToolCalls(assistant_id, toolCalls, existingAssistant.functionCalling);
        await submitToolOutputs(openai, threadId, runId, toolOutputs);
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      retrieveRun = await retrieveRunFromThread(openai, threadId, runId);
      if (["failed", "cancelled", "expired"].includes(retrieveRun.status)) {
        openAIErrorFlag = true;
        break;
      }
    }
    if (openAIErrorFlag) {
      return next(
        BadRequest(
          "Received an error from openAI, please reload the conversation."
        )
      );
    }

    // Track usage
    const {
      inputTokenPrice,
      outputTokenPrice,
      inputTokenCount,
      outputTokenCount,
      totalCost,
      totalTokens
    } = calculateCostFromTokenCounts(
      retrieveRun?.usage?.prompt_tokens,
      retrieveRun?.usage?.completion_tokens,
      retrieveRun?.model,
      'openai'
    );
    await createTrackUsage({
      userId,
      inputTokenCount,
      outputTokenCount,
      modelUsed: retrieveRun.model,
      inputTokenPrice,
      outputTokenPrice,
      totalTokens,
      totalCost
    });

    // Get the assistant's response
    const threadMessages = await messageListFromThread(openai, threadId);
    const mostRecentMessage = threadMessages.data.find(
      (message) => message.run_id === runId && message.role === "assistant"
    );
    if (mostRecentMessage) {
      const responsePayload = {
        msg_id: mostRecentMessage.id,
        thread_id: threadId,
        response: "",
      };
      responsePayload.response = await processAssistantMessage(
        mostRecentMessage
      );
      return res.status(StatusCodes.CREATED).json({
        botResponse: responsePayload.response,
        threadId: threadId,
      });
    } else {
      console.error("No assistant response found in thread messages.");
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: AssistantMessages.SOMETHING_WENT_WRONG,
      });
    }
  } catch (error) {
    console.error("Error in createChatPerAssistantOFn8nNode:", error);
    if (error instanceof OpenAI.APIError) {
      const customOpenAIError = handleOpenAIError(error);
      return next(customOpenAIError);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errorMessage: error.message,
    });
  }
};

/**
 * @async
 * @function getAssistantsCreatedByUser
 * @description Get assistants created by a specific user with a given category, considering pagination
 * @param {Object} req - The request object. Expected params: userId. Expected query: page, pageSize
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns a list of assistants created by the user
 */

export const getAssistantsCreatedByUserForN8N = async (req, res) => {
  try {
      const authHeader = req.headers['authorization'];
      let userId = null;

  // Check if the Authorization header exists and starts with 'Bearer '
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1]; // Extract the token part
    userId = await getUserIdFromApiKey(token)
  }
    const { page = 1, pageSize = 10, searchQuery = "" } = req.query;

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = parseInt(pageSize);

    const query = {
      userId: userId,
      // category: "PERSONAL", // Filter by category "PERSONAL"
      category: { $in: ["PERSONAL", "ORGANIZATIONAL"] },
      is_deleted: false,
      //  is_active: true
    };

    if (typeof searchQuery === "string" && searchQuery?.length) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }
    const openai = await getOpenAIInstance();

    const [assistants, totalCount] = await Promise.all([
      Assistant.find(query)
      // .populate({
      //   path: "assistantApiId",
      //   model: FunctionDefinition,
      //   select: "name"
      // })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assistant.countDocuments(query),
    ]);

    // Iterate over each assistant and fetch filenames for file_ids
    for (const assistant of assistants) {
      let existingFileIds = [];
      for (const fileId of assistant?.file_ids) {
        const isFileExist = await isOpenAIFileObjectExist(openai, fileId);
        if (isFileExist) {
          existingFileIds.push(fileId);
        }
      }
      assistant.file_ids = existingFileIds;

      const fileNames = await Promise.all(
        assistant.file_ids.map(fileId => retrieveOpenAIFileObject(fileId).then(fileInfo => fileInfo.filename))
      );

      assistant.fileNames = fileNames;
    }
    res.status(StatusCodes.OK).json({
      assistants,
      totalCount,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error("Error in getAssistantsCreatedByUserForN8N:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};