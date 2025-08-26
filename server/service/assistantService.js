// ----- MODELS -----
import Assistant from "../models/assistantModel.js"; // Adjust the import path based on your project structure
import AssistantThread from "../models/assistantThreadModel.js";
import promptModel from "../models/promptModel.js";
// ----- CONSTANTS -----
import { getOpenAIInstance } from '../config/openAI.js';
import { createChatPerAssistantSchema } from "../utils/validations.js";
import { retrieveAssistantFromOpenAI } from "../lib/openai.js";
import { parseStaticQuestions } from "../utils/assistant.js";
import { getAssistantIdByName } from "./assistantTypeService.js";
import KnowledgeBaseAssistants from "../models/knowledgeBaseAssistants.js";
import { getFileIdsFromVectorStore } from "../lib/vectorStore.js";
import mongoose from "mongoose";
import { deleteUseCaseData } from "./workBoardService.js";
import WorkBoardSync from "../models/workBoardSyncModel.js";
import AssistantUsage from "../models/assistantUsageModel.js";
import User from "../models/user.js";

export const createAssistantInstance = async (assistant, userId, category, description, image_url, functionCalling, staticQuestions, userSelectedModel, assistantTypes,connectApps) => {
  const getAssistantType = await getAssistantIdByName(assistantTypes);
  const parsedConnectApps = connectAppsParseJSON(connectApps);

  const newAssistantInstance = new Assistant({
    assistant_id: assistant.id,
    name: assistant.name,
    model: userSelectedModel,
    instructions: assistant.instructions,
    tools: assistant.tools,
    assistantTypes: assistantTypes,
    assistantTypeId: getAssistantType._id,
    file_ids: assistant.file_ids,
    userId,
    category,
    description,
    image_url,
    functionCalling,
    static_questions: staticQuestions ? parseStaticQuestions(staticQuestions) : [],
    connectApps : parsedConnectApps,
  });

  return newAssistantInstance.save();
}


export const createAssistantInstanceV2 = async (assistant, userId, category, description, image_url, functionCalling, staticQuestions, userSelectedModel, assistantTypes,connectApps, plugin=[], imageType, dalleImageDescription, assistantApiId,assistantApiServiceids,selectedassistantIds, selectedWorkflowIds=[]) => {
  const getAssistantType = await getAssistantIdByName(assistantTypes);
  const openai = await getOpenAIInstance()
  const vectorStoreId = assistant?.tool_resources?.file_search?.vector_store_ids[0] ||"";
  const codeInterpreterFileIds = assistant?.tool_resources?.code_interpreter?.file_ids || [];
  let attachedFileIds = [];
  if(vectorStoreId){
    const fileIdsFromVectorStore = await getFileIdsFromVectorStore(openai, vectorStoreId);
    attachedFileIds = fileIdsFromVectorStore;
  }
  const allFileIds = [...codeInterpreterFileIds, ...attachedFileIds];
  let uniqueFileIds = [...new Set(allFileIds)];
  const plugins = plugin?.map((type) => {
    return {
        type: type?.type
    };
});

const newAssistantInstance = new Assistant({
    assistant_id: assistant.id,
    vectorStoreId,
    name: assistant.name,
    model: userSelectedModel,
    instructions: assistant.instructions,
    tools: assistant.tools,
    assistantTypes: assistantTypes,
    assistantTypeId: getAssistantType._id,
    file_ids: uniqueFileIds,
    userId,
    category,
    description,
    image_url,
    functionCalling,
    static_questions: staticQuestions ? parseStaticQuestions(staticQuestions) : [],
    connectApps : connectApps,
    plugins: plugins,
    imageType,
    dalleImageDescription,
    assistantApiId,
    assistantApiServiceids,
    selectedassistantIds: selectedassistantIds? selectedassistantIds : [],
    selectedWorkflowIds: selectedWorkflowIds || [],
  });

  return newAssistantInstance.save();
}


export const validateUserPromptForAssistant = ({ question }) => {
  const payload = { question };

  return createChatPerAssistantSchema.validate(payload, {
    abortEarly: false,
    stripUnknown: true,
  });
}

