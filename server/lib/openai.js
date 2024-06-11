import { getOpenAIInstance } from "../config/openAI.js";
import fs from "fs";

/**
 * Creates a new assistant using the OpenAI API.
 * @param {Object} openai - The OpenAI instance.
 * @param {String} name - The name of the assistant.
 * @param {String} instructions - The Instructions for the assistant.
 * @param {String} tools - The tools for the assistant.
 * @param {String} userSelectedModel - The selected model for the assistant.
 * @param {Array} file_ids - All the file path.
 * @returns {Promise<Object>} A promise that resolves to the created assistant object.
 */
export const createAssistantInOpenAI = (openai,name,instructions,tools,userSelectedModel,file_ids) => {
  return openai.beta.assistants.create({
    name,
    instructions,
    tools,
    model: userSelectedModel || "gpt-4-1106-preview",
    file_ids,
  });
};

/**
 * Update properties from an assistant using the OpenAI API.
 * @param {Object} openai - The OpenAI instance.
 * @param {String} assistantId - The id of the assistant.
 * @param {Object} updateData - The updated data instance.
 * @returns {Promise<Object>} A promise that resolves to the created assistant thread object.
 */
export const updateAssistantProperties = async (openai, assistantId, updateData) => {
  return openai.beta.assistants.update(assistantId, updateData);
};

/**
 * Delete files from an assistant by id using the OpenAI API.
 * @param {Object} openai - The OpenAI instance.
 * @param {String} assistantId - The id of the assistant.
 * @param {Object} deletedFileId - The id of the specific file.
 * @returns {Promise<Object>} A promise that resolves to the deleted files from an assistant object.
 */
export const deleteAssistantFileByID = async (openai, assistantId, deletedFileId) => {
  return openai.beta.assistants.files.del(assistantId, deletedFileId);
};

/**
 * Creates a new assistant thread using the OpenAI API.
 * @param {Object} openai - The OpenAI instance.
 * @returns {Promise<Object>} A promise that resolves to the created assistant thread object.
 */
export const createAssistantThread = (openai) => {
  return openai.beta.threads.create();
};

/**
 * Delete an existng assistant thread using the OpenAI API.
 * @param {string} threadId - The ID of the thread.
 * @returns {Promise<Object>} A promise that resolves to the deleted assistant thread object.
 */
export const deleteOpenAiThreadById = async (threadId) => {
  const openai = await getOpenAIInstance();

  return openai.beta.threads.del(threadId);
};

/**
 * Creates a message in a thread.
 *
 * @param {Object} openai - The OpenAI instance.
 * @param {string} threadId - The ID of the thread.
 * @param {string} question - The content of the message.
 * @returns {Promise<Object>} - A promise that resolves to the created message object.
 */
export const createMessageInThread = async (openai, threadId, question) => {

  return openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: question,
  });
};

/**
 * Creates a run in a thread.
 *
 * @param {Object} openai - The OpenAI instance.
 * @param {string} threadId - The ID of the thread.
 * @param {string} assistantId - The ID of the assistant.
 * @returns {Promise<Object>} - A promise that resolves to the created run object in a thread.
 */
export const createRunInThread = async (openai, threadId, assistantId) => {

  return openai.beta.threads.runs.create(threadId, {
    assistant_id : assistantId,
  });
};

/**
 * Return run from the thread.
 *
 * @param {Object} openai - The OpenAI instance.
 * @param {string} threadId - The ID of the thread.
 * @param {string} runId - The ID of the run.
 * @returns {Promise<Object>} - A promise that resolves to the retrieve the run object from a thread.
 */
export const retrieveRunFromThread = (openai, threadId, runId) => {

  return openai.beta.threads.runs.retrieve(threadId, runId);
};

/**
 * Return a list of messages for a given thread using the OpenAI API.
 *
 * @param {Object} openai - The OpenAI instance.
 * @param {string} threadId - The ID of the thread.
 * @returns {Object} - Returns the list of messages from the thread
 */
export const messageListFromThread = (openai, threadId) => {
  return openai.beta.threads.messages.list(threadId)
};


