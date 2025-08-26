import { StatusCodes } from "http-status-codes";
import OpenAI from "openai";
import mime from "mime-types";
import Assistant from "../models/assistantModel.js";
import AssistantThread from "../models/assistantThreadModel.js";
import { hardDeleteAssistant, getAssistantByAssistantID, createAssistantThreadInDb, getAssistantByName, createAssistantInstance, getAssistantByObjectID, softDeleteAssistant, getSingleAssistantByIdService, extractQuestion, updateChatPrompts, createAssistantInstanceV2, connectAppsParseJSON, extractFluxPrompt } from "../service/assistantService.js";
import User from "../models/user.js";
import * as errorMessage from "../locale/index.js";
import { AssistantMessages, CommonMessages, KnowledgeBaseMessages, VectorStoreMessages, FunctionCallingMessages, MultiAgentFunctionCallingInstructions, N8nWorkflowMessages } from "../constants/enums.js";
import { BadRequest, Conflict, InternalServer, NotFound } from "../middlewares/customError.js";
import { getOpenAIInstance } from "../config/openAI.js";
import { createChatPerAssistantSchema } from "../utils/validations.js";
import { handleOpenAIError } from "../utils/openAIErrors.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";
import { calculateCostFromTokenCounts, calculateTokenAndCost, createTrackUsage } from "../service/trackUsageService.js";
import TrackUsage from "../models/trackUsageModel.js";
import axios from "axios";
import FunctionDefinition from "../models/functionDefinitionModel.js";
import { createAssistantInOpenAI, createAssistantThread, createMessageInThread, createOpenAIFileObject, createRunInThread, dalleGeneratedImage, retrieveAssistantFromOpenAI, messageListFromThread, retrieveOpenAIFile, retrieveOpenAIFileObject, retrieveRunFromThread, submitToolOutputs, updateAssistantProperties, createAssistantInOpenAIv2, doesAssistantExist, isOpenAIFileObjectExist, stopGeneratingResponseByThreadAndRunId } from "../lib/openai.js";
import { uploadImageToS3 } from "../lib/s3.js";
import { deleteAssistantFilesAndFilterIds, deleteLocalFile, onToolCalls, parseStaticQuestions, parseTools, processAssistantMessage, uploadFiles } from "../utils/assistant.js";
import { getAssistantByIdOrAssistantIdService, getAllAssistantsDataFromDB } from "../service/assistantService.js";
import { deleteSinglePublicAssistant } from "./publicAssistantController.js";
import { deletePublicAssistantService } from "../service/publicAssistantService.js";
import { deleteFavouriteAssistantService, getSingleFavouriteAssistantService, deleteManyFavouriteAssistantService } from "../service/favoriteAssistantService.js";
import { getSingleUsersPinnedAssistService } from "../service/PinnedAssistantService.js";
import { uploadToS3Bucket } from "../lib/s3.js";
import { checkKnowledgeBasedAssistants, getFileIdsFromFileKey, replaceCharacters, storeKnowledgeBaseAssistantsReference } from "../service/knowledgeBase.js";
import { createSingleKnowledgeBaseService } from "../service/knowledgeBase.js";
import { createAndUpsertVector, preprocessFilesForRAG } from "./preprocessOfRAG.js";
import { getAssistantIdByName } from "../service/assistantTypeService.js";
import AssistantTypes from "../models/assistantTypes.js";
import { findFileFromDBandDownload } from "./knowledgeBase.js";
import { createOpenAiVectorStore, createOpenAiVectorStoreWithFileIds, deleteFilesFromVectorStoreUtils, getFileIdsFromVectorStore, updateOpenAiVectorStoreName, uploadFilesToVectorStore } from "../lib/vectorStore.js";
import mongoose from "mongoose";
import { fileSearchFileTypes } from "../utils/fileSearchFileExtensions.js";
import { getValidDescription } from "../service/dalleService.js";
import { getAssistantsBySearchQuery, getAssistantsWithUsage } from "../service/assistantControllerService.js";
import AgentFunctionAssociation from "../models/functionAssistantModel.js";
import {getAssistantDetails, getAssistantUsageData} from "../service/assistantService.js";
import {
  createFunctionAssociations,
  deleteFunctionAssociations,
  getAllFunctionAssistants,
} from "../service/functionAssistantService.js";

const getFileExtension = (filePath) => {
  return filePath.split('.').pop().toLowerCase();
}
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
  try {
    const {
      name,
      instructions,
      description,
      assistantId,
      tools: toolsString = '',
      model: userSelectedModel,
      userId,
      category,
      generateDalleImage,
      imageGeneratePrompt,
      staticQuestions,
      functionsArray,
      assistantTypes,
      fileNameList = [],
      assistantBase,
      knowledgeSource,
      plugins: pluginString = '',
      connectApps,
      imageType,
      dalleImageDescription,
      selectedassistantIds,
      selectedWorkflowIds,
    } = req.body;
    const dalleImagePrompt = getValidDescription(dalleImageDescription);

    const plugin = pluginString !== 'undefined' && pluginString !== '' && pluginString ? JSON.parse(pluginString) : [];
    const selectedWorkflowIdsParsed = selectedWorkflowIds !== 'undefined' && selectedWorkflowIds !== '' && selectedWorkflowIds ? JSON.parse(selectedWorkflowIds) : [];
    let pluginList = [];
    pluginList = plugin?.map((element) => {
      return { type: element }
    });
    const fileNameListParsed = fileNameList !== 'undefined' && fileNameList?.length > 0 ? JSON.parse(fileNameList) : [];
    let files = req.files['files'] ?? [];
    let ragFiles = [];
    let findApps = [];
    if (fileNameListParsed?.length > 0) {
      try {
        await findFileFromDBandDownload(fileNameListParsed, files, ragFiles, knowledgeSource, findApps);
      } catch (downloadError) {
        return next(new Error(`Error during file downloads: ${downloadError.message}`));
    }

    }

    const avatarFiles = req.files['avatar'] ?? [];
    const avatar = avatarFiles.length > 0 ? avatarFiles[0] : null;
    let newAssistantInstance = null;
    let myAssistant = null;

    const tools = toolsString && JSON.parse(toolsString);
    console.log("tools : ", tools);
    const parsedTools = tools && tools.map((tool) => (tool !== "function" ? { type: tool } : null)).filter(Boolean);
    let parsedToolsWithFunctions = [...parsedTools];
    let assistantApiId = [];
    let assistantApiServiceids = [];
    if (functionsArray) {
      try {
        let parsedFunctions = JSON.parse(functionsArray);
        // Extracting all `_id` values into an array
        assistantApiId = parsedFunctions.map(func => func._id).filter(Boolean);
        assistantApiServiceids = parsedFunctions.map(func => func.service_id).filter(Boolean);
        // Processing function definitions
        const parsedFunctionsList = parsedFunctions
          .filter((item) => item.name) // Items with `name` are functions
          .map((func) => ({
            type: "function",
            function: {
              name: func.name,
              description: func.description,
              parameters: func.parameters,
            },
          }));
           // Process APIs by converting them into functions
        const parsedApisList = parsedFunctions
        .filter((item) => item.api_name) // Filter only items with `api_name`
        .map((api) => {

            try {
          // Process `parameters` field dynamically
              const properties = {};
              const required = [];
              if (Array.isArray(api.parameters) && api.parameters.length > 0) {
            api.parameters.forEach((param) => {
                  if (param.name) {
                    required.push(param.name);
                    properties[param.name] = {
                      type: param.type,
                      description: param.description || "No description provided",
                    };
                  }
                });
              }

          const parameters =
            Object.keys(properties).length > 0
              ? {
                type: "object",
                properties,
                required,
                }
              : undefined;
                
          // Return the transformed function object
              return {
                type: "function",
                function: {
                  name: `${api.api_name.replace(/ /g, "_")}_${api._id}`,
              description: api.description || "No description provided", // Default description if not provided
              ...(parameters ? { parameters } : {}), // Include `parameters` only if valid
                },
              };
            } catch (error) {
              console.error("Error processing API:", error.message);
              return null;
            }
          });
      // Combine functions and APIs into the final list
        parsedToolsWithFunctions = [
          ...parsedFunctionsList,
          ...parsedApisList,
        ...parsedTools, // Assuming parsedTools is defined elsewhere
        ];
    }catch (error) {
        console.error("Error processing functionsArray:", error.message);
      }
    }
    const dallEModel = await getOpenAiConfig("dallEModel");
    const dallEQuality = (await getOpenAiConfig("dallEQuality")).toLowerCase();
    const dallEResolution = await getOpenAiConfig("dallEResolution");
    const openai = await getOpenAIInstance();
    const isNameExist = await getAssistantByName(name);
    let assistantInformation = [];

    if (isNameExist) return next(Conflict(AssistantMessages.NAME_EXISTS));
    let fileIdWithExtension = []
    let fileSearchIds = [];
    let newFileIds = [];
    let fileSearchFileIds = []

    try {

      const filePromises = files?.map(file => createOpenAIFileObject(openai, file, "assistants", assistantInformation, fileIdWithExtension, fileSearchIds).then(uploadedFile => uploadedFile.id));
      // TODO: Handle promises here. If one promise is rejected then the entire promises will be rejected
      newFileIds = await Promise.all(filePromises);
      fileSearchFileIds = await Promise.all(fileSearchIds);

    } catch (fileError) {
      console.error('Error during OpenAI File Object creation:', fileError.message);
      return next(new Error(`Failed to upload files: ${fileError.message}`));
    }

    let image_url = null;

    if (avatar) {
      image_url = await uploadImageToS3(avatar.path, 'image')
    } else if (generateDalleImage && generateDalleImage?.toLowerCase() == 'true') {
      const imageResponse = await dalleGeneratedImage(dalleImagePrompt, dallEModel, dallEQuality, dallEResolution) // Based on the assistant name and model it will generate an image
      image_url = await uploadImageToS3(imageResponse.data[0].b64_json, 'base64')
    }

    // if assistantId is given, then we have to retrieve the assistant and create it in our database
    if (assistantId) {
      // check if already an assistant exists with the given assistantId
      const existingAssistant = await getAssistantByAssistantID(assistantId);

      if (existingAssistant) return next(Conflict(AssistantMessages.ASSISTANT_ALREADY_EXISTS));
      myAssistant = await retrieveAssistantFromOpenAI(openai, assistantId);
    } else {
      let fileSearch = false;
      parsedToolsWithFunctions.forEach(tool => {
        if (tool?.type === "function") {
          tool.function.name = tool.function.name.replace(/\s+/g, '_');
        }
        if(tool?.type === 'file_search'){
          fileSearch = true;
        }
      });
      let predefinedInstructions="";
      const allAssistants = await getAllAssistantsData(userId);
      const selected = allAssistants.filter((assistant) => selectedassistantIds.includes(assistant._id))
                        .map((assistant) => ({
                          _id: assistant._id,
                          assistant_id: assistant.assistant_id,
                          description: assistant.description || "",
                          name: assistant.name || "",
                        }));
      const assistantText = selected.map((assistant, index) => 
                            `assistant${index + 1} ID: ${assistant.assistant_id}\nassistant${index + 1} description: ${assistant.description}`).join('\n\n');

      predefinedInstructions = MultiAgentFunctionCallingInstructions.PREDEFINED_TECHNICAL_INSTRUCTIONS+`${assistantText}`+"\n"+instructions;
      const vectorStore = fileSearch ? await createOpenAiVectorStoreWithFileIds(openai, name, fileSearchFileIds) : null;
      if(selectedassistantIds && selectedassistantIds.length > 0){
        myAssistant = await createAssistantInOpenAIv2(openai, name, predefinedInstructions,description, parsedToolsWithFunctions, userSelectedModel, newFileIds, vectorStore ? vectorStore?.id : null); 
        myAssistant.instructions = instructions;
      }else{
        myAssistant = await createAssistantInOpenAIv2(openai, name, instructions,description, parsedToolsWithFunctions, userSelectedModel, newFileIds, vectorStore ? vectorStore?.id : null); // create new assistant and save it in our database
      } 
    }

    if (myAssistant) {
      const clone = false;
      const editMode = false;
      newAssistantInstance = await createAssistantInstanceV2(myAssistant, userId, category, description, image_url, tools.includes("function"), staticQuestions, userSelectedModel, assistantTypes, findApps, pluginList, imageType, dalleImagePrompt, assistantApiId, assistantApiServiceids,selectedassistantIds, selectedWorkflowIdsParsed);
      const storeKnowledgebaseReference = await storeKnowledgeBaseAssistantsReference(newAssistantInstance._id, myAssistant.id, fileNameListParsed, assistantInformation, knowledgeSource, editMode, clone, userId);
    }

    if (newAssistantInstance) {
      // Delete the uploaded files from the temporary directory
      avatar && files.push(avatar);

         // After successfully creating the assistant, store function assistant data
         if (functionsArray) {
          try {
            let parsedFunctions = JSON.parse(functionsArray);
  
            const functionIds =
              parsedFunctions?.map((func) => func?._id)?.filter(Boolean) ?? [];
  
            const associationPromises = functionIds.map((functionId) => {
              return AgentFunctionAssociation.create({
                agentid: newAssistantInstance._id, 
                functionid: functionId,
              });
            });
  
            // Wait for all associations to be inserted
            await Promise.all(associationPromises);
          } catch (error) {
          }
        }

      Promise.all(files.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
      Promise.all(ragFiles.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));

      if (newAssistantInstance) {
        res.status(StatusCodes.CREATED).json({
          message: AssistantMessages.ASSISTANT_CREATED_SUCCESSFULLY,
          assistant: newAssistantInstance,
        });
      }
    } else {
      return next(InternalServer(AssistantMessages.ASSISTANT_CREATION_FAILED));
    }
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      const customOpenAIError = handleOpenAIError(error);
      return next(error); 
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
  let threadId = null;

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

    // Step 1.1: check if assistant exists in database
    const existingAssistant = await getAssistantByAssistantID(assistant_id);
    if (!existingAssistant) {
      return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
    }

    // Step 1.2: create a thread if doesn't exist for the requested user
    if (thread_id) {
      threadId = thread_id;
    } else {
      const thread = await createAssistantThread(openai);

      thread && await createAssistantThreadInDb(assistant_id, userId, thread.id, question);

      threadId = thread.id;
    }


    // Step 2: now we have a threadId, create a message in the thread
    await createMessageInThread(openai, assistant_id, threadId, question, userId);

    // Step 3: now we have to create a run that will wait for the response from the assistant
    const run = await createRunInThread(openai, threadId, assistant_id);
    let runId = run.id;
    let retrieveRun = await retrieveRunFromThread(openai, threadId, runId);

    // Step 4: now we have to create a polling mechanism to check if the assistant has responded
    // TODO: handle all the possible cases including errors that can happen
    let openAIErrorFlag = false;
    while (retrieveRun.status !== "completed") {
      if (retrieveRun.status === "requires_action") {
        let retrieveRuntwo = await retrieveRunFromThread(openai, threadId, runId);
        const toolOutputs = [];
        const toolCalls = retrieveRuntwo.required_action.submit_tool_outputs.tool_calls;
        toolOutputs = await onToolCalls(assistant_id, toolCalls, existingAssistant.functionCalling);
        await submitToolOutputs(openai, threadId, runId, toolOutputs);
      }
      await new Promise((resolve) => {
        return setTimeout(resolve, 1000);
      });
      retrieveRun = await retrieveRunFromThread(openai, threadId, runId);

      // Check for failed, cancelled, or expired status
      if (["failed", "cancelled", "expired"].includes(retrieveRun.status)) {
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

    // Step 5: now we have to store the token count and cost to keep track of the assistant usage
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
        response: responsePayload.response,
        msg_id: responsePayload.msg_id,
        thread_id: responsePayload.thread_id,
      });
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
      .populate({
        path: "assistantTypeId",
        model: AssistantTypes,
        select: "name"
      })
      .populate({
        path: "assistantApiId",
        model: FunctionDefinition,
        select: "name"
      })
      .populate("teamId")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(limit)
      .lean();
    const openai = await getOpenAIInstance();

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
      // Update the assistant object with fileNames
      assistant.fileNames = fileNames;
      assistant.assistantTypes = assistant.assistantTypeId.name
    }

    res.status(StatusCodes.OK).json({
      assistants,
      totalAssistantCount,
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
 * @function getAssistantById
 * @description Get assistant by id
 * @param {Object} req - The request object. The params should contain the assistant ID
 * @param {Object} res - The response object
 * @param {Onject} next - next function 
 * @throws {Error} Will throw an error if it fails to fetch the assistant
 * @returns {Response} 200 - Returns fetched assistant
 */
export const getAssistantById = async (req, res, next) => {
  try {
    const { id: assistant_id } = req.params;

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
    const openai = await getOpenAIInstance();

    // Check if the assistant has file_ids and if found update the assistant object with fileNames otherwise set an empty array
    if (assistant.file_ids && assistant.file_ids.length > 0) {
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
    } else {
      assistant.fileNames = [];
    }

    res.status(StatusCodes.OK).json({
      assistant,
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
          fname: "$userDetails.fname",
          lname: "$userDetails.lname",
          username: "$userDetails.username",
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
      .populate({
        path: "assistantApiId",
        model: FunctionDefinition,
        select: "name"
      })
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
export const getAllUserAssignedAssistants = async (req, res, next) => {
  const { _id: userId } = req.user;
  const pageSize = parseInt(req.query?.pageSize, 10) || 10;
  const currentPage = parseInt(req.query?.page, 10) || 1;
  const searchQuery = req.query?.searchQuery || "";
  const searchConditionOnName = { $regex: new RegExp(searchQuery, "i") };

  const userObjectId = new mongoose.Types.ObjectId(userId);

  try {
    const authenticatedUser = await User.findById(userId).populate("teams");
    if (!authenticatedUser) {
      return next(BadRequest(AssistantMessages.USER_DOES_NOT_EXIST));
    }

    const pinnedAssistants = await getSingleUsersPinnedAssistService(userId);
    const pinnedAssistantIds =
      pinnedAssistants
        ?.map((entry) => entry.assistantId.toString())
        .slice(0, 3) || [];

    let result;
    if (searchQuery) {
      result = await getAssistantsBySearchQuery(
        searchConditionOnName,
        userObjectId,
        authenticatedUser,
        pinnedAssistantIds,
        pageSize,
        currentPage
      );
    } else {
      result = await getAssistantsWithUsage(
        userObjectId,
        authenticatedUser,
        pinnedAssistantIds,
        pageSize,
        currentPage
      );
    }

    return res.status(StatusCodes.OK).json({
      assistantList: result?.assistantList || [],
      totalPages: result?.totalPages || 1,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error?.message,
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

  let messages = [];
  let metadata = { first_id: null, last_id: null, has_more: false };

  let query = {
    order: "desc", // changing order in future will require change in formatting data at line 239
    limit: limit || 20,
  };

  after && (query.after = after);
  before && (query.before = before);

  try {
    const existingThread = await AssistantThread.findOne({
      assistant_id,
      user: user_id,
      thread_id,
    })
      .lean()
      .populate("messages");

    if (existingThread) {
      const openai = await getOpenAIInstance();
      const threadMessages = await openai.beta.threads.messages.list(
        existingThread.thread_id,
        query
      );

      if (threadMessages.data) {
        messages = await threadMessages.data.reduce(
          async (accPrevious, message) => {
            const messageAccumulator = await accPrevious;
            const { id, created_at, role, content } = message;

            if (content.length === 0) return messageAccumulator;

            let codeInterpreterOutput = null;

            if (Array.isArray(existingThread?.messages)) {
              const matchingStoredMessage = existingThread.messages.find(
                (msg) => msg.msg_id === id
              );
              codeInterpreterOutput =
                matchingStoredMessage?.codeInterpreterOutput ?? null;
            }

            if (role === "assistant") {
              let formattedResponse = await processAssistantMessage(message);
              formattedResponse = formattedResponse.replace(
                /[-.\di\s]*\[\s*.*?\]\(.*?\)/g,
                ""
              );
              messageAccumulator.push({
                botMessage: formattedResponse,
                chatPrompt: "",
                codeInterpreterOutput,
                msg_id: id,
                created_at: new Date(created_at * 1000).toISOString(),
              });
            } else if (role === "user" && messageAccumulator.length > 0) {
              const lastMessage =
                messageAccumulator[messageAccumulator.length - 1];
              lastMessage.chatPrompt = content[0]?.text?.value || "";
              lastMessage.msg_id = id;
              lastMessage.created_at = new Date(
                created_at * 1000
              ).toISOString();
              lastMessage.codeInterpreterOutput = codeInterpreterOutput;
            }

            return messageAccumulator;
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

    const updatedMessages = messages.map((message) => ({
      ...extractFluxPrompt(message),
      codeInterpreterOutput: message?.codeInterpreterOutput ?? null,
    }));

    res.status(StatusCodes.OK).json({ messages: updatedMessages, metadata });
  } catch (error) {
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
    const isFileExist = await isOpenAIFileObjectExist(openai, file_id);
    if (isFileExist) {
      // Retrieve the file metadata to get the filename
      const fileMetadata = await retrieveOpenAIFileObject(file_id);
      // Retrieve the file content
      const fileContentResponse = await retrieveOpenAIFile(file_id);
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

    } else {
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
    const existingAssistant = await getAssistantByAssistantID(assistant_id);

    // TODO: Handle the case when the assistant is not found in a separate function
    if (!existingAssistant) {
      next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
      return;
    }

    const openai = await getOpenAIInstance();

    const myAssistant = await retrieveAssistantFromOpenAI(openai, assistant_id);

    let fileIds = [...myAssistant?.file_ids];

    /*
        You can attach a maximum of 20 files per Assistant, and they can be at most 512 MB each.
        ref: https://platform.openai.com/docs/assistants/how-it-works/creating-assistants
         */
    if (fileIds.length === 20 || fileIds.length + files.length >= 20) {
      return next(BadRequest(AssistantMessages.FILES_AND_PROPERTIES_UPDATED));
    }
    let assistantInformation = [];
    if (files) {
      const filePromises = files.map(file => createOpenAIFileObject(openai, file, "assistants", assistantInformation).then(uploadedFile => uploadedFile.id));

      fileIds = [...fileIds, ...(await Promise.all(filePromises))];

      // Delete the uploaded files from the "docs" directory
      Promise.all(files.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
    }

    const myUpdatedAssistant = await updateAssistantProperties(
      openai,
      assistant_id,
      {
        file_ids: [...fileIds],
      }
    );

    if (myUpdatedAssistant) {
      existingAssistant.file_ids = fileIds;
      existingAssistant.save();
      const clone = false;
      const storeKnowledgebaseReference = await storeKnowledgeBaseAssistantsReference(myUpdatedAssistant._id, myAssistant.id, fileNameListParsed, assistantInformation, knowledgeSource, editMode = true, clone, existingAssistant?.userId);

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
    const isExistingAssistant = await getAssistantByObjectID(assistant_id);

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
  const { name, model, is_active = null, is_public = null, is_featured = null, is_pinned = null } = req.body; // add more value as per the requirements
  try {
    const isExistingAssistant = await getAssistantByObjectID(assistant_id);

    if (isExistingAssistant) {
      isExistingAssistant.name = name || isExistingAssistant.name;
      isExistingAssistant.model = model || isExistingAssistant.model;
      isExistingAssistant.is_active =
        is_active !== null ? is_active : isExistingAssistant.is_active;

      isExistingAssistant.is_public =
        is_public !== null ? is_public : isExistingAssistant.is_public;

      isExistingAssistant.is_featured =
        is_featured !== null ? is_featured : isExistingAssistant.is_featured;
      isExistingAssistant.is_pinned =
        is_pinned !== null ? is_pinned : isExistingAssistant.is_pinned;
      if (is_active === false) {
        isExistingAssistant.is_public = false;
        isExistingAssistant.is_featured = false;
        const deletedDocument = await deletePublicAssistantService(isExistingAssistant.assistant_id);
        if (deletedDocument) {
          const findFromFavourite = await getSingleFavouriteAssistantService(isExistingAssistant.assistant_id);

          if (findFromFavourite != null && findFromFavourite) {
            const deleteFromFavourite = await deleteManyFavouriteAssistantService(assistant_id);
          }
        }

      }

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
    const existingAssistant = await getAssistantByAssistantID(assistant_id);

    if (!existingAssistant) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: AssistantMessages.ASSISTANT_NOT_FOUND });
    }

    await hardDeleteAssistant(assistant_id, existingAssistant);
    // await softDeleteAssistant(existingAssistant);

    res.status(StatusCodes.OK).json({
      message: errorMessage.ASSISTANT_DELETED_SUCCESSFULLY,
    });
  } catch (error) {
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
    const {
      name,
      instructions,
      model,
      tools: toolsString = '',
      teamId,
      userId,
      staticQuestions,
      category,
      deleted_files = [],
      description,
      regenerateWithDalle,
      assistantTypes,
      functionsArray,
      fileNameList = [],
      assistantBase,
      knowledgeSource,
      enableSync,
      deletedFileList = [],
      connectApps = [],
      plugins: pluginString = '',
      imageType,
      dalleImageDescription,
      selectedassistantIds,
      selectedWorkflowIds,
    } = req.body;
    const dalleImagePrompt = getValidDescription(dalleImageDescription);

    const plugin = pluginString !== 'undefined' && pluginString !== '' && pluginString ? JSON.parse(pluginString) : [];
    const selectedWorkflowIdsParsed = selectedWorkflowIds !== 'undefined' && selectedWorkflowIds !== '' && selectedWorkflowIds ? JSON.parse(selectedWorkflowIds) : [];

    const allPlugins = plugin.map((type) => {
      return {
        type: type
      };
    });

    const files = req.files['files'] ?? [];
    

    const avatarFiles = req.files['avatar'] ?? [];
    const avatar = avatarFiles.length > 0 ? avatarFiles[0] : null;
    let image_url = null;
    const fileNameListParsed = fileNameList !== 'undefined' && fileNameList?.length > 0 ? JSON.parse(fileNameList) : [];
    if (fileNameListParsed?.length === 0 && (knowledgeSource === "true" || knowledgeSource === true)) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: KnowledgeBaseMessages.SELECT_ANY_FILE_FROM_KNOWLEDGE_BASE,
      });
    }
    const isKnowledgeBaseExists = await checkKnowledgeBasedAssistants(assistant_id);
    let ragFiles = [];
    let findApps = [];

    if (fileNameListParsed?.length > 0) {
      let newFileNameLists = fileNameListParsed;
      if (isKnowledgeBaseExists && isKnowledgeBaseExists?.length > 0) {
        for (let info of isKnowledgeBaseExists[0]?.knowledgeBaseId) {
          newFileNameLists = newFileNameLists?.filter((file) => file?.key !== info?._id?.toString());
        }

      }
      try {

        await findFileFromDBandDownload(newFileNameLists, files, ragFiles, knowledgeSource, findApps);
      } catch (downloadError) {
        return next(new Error(`Error during file downloads: ${downloadError.message}`));
      }
    }


    const tools = toolsString && JSON.parse(toolsString);
    const parsedTools = tools && tools.map((tool) => (tool !== "function" ? { type: tool } : null)).filter(Boolean);
    let parsedToolsWithFunctions = [...parsedTools];
    let assistantApiId = [];
    let assistantApiServiceids = [];
    let fileSearch = false;
    for(const tool of parsedTools){
      if(tool?.type ==='file_search'){
        fileSearch =  true;
      }
    }

    if (functionsArray) {
      try {
        // Parse the user selections from the functionsArray
        let parsedFunctions = JSON.parse(functionsArray);
        // Extracting all `_id` values into an array
        assistantApiId = parsedFunctions.map(func => func._id).filter(Boolean);
        assistantApiServiceids = parsedFunctions.map(func => func.service_id).filter(Boolean);
        // Processing function definitions
        // Process function definitions
        const parsedFunctionsList = parsedFunctions
          .filter((item) => item.name) // Items with `name` are functions
          .map((func) => ({
            type: "function",
            function: {
              name: func.name,
              description: func.description,
              parameters: func.parameters,
            },
          }));

        // Process APIs by converting them into functions
        const parsedApisList = parsedFunctions
          .filter((item) => item.api_name) // Filter only items with `api_name`
          .map((api) => {
            // Process `parameters` field dynamically
            const properties = {};
            const required = [];
            if (Array.isArray(api.parameters) && api.parameters.length > 0) {
              api.parameters.forEach((param) => {
                if (param.name) {
                  required.push(param.name);
                  properties[param.name] = {
                    type: param.type,
                    description: param.description || "No description provided",
                  };
                }
              });
            }

            const parameters =
              Object.keys(properties).length > 0
                ? {
                    type: "object",
                    properties,
                    required,
                  }
                : undefined;

            // Return the transformed function object
            return {
              type: "function",
              function: {
                name: `${api.api_name.replace(/ /g, "_")}_${api._id}`,
                description: api.description || "No description provided", // Default description if not provided
                ...(parameters ? { parameters } : {}), // Include `parameters` only if valid
              },
            };
          });
        // Combine functions and APIs into the final list
        parsedToolsWithFunctions = [
          ...parsedFunctionsList,
          ...parsedApisList,
          ...parsedTools, // Assuming parsedTools is defined elsewhere
        ];
      } catch (error) {
        console.error("Error processing functionsArray:", error.message);
      }
    }
    const dallEModel = await getOpenAiConfig("dallEModel");
    const dallEQuality = (await getOpenAiConfig("dallEQuality")).toLowerCase();
    const dallEResolution = await getOpenAiConfig("dallEResolution");
    const openai = await getOpenAIInstance();

    const existingAssistant = await getAssistantByAssistantID(assistant_id);

    if (!existingAssistant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: AssistantMessages.ASSISTANT_NOT_FOUND,
      });
    }


    if (!existingAssistant?.vectorStoreId) {
      const vectorStore =fileSearch? await createOpenAiVectorStoreWithFileIds(openai, name, []): null;
      existingAssistant.vectorStoreId = fileSearch ? vectorStore.id : null;
      await existingAssistant.save();
    }
    const updatedVectorStore = await updateOpenAiVectorStoreName(openai, existingAssistant?.vectorStoreId, name);
    if (updatedVectorStore.success === false && (knowledgeSource === "false" || knowledgeSource === false) && files.length > 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: VectorStoreMessages.VECTOR_STORE_NOT_FOUND,
      });
    }
    const myAssistant = await retrieveAssistantFromOpenAI(openai, assistant_id);
    let fileIds = [...existingAssistant.file_ids];
    const deletedFileFromKnowledgeBase = JSON.parse(deletedFileList) 

    const deletedKBfileList = await getFileIdsFromFileKey(deletedFileFromKnowledgeBase,assistant_id);
    if (deletedFileList?.length > 0) {
      const result = fileSearch?await deleteFilesFromVectorStoreUtils(
        openai,
        existingAssistant?.vectorStoreId,
        deletedKBfileList,
        assistant_id
      ):'';
      fileIds = await deleteAssistantFilesAndFilterIds(
        openai,
        assistant_id,
        fileIds,
        deletedKBfileList
      );

    }
    if (deleted_files?.length > 0) {
      const result = fileSearch?await deleteFilesFromVectorStoreUtils(
        openai,
        existingAssistant?.vectorStoreId,
        JSON.parse(deleted_files),
        assistant_id
      ):'';
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
    const previousImageType = existingAssistant?.imageType;
    if (avatarFiles.length === 0 && previousImageType === "UPLOAD" && imageType === "UPLOAD") {
      image_url = existingAssistant?.image_url; // Use the existing image URL
    } else if (avatar) {
      image_url = await uploadImageToS3(avatar.path, 'image');
      avatarFiles.push(avatar);
    } else if (regenerateWithDalle && regenerateWithDalle?.toLowerCase() === 'true') {
      const imageResponse = await dalleGeneratedImage(dalleImagePrompt, dallEModel, dallEQuality, dallEResolution);
      image_url = await uploadImageToS3(imageResponse.data[0].b64_json, 'base64');
    } else {
      image_url = null;
    }

    // if (avatar) {
    //   image_url = await uploadImageToS3(avatar.path, 'image')
    //   files.push(avatar);
    // } else if (regenerateWithDalle && regenerateWithDalle?.toLowerCase() == 'true') {
    //   const imageResponse = await dalleGeneratedImage(dalleImagePrompt, dallEModel, dallEQuality, dallEResolution) // Based on the assistant name and model it will generate an image
    //   image_url = await uploadImageToS3(imageResponse.data[0].b64_json, 'base64')
    // } else {
    //   image_url = null;
    // }
// before merge to stage


    const existingDescription = existingAssistant?.dalleImageDescription?.trim().toLowerCase()
    const newDescription = dalleImagePrompt?.trim().toLowerCase()


    if (regenerateWithDalle === 'false' && imageType === 'DALLE') {
      if (existingDescription === newDescription) {
        if (existingAssistant.image_url === null) {
          const imageResponse = await dalleGeneratedImage(dalleImagePrompt, dallEModel, dallEQuality, dallEResolution) // Based on the assistant name and model it will generate an image
          image_url = await uploadImageToS3(imageResponse.data[0].b64_json, 'base64')
        } else {
          image_url = existingAssistant?.image_url
        }

      } else {
        const imageResponse = await dalleGeneratedImage(dalleImagePrompt, dallEModel, dallEQuality, dallEResolution) // Based on the assistant name and model it will generate an image
        image_url = await uploadImageToS3(imageResponse.data[0].b64_json, 'base64')
      }


    }

    if (regenerateWithDalle === 'true' && existingAssistant.imageType === 'DALLE') {
      if (existingDescription === newDescription) {
        image_url = existingAssistant?.image_url
      } else {
        const imageResponse = await dalleGeneratedImage(dalleImagePrompt, dallEModel, dallEQuality, dallEResolution) 
        image_url = await uploadImageToS3(imageResponse.data[0].b64_json, 'base64')
      }
    }

    if (existingAssistant.imageType === 'DALLE' && imageType === 'UPLOAD') {
      if (avatarFiles.length === 1) {
        image_url = await uploadImageToS3(avatar.path, 'image');
        avatarFiles.push(avatar);
      } else {
        image_url = existingAssistant?.image_url
      }
    }

    let assistantInformation = [];
    let fileIdWithExtension =[],fileSearchIds =[]
    if (isKnowledgeBaseExists?.length > 0) {
      for (const info of isKnowledgeBaseExists[0]?.file_ids) {
        assistantInformation?.push(info);

      }

    }
    let newFileIds =[];
    try {
      newFileIds = await uploadFiles(openai, files, assistantInformation, fileIdWithExtension, fileSearchIds);
      fileIds = [...fileIds, ...newFileIds];
      await uploadFilesToVectorStore(openai, existingAssistant?.vectorStoreId, fileIds);
    } catch (fileError) {
      console.error('Error during OpenAI File Object creation:', fileError.message);
      return next(new Error(`Failed to upload files: ${fileError.message}`));
    }
      Promise.all(files.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
      Promise.all(avatarFiles.map(deleteLocalFile)).then(() => console.log('All avatarfiles deleted from local')).catch(err => console.error('Failed to delete some files:', err));
    const existingFileIds = [];
    for (const fileId of fileIds) {
      const isFileExist = await isOpenAIFileObjectExist(openai, fileId);
      if (isFileExist) {
        existingFileIds.push(fileId);
      }
    }
    let predefinedInstructions="";
    if(selectedassistantIds?.length > 0 && selectedassistantIds[0] !== "undefined"){
      const allAssistants = await getAllAssistantsData(userId);
      const selected = allAssistants.filter((assistant) => selectedassistantIds.includes(assistant._id))
                        .map((assistant) => ({
                          _id: assistant._id,
                          assistant_id: assistant.assistant_id,
                          description: assistant.description || "",
                          name: assistant.name || "",
                        }));
      const assistantText = selected.map((assistant, index) => 
                             `assistant${index + 1} ID: ${assistant.assistant_id}\nassistant${index + 1} description: ${assistant.description}`).join('\n\n');
  
      predefinedInstructions = MultiAgentFunctionCallingInstructions.PREDEFINED_TECHNICAL_INSTRUCTIONS+`${assistantText}`+"\n"+instructions;
    }

    const updateData = {
      // file_ids: fileIds,
      name,
      instructions:predefinedInstructions || instructions,
      model,
      tools: toolsString ? parsedToolsWithFunctions : [],
      tool_resources: {
        "code_interpreter": {
          "file_ids": fileIds?.length > 0? fileIds : []
        },
        "file_search": {
          "vector_store_ids": existingAssistant?.vectorStoreId?[existingAssistant?.vectorStoreId]:[]
        }
      } ,
    };
    let functionCalling = false;

    updateData.tools.forEach(tool => {
      if (tool.type === "function") {
        functionCalling = true;
        tool.function.name = tool.function.name.replace(/\s+/g, '_');
      }
    });

    const myUpdatedAssistant = await updateAssistantProperties(
      openai,
      assistant_id,
      updateData
    );
    const getAssistantTypeId = await getAssistantIdByName(assistantTypes);
    // const parsedConnectApps = connectAppsParseJSON(findApps);
    if (myUpdatedAssistant) {
      if(selectedassistantIds?.length > 0 && selectedassistantIds[0] !== "undefined"){
        myUpdatedAssistant.instructions = instructions;
      }
      const updatedAssistantFieldsObject = {
        file_ids: fileIds,
        name: myUpdatedAssistant.name,
        instructions: myUpdatedAssistant.instructions,
        model: myUpdatedAssistant.model,
        tools: updateData.tools,
        static_questions: staticQuestions && staticQuestions !== undefined
          ? parseStaticQuestions(staticQuestions)
          : [],
        category,
        assistantApiId,
        assistantApiServiceids,
        description,
        image_url,
        assistantTypes: assistantTypes,
        assistantTypeId: getAssistantTypeId,
        connectApps: findApps,
        plugins: allPlugins,
        imageType,
        dalleImageDescription: dalleImagePrompt,
        functionCalling: functionCalling,
        selectedassistantIds: selectedassistantIds? selectedassistantIds : [],
        selectedWorkflowIds: selectedWorkflowIdsParsed || [],
      };

      teamId !== undefined && (updatedAssistantFieldsObject.teamId = teamId);

      Object.assign(existingAssistant, updatedAssistantFieldsObject);

      await existingAssistant.save();
      // New logic to update function associations
      const updatedFunctionIds = assistantApiId; // New function IDs from the update
      const existingAssociations = await AgentFunctionAssociation.find({
        agentid: existingAssistant._id,
      });

      // Identify functions to be deleted
      const existingFunctionIds = existingAssociations.map((assoc) =>
        assoc.functionid.toString()
      );
      const functionsToDelete = existingFunctionIds.filter(
        (id) => !updatedFunctionIds.includes(id)
      );
      const functionsToAdd = updatedFunctionIds.filter(
        (id) => !existingFunctionIds.includes(id)
      );

      // Delete associations for removed functions
      if (functionsToDelete.length > 0) {
        await deleteFunctionAssociations(
          existingAssistant._id,
          functionsToDelete
        );
      }

      // Add new associations
      if (functionsToAdd.length > 0) {
        await createFunctionAssociations(existingAssistant._id, functionsToAdd);
      }
      const editMode = true;
      const clone = false;
      const storeKnowledgebaseReference = await storeKnowledgeBaseAssistantsReference(existingAssistant._id, existingAssistant.assistant_id, fileNameListParsed, assistantInformation, knowledgeSource, editMode, clone, existingAssistant?.userId);

    }

    res.status(StatusCodes.CREATED).json({
      message: AssistantMessages.FILES_AND_PROPERTIES_UPDATED,
      assistant: existingAssistant,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {

      const customOpenAIError = handleOpenAIError(error);
      return next(error);
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};

//Function Calling API's

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
    const openai = await getOpenAIInstance();
    if (
      !assistantName ||
      assistantName == "" ||
      assistantName == null ||
      assistantName == undefined
    ) {
      res.status(StatusCodes.BAD_REQUEST).send({ message: AssistantMessages.ASSISTANT_NAME_REQUIRED });
    } else {
      const assistant = await getAssistantByName(assistantName);

      const myAssistant = await retrieveAssistantFromOpenAI(
        openai,
        assistant.assistant_id
      );

      const functionNames = myAssistant.tools.map((tool) => tool.function.name);      //name is not getting fro tools parameter

      res.status(StatusCodes.OK).send({ assistantFunctionName: functionNames });
    }
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
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
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: AssistantMessages.FUNCTION_NAME_AND_ASSISTANT_NAMEIS_REQUIRED,
      });
    }

    const assistant = await getAssistantByName(assistantName);

    const myAssistant = await retrieveAssistantFromOpenAI(
      openai,
      assistant.assistant_id
    );

    // Find the function by the given name
    const functionObj = myAssistant.tools.find(
      (tool) => tool.function.name === functionName
    );

    // Check if function with functionName exists
    if (!functionObj) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ message: `Function ${functionName} not found` });
    }

    // Extract the properties from the parameters object
    const properties = functionObj.function.parameters?.properties;
    const parametersList = properties ? Object.keys(properties) : [];

    res.status(StatusCodes.OK).send({ parametersPerFunctionName: parametersList });
  } catch (err) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
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
    const { functionDefinition, functionName, functionsParameterNames, parameters } = req.body;

    if (!functionDefinition) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: FunctionCallingMessages.FUNCTION_DEFINITION_IS_REQUIRED,
      });
    }

    const funcDefinition = functionDefinition.replace("()", "(axios)");
    const func = new Function("axios", `return async ${funcDefinition}`)(axios);

    if (Array.isArray(parameters)) {
      parameters = parameters.shift();
    }
    delete parameters['[object Object]'];

    const paramValues = functionsParameterNames.map((param, index) => {
      let value = parameters[param.name];

      switch (param.type.toLowerCase()) {
        case 'number':
          return Number(value);
        case 'boolean':
          return String(value).toLowerCase() === 'true';
        case 'object':
          return JSON.parse(value);
        case 'array':
          return JSON.parse(value);
        default:
          return value;
      }
    });


    try {
      const result = await func(...paramValues);


      if (result === undefined) {
        return res.status(StatusCodes.BAD_REQUEST).send({
          message: FunctionCallingMessages.FUNCTION_IS_INCORRECT
        });
      }

      return res.status(StatusCodes.OK).send({ message: FunctionCallingMessages.FUNCTION_IS_CORRECT });
    } catch (funcError) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        message: funcError.message
      });
    }
  } catch (err) {

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
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
    const { title, name, definition, description, instruction, parameters, userId } = req.body;

    if (!title || !name || !definition || !description || !instruction) {
      res.status(StatusCodes.UNAUTHORIZED).send({ error: FunctionCallingMessages.PROVIDE_MENDATORY_FIELDS });
    }

    const nameExists = await FunctionDefinition.findOne({ name });
    const titleExists = await FunctionDefinition.findOne({ title });
    if (nameExists) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: FunctionCallingMessages.FUNCTION_NAME_ALREADY_EXISTS });
    } else if (titleExists) {
      res.status(StatusCodes.BAD_REQUEST).json({ error: FunctionCallingMessages.FUNCTION_TITLE_ALREADY_EXISTS });
    }
    else {
      const formattedName = name.replace(/\s+/g, '_');
      const newFunctionDefinition = new FunctionDefinition({
        title: title,
        name: formattedName,
        definition: definition,
        description: description,
        instruction: instruction,
        parameters: parameters,
        userId: userId,
      });
      await newFunctionDefinition.save();
      res.status(StatusCodes.CREATED).send(newFunctionDefinition);
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ message: error.message });
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
    const isNameAndUserExist = await getAssistantByName(name);

    if (isNameAndUserExist) {
      return res.status(StatusCodes.CONFLICT).json({
        message: FunctionCallingMessages.NAME_ALREADY_EXISTS,
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

    const assistant = await createAssistantInOpenAI(openai, name, instructions, assistantTools, userSelectedModel)

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
    }

    res.status(StatusCodes.CREATED).json({
      message: AssistantMessages.ASSISTANT_CREATED_SUCCESSFULLY,
      assistant: newAssistantInstance,
    });
  } catch (error) {
    console.error(AssistantMessages.ASSISTANT_CREATION_FAILED, error);
    InternalServer(AssistantMessages.ASSISTANT_CREATION_FAILED);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: AssistantMessages.ASSISTANT_CREATION_FAILED,
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
export const getAssistantInfo = async (req, res, next) => {
  try {
    const { assistant_id } = req.params;

    const openai = await getOpenAIInstance();
    const isExistingAssistantInOpenAI = await doesAssistantExist(openai, assistant_id);
    if (isExistingAssistantInOpenAI === false) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: AssistantMessages.ASSISTANT_NOT_FOUND });

    }
    const assistantInfoFromOpenAI = await retrieveAssistantFromOpenAI(openai, assistant_id);
    const assistantInfoFromOurDB = await Assistant.findOne({ assistant_id });
    if (!assistantInfoFromOurDB) {
      return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
    }
    if(assistantInfoFromOurDB?.selectedassistantIds?.length > 0 && assistantInfoFromOurDB?.selectedassistantIds[0] !== "undefined"){
      assistantInfoFromOpenAI.instructions = assistantInfoFromOurDB.instructions;
    }

    const myAssistant = {};

    const dbData = assistantInfoFromOurDB?._doc || {};
    const openAIData = assistantInfoFromOpenAI || {};

    for (const key in { ...dbData, ...openAIData }) {
      const openAIValue = openAIData[key];
      const dbValue = dbData[key];

      myAssistant[key] =
        openAIValue !== null && openAIValue !== undefined
          ? openAIValue
          : dbValue;
    }

    let existingFileIds = [];
    for (const fileId of myAssistant?.file_ids) {
      const isFileExist = await isOpenAIFileObjectExist(openai, fileId);
      if (isFileExist) {
        existingFileIds.push(fileId);
      }
    }
    myAssistant.file_ids = existingFileIds;

    let fileNames = await Promise.all(
      myAssistant?.file_ids?.map(fileId => retrieveOpenAIFileObject(fileId).then(fileInfo => fileInfo?.filename))
    );
    let fileIds = myAssistant?.file_ids || [];
    const restoreFileName = true;
    const editMode = true;
    const isKnowledgeBaseExists = await checkKnowledgeBasedAssistants(assistant_id, restoreFileName, editMode);
    let knowledgeBaseFilesOfRAG = [];
    let knowledgeBaseFilesOfOpenAI = [];
    let knowledgeBaseFileIdsAndKysOfOpenAI = [];
    let knowledgeBaseFileIds = [];
    let deviceBaseFileIds = [];
    const knowledgeSource = false;
    if (isKnowledgeBaseExists?.length > 0 && isKnowledgeBaseExists[0]?.knowledgeSource === true) {
      for (let file of isKnowledgeBaseExists[0]?.knowledgeBaseId) {
        knowledgeBaseFilesOfRAG.push(file._id);
      }

    }
    if (isKnowledgeBaseExists?.length > 0 && isKnowledgeBaseExists[0]?.knowledgeSource === false) {
      for (let file of isKnowledgeBaseExists[0]?.knowledgeBaseId) {
        knowledgeBaseFilesOfOpenAI.push(file?._id?.toString());

      }
      for (let file of isKnowledgeBaseExists[0]?.file_ids) {
        knowledgeBaseFileIdsAndKysOfOpenAI.push(file);
        knowledgeBaseFileIds.push(file.file_id);
      }
      for (let assistantFileId of myAssistant?.file_ids) {
        if (!knowledgeBaseFileIds.includes(assistantFileId)) {
          deviceBaseFileIds.push(assistantFileId);
        }

      }
    }
    if (myAssistant?.tools?.length === 0 && myAssistant?.file_ids?.length > 0) {
      const tool = [{ type: 'code_interpreter' }, { type: 'file_search' }];
      myAssistant.tools = tool;
    }

    let knowledgeBaseInfo = [];
    if (isKnowledgeBaseExists?.length > 0) {
      for (let file of isKnowledgeBaseExists[0]?.knowledgeBaseId) {
        const title = file.name.split('/').pop();
        let fileIds = "-";
        for (const fileId of isKnowledgeBaseExists[0]?.file_ids) {
          if (fileId.key === file._id.toString()) {
            fileIds = fileId.file_id;
          }
        }
        knowledgeBaseInfo.push({ key: file?._id, title: title, originalName: file?.name, owner: file?.owner, fileId: fileIds });
      }
    }
    let fileIdsWithName = fileIds
      ?.map((fileId, index) => ({
        file_id: fileId,
        filename: fileNames[index],
      }))
      .filter(file =>
        !knowledgeBaseInfo.some(knowledgeFile => knowledgeFile?.fileId === file?.file_id)
      );
    const names = [];

    for (let info of knowledgeBaseInfo) {
      names?.push(info?.title);
      fileNames = fileNames?.filter((name) => name !== info?.title);
    }
    let filteredFiles = fileIdsWithName?.filter(file =>
      knowledgeBaseInfo.some(knowledgeFile => knowledgeFile?.key === file?.file_id)
    );
    const allPlugins = [];
    const allPluginsList = myAssistant.plugins.map((plugin) => allPlugins.push(plugin?.type));
    myAssistant.plugins = allPlugins;
    myAssistant.fileNames = fileNames;
    myAssistant.knowledgeBaseFilesOfRAG = knowledgeBaseFilesOfRAG;
    myAssistant.knowledgeBaseFilesOfOpenAI = knowledgeBaseFilesOfOpenAI;
    myAssistant.knowledgeBaseFileIdsAndKysOfOpenAI = knowledgeBaseFileIdsAndKysOfOpenAI;
    myAssistant.knowledgeBaseFileIds = knowledgeBaseFileIds;
    myAssistant.deviceBaseFileIds = deviceBaseFileIds;
    myAssistant.knowledgeBaseInfo = knowledgeBaseInfo;
    myAssistant.knowledgeSource = isKnowledgeBaseExists?.length > 0 ? isKnowledgeBaseExists[0]?.knowledgeSource : knowledgeSource;
    myAssistant.fileIdsWithName = fileIds.length > 0 ? fileIdsWithName : [];

    res.status(StatusCodes.OK).send(myAssistant);
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
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
    const existingAssistant = await getAssistantByAssistantID(assistant_id);

    if (!existingAssistant || existingAssistant.functionCalling === false) {
      throw new Error(AssistantMessages.ASSISTANT_NOT_FOUND);
    }

    const openai = await getOpenAIInstance();

    const myAssistant = await retrieveAssistantFromOpenAI(openai, assistant_id);

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

    const myUpdatedAssistant = await updateAssistantProperties(
      openai,
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
      message: FunctionCallingMessages.UPDATED_FUNCTION_DEFINITION_SUCCESSFULLY,
      assistant: existingAssistant,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/**
 * Retrieves a single function definition by user ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.userId - The ID of the user.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the function is complete.
 */

export const getSingleFunctionDefinitions = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    const { userId } = req.params;
    const query = {};

    if (typeof searchQuery === "string" && searchQuery.length) {
      const searchTerms = searchQuery.split(" ");
      query.$or = searchTerms.map((term) => ({
        name: { $regex: new RegExp(term, "i") },
      }));
    }
    const objectId = new mongoose.Types.ObjectId(userId);
    if (objectId) {
      query.userId = objectId;
    }
    // Fetch all function definitions from the database
    const response = await FunctionDefinition.find(query).sort({
      createdAt: -1,
    });
    let functionDefinitions = response.map((def) => {
      return {
        ...def._doc,
        name: def.name.replace(/_/g, " "),
      };
    });
    // Fetch associated agents
    functionDefinitions = await Promise.all(
      functionDefinitions.map(async (functionItem) => {
        const associateAgents = await getAllFunctionAssistants(
          functionItem._id
        );
        return { ...functionItem, associateAgents };
      })
    );

    res.status(StatusCodes.OK).json({
      functionDefinitions,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

/**
 * @async
 * @function getAllFunctionDefinitions
 * @description Retrieves all function definitions from the database
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns all function definitions
 * @throws {Error} Will throw an error if there are issues during the retrieval process
 */
export const getAllFunctionDefinitions = async (req, res) => {
  try {
    const { searchQuery } = req.query;
    const query = {};

    // Add search functionality
    if (typeof searchQuery === "string" && searchQuery.length) {
      const searchTerms = searchQuery.split(" ");
      query.$or = searchTerms.map((term) => ({
        name: { $regex: new RegExp(term, "i") },
      }));
    }

    // Fetch all function definitions from the database based on the query
    const response = await FunctionDefinition.find(query).sort({
      createdAt: -1,
    });
    let functionDefinitions = response.map((def) => {
      return {
        ...def._doc,
        name: def.name.replace(/_/g, " "),
      };
    });

    // Fetch associated agents
    functionDefinitions = await Promise.all(
      functionDefinitions.map(async (functionItem) => {
        const associateAgents = await getAllFunctionAssistants(
          functionItem._id
        );
        return { ...functionItem, associateAgents };
      })
    );

    res.status(StatusCodes.OK).json({
      functionDefinitions,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};


/**
 * Deletes a function definition by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the function definition to delete.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the function definition is deleted.
 */
export const deleteFunctionDefinition = async (req, res) => {
  try {
    const { id } = req.params; // Extract functionId from req.params
    const objectId = new mongoose.Types.ObjectId(id); // Ensure it's a valid ObjectId
    const functionDefinition = await FunctionDefinition.findByIdAndDelete(objectId);

    if (!functionDefinition) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: FunctionCallingMessages.FUNCTION_DEFINITION_NOT_FOUND,
      });
    }

    res.status(StatusCodes.OK).json({
      message: FunctionCallingMessages.FUNCTION_DEFINITION_DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    console.error(FunctionCallingMessages.ERROR_DELETING_FUNCTION_DEFINITION, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};



/**
 * Updates a function definition by its ID.
 *
 * @param {Object} req - The request object.
 * @param {Object} req.params - The request parameters.
 * @param {string} req.params.id - The ID of the function definition to update.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.name - The new name of the function definition.
 * @param {string} req.body.definition - The new definition of the function.
 * @param {string} req.body.description - The new description of the function.
 * @param {string} req.body.instruction - The new instruction for the function.
 * @param {Object} req.body.parameters - The new parameters for the function.
 * @param {Object} res - The response object.
 * @returns {Promise<void>} - A promise that resolves when the function definition is updated.
 */
export const updateFunctionDefinition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, name, definition, description, instruction, parameters } = req.body;
    const objectId = new mongoose.Types.ObjectId(id);
    const formattedName = name.replace(/\s+/g, '_');
    const functionDefinition = await FunctionDefinition.findByIdAndUpdate(objectId, { title, name: formattedName, definition, description, instruction, parameters }, { new: true });
    if (!functionDefinition) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: FunctionCallingMessages.FUNCTION_DEFINITION_NOT_FOUND,
      });
    }
    res.status(StatusCodes.OK).json({
      message: FunctionCallingMessages.FUNCTION_DEFINITION_DELETED_SUCCESSFULLY
    });

  } catch (error) {
    console.error(FunctionCallingMessages.ERROR_DELETING_FUNCTION_DEFINITION, error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
}


/**
 * @async
 * @function assistantClone
 * @description clones the assistant which id it is given
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Response} 200 - return a success message
 * @throws {Error} Will throw an error if there are issues during the retrieval process
 */

export const assistantClone = async (req, res) => {
  try {
    const { assistantId, userId } = req.body;
    const openai = await getOpenAIInstance();

    const assistantSettings = await getSingleAssistantByIdService(assistantId);
    const isExistingOpenAIAssistant = await doesAssistantExist(openai, assistantId);
    let parsedFunctionsList = [];
    const assistantInfoFromOpenAI = isExistingOpenAIAssistant ? await retrieveAssistantFromOpenAI(openai, assistantId) : null;
    const newFileIds = isExistingOpenAIAssistant ? assistantSettings.file_ids : [];
    const tools = isExistingOpenAIAssistant ? assistantSettings.tools : [];
    let parsedTools = tools && tools.map((tool) => (tool.type !== "function" ? { type: tool.type } : null)).filter(Boolean);
    parsedFunctionsList = isExistingOpenAIAssistant && assistantInfoFromOpenAI !== null ? assistantInfoFromOpenAI?.tools?.map(func => func).filter(Boolean) || [] : [];
    let parsedToolsWithFunctions = [...parsedFunctionsList, ...parsedTools];
    parsedToolsWithFunctions = parsedToolsWithFunctions.filter((item, index, self) =>
      item.type === 'function' ||
      index === self?.findIndex((t) => t?.type === item?.type));

    let myAssistant = null;
    let newAssistantInstance = null;
    const image_url = null;
    const assistantName = "Copy of " + assistantSettings?.name;
    const restoreFileName = false;
    const isKnowledgeBaseExists = await checkKnowledgeBasedAssistants(assistantId, restoreFileName);
    const knowledgeSource = isKnowledgeBaseExists?.length > 0 ? isKnowledgeBaseExists[0]?.knowledgeSource : false;
    const fileInfo = await Promise.all(
      newFileIds.map(fileId => retrieveOpenAIFileObject(fileId))
    );
    let file_search_Ids = [];
    let code_interpreter_Ids = [];

    for (const file of fileInfo) {
      const filename = file.filename;
      if (filename.includes('.')) {
        let extension = filename.split('.').pop();
        extension = "." + extension;

        if (fileSearchFileTypes.includes(extension)) {
          file_search_Ids.push(file.id);
        } else {
          code_interpreter_Ids.push(file.id);
        }
      } else {
        code_interpreter_Ids.push(file.id);
      }
    }


    const vectorStore = await createOpenAiVectorStoreWithFileIds(openai, assistantName, file_search_Ids);
    myAssistant = await createAssistantInOpenAIv2(openai, assistantName, assistantSettings?.instructions, assistantSettings?.description, parsedToolsWithFunctions, assistantSettings?.model, newFileIds, vectorStore?.id);

    if (myAssistant) {
      const isFunctionCalling = tools?.map(tool => tool?.type === 'function').filter(Boolean);
      assistantSettings.category = "PERSONAL";
      assistantSettings.static_questions = JSON.stringify(assistantSettings?.static_questions);
      const connectApps = [];
      const enableSync = false;

      newAssistantInstance = await createAssistantInstanceV2(myAssistant, userId, assistantSettings?.category, assistantSettings?.description, image_url, isFunctionCalling[0], assistantSettings?.static_questions, assistantSettings?.model, assistantSettings?.assistantTypes, assistantSettings.connectApps, assistantSettings?.plugins);
      const editMode = false;
      const clone = true;
      if (isKnowledgeBaseExists[0]?.knowledgeBaseId.length > 0) {
        const knowledgeBaseFileIds = isExistingOpenAIAssistant ? isKnowledgeBaseExists[0]?.file_ids : [];
        const storeKnowledgebaseReference = await storeKnowledgeBaseAssistantsReference(newAssistantInstance?._id, myAssistant?.id, isKnowledgeBaseExists[0]?.knowledgeBaseId, knowledgeBaseFileIds, knowledgeSource, editMode, clone, userId);
      }
    }
    if (newAssistantInstance) {
      return res.status(StatusCodes.CREATED).json({
        message: AssistantMessages.ASSISTANT_CLONED_SUCCESSFULLY,
      });
    } else {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: AssistantMessages.ASSISTANT_CLONING_FAILED,
      });
    }
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message });
  }
};