export const getAssistantByAssistantID = async (assistant_id) => {
  const assistant = await Assistant.findOne({
    assistant_id,
    is_deleted: false
  });

  return assistant;
}

export const getAssistantByObjectID = async (_id) => {
  const assistant = await Assistant.findOne({
    _id,
    is_deleted: false
  });

  return assistant;
}

export const getAssistantByName = async (name) => {
  const assistant = await Assistant.findOne({
    name,
    is_deleted: false
  });

  return assistant;
}


export const updateAssistantFromPlayground = async (
  assistantId,
  localAssistant
) => {
  try {
    const openai = await getOpenAIInstance();

    const playgroundAssistant = await retrieveAssistantFromOpenAI(openai, assistantId);

    // Compare the fields with the local MongoDB model
    const fieldsToCheck = [
      "name",
      "model",
      "instructions",
      "tools",
      "file_ids",
    ];
    const needsUpdate = fieldsToCheck.some(
      (field) =>
        JSON.stringify(playgroundAssistant[field]) !==
        JSON.stringify(localAssistant[field])
    );

    if (needsUpdate) {
      // Update the local MongoDB model
      await Assistant.findOneAndUpdate(
        { assistant_id: assistantId },
        {
          name: playgroundAssistant.name,
          model: playgroundAssistant.model,
          instructions: playgroundAssistant.instructions,
          tools: playgroundAssistant.tools,
          file_ids: playgroundAssistant.file_ids,
        }
      );
    }
  } catch (error) {
    console.error(
      `Error updating assistant ${assistantId} from the OpenAI Playground: ${error.message}`
    );
  }
};

// ----- THREAD -----
export const createAssistantThreadInDb = async (
  assistantId,
  userId,
  threadId,
  question
) => {
  const newAssistantThread = new AssistantThread({
    assistant_id: assistantId,
    user: userId,
    thread_id: threadId,
    title: question.substring(0, 50),
  });
  await newAssistantThread.save();
  return newAssistantThread;
};

// service that gets single assistant thread by id
export const getAssistantThreadsByQuery = async (query) => {
  const threads = await AssistantThread.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "assistants",
        localField: "assistant_id",
        foreignField: "assistant_id",
        as: "assistant",
      },
    },
    {
      $addFields: {
        name: { $ifNull: [{ $arrayElemAt: ["$assistant.name", 0] }, null] },
        description: "$title",
      },
    },
  ]);

  return threads;
};


export const getAssistantThreadById = async (threadId) => {
  const thread = await AssistantThread.findById(threadId);

  return thread;
};

export const softDeleteAssistant = async (existingAssistant) => {
  existingAssistant.is_deleted = true;
  await existingAssistant.save();
};

