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

export const createAssistantInstance = async (assistant, userId, category, description, image_url, functionCalling, staticQuestions, userSelectedModel, assistantTypes) => {
  const getAssistantType = await getAssistantIdByName(assistantTypes);

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
  });

  return newAssistantInstance.save();
}

export const createAssistantInstanceV2 = async (assistant, userId, category, description, image_url, functionCalling, staticQuestions, userSelectedModel, assistantTypes) => {
  const getAssistantType = await getAssistantIdByName(assistantTypes);
  const openai = await getOpenAIInstance()
  const vectorStoreId = assistant?.tool_resources?.file_search?.vector_store_ids[0];
  const codeInterpreterFileIds = assistant?.tool_resources?.code_interpreter?.file_ids || [];
  let attachedFileIds = [];
  if(vectorStoreId){
    const fileIdsFromVectorStore = await getFileIdsFromVectorStore(openai, vectorStoreId);
    attachedFileIds = fileIdsFromVectorStore;
  }
  const allFileIds = [...codeInterpreterFileIds, ...attachedFileIds];
  let uniqueFileIds = [...new Set(allFileIds)];

console.log(uniqueFileIds);
  console.log("allFileIds", allFileIds)
  
  
  console.log("vectorStoreId while created:", vectorStoreId)
  const newAssistantInstance = new Assistant({
    assistant_id: assistant.id,
    vectorStoreId,
    name: assistant.name,
    model: userSelectedModel,
    instructions: assistant.instructions,
    tools: assistant.tools,
    assistantTypes: assistantTypes,
    assistantTypeId: getAssistantType._id,
    // file_ids: assistant.file_ids,
    file_ids: uniqueFileIds,
    userId,
    category,
    description,
    image_url,
    functionCalling,
    static_questions: staticQuestions ? parseStaticQuestions(staticQuestions) : [],
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
      try {
        await openai.beta.assistants.del(assistantId);
        await Assistant.findByIdAndDelete(existingAssistant._id);
      } catch (error) {
        await Assistant.findByIdAndDelete(existingAssistant._id);
      }
    } else {
        await Assistant.findByIdAndDelete(existingAssistant._id);
    }
    if(openaiAssistant){
      const findKnowledgeBaseAssistant = await KnowledgeBaseAssistants.findOne({assistantId : assistantId});

      if(findKnowledgeBaseAssistant && findKnowledgeBaseAssistant !==null){
        const deleteAssistantFromKnowledgeBase = await KnowledgeBaseAssistants.findByIdAndDelete({_id : findKnowledgeBaseAssistant?._id});


      }
    }
  } catch (error) {
    throw error;
  }
};
//-----------Assistant-------------------
export const getSingleAssistantByIdService = async (assistant_id) => {
  return await Assistant.findOne({ assistant_id }).lean();
};

export const getSingleAssistantByIdWithUserDetailsService = async (assistant_id) => {
  return await Assistant.findOne({ assistant_id }).populate('userId','fname lname').lean();
};
export const getAssistantByIdOrAssistantIdService = async (assistant_id) => {
  return await Assistant.findOne({ _id: mongoose.Types.ObjectId(assistant_id) });
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