/**
 * ------------ Script to migrate assistant from v1 to v2 -----------
 * 
 */



export const migrateAssistantsFromV1toV2 = async (req, res) => {
  const openai = await getOpenAIInstance();
  try {
    // const allAssistantFromDB = await Assistant.find({}) // this is for all assistant
    const singleAssistant = await Assistant.find({ assistant_id: "asst_0jgdn4T8ahUbm05by2oAzxxC" }) // this is for first time testing with single assistant
    const allAssistantFromDB = singleAssistant;
    let count = 0;

    for (const assistant of allAssistantFromDB) {
      // console.log("assistant", assistant)
      // console.log("allAssistantFromDB", allAssistantFromDB)
      try {
        const isAssistantExistOnOpenAiPlatform = await doesAssistantExist(openai, assistant?.assistant_id);
        if (!isAssistantExistOnOpenAiPlatform) {
          continue
        }

        if (isAssistantExistOnOpenAiPlatform) {

          const assistantInfoFromOpenAI = await retrieveAssistantFromOpenAI(openai, assistant?.assistant_id);
          const attachedVectorStoreId = assistantInfoFromOpenAI?.tool_resources?.file_search?.vector_store_ids?.[0]

          // console.log("assistantInfoFromOpenAI ❤️", assistantInfoFromOpenAI)
          // console.log("attachedVectorStoreId 👌", attachedVectorStoreId)

          // step 3 & 4: Update 'retrieval' to 'file_search' and need to add vector store id in our DB
          await Assistant.updateOne(
            { _id: assistant._id, "tools.type": "retrieval" }, // Find the document with 'retrieval' in tools
            {
              $set: {
                "tools.$[elem].type": "file_search", // Update 'retrieval' to 'file_search'
                vectorStoreId: attachedVectorStoreId
              }
            },
            {
              arrayFilters: [{ "elem.type": "retrieval" }]
            }
          );
          count++;
        }
      } catch (error) {
        console.error("Error while checking isAssistantExistOnOpenAiPlatform :", error);
        continue
      }
    }


    res.status(StatusCodes.OK).json({
      platformDataCount: count,
      dataCount: allAssistantFromDB?.length,
      allAssistantFromDB,
    });
  } catch (error) {

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const createVectorStoreForAllAssistantWhereStoreNotExist = async (req, res) => {
  const openai = await getOpenAIInstance();
  try {
    // const allAssistantWhereStoreNotExist = await Assistant.find({ vectorStoreId: { $exists: false } }) // this is for all assistant
    const singleAssistant = await Assistant.find({ assistant_id: "asst_K7YeDHXVYQ6h7e2jkBQz4YWM" }) // this is for first time testing with single assistant
    const allAssistantWhereStoreNotExist = singleAssistant;
    let count = 0;

    for (const assistant of allAssistantWhereStoreNotExist) {
      // console.log("assistant", assistant)
      // console.log("allAssistantFromDB", allAssistantFromDB)
      try {
        const createdVectorStore = await createOpenAiVectorStore(openai, assistant?.name);

        if (createdVectorStore.success === true) {
          await Assistant.updateOne(
            { _id: assistant._id, },
            {
              $set: {
                vectorStoreId: createdVectorStore?.store?.id
              }
            },
          );

          count++;
        }


      } catch (error) {
        console.error("Error while creating vector store for assistant :", error);
        continue
      }
    }


    return res.status(StatusCodes.OK).json({
      createdVectorStoreDataCount: count,
      dataCount: allAssistantWhereStoreNotExist?.length,
      allAssistantWhereStoreNotExist,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};



/**
 * @async
 * @function stopGeneratingResponse
 * @description It will stop generating response for an assistant based on the provided thread and run id
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @returns {Response} 200 - return a success message
 * @throws {Error} Will throw an error if there are issues during the stop generating response API call
 */

export const stopGeneratingResponse = async (req, res) => {
  const { threadId, runId } = req.body;
  try {
    const run = await stopGeneratingResponseByThreadAndRunId(threadId, runId)
    return res.status(StatusCodes.OK).json({
      run
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message });
  }
};

export const getAllAssistantsIds = async (req, res) => {
  try {
    const { userId } = req.params;
    const allAgents =  await getAllAssistantsDataFromDB(userId);

    res.status(StatusCodes.OK).json({
      "allAgents": allAgents,
      message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message,
    });
  }
};
const getAllAssistantsData = async (userId) => {
  try {
    const allAgents = await getAllAssistantsDataFromDB(userId);

    return allAgents;
  } catch (error) {
    return { success: false, message: 'Failed to retrieve all assistants data' };
  }
};


export const getAssistantUsages = async (req, res) => {
  try {
    const { assistant_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate assistant_id
    if (!assistant_id) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: 'Assistant ID is required' });
    }

    // Validate pagination parameters
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ success: false, message: 'Invalid pagination parameters' });
    }

    // Call service to get assistant usage data with pagination
    const usageData = await getAssistantUsageData(
      assistant_id,
      pageNum,
      limitNum
    );

    // Check if data was retrieved successfully
    if (!usageData.success) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ success: false, message: usageData.message });
    }

    // Return the response
    return res.status(StatusCodes.OK).json({
      success: true,
      data: usageData.data,
    });
  } catch (error) {
    console.error('Error in getAssistantUsages:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: 'Failed to retrieve assistant usage data' });
  }
};