export const hardDeleteAssistant = async (assistantId, existingAssistant) => {
  try {
    const openai = await getOpenAIInstance();
    const openaiAssistant = await retrieveAssistantFromOpenAI(openai, assistantId);
    
    if (openaiAssistant) {
      // Get all file IDs from different sources
      const codeInterpreterFileIds = openaiAssistant?.tool_resources?.code_interpreter?.file_ids || [];
      const vectorStoreId = openaiAssistant?.tool_resources?.file_search?.vector_store_ids?.[0] || existingAssistant?.vectorStoreId;

      let vectorStoreFileIds = [];
      if (vectorStoreId) {
        try {
          // Get file IDs from vector store before deleting it
          const vectorStoreFiles = await openai.vectorStores.files.list(vectorStoreId);
          vectorStoreFileIds = vectorStoreFiles.data.map(file => file.id);
          // Delete files from vector store first
          for (const fileId of vectorStoreFileIds) {
            try {
              await openai.vectorStores.files.del(vectorStoreId, fileId);
            } catch (error) {
              console.error(`Failed to delete file ${fileId} from vector store:`, error.message);
            }
          }

          // Delete the vector store itself
          await openai.vectorStores.del(vectorStoreId);
        } catch (error) {
          console.error(`Failed to handle vector store ${vectorStoreId}:`, error.message);
        }
      }

      // Combine all file IDs and remove duplicates
      const allFileIds = [...new Set([
        ...codeInterpreterFileIds,
        ...vectorStoreFileIds
      ])];
      // Delete all files from OpenAI
      for (const fileId of allFileIds) {
        try {
          await openai.files.del(fileId);
        } catch (error) {
          console.error(`Failed to delete file ${fileId} from OpenAI:`, error.message);
        }
      }
      try {
        await openai.beta.assistants.del(assistantId);
        await Assistant.findByIdAndDelete(existingAssistant._id);
      } catch (error) {
        await Assistant.findByIdAndDelete(existingAssistant._id);
      }
    } else {
        await Assistant.findByIdAndDelete(existingAssistant._id);
    }
    if (openaiAssistant) {
      const findKnowledgeBaseAssistant = await KnowledgeBaseAssistants.findOne({ assistantId: assistantId });
      for (const file of findKnowledgeBaseAssistant?.file_ids) {
        const isKnowledgeBaseFileExistInSyncTable = await WorkBoardSync.findOne({ knowledgeBaseId: file.key });
        if (isKnowledgeBaseFileExistInSyncTable) {
          for (const useCase of isKnowledgeBaseFileExistInSyncTable?.useCaseData) {
            if (useCase?.assistantId === existingAssistant._id.toString()) {
              const deleteFromSyncTable = await deleteUseCaseData(file?.key, useCase?.assistantId);
            }
          }
        }
      }

      if (findKnowledgeBaseAssistant && findKnowledgeBaseAssistant !== null) {
        const deleteAssistantFromKnowledgeBase = await KnowledgeBaseAssistants.findByIdAndDelete({ _id: findKnowledgeBaseAssistant?._id });
      }
    }
  } catch (error) {
    throw error;
  }
};
//-----------Assistant-------------------
export const getSingleAssistantByIdService = async (assistant_id) => {
  return await Assistant.findOne({ assistant_id }).lean().populate([
    {
      path: "userId",
      select: "fname lname email _id"
    }
  ]);
};

export const getSingleAssistantByIdWithUserDetailsService = async (assistant_id) => {
  return await Assistant.findOne({ assistant_id }).populate('userId','fname lname').lean();
};
export const getAssistantByIdOrAssistantIdService = async (assistant_id) => {
  const assistantId = new mongoose.Types.ObjectId(assistant_id)
  return await Assistant.findOne({ _id:  assistantId});
};

// Function to extract the question part
export const extractQuestion =(text)=>{
  const questionRegex = /Based on the following documents, answer the question: (.*)\n\nDocuments:/;
  const match = text.match(questionRegex);
  return match ? match[1] : null;
}
const decodeLink = (encodedLink)=>{
  return Buffer.from(encodedLink, 'base64').toString('utf-8');  // Decode the base64 link
}

export const updateChatPrompts = (messages) => {
  const questionRegex = /Based on the following documents, answer the question:([\s\S]*?)\n\nDocuments:/;

  return messages.map((message) => {
    const matchResult = message.chatPrompt.match(questionRegex);
    if (matchResult) {
      let question = matchResult[1]; // Extract the question part
      const encodedLinkMatch = question.match(/\[ENCODED_LINK:(.*)\]/);
      if (encodedLinkMatch && encodedLinkMatch[1]) {
        const decodedLink = decodeLink(encodedLinkMatch[1]);
        question = question.replace(encodedLinkMatch[0], decodedLink); 
      }
      question = question.replace(/,ignore if there is any 'ENCODED_LINK' found in the question and do not try to access ENCODED_LINK./i, '').trim();
      message.chatPrompt = question;
    }

    return message;
  });
};
export const connectAppsParseJSON = (connectApps)=>{
  const defaultValue = []
  if (!connectApps || connectApps === "undefined") return defaultValue;
  try {
    return JSON.parse(connectApps);
  } catch (error) {
    console.error("Invalid JSON:", connectApps, error);
    return defaultValue;
  }
}

export const deleteFilesVectorStore = async (openai,vectorStoreId,opeanaiFileId)=>{
  return await openai.vectorStores.files.del(
    vectorStoreId,
    opeanaiFileId
  );
};
export const updateAssistantFileIds = async (assistantId,fileIds) =>{
  return await Assistant.updateOne({assistant_id:assistantId},{file_ids : fileIds});
};

