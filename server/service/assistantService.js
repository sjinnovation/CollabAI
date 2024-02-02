import OpenAI from "openai";

// ----- MODELS -----
import Assistant from "../models/assistantModel.js"; // Adjust the import path based on your project structure
import AssistantThread from "../models/assistantThreadModel.js";
import promptModel from "../models/promptModel.js";

// ----- CONSTANTS -----
import config from "../config.js";

const openai = new OpenAI({
    apiKey: config.OPEN_AI_API_KEY,
  });
  
  export const updateAssistantFromPlayground = async (assistantId, localAssistant) => {
    try {
      const playgroundAssistant = await openai.beta.assistants.retrieve(assistantId);
      console.log(playgroundAssistant, "playgroundAssistant");
  
      // Compare the fields with the local MongoDB model
      const fieldsToCheck = ["name", "model", "instructions", "tools", "file_ids"];
      const needsUpdate = fieldsToCheck.some(field => JSON.stringify(playgroundAssistant[field]) !== JSON.stringify(localAssistant[field]));
  
      if (needsUpdate) {
        // Update the local MongoDB model
        await Assistant.findOneAndUpdate({ assistant_id: assistantId }, {
          name: playgroundAssistant.name,
          model: playgroundAssistant.model,
          instructions: playgroundAssistant.instructions,
          tools: playgroundAssistant.tools,
          file_ids: playgroundAssistant.file_ids,
        });
      }
    } catch (error) {
      console.error(`Error updating assistant ${assistantId} from the OpenAI Playground: ${error.message}`);
    }
  };

// this function is for assistant function calling, responsible for getting prompts based on query
export async function meeting_summary(sDate, eDate, meetingType) {
    try {
        // Validate inputs
        if (!sDate || !eDate) {
            throw new Error('Start and end dates are required');
        }

        const startDate = new Date(sDate);
        const endDate = new Date(eDate);

        // Prepare query
        let query = {
            createdAt: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Add tags to query if provided
        if (meetingType && meetingType.length) {
            query.tags = { $in: meetingType };
        }

        // Fetch data from DB
        const result = await promptModel
            .find(query)
            .populate("tags", "title")
            .lean();

        // Prepare response
        const concisePrompt = result.map(item => ({
            user: item.description,
            assistant: item.promptresponse,
            meeting_type: item.tags.length ? item.tags.map(i => i.title).join(' ') : 'Not a meeting',
            createdAt: new Date(item.createdAt).toISOString()
        }));

        // Convert the response to JSON and remove newline characters
        const jsonString = JSON.stringify(concisePrompt).replace(/\\n/g, '');

        return jsonString;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


// ----- THREAD -----

// service that gets single assistant thread by id
export const getAssistantThreadsByQuery = async (query) => {
    const threads = await AssistantThread.find({
        ...query
    })

    return threads;
}

export const getAssistantThreadById = async (threadId) => {
    const thread = await AssistantThread.findById(threadId);

    return thread;
}

export const deleteOpenAiThreadById = async (threadId) => {
    const response = await openai.beta.threads.del(threadId);
    if(response.deleted) {
        return true;
    } else {
        return false;
    }
}