// Controller for assistant details
export const getAssistantDetailsController = async (req, res) => {
  const { page, limit } = req.query;


  const result = await getAssistantDetails(page, limit);

  if (!result.success) {
    return res.status(400).json({ success: false, message: result.message });
  }

  return res.status(200).json({ success: true, data: result.data });
};

export const getAssistantCategoryCount = async (req, res) => {
  const { _id: user_id } = req.user;

  try {
    // Verify user exists
    const reqUser = await User.findById(user_id);
    if (!reqUser) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: AssistantMessages.USER_DOES_NOT_EXIST,
      });
    }

    // Build base query with required filters
    let baseQuery = {
      is_active: true,
      is_deleted: false,
    };

    // Apply teamId filter for non-superadmin users with teamId
    if (reqUser.teamId && reqUser.role !== "superadmin") {
      baseQuery.teamId = reqUser.teamId;
    } else if (!reqUser.teamId && reqUser.role !== "superadmin") {
      return res.status(StatusCodes.OK).json({
        personalCount: 0,
        organizationalCount: 0,
        message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
      });
    }

    // Count assistants by category
    const [personalCount, organizationalCount] = await Promise.all([
      Assistant.countDocuments({
        ...baseQuery,
        category: "PERSONAL",
        is_public: true // Personal assistants must be public
      }),
      Assistant.countDocuments({
        ...baseQuery,
        category: "ORGANIZATIONAL" // No is_public restriction for ORGANIZATIONAL
      }),
    ]);

    res.status(StatusCodes.OK).json({
      personalCount,
      organizationalCount,
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
 * @function fetchN8nWorkflows
 * @description Fetches workflows from n8n API using the provided secret key (for validation only)
 * @param {Object} req - Request object. Should contain secretKey and assistant_id in the body
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns the workflows list
 * @throws {Error} Will throw an error if the API call fails or secret key is invalid
 */
export const fetchN8nWorkflows = async (req, res) => {
  try {
    const { secretKey, assistant_id, isExistingKey = false } = req.body;

    if (!secretKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: N8nWorkflowMessages.SECRET_KEY_REQUIRED
      });
    }

    if (!assistant_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: N8nWorkflowMessages.ASSISTANT_ID_REQUIRED
      });
    }

    const response = await axios.get('https://n8n.buildyourai.consulting/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': secretKey
      }
    });

    if (response?.data?.data && Array.isArray(response?.data?.data)) {
      return res.status(StatusCodes.OK).json({
        success: true,
        workflows: response.data.data,
        message: N8nWorkflowMessages.WORKFLOWS_FETCHED_SUCCESSFULLY
      });
    } else {
      return res.status(StatusCodes.OK).json({
        success: true,
        workflows: [],
        message: N8nWorkflowMessages.NO_WORKFLOWS_FOUND
      });
    }
  } catch (error) {
    console.error('Error fetching n8n workflows:', error);
    
    if (error.response?.status === 401) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: N8nWorkflowMessages.INVALID_SECRET_KEY
      });
    }
    
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: N8nWorkflowMessages.FAILED_TO_FETCH_WORKFLOWS
    });
  }
};