export const extractFluxPrompt = (text) => {
  const match = text?.chatPrompt?.match(/@image\s+(.*?)\s+Description:/);
  return {
    botMessage:text.botMessage,
    chatPrompt: match ? match[1] : text?.chatPrompt,
    msg_id:text?.msg_id,
    created_at: text?.created_at
  }
};

/**
 * Adds a message with its ID and code interpreter output to an assistant thread.
 * @param {string} threadId - The ID of the thread.
 * @param {string} msgId - The ID of the message.
 * @param {string|null} codeInterpreterOutput - The code interpreter output (null if none).
 * @returns {Promise<Object>} The updated AssistantThread document.
 * @throws {Error} If the thread is not found or an error occurs during saving.
 */
export const addMessageToThread = async (
  threadId,
  msgId,
  codeInterpreterOutput
) => {
  try {
    const assistantThread = await AssistantThread.findOne({
      thread_id: threadId,
    });
    if (!assistantThread) {
      throw new Error(`AssistantThread not found for thread_id: ${threadId}`);
    }

    const messageData = {
      msg_id: msgId,
      codeInterpreterOutput: codeInterpreterOutput || null,
    };

    assistantThread.messages.push(messageData);
    await assistantThread.save();
    return assistantThread;
  } catch (error) {
    throw error;
  }
};


export const getAllAssistantsDataFromDB= async (userId) => {
  const allAgents = await Assistant.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      }
    }
  ]);


  return allAgents;
}


export const getAssistantUsageData = async (assistantId, page, limit) => {
  try {
    // Find the assistant to get its name and verify user access, ensuring category is PERSONAL or ORGANIZATIONAL
    const assistant = await Assistant.findOne({
      assistant_id: assistantId,
      $or: [
        { category: "PERSONAL", is_public: true },
        { category: "ORGANIZATIONAL" } // No is_public restriction for ORGANIZATIONAL
      ],
      is_active: true,
      is_deleted: false
    })
      .select('name')
      .lean();
    if (!assistant) {
      return {
        success: false,
        message: 'Assistant not found, not PERSONAL or ORGANIZATIONAL, not active, or deleted',
      };
    }

    // Convert page and limit to numbers with defaults
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch usage data with manual pagination
    const usageData = await AssistantUsage.find({ assistantId })
      .populate({ path: 'userId', select: 'fname lname username email status role' })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination metadata
    const totalItems = await AssistantUsage.countDocuments({ assistantId });

    // Format the response
    const formattedData = {
      assistantName: assistant.name,
      users: usageData.map((usage) => ({
        user: {
          userId: usage.userId._id,
          firstName: usage.userId.fname,
          lastName: usage.userId.lname,
          username: usage.userId.username,
          email: usage.userId.email,
          status: usage.userId.status,
          role: usage.userId.role,
        },
        usageCount: usage.usageCount,
      })),
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1,
        nextPage: pageNum < Math.ceil(totalItems / limitNum) ? pageNum + 1 : null,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
      },
    };

    return { success: true, data: formattedData };
  } catch (error) {
    console.error('Error in getAssistantUsageData:', error);
    return { success: false, message: 'Failed to retrieve assistant usage data' };
  }
};

const isComplexAssistant = (assistant) => {
  const complexityDetails = {
    hasFunctions: Array.isArray(assistant.tools) && assistant.tools.some((tool) => tool.type === 'function'),
    hasCodeInterpreter: Array.isArray(assistant.tools) && assistant.tools.some((tool) => tool.type === 'code_interpreter'),
    hasFileSearch: Array.isArray(assistant.tools) && assistant.tools.some((tool) => tool.type === 'file_search'),
    hasAssistantApiServiceIds: Array.isArray(assistant.assistantApiServiceIds) && assistant.assistantApiServiceIds.length > 0,
    hasAssistantApiId: Array.isArray(assistant.assistantApiId) && assistant.assistantApiId.length > 0,
    hasFileIds: Array.isArray(assistant.file_ids) && assistant.file_ids.length > 0,
    hasEnableSyncPlugin: Array.isArray(assistant.plugins) && assistant.plugins.some((plugin) => plugin.type === 'enableSync'),
    hasMermaidPlugin: Array.isArray(assistant.plugins) && assistant.plugins.some((plugin) => plugin.type === 'mermaid'),
  };
  const isComplex = Object.values(complexityDetails).some((value) => value === true);
  return { isComplex, complexityDetails };
};

