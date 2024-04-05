import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";
import fs from "fs";
import mime from "mime-types";
import Assistant from "../models/assistantModel.js";
import AssistantThread from "../models/assistantThreadModel.js";
import {
  meeting_summary,
  hardDeleteAssistant,
  retrieveOpenAIFile,
  processAssistantMessage,
  retrieveOpenAIFileObject,
	getAssistantByAssistantId,
} from "../service/assistantService.js";
import User from "../models/user.js";
import * as errorMessage from "../locale/index.js";
import { AssistantMessages, CommonMessages } from "../constants/enums.js";
import {
  BadRequest,
  Conflict,
  InternalServer,
  NotFound,
} from "../middlewares/customError.js";
import { getOpenAIInstance } from "../config/openAI.js";
import { createChatPerAssistantSchema } from "../utils/validations.js";
import { handleOpenAIError } from "../utils/openAIErrors.js";
import { assistantFuncMap } from "../utils/assistantFunctionMapper.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";
import { calculateTokenAndCost } from "../service/trackUsageService.js";
import TrackUsage from "../models/trackUsageModel.js";
import axios from "axios";
import FunctionDefinition from "../models/functionDefinitionModel.js";

/**
 * @function createAssistant
 * @async
 * @description Create a new assistant by attributes or retrieval from openai through assistantId
 * @param {Object} req - Request object, should contain the following properties in body: name, instructions, description,
 *     assistantId, tools, model, userId, category, imageGeneratePrompt, staticQuestions
 * @param {Object} res - Response object
 * @param {function} next - Next middleware function
 * @returns {Response} 201 - Returns assistant created message and assistant details
 * @throws {Error} Will throw an error if no assistant found or if assistant creation failed
 */
export const createAssistant = async (req, res, next) => {
  const {
    name,
    instructions,
    description,
    assistantId,
    tools: toolsString,
    model: userSelectedModel,
    userId,
    category,
    imageGeneratePrompt,
    staticQuestions,
  } = req.body;
  const files = req.files;
  let newAssistantInstance = null;

  const tools = JSON.parse(toolsString);
  const parsedTools = tools.map((tool) => ({ type: tool }));
  const dallEModel = await getOpenAiConfig("dallEModel");
  const dallEQuality = await getOpenAiConfig("dallEQuality");
  const dallEResolution = await getOpenAiConfig("dallEResolution");

  try {
    const openai = await getOpenAIInstance();

    const isNameExist = await Assistant.findOne({
      is_deleted: false,
      name: name,
    });
    if (isNameExist) {
      return next(Conflict(AssistantMessages.NAME_EXISTS));
    }

    // Handle file uploads for the new assistant
    const filePromises = files.map(async (file) => {
      const uploadedFile = await openai.files.create({
        file: fs.createReadStream(file.path),
        purpose: "assistants",
      });

      return uploadedFile.id;
    });

    // TODO: Handle promises here. If one promise is rejected then the entire promises will be rejected
    const newFileIds = await Promise.all(filePromises);

    let image_url = null;

    //Under progress
    // Based on the assistant name and model it will generate an image
    // const imageResponse = await openai.images.generate({
    // 	model: dallEModel,
    // 	prompt: name,
    // 	n: 1,
    // 	quality : dallEModel == "dall-e-3" ? dallEQuality : undefined,
    // 	size: dallEResolution,
    // });

    // image_url = imageResponse.data[0].url;
    // if assistantId is given, then we have to retrieve the assistant and create it in our database
    if (assistantId) {
      // check if already an assistant exists with the given assistantId
      const existingAssistant = await Assistant.findOne({
        assistant_id: assistantId,
      });
      if (existingAssistant)
        return next(Conflict(AssistantMessages.ASSISTANT_ALREADY_EXISTS));

      const myAssistant = await openai.beta.assistants.retrieve(assistantId);
      if (myAssistant) {
        newAssistantInstance = new Assistant({
          assistant_id: myAssistant.id,
          name: myAssistant.name,
          model: myAssistant.model,
          instructions: myAssistant.instructions,
          file_ids: myAssistant.file_ids,
          tools: myAssistant.tools,
          userId: userId,
          category: category,
          description: description,
          image_url: image_url,
          static_questions: staticQuestions
            ? parseStaticQuestions(staticQuestions)
            : [],
        });
      }
    } else {
      // create new assistant and save it in our database
      const assistant = await openai.beta.assistants.create({
        name,
        instructions,
        tools: parsedTools,
        model: userSelectedModel || "gpt-4-1106-preview",
        file_ids: newFileIds,
      });

      if (assistant) {
        newAssistantInstance = new Assistant({
          assistant_id: assistant.id,
          name: assistant.name,
          model: assistant.model,
          instructions: assistant.instructions,
          tools: assistant.tools,
          file_ids: assistant.file_ids,
          userId: userId,
          category: category,
          description: description,
          image_url: image_url,
          static_questions: staticQuestions
            ? parseStaticQuestions(staticQuestions)
            : [],
        });
      }
    }

    if (newAssistantInstance) {
      // Delete the uploaded files from the temporary directory
      files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting file: ${file.path}`, err);
          }
        });
      });

      // Save the new assistant instance to the database
      newAssistantInstance.model = userSelectedModel; // Save the user-selected model
      const result = await newAssistantInstance.save();

      if (result) {
        res.status(StatusCodes.CREATED).json({
          message: AssistantMessages.ASSISTANT_CREATED_SUCCESSFULLY,
          assistant: newAssistantInstance,
        });
      }
    } else {
      return next(InternalServer(AssistantMessages.ASSISTANT_CREATION_FAILED));
    }
  } catch (error) {
    console.log(error);
    if (error instanceof OpenAI.APIError) {
      const customOpenAIError = handleOpenAIError(error);
      return next(customOpenAIError);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

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

export const createChatPerAssistant = async (req, res, next) => {
  const { _id: userId } = req.user;
  const { assistant_id } = req.params;
  const { question, thread_id = false } = req.body;
  let threadId = null,
    finalMessage = [];

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

		// Step 1.2: check if assistant exists in database
    const existingAssistant = await getAssistantByAssistantId(assistant_id);

		if(!existingAssistant) {
			return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
		}
    
		
		
    // Step 1.1: create a thread if doesn't exist for the requested user
		if (thread_id) {
      threadId = thread_id;
    } else {
      const thread = await openai.beta.threads.create();

      if (thread) {
        const newAssistantThread = new AssistantThread({
          assistant_id,
          user: userId,
          thread_id: thread.id,
          title: question.substring(0, 50),
        });
        await newAssistantThread.save();
      }
      threadId = thread.id;
    }

    // Step 2: now we have a threadId, create a message in the thread
    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: question,
    });

    // Step 3: now we have to create a run that will wait for the response from the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id,
    });
    let runId = run.id;

    let retrieveRun = await openai.beta.threads.runs.retrieve(threadId, runId);

    // Step 4: now we have to create a polling mechanism to check if the assistant has responded
    // TODO: handle all the possible cases including errors that can happen
    let openAIErrorFlag = false;
    while (retrieveRun.status !== "completed") {
      console.log(
        `${retrieveRun.status}`,
        "Waiting for the Assistant to process..."
      );
      if (retrieveRun.status === "requires_action") {
        let retrieveRuntwo = await openai.beta.threads.runs.retrieve(
          threadId,
          runId
        );
				const toolOutputs = [];

        const requiredActions =
          retrieveRuntwo.required_action.submit_tool_outputs.tool_calls;

          for (const action of requiredActions) {
            const funcName = action.function.name;
            const argument = JSON.parse(action.function.arguments);
            console.log(argument, "arg");
            let currOutput = {
              tool_call_id: action.id,
              output: "This function doesn't exist.",
            }
  
            const myAssistant = await openai.beta.assistants.retrieve(
              assistant_id
            );
  
            const propertiesKeysObject =  myAssistant?.tools[0]?.function?.parameters?.properties || {};
            const propertiesKeys = Object.keys(propertiesKeysObject);
            
            // all conditions
            const isCustomFunctionCallingAssistant = existingAssistant?.functionCalling === true && propertiesKeys;
            const isLocalFunctionCallingAssistant = existingAssistant?.functionCalling === false && assistantFuncMap.hasOwnProperty(funcName);
  
            if (isCustomFunctionCallingAssistant) {
              const argumentsList = propertiesKeys.map((key) => argument[key]);
  
              // Assuming argumentsList now is an array of values from the argument object based on propertiesKeys
              const functionName = myAssistant.tools[0].function.name;
              const functionVar = [functionName];
  
              const functionMap = await createFunctionMap();
              // Create the function call dynamically using the spread operator
              if (typeof functionMap[functionName] === "function") {
                const output = await functionMap[functionName](...argumentsList);
                currOutput.output = JSON.stringify(output);
              }
            } else if (isLocalFunctionCallingAssistant) {
                const output = await assistantFuncMap[funcName](argument);
                currOutput.output = JSON.stringify(output);
            }
            
            toolOutputs.push(currOutput);
          }

        console.log("Submitting outputs back to the Assistant...");
        const run = await openai.beta.threads.runs.submitToolOutputs(
          threadId,
          runId,

          {
            tool_outputs: toolOutputs,
          }
        );
      }
      await new Promise((resolve) => {
        console.log("timeout....");
        return setTimeout(resolve, 1000);
      });
      retrieveRun = await openai.beta.threads.runs.retrieve(threadId, runId);

      // Check for failed, cancelled, or expired status
      if (["failed", "cancelled", "expired"].includes(retrieveRun.status)) {
        console.log(
          `Run status is '${retrieveRun.status}'. Unable to complete the request.`
        );
        openAIErrorFlag = true;
        break; // Exit the loop if the status indicates a failure or cancellation
      }
    }

    if (openAIErrorFlag) {
      return next(
        BadRequest(
          "Received an error from openAI, please reload the conversation."
        )
      );
    }
    const threadMessages = await openai.beta.threads.messages.list(threadId);

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
        response: responsePayload.response,
        msg_id: responsePayload.msg_id,
        thread_id: responsePayload.thread_id,
      });
      return;
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: AssistantMessages.SOMETHING_WENT_WRONG,
      });
    }
  } catch (error) {
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
 * @function getAllAssistants
 * @description Get a list of assistants with optional category filter and pagination
 * @param {Object} req - The request object. Query string may contain 'page' and 'limit' parameters for pagination
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns assistants list and total assistant count
 */
export const getAllAssistants = async (req, res) => {
  try {
    const { page = 1, limit = 10, searchQuery = "" } = req.query;

    console.log("page:", page, "Limit:", limit);

    //openai init
    const openai = await getOpenAIInstance();

    // Define the query object with the is_deleted condition
    const query = { is_deleted: false, category: "ORGANIZATIONAL" };

    if (typeof searchQuery === "string" && searchQuery?.length) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    const totalAssistantCount = await Assistant.countDocuments(query);

    // Find assistants based on the query
    const assistants = await Assistant.find(query)

      .populate({
        path: "userId",
        model: "User",
        select: "fname",
      })

      .populate("teamId")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(limit)
      .lean();

    // Iterate over each assistant and fetch filenames for file_ids
    for (const assistant of assistants) {
      const fileNames = await Promise.all(
        assistant.file_ids.map(async (fileId) => {
          const fileInfo = await openai.files.retrieve(fileId);
          return fileInfo.filename;
        })
      );
      // Update the assistant object with fileNames
      assistant.fileNames = fileNames;
    }

    res.status(StatusCodes.OK).json({
      assistants,
      totalAssistantCount,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function getAssistantById
 * @description Get assistant by id
 * @param {Object} req - The request object. The params should contain the assistant ID
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistant
 * @returns {Response} 200 - Returns fetched assistant
 */
export const getAssistantById = async (req, res) => {
  try {
    const { id: assistant_id } = req.params;

    //openai init
    const openai = await getOpenAIInstance();
    // console.log(assistant_id, "assistant_id");

    // Find assistants based on the query
    const assistant = await Assistant.findOne({ assistant_id })
      .populate({
        path: "userId",
        select: "fname lname",
      })
      .lean();

    if (!assistant) {
      return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
    }

    // Check if the assistant has file_ids
    if (assistant.file_ids && assistant.file_ids.length > 0) {
      // Iterate over each assistant and fetch filenames for file_ids
      const fileNames = await Promise.all(
        assistant.file_ids.map(async (fileId) => {
          const fileInfo = await openai.files.retrieve(fileId);
          return fileInfo.filename;
        })
      );

      // Update the assistant object with fileNames
      assistant.fileNames = fileNames;
    } else {
      // Set an empty array for fileNames if file_ids is not present
      assistant.fileNames = [];
    }

    res.status(StatusCodes.OK).json({
      assistant,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function getAllUserAssistantStats
 * @description Get statistics of assistants for all users with pagination
 * @param {Object} req - The request object. The query may contain 'page' and 'limit' parameters for pagination
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the statistics
 * @returns {Response} 200 - Returns statistics of assistants for all users
 */
export const getAllUserAssistantStats = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Use Aggregation Framework for counting
    const userStats = await Assistant.aggregate([
      {
        $match: {
          userId: { $exists: true, $ne: null },
          is_deleted: false,
          category: "PERSONAL",
        },
      },
      {
        $group: {
          _id: "$userId",
          totalAssistants: { $sum: 1 },
          activeAssistants: {
            $sum: {
              $cond: [{ $eq: ["$is_active", true] }, 1, 0],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users", // Collection name for the User model
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      {
        $unwind: "$userDetails",
      },
      {
        $project: {
          _id: 1,
          username: "$userDetails.fname",
          totalAssistants: 1,
          activeAssistants: 1,
          status: "$userDetails.status",
        },
      },
      { $sort: { totalAssistants: -1 } },
      { $skip: (page - 1) * limit },
      // { $limit: limit },
    ]);

    res.status(StatusCodes.OK).json({
      userStats,
      message: AssistantMessages.ASSISTANT_STATS_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
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
export const getAssistantsCreatedByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, pageSize = 10, searchQuery = "" } = req.query;

    //openai init
    const openai = await getOpenAIInstance();

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = parseInt(pageSize);

    const query = {
      userId: userId,
      category: "PERSONAL", // Filter by category "PERSONAL"
      is_deleted: false,
      //  is_active: true
    };

    if (typeof searchQuery === "string" && searchQuery?.length) {
      query.$or = [{ name: { $regex: new RegExp(searchQuery, "i") } }];
    }

    const [assistants, totalCount] = await Promise.all([
      Assistant.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Assistant.countDocuments(query),
    ]);

    // Iterate over each assistant and fetch filenames for file_ids
    for (const assistant of assistants) {
      try {
        const fileNames = await Promise.all(
          assistant.file_ids.map(async (fileId) => {
            try {
              const fileInfo = await openai.files.retrieve(fileId);
              return fileInfo.filename;
            } catch (fileError) {
              console.error(
                `Error retrieving file ${fileId}: ${fileError.message}`
              );
              return null; // Handle file retrieval error gracefully
            }
          })
        );

        // Update the assistant object with fileNames
        assistant.fileNames = fileNames;
      } catch (error) {
        console.error(
          `Error processing assistant ${assistant._id}: ${error.message}`
        );
        // Handle assistant processing error gracefully
      }
    }

    res.status(StatusCodes.OK).json({
      assistants,
      totalCount,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function getAllUserAssignedAssistants
 * @description Get a list of assistants that are assigned to the user
 * @param {Object} req - The request object. Expected params: none. Expected query: pageSize, page. Request object should contain user details
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns a list of assistants assigned to the user including pagination details
 */
export const getAllUserAssignedAssistants = async (req, res) => {
  const { _id: user_id } = req.user;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const currentPage = parseInt(req.query.page) || 1;

  const searchQuery = req.query.searchQuery || "";
  const searchConditionOnName = { $regex: new RegExp(searchQuery, "i") };

  try {
    const reqUser = await User.findById(user_id).populate("teams");

    if (!reqUser) {
      return next(BadRequest(AssistantMessages.USER_DOES_NOT_EXIST));
    }
    let query = {};
    let notDeletedAndActive = { is_deleted: false, is_active: true };
    let getPersonalAssistant = {
      ...notDeletedAndActive,
      userId: reqUser._id,
      category: "PERSONAL",
    };

    if (reqUser.role === "superadmin") {
      // Query for superadmin to fetch all active organizational assistants and personal created assistants
      query = {
        $or: [
          {
            ...notDeletedAndActive,
            category: "ORGANIZATIONAL",
            name: searchConditionOnName,
          }, // Organizational assistants
          { ...getPersonalAssistant, name: searchConditionOnName }, // Personal created assistants by the user
        ],
      };
    } else if (reqUser.teams.length) {
      // Query for normal user to fetch organizational assistants for the user's team and personal created assistants
      query = {
        $or: [
          {
            ...notDeletedAndActive,
            teamId: { $in: reqUser.teams },
            category: "ORGANIZATIONAL",
            name: searchConditionOnName,
          }, // Organizational assistants for the user's team
          { ...getPersonalAssistant, name: searchConditionOnName }, // Personal created assistants by the user
        ],
      };
    } else if (!reqUser.teams.length) {
      return res.status(StatusCodes.OK).json({ assistants: [] });
    }

    const [assistants, totalCount] = await Promise.all([
      Assistant.find(query)
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 }),
      Assistant.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    console.log(
      "totalPages:",
      totalPages,
      "totalCount:",
      totalCount,
      "pageSize:",
      pageSize,
      "Assistants:"
      // assistants
    );
    return res.status(StatusCodes.OK).json({
      assistants,
      totalPages,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function getAllAssistantsByPagination
 * @description Get list of assistants that are assigned to the user with pagination
 * @param {Object} req - The request object. Expected params: none. Expected query: pageSize, page. Request object should contain user details
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns a list of assistants assigned to the user including pagination details
 */
export const getAllAssistantsByPagination = async (req, res) => {
  const { _id: user_id } = req.user;
  const pageSize = parseInt(req.query.pageSize) || 10;
  const currentPage = parseInt(req.query.page) || 1;
  try {
    let query = {};
    const reqUser = await User.findById(user_id);

    if (!reqUser) {
      return next(BadRequest(AssistantMessages.USER_DOES_NOT_EXIST));
    }
    const totalAssistants = await Assistant.find({ is_deleted: false });
    const totalPages = Math.ceil(totalAssistants.length / pageSize);

    if (reqUser.teamId) {
      query.teamId = reqUser.teamId;
    } else if (reqUser.role !== "superadmin") {
      return res.status(StatusCodes.OK).json({ assistants: [] });
    }

    const allAssistants = await Assistant.find({ is_deleted: false })
      .skip((currentPage - 1) * pageSize + 3)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      allAssistants,
      currentPage,
      totalPages,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function getChatPerAssistant
 * @description Get all chats for a specific assistant by the user
 * @param {Object} req - The request object. Expected params: assistant_id. Expected query: thread_id (required), limit, after, before.
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the chat
 * @returns {Response} 200 - Returns chat messages and metadata
 */
export const getChatPerAssistant = async (req, res, next) => {
  const { _id: user_id } = req.user;
  const { assistant_id } = req.params;
  const { thread_id, limit, after, before } = req.query;

  if (!thread_id) {
    return next(BadRequest(AssistantMessages.ASSISTANT_THREAD_NOT_FROUND));
  }

  let messages = [],
    metadata = { first_id: null, last_id: null, has_more: false };

  let query = {
    order: "desc", // changing order in future will require change in formatting data at line 239
    limit: limit || 20,
  };

  if (after) {
    query.after = after;
  }

  if (before) {
    query.before = before;
  }

  try {
    const existingThread = await AssistantThread.findOne({
      assistant_id,
      user: user_id,
      thread_id,
    }).lean();

    if (existingThread) {
      console.log(existingThread);
      // initialize openai to retrieve messages
      const openai = await getOpenAIInstance();

      const threadMessages = await openai.beta.threads.messages.list(
        existingThread.thread_id,
        query
      );
      if (threadMessages.data) {
        messages = await threadMessages.data.reduce(
          async (accPrevious, message) => {
            const acc = await accPrevious;
            const { id, created_at, role, content } = message;

            if (content.length === 0) return acc;

            if (role === "assistant") {
              const formattedResponse = await processAssistantMessage(message);
              acc.push({
                botMessage: formattedResponse,
                chatPrompt: "",
              });
            } else if (role === "user") {
              const lastMessage = acc[acc.length - 1];
              if (lastMessage) {
                lastMessage.chatPrompt = content[0]?.text?.value;
                lastMessage.msg_id = id;
                lastMessage.created_at = new Date(
                  created_at * 1000
                ).toISOString();
              }
            }
            return acc;
          },
          Promise.resolve([])
        );

        metadata = {
          first_id: threadMessages.body?.first_id,
          last_id: threadMessages.body?.last_id,
          has_more: !!threadMessages.body?.has_more,
        };
      }
    }

    res.status(StatusCodes.OK).json({ messages: messages, metadata });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * Downloads a file via the assistant interface given a file ID.
 * @async
 * @function downloadAssistantFile
 * @description Handles the file download process by sending the file to the client as an HTTP attachment.
 * @param {Object} req - The HTTP request object with params containing 'file_id'.
 * @param {Object} res - The HTTP response object used to send back the downloaded file.
 * @param {Function} next - The middleware function to handle the next operation in the stack.
 * @throws {Error} Will throw an error if the download operation or file retrieval fails.
 */
export const downloadAssistantFile = async (req, res, next) => {
  try {
    const { file_id } = req.params;
    const openai = await getOpenAIInstance();

    // Retrieve the file metadata to get the filename
    const fileMetadata = await openai.files.retrieve(file_id);

    // Retrieve the file content
    const fileContentResponse = await openai.files.content(file_id);

    if (fileContentResponse) {
      const buffer = await fileContentResponse.arrayBuffer();
      const bufferData = Buffer.from(buffer);
      const filename = fileMetadata.filename || "download.pdf";
      const mimeType = mime.lookup(filename) || "application/octet-stream";

      res.writeHead(StatusCodes.OK, {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": mimeType,
        "Access-Control-Expose-Headers": "Content-Disposition",
      });

      res.end(bufferData);
    } else {
      // Incase fileContentResponse doesn't have data
      return res
        .status(StatusCodes.NOT_FOUND)
        .send(AssistantMessages.ASSISTANT_FILE_NOT_FOUND_MESSAGE);
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .send(AssistantMessages.ASSISTANT_FILE_DOWNLOAD_ERROR_MESSAGE);
    }
  }
};

/**
 * @async
 * @function updateAssistantFiles
 * @description Update the file associations of specific assistant
 * @param {Object} req - The request object. Expected params: assistant_id. Files in request object body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to update the assistant
 * @returns {Response} 201 - Returns successfully updated assistant
 */
export const updateAssistantFiles = async (req, res, next) => {
  const { assistant_id } = req.params;
  const files = req.files;

  try {
    const existingAssistant = await Assistant.findOne({ assistant_id });

    // TODO: Handle the case when the assistant is not found in a separate function
    if (!existingAssistant) {
      next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
      return;
    }

    const openai = await getOpenAIInstance();

    const myAssistant = await openai.beta.assistants.retrieve(assistant_id);

    let fileIds = [...myAssistant.file_ids];

    /*
        You can attach a maximum of 20 files per Assistant, and they can be at most 512 MB each.
        ref: https://platform.openai.com/docs/assistants/how-it-works/creating-assistants
         */
    if (fileIds.length === 20 || fileIds.length + files.length >= 20) {
      return next(BadRequest(AssistantMessages.FILES_AND_PROPERTIES_UPDATED));
    }

    if (files) {
      const filePromises = files.map(async (file) => {
        const uploadedFile = await openai.files.create({
          file: fs.createReadStream(file.path),
          purpose: "assistants",
        });

        return uploadedFile.id;
      });

      fileIds = [...fileIds, ...(await Promise.all(filePromises))];

      // Delete the uploaded files from the "docs" directory
      files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting file: ${file.path}`, err);
          }
        });
      });
    }

    const myUpdatedAssistant = await openai.beta.assistants.update(
      assistant_id,
      {
        file_ids: [...fileIds],
      }
    );

    if (myUpdatedAssistant) {
      existingAssistant.file_ids = fileIds;
      existingAssistant.save();
    }

    res.status(StatusCodes.CREATED).json({
      message: AssistantMessages.FILES_UPDATED,
      assistant: myAssistant,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @async
 * @function assignTeamToAssistant
 * @description Assign a team to an assistant
 * @param {Object} req - The request object. Expected params: assistant_id. Expected body: teamIds
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to assign the team to the assistant
 * @returns {Response} 200 - Returns success message and result of the operation
 */
export const assignTeamToAssistant = async (req, res, next) => {
  const { assistant_id } = req.params;
  const { teamIds } = req.body;

  try {
    const isExistingAssistant = await Assistant.findOne({
      _id: assistant_id,
    });

    if (isExistingAssistant && Array.isArray(teamIds)) {
      isExistingAssistant.teamId = teamIds;
      const result = await isExistingAssistant.save();

      res.status(StatusCodes.OK).json({
        result,
        message: AssistantMessages.ASSISTANT_ASSIGNED_TO_TEAM,
      });
    } else {
      next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
      return;
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function updateAssistant
 * @description Perform updating fields for an existing assistant
 * @param {Object} req - The request object. Expected params: assistant_id. Assistant properties in the body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to update the assistant
 * @returns {Response} 200 - Returns success message and result of the operation
 */
export const updateAssistant = async (req, res, next) => {
  const { assistant_id } = req.params;
  const { name, model, is_active = null } = req.body; // add more value as per the requirements

  try {
    const isExistingAssistant = await Assistant.findOne({
      _id: assistant_id,
    });

    if (isExistingAssistant) {
      isExistingAssistant.name = name || isExistingAssistant.name;
      isExistingAssistant.model = model || isExistingAssistant.model;
      isExistingAssistant.is_active =
        is_active !== null ? is_active : isExistingAssistant.is_active;

      const result = await isExistingAssistant.save();

      res.status(StatusCodes.OK).json({
        result,
        message: AssistantMessages.ASSISTANT_UPDATED_SUCCESSFULLY,
      });
      return;
    } else {
      next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
      return;
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function deleteAssistant
 * @description Delete an existing assistant
 * @param {Object} req - The request object. Expected params: assistant_id
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to delete the assistant
 * @returns {Response} 200 - Returns success message
 */
export const deleteAssistant = async (req, res, next) => {
  const { assistant_id } = req.params;

  try {
    const openai = await getOpenAIInstance();

    const existingAssistant = await Assistant.findOne({
      assistant_id: assistant_id,
    });

    if (!existingAssistant) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: AssistantMessages.ASSISTANT_NOT_FOUND });
    }

    await hardDeleteAssistant(assistant_id, existingAssistant);

    res.status(StatusCodes.OK).json({
      message: errorMessage.ASSISTANT_DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * @async
 * @function updateAssistantDataWithFile
 * @description Update assistant data and associated files
 * @param {Object} req - The request object. Expected params: assistant_id. Assistant properties and files in the request body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to update the assistant
 * @returns {Response} 201 - Returns success message and updated assistant
 */
export const updateAssistantDataWithFile = async (req, res, next) => {
  try {
    const { assistant_id } = req.params;
    const files = req.files;
    const {
      name,
      instructions,
      model,
      tools: toolsString,
      teamId,
      staticQuestions,
      category,
      deleted_files,
      description,
    } = req.body;

    const openai = await getOpenAIInstance();

    const existingAssistant = await Assistant.findOne({ assistant_id });

    if (!existingAssistant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: AssistantMessages.ASSISTANT_NOT_FOUND,
      });
    }

    const myAssistant = await openai.beta.assistants.retrieve(assistant_id);

    let fileIds = [...myAssistant.file_ids];

    if (deleted_files) {
      fileIds = await deleteAssistantFilesAndFilterIds(
        openai,
        assistant_id,
        fileIds,
        JSON.parse(deleted_files)
      );
    }

    if (
      fileIds.length === 20 ||
      (files && fileIds.length + files.length >= 20)
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: AssistantMessages.FILE_LIMIT_REACHED,
      });
    }

    if (files) {
      fileIds = [...fileIds, ...(await uploadFiles(openai, files))];

      files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) {
            console.error(`Error deleting file: ${file.path}`, err);
          }
        });
      });
    }

    const updateData = {
      file_ids: fileIds,
      name,
      instructions,
      model,
      tools: toolsString ? parseTools(toolsString) : [],
    };

    const myUpdatedAssistant = await updateAssistantProperties(
      openai,
      assistant_id,
      updateData
    );

    if (myUpdatedAssistant) {
      const updatedAssistantFieldsObject = {
        file_ids: fileIds,
        name: myUpdatedAssistant.name,
        instructions: myUpdatedAssistant.instructions,
        model: myUpdatedAssistant.model,
        tools: updateData.tools,
        static_questions: staticQuestions
          ? parseStaticQuestions(staticQuestions)
          : [],
        category,
        description,
      };

      if (teamId !== undefined) {
        updatedAssistantFieldsObject.teamId = teamId;
      }

      Object.assign(existingAssistant, updatedAssistantFieldsObject);

      await existingAssistant.save();
    }

    res.status(StatusCodes.CREATED).json({
      message: AssistantMessages.FILES_AND_PROPERTIES_UPDATED,
      assistant: existingAssistant,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const customOpenAIError = handleOpenAIError(error);
      return next(customOpenAIError);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/** ============== UTILITY FUNCTION =================== */
const parseTools = (toolsString) => {
  try {
    return JSON.parse(toolsString).map((tool) => ({ type: tool }));
  } catch (error) {
    console.error("Error parsing tools:", error);
    throw new Error("Invalid tools format");
  }
};

const parseStaticQuestions = (staticQuestionsString) => {
  try {
    return JSON.parse(staticQuestionsString);
  } catch (error) {
    console.error("Error parsing static questions:", error);
    throw new Error("Invalid static questions format");
  }
};

const deleteAssistantFilesAndFilterIds = async (
  openai,
  assistantId,
  fileIds,
  deletedFileIds
) => {
  try {
    for (const deletedFileId of deletedFileIds) {
      await openai.beta.assistants.files.del(assistantId, deletedFileId);
    }
    return fileIds.filter((fileId) => !deletedFileIds.includes(fileId));
  } catch (error) {
    console.error("Error deleting assistant files:", error);
    throw error;
  }
};

const uploadFiles = async (openai, files) => {
  const filePromises = files.map(async (file) => {
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(file.path),
      purpose: "assistants",
    });

    return uploadedFile.id;
  });

  return Promise.all(filePromises);
};

const updateAssistantProperties = async (openai, assistantId, updateData) => {
  return openai.beta.assistants.update(assistantId, updateData);
};

//Function Calling API's

//Helper Function
/**
 * @async
 * @function createFunctionMap
 * @description A helper function which creates new function and maps it based on the function definitions stored in the database
 * @param {Object} req - No request params
 * @param {Object} res - Response object
 * @throws {Error} Will throw an error if function creation is failed
 */
async function createFunctionMap() {
  try {
    // Get all function definitions from the database
    const definitions = await FunctionDefinition.find({});

    // Map function names to executable functions
    const functionMap = definitions.reduce((acc, def) => {
      try {
        const funcDefinition = def.definition.replace("()", "(axios)");

        const func = new Function("axios", `return async ${funcDefinition}`)(
          axios
        );

        acc[def.name] = func;
      } catch (error) {
        console.error(`Failed to compile function ${def.name}:`, error);
      }
      return acc;
    }, {});

    return functionMap;
  } catch (err) {
    console.error("Error fetching function definitions:", err);
  }
}

/**
 * @async
 * @function fetchFunctionNamesPerAssistant
 * @description Fetches function name created in the particular function calling assistant
 * @param {Object} req - Request object. Should contain the following parameter in body: { assistantName }
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns assistants function name
 * @throws {Error} Will throw an error if function not found
 */
export const fetchFunctionNamesPerAssistant = async (req, res) => {
  try {
    const { assistantName } = req.body;
    console.log(assistantName);
    const openai = await getOpenAIInstance();
    if (
      !assistantName ||
      assistantName == "" ||
      assistantName == null ||
      assistantName == undefined
    ) {
      res.status(400).send({ message: "Assistant name required" });
    } else {
      const assistant = await Assistant.findOne({ name: assistantName });

      const myAssistant = await openai.beta.assistants.retrieve(
        assistant.assistant_id
      );

      const functionNames = myAssistant.tools.map((tool) => tool.function.name);

      res.status(200).send({ assistantFunctionName: functionNames });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @async
 * @function functionsParametersPerFunctionName
 * @description Fetches parameter names for a specific function within an assistant
 * @param {Object} req - Request object. Should contain the following parameters in body: { assistantName, functionName }
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns an array of parameter names for the function
 * @throws {Error} Will throw an error if the assistant or function is not found
 */
export const functionsParametersPerFunctionName = async (req, res) => {
  try {
    const { assistantName, functionName } = req.body;

    const openai = await getOpenAIInstance();

    if (!assistantName || !functionName) {
      return res.status(400).send({
        message: "Both Function name and Assistant name are required",
      });
    }

    const assistant = await Assistant.findOne({ name: assistantName });

    const myAssistant = await openai.beta.assistants.retrieve(
      assistant.assistant_id
    );

    // Find the function by the given name
    const functionObj = myAssistant.tools.find(
      (tool) => tool.function.name === functionName
    );

    // Check if function with functionName exists
    if (!functionObj) {
      return res
        .status(404)
        .send({ message: `Function ${functionName} not found` });
    }

    // Extract the properties from the parameters object
    const properties = functionObj.function.parameters?.properties;
    const parametersList = properties ? Object.keys(properties) : [];

    res.status(200).send({ parametersPerFunctionName: parametersList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * @async
 * @function validateFunctionDefinition
 * @description Validates a given function definition to ensure it is well-formed and executable
 * @param {Object} req - Request object. Should contain the following parameters in body: { functionDefinition, functionName, parameters }
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns success message if the function definition is valid
 * @throws {Error} Will throw an error if the function definition is not executable or has errors
 */
export const validateFunctionDefinition = async (req, res) => {
  try {
    const { functionDefinition, functionName, parameters } = req.body;

    if (!functionDefinition) {
      return res.status(400).send({
        message: "Function Definition is required",
      });
    }

    const funcDefinition = functionDefinition.replace("()", "(axios)");

    const func = new Function("axios", `return async ${funcDefinition}`)(axios);
    const result = func(...Object.values(parameters));
    console.log(result);

    res.status(200).send({ message: "Function is correct" });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

/**
 * @async
 * @function addFunctionDefinition
 * @description Adds a new function definition to the database
 * @param {Object} req - Request object. Should contain the following parameters in body: { name, definition }
 * @param {Object} res - Response object
 * @returns {Response} 201 - Returns the newly added function definition
 * @throws {Error} Will throw an error if the name or definition is missing, or if the name already exists
 */
export const addFunctionDefinition = async (req, res) => {
  try {
    const { name, definition } = req.body;
    if (!name || !definition) {
      res.status(401).send({ error: "Both fields are mandatory" });
    }

    const nameExists = await FunctionDefinition.findOne({ name });
    if (nameExists) {
      res.status(400).json({ error: "Name already exists" });
    } else {
      const newFunctionDefinition = new FunctionDefinition({
        name: name,
        definition: definition,
      });
      console.log(newFunctionDefinition);
      await newFunctionDefinition.save();
      res.status(201).send(newFunctionDefinition);
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

/**
 * @async
 * @function getAllFunctionCallingAssistants
 * @description Retrieves all assistants that have function calling enabled and are not deleted
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns an array of assistant names
 * @throws {Error} Will throw an error if there is an issue retrieving the assistants from the database
 */
export const getAllFunctionCallingAssistants = async (req, res) => {
  try {
    const query = {
      functionCalling: true,
      is_deleted: false,
    };

    const assistants = await Assistant.find(query).sort({ createdAt: -1 });

    // Map over the assistants and extract the names into an array
    const assistantNames = assistants.map((assistant) => assistant.name);

    res.status(StatusCodes.OK).json({ assistants: assistantNames });
  } catch (error) {
    console.error(error); // Use console.error here for better error stack tracing
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function getFunctionCallingAssistantsByPagination
 * @description Retrieves a paginated list of all function calling assistants
 * @param {Object} req - Request object. Can contain the following query parameters: { page, pageSize }
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns paginated result of assistants
 * @throws {Error} Will throw an error if there is an issue retrieving the assistants or processing the query
 */
export const getFunctionCallingAssistantsByPagination = async (req, res) => {
  try {
    // const { userId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const query = {
      // userId: userId,
      functionCalling: true,
      is_deleted: false,
    };

    const assistants = await Assistant.find(query)
      .skip(skip)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.status(StatusCodes.OK).json({ assistants });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

/**
 * @async
 * @function createAssistantWithFunctionCalling
 * @description Creates a new assistant instance with function calling capability
 * @param {Object} req - Request object. Should contain various assistant attributes in the body
 * @param {Object} res - Response object
 * @returns {Response} 201 - Returns the newly created assistant instance
 * @throws {Error} Will throw an error if an assistant with the same name already exists, or if there is an issue during creation
 */
export const createAssistantWithFunctionCalling = async (req, res) => {
  try {
    const {
      name,
      instructions,
      tools, // Instead of toolsString, directly use an array of tools in req.body
      userSelectedModel,
      category = "ORGANIZATIONAL",
      description,
      userId,
    } = req.body;

    let newAssistantInstance = null;

    const openai = await getOpenAIInstance();

    // Check if an assistant with the same name and user ID already exists
    const isNameAndUserExist = await Assistant.findOne({
      is_deleted: false,
      name,
    });

    if (isNameAndUserExist) {
      return res.status(StatusCodes.CONFLICT).json({
        message: "An assistant with this name already exists for the user",
      });
    }

    const assistantTools = tools.map((tool) => {
      return {
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters || {}, // If parameters are not provided, default to an empty object
        },
      };
    });

    const assistant = await openai.beta.assistants.create({
      instructions,
      tools: assistantTools,
      model: userSelectedModel || "gpt-4-1106-preview",
    });

    if (assistant) {
      newAssistantInstance = new Assistant({
        assistant_id: assistant.id,
        name: name,
        model: assistant.model,
        instructions: assistant.instructions,
        tools: assistant.tools,
        userId: userId,
        category: category,
        description: description,
        functionCalling: true,
      });
    }

    if (newAssistantInstance) {
      const result = await newAssistantInstance.save();

      if (result) {
        console.log("Assistant created successfully:", newAssistantInstance);
      }
    }

    res.status(StatusCodes.CREATED).json({
      message: AssistantMessages.ASSISTANT_CREATED_SUCCESSFULLY,
      assistant: newAssistantInstance,
    });
  } catch (error) {
    console.error("Error during assistant creation:", error);
    InternalServer(AssistantMessages.ASSISTANT_CREATION_FAILED);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred during the creation of the assistant.",
      error: error.message,
    });
  }
};

/**
 * @async
 * @function getAssistantInfo
 * @description Retrieves information about a specific assistant by its ID
 * @param {Object} req - Request object. Should contain the assistant ID in the params
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns detailed information about the assistant
 * @throws {Error} Will throw an error if the assistant is not found or if there is an issue with the request
 */
export const getAssistantInfo = async (req, res) => {
  try {
    const { assistant_id } = req.params;

    const openai = await getOpenAIInstance();

    const myAssistant = await openai.beta.assistants.retrieve(assistant_id);
    res.status(200).send(myAssistant);
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

/**
 * @async
 * @function updateFunctionCallingAssistantdata
 * @description Updates an existing function calling assistant with new data provided in request body
 * @param {Object} req - Request object. Should contain assistant attributes to be updated in the body and assistant_id in the params
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns message and updated assistant data
 * @throws {Error} Will throw an error if the assistant is not found, or if there are issues during the update process
 */
export const updateFunctionCallingAssistantdata = async (req, res) => {
  const { assistant_id } = req.params;
  const {
    name,
    instructions,
    userSelectedModel: model,
    tools,
    description,
  } = req.body;

  try {
    const existingAssistant = await Assistant.findOne({ assistant_id });

    if (!existingAssistant || existingAssistant.functionCalling === false) {
      throw new Error("Assistant not found");
    }

    const openai = await getOpenAIInstance();

    const myAssistant = await openai.beta.assistants.retrieve(assistant_id);

    let assistantTools;

    if (tools) {
      assistantTools = tools.map((tool) => {
        return {
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters || {}, // If parameters are not provided, default to an empty object
          },
        };
      });
    }

    // Only include properties in the updateData if they are present in the request body
    const updateData = {};
    if (name) updateData.name = name;
    if (instructions) updateData.instructions = instructions;
    if (description) updateData.description = description;
    if (model) updateData.model = model;
    if (tools.length > 0) updateData.tools = assistantTools;

    const myUpdatedAssistant = await openai.beta.assistants.update(
      assistant_id,
      updateData
    );

    if (myUpdatedAssistant) {
      if (name) existingAssistant.name = myUpdatedAssistant.name;
      if (instructions)
        existingAssistant.instructions = myUpdatedAssistant.instructions;
      if (model) existingAssistant.model = myUpdatedAssistant.model;
      if (tools) existingAssistant.tools = assistantTools;
      if (description) existingAssistant.description = description;

      await existingAssistant.save();
    }

    res.status(StatusCodes.CREATED).json({
      message: "Updated Function calling assistant successfully",
      assistant: existingAssistant,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};