/**
 * @async
 * @function getN8nWorkflowsForAssistant
 * @description Gets selected workflow IDs for a specific assistant
 * @param {Object} req - Request object. Should contain assistant_id in params
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns the selected workflow IDs
 * @throws {Error} Will throw an error if assistant is not found
 */
export const getN8nWorkflowsForAssistant = async (req, res) => {
  try {
    const { assistant_id } = req.params;

    if (!assistant_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: N8nWorkflowMessages.ASSISTANT_ID_REQUIRED
      });
    }

    const assistant = await getAssistantByAssistantID(assistant_id);
    
    if (!assistant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: N8nWorkflowMessages.ASSISTANT_NOT_FOUND
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      selectedWorkflowIds: assistant.selectedWorkflowIds || [],
      message: N8nWorkflowMessages.N8N_CONNECTION_STATUS_RETRIEVED
    });

  } catch (error) {
    console.error('Error getting n8n workflows for assistant:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: N8nWorkflowMessages.FAILED_TO_GET_N8N_WORKFLOWS
    });
  }
};

/**
 * @async
 * @function saveSelectedN8nWorkflows
 * @description Saves selected workflow IDs for a specific assistant
 * @param {Object} req - Request object. Should contain assistant_id in params and workflowIds in body
 * @param {Object} res - Response object
 * @returns {Response} 200 - Returns success message
 * @throws {Error} Will throw an error if assistant is not found
 */
export const saveSelectedN8nWorkflows = async (req, res) => {
  try {
    const { assistant_id } = req.params;
    const { workflowIds } = req.body;

    if (!assistant_id) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: N8nWorkflowMessages.ASSISTANT_ID_REQUIRED
      });
    }

    if (!Array.isArray(workflowIds)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: N8nWorkflowMessages.WORKFLOW_IDS_MUST_BE_ARRAY
      });
    }

    const assistant = await getAssistantByAssistantID(assistant_id);
    
    if (!assistant) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: N8nWorkflowMessages.ASSISTANT_NOT_FOUND
      });
    }

    assistant.selectedWorkflowIds = workflowIds;
    await assistant.save();

    return res.status(StatusCodes.OK).json({
      success: true,
      message: N8nWorkflowMessages.SELECTED_WORKFLOWS_SAVED_SUCCESSFULLY
    });

  } catch (error) {
    console.error('Error saving selected n8n workflows:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: N8nWorkflowMessages.FAILED_TO_SAVE_SELECTED_WORKFLOWS
    });
  }
};