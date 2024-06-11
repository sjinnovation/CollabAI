// ----- MODELS -----
import Assistant from "../models/assistantModel.js"; // Adjust the import path based on your project structure
import AssistantThread from "../models/assistantThreadModel.js";
import promptModel from "../models/promptModel.js";
// ----- CONSTANTS -----
import { getOpenAIInstance } from '../config/openAI.js';
import { createChatPerAssistantSchema } from "../utils/validations.js";
import { retrieveAssistantFromOpenAI } from "../lib/openai.js";
import { parseStaticQuestions } from "../utils/assistant.js";

export const createAssistantInstance = (assistant, userId, category, description, image_url, functionCalling, staticQuestions, userSelectedModel,assistantTypes) => {
  const newAssistantInstance = new Assistant({
      assistant_id: assistant.id,
      name: assistant.name,
      model: userSelectedModel,
      instructions: assistant.instructions,
      tools: assistant.tools,
      assistantTypes: assistantTypes,
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
    console.log(playgroundAssistant, "playgroundAssistant");

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
    if (openaiAssistant !== false) {
      await openai.beta.assistants.del(assistantId);
    }
    await existingAssistant.delete();
  } catch (error) {
    throw error;
  }
};
//-----------Assistant-------------------
export const getSingleAssistantByIdService = async (assistant_id)=>{
	return await Assistant.findOne({ assistant_id }).lean();
};

export const getAssistantByIdOrAssistantIdService = async (assistant_id)=>{
	return await Assistant.findOne({_id : mongoose.Types.ObjectId(assistant_id)});
};