export const getAssistantDetails = async (page = 1, limit = 10) => {
  try {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const assistants = await Assistant.find({
      category: { $in: ["PERSONAL", "ORGANIZATIONAL"] },
      is_active: true,
      is_public: true,
      is_deleted: false
    })
      .select('assistant_id name tools assistantApiServiceIds assistantApiId file_ids plugins userId')
      .populate({
        path: 'userId',
        select: 'fname lname username email status role',
      })
      .skip(skip)
      .limit(limitNum)
      .lean();

    if (!assistants || assistants.length === 0) {
      return {
        success: false,
        message: 'No active, public, non-deleted PERSONAL or ORGANIZATIONAL assistants found',
      };
    }

    for (const assistant of assistants) {
      if (!assistant.userId || !assistant.userId._id) {
        console.warn(
          `Assistant ${assistant.assistant_id} has invalid userId. Value: ${assistant.userId}. Check Assistant document for missing or invalid userId.`
        );
      } else {
        const user = await User.findById(assistant.userId._id).lean();
        if (!user) {
          console.warn(
            `Assistant ${assistant.assistant_id} references non-existent userId: ${assistant.userId._id}`
          );
        }
      }
    }

    const totalItems = await Assistant.countDocuments({
      category: { $in: ["PERSONAL", "ORGANIZATIONAL"] },
      is_active: true,
      is_public: true,
      is_deleted: false
    });

    const assistantIds = assistants.map((a) => a.assistant_id);
    const lastUsedData = await Promise.all([
      AssistantThread.aggregate([
        {
          $match: {
            assistant_id: { $in: assistantIds },
          },
        },
        {
          $group: {
            _id: '$assistant_id',
            lastUsed: { $max: '$updatedAt' },
          },
        },
      ]),
      AssistantUsage.aggregate([
        {
          $match: {
            assistantId: { $in: assistantIds },
          },
        },
        {
          $group: {
            _id: '$assistantId',
            lastUsed: { $max: '$updatedAt' },
          },
        },
      ]),
    ]);

    const lastUsedMap = {};
    lastUsedData.flat().forEach((item) => {
      const existing = lastUsedMap[item._id];
      if (!existing || new Date(item.lastUsed) > new Date(existing)) {
        lastUsedMap[item._id] = item.lastUsed;
      }
    });

    const formattedData = {
      assistants: assistants.map((assistant) => {
        const { isComplex, complexityDetails } = isComplexAssistant(assistant);
        return {
          assistantId: assistant.assistant_id,
          assistantName: assistant.name,
          isComplex,
          complexityDetails: isComplex ? complexityDetails : null,
          createdBy: assistant.userId && assistant.userId._id
            ? {
                userId: assistant.userId._id,
                firstName: assistant.userId.fname,
                lastName: assistant.userId.lname,
                username: assistant.userId.username,
                email: assistant.userId.email,
                status: assistant.userId.status,
                role: assistant.userId.role,
              }
            : null,
          lastUsed: lastUsedMap[assistant.assistant_id] || null,
        };
      }),
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
        currentPage: pageNum,
        limit: limitNum,
        hasNextPage: pageNum < Math.ceil(totalItems / limitNum),
        hasPrevPage: pageNum > 1,
        nextPage: pageNum < Math.ceil(totalItems / limitNum) ? pageNum + 1 : null,
        prevPage: pageNum > 1 ? pageNum - 1 : null,
      },
    };

    return { success: true, data: formattedData };
  } catch (error) {
    console.error('Error in getAssistantDetails:', error);
    return { success: false, message: 'Failed to retrieve assistant details' };
  }
};