/**
 * Runs a stream of messages in a thread using the OpenAI API.
 *
 * @param {Object} openai - The OpenAI instance.
 * @param {string} threadId - The ID of the thread.
 * @param {string} assistantId - The ID of the assistant.
 * @returns {Object} - The stream of messages in the thread and events of the running stream in which can be subscribed.
 */
export const streamRunInThread = (openai, threadId, assistantId) => {
  return openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
  });
};

/**
 * Submits tool outputs them for a specific thread and run.
 *
 * @param {object} openai - The OpenAI object.
 * @param {string} threadId - The ID of the thread.
 * @param {string} runId - The ID of the run.
 * @param {object} toolOutputs - The tool outputs to be submitted.
 * @returns {Promise} - A promise that resolves when the tool outputs are submitted.
 */
export const submitToolOutputs = (openai, threadId, runId, toolOutputs) => {
  return openai.beta.threads.runs.submitToolOutputs(
    threadId,
    runId,
    {
      tool_outputs: toolOutputs,
    }
  )
}

/**
 * Submits tool outputs and streams them for a specific thread and run.
 *
 * @param {object} openai - The OpenAI object.
 * @param {string} threadId - The ID of the thread.
 * @param {string} runId - The ID of the run.
 * @param {object} toolOutputs - The tool outputs to be submitted.
 * @returns {Promise} - A promise that resolves when the tool outputs are submitted and streamed.
 */
export const submitToolOutputsAndStream = (openai, threadId, runId, toolOutputs) => {
  return openai.beta.threads.runs.submitToolOutputsStream(
    threadId,
    runId,
    {
      tool_outputs: toolOutputs,
    }
  )
}

/**
 * Retrieves an assistant by its ID from OpenAI.
 * @param {object} openai - The OpenAI object.
 * @param {string} assistantId - The ID of the assistant to retrieve.
 * @returns {Promise<Object>} - A promise that resolves to the retrieved assistant object.
 */
export const retrieveAssistantFromOpenAI = async (openai, assistantId) => {
  return openai.beta.assistants.retrieve(assistantId);
}

/**
 * Generated an image using OpenAI.
 * @param {string} name - The name of the image.
 * @param {string} dallEModel - The dallEModel to generate image.
 * @param {string} assistantId - The dallEQuality to generate image.
 * @param {string} assistantId - The dallEResolution to generate image.
 * @returns {Promise<Object>} - A promise that resolves to the generated DallE image.
 */
export const dalleGeneratedImage = async (name,dallEModel,dallEQuality,dallEResolution) => {
    const openai = await getOpenAIInstance();

    const image = await openai.images.generate({
        model: dallEModel,
        prompt: name,
        n: 1,
        response_format: 'b64_json',
        quality : dallEModel == "dall-e-3" ? dallEQuality : undefined,
        size: dallEResolution,
    });

    return image;
}

/**
 * @async
 * @function createOpenAIFileObject
 * @description retrieves a file from openAi using the specified file ID.
 * @param {object} openai - The OpenAI object.
 * @param {object} file - The file to put in OpenAI.
 * @param {string} purpose - The purpose for creating file in OpenAI.
 * @returns {Promise<Object>} A promise that resolves with the file object when retrieval is successful.
 * @throws {Error} Will throw an error if the file object cannot be retrieved.
 */
export const createOpenAIFileObject = async (openai, file, purpose) => {
  return openai.files.create({
    file: fs.createReadStream(file.path),
    purpose,
  });
};

/**
 * @async
 * @function retrieveOpenAIFile
 * @description Fetches the content of the file from openai.
 * @param {string} file_id - The unique identifier of the file to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the content of the file when the retrieval is successful.
 * @throws {Error} Throws an error if the file retrieval fails.
 */
export const retrieveOpenAIFile = async (file_id) => {
  const openai = await getOpenAIInstance();
  const file = await openai.files.content(file_id);
  return file;
};

/**
 * @async
 * @function retrieveOpenAIFileObject
 * @description retrieves a file from openAi using the specified file ID.
 * @param {string} fileId - The ID of the file to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the file object when retrieval is successful.
 * @throws {Error} Will throw an error if the file object cannot be retrieved.
 */
export const retrieveOpenAIFileObject = async (fileId) => {
  const openai = await getOpenAIInstance();
  return openai.files.retrieve(fileId);
};