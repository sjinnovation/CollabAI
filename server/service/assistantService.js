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
import User ,{UserRole} from "../models/user.js";
import sendEmail from "../utils/sendEmailViaOutlook.js";

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

export const createAssistantInstanceV2 = async (assistant, userId, category, description, image_url, functionCalling, staticQuestions, userSelectedModel, assistantTypes, voiceAgent) => {
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
    voiceAgent,
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

export const validateInterviewSubmission = (assistant_id, thread_id, content) => {
  if (!assistant_id || !thread_id) {
    throw new Error('Assistant ID and Thread ID are required');
  }

  if (!content) {
    throw new Error('Interview content is required');
  }

  return true;
};

export const getInterviewPromptsFromThread = async (thread_id) => {
  try {    
    const prompts = await AssistantThread.find({ thread_id });
    
    if (!prompts || prompts.length === 0) {
      throw new Error('No interview data found for this thread');
    }

    return prompts;
  } catch (error) {
    throw new Error(`Failed to get interview prompts: ${error.message}`);
  }
};

export const getUserFromPrompts = async (prompts) => {
  try {
    
    const user_id = prompts[0].user;
    if (!user_id) {
      throw new Error('User information not found');
    }

    const user = await User.findOne({ _id: user_id })
      .select('-password')
      .populate('teams');

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error(`Failed to get user information: ${error.message}`);
  }
};

export const createInterviewOverviewRecord = async (userId, threadId, assistant_id, content, chatCount) => {
  try {
    const { default: InterviewOverview } = await import('../models/interviewOverviewModel.js');
    
    const interviewOverview = new InterviewOverview({
      userId: userId,
      threadId: threadId,
      assistant_id: assistant_id,
      overview: content,
      submissionDate: new Date().toISOString(),
      totalMessages: chatCount,
      isDeleted: false
    });

    await interviewOverview.save();

    return interviewOverview;
  } catch (error) {
    throw new Error(`Failed to create interview overview: ${error.message}`);
  }
};

export const prepareInterviewEmailData = (user, content, chatCount, interviewOverview, thread_id) => {
  let parsedContent = null;
  let isJsonContent = false;
  
  try {
    // Remove markdown code block markers if present
    const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
    parsedContent = JSON.parse(cleanContent);
    isJsonContent = true;
  } catch (e) {
    // Not JSON, keep as original content
    parsedContent = content;
  }
  return {
    name: `${user.fname} ${user.lname}`.trim(),
    email: user.email,
    content: isJsonContent ? parsedContent : content, 
    submissionDate: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    totalMessages: chatCount,
    hrDashboardUrl: `${process.env.CLIENT_URL}/hr/dashboard`,
    reviewUrl: `${process.env.CLIENT_URL}/hr/interviews/${interviewOverview._id}`,
    supportUrl: `${process.env.CLIENT_URL}/support`,
    thread_id: thread_id
  };
};

export const sendInterviewNotificationEmail = async (emailData) => {
  try {
    const result = sendEmail("mohammad.ashikuzzaman@sjinnovation.com", "Interview Submission", {emailData}, "../utils/template/interviewSubmittedToHR.handlebars", false);
    
    return { success: true };
  } catch (emailError) {
    // Don't throw the error, just return failure
    return { success: false, error: emailError };
  }
};

export const processCompleteInterviewSubmission = async (assistant_id, thread_id, content, chatCount) => {
  try {
    // Validate input
    validateInterviewSubmission(assistant_id, thread_id, content);

    // Get interview prompts
    const prompts = await getInterviewPromptsFromThread(thread_id);
    const user = await getUserFromPrompts(prompts);

    // Create interview overview record
    const interviewOverview = await createInterviewOverviewRecord(
      user._id, 
      thread_id, 
      assistant_id, 
      content, 
      chatCount
    );

    // Prepare email data
    const emailData = prepareInterviewEmailData(user, content, chatCount, interviewOverview, thread_id);
    const emailResult = await sendInterviewNotificationEmail(emailData);

    return {
      success: true,
      interviewOverview,
      user
    };
  } catch (error) {
    throw error;
  }
};
