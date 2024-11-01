import { getOpenAIInstance } from "../config/openAI.js";
import fs from "fs";
import { checkKnowledgeBasedAssistants } from "../service/knowledgeBase.js";
import { findAssistantContext } from "../controllers/ragImplementationWithS3Files.js";
import { extractAllGoogleDriveLinks, extractFileOrFolderId, longFileContextToUsableFileContext, replaceGoogleDriveLinks } from "../utils/googleDriveHelperFunctions.js";
import { downloadFilesFromGoogleDriveLink, downloadGoogleFile, getFileMetadata, getGoogleDocContent } from "../controllers/googleAuth.js";
import { extractText } from "../controllers/preprocessOfRAG.js";
import { getGoogleAuthCredentialService } from "../service/googleAuthService.js";
import {encode, decode} from 'gpt-3-encoder'; 

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
export const createAssistantInOpenAI = (openai, name, instructions, tools, userSelectedModel, file_ids = []) => {
  return openai.beta.assistants.create({
    name,
    instructions,
    tools,
    model: userSelectedModel || "gpt-4-1106-preview",
    file_ids,
  });
};


export const createAssistantInOpenAIv2 = async (openai,name,instructions,tools,userSelectedModel,file_ids, vectorStoreId) => {
  const payload = {
        name,
        instructions,
        tools,
        model: userSelectedModel || "gpt-4-1106-preview",
  }

  const hasFileSearchTool = tools.some(tool => tool.type === 'file_search');
  const hasCodeInterpreterTool = tools.some(tool => tool.type === 'code_interpreter');

  if(hasCodeInterpreterTool && hasFileSearchTool){
    payload.tool_resources = {
      "code_interpreter": {
        "file_ids": file_ids
      },
      "file_search": {
        "vector_store_ids": [vectorStoreId]
      }
    }
  }else {
    if(hasCodeInterpreterTool){
      payload.tool_resources = {
        "code_interpreter": {
          "file_ids": file_ids
        },
      }
    }
    if(hasFileSearchTool){
      payload.tool_resources = {
        "file_search": {
          "vector_store_ids": [vectorStoreId]
        }
      }
    }
  }
  const createAssistant = await openai.beta.assistants.create(payload);
  return createAssistant;
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
  return openai.beta.assistants?.files?.del(assistantId, deletedFileId);
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

  try {
    const thread = await openai.beta.threads.del(threadId);
    return thread;
  } catch (error) {
    return error
  }
};

/**
 * Creates a message in a thread.
 *
 * @param {Object} openai - The OpenAI instance.
 * @param {string} threadId - The ID of the thread.
 * @param {string} question - The content of the message.
 * @returns {Promise<Object>} - A promise that resolves to the created message object.
 */
export const createMessageInThread = async (openai, assistantId, threadId, question, userId) => {
  const restoreFileName = false;
  let modifiedPrompt = '';
  let changedQuestionWithDataContext = '';
  let fileDataContext = [];
  const links = extractAllGoogleDriveLinks(question);
  if(links?.length > 0){
    const fileIds = links?.map(link => extractFileOrFolderId(link));
    const { fileName, mimeType,fileSize } = await getFileMetadata(fileIds[0],userId);
    if(fileName !== '' && mimeType !== '' && fileSize !== 0){
      if(fileSize < 5000000){
        fileDataContext = await downloadFilesFromGoogleDriveLink(links,userId);
      }
      changedQuestionWithDataContext = replaceGoogleDriveLinks(question);
      modifiedPrompt = fileDataContext.length > 0?`Based on the following documents, answer the question: ${changedQuestionWithDataContext},ignore if there is any 'ENCODED_LINK' found in the question and do not try to access ENCODED_LINK.\n\nDocuments:\n${fileDataContext}`: "show this message only 'File Size Exceeds 5MB,please download it and upload for great experience'";
    }else{
      modifiedPrompt = "Write this message only 'Please Connect Your Apps First'";
    }
  }

  if(fileDataContext.length > 0){

    if (typeof fileDataContext[0] !== 'string') {
      throw new TypeError('modifiedPrompt must be a string');
    }
    const truncatedPrompt = await longFileContextToUsableFileContext(fileDataContext,'openai');

    return openai.beta.threads.messages.create(threadId, {
      role: "user",
      content:`Based on the following documents, answer the question: ${changedQuestionWithDataContext} ,ignore if there is any 'ENCODED_LINK' found in the question and do not try to access ENCODED_LINK.\n\nDocuments:\n${truncatedPrompt}`,
    });
  }
  if(links.length > 0 && fileDataContext.length ===0){
    return openai.beta.threads.messages.create(threadId, {
      role: "user",
      content:  "show this message only 'File Size Exceeds 5MB,please download it and upload for great experience'  and do not write anything extra with it",
    });
   
  }

  const isKnowledgeBaseExists = await checkKnowledgeBasedAssistants(assistantId,restoreFileName);
  if (isKnowledgeBaseExists.length > 0 && isKnowledgeBaseExists[0].knowledgeSource === true) {
    const file = isKnowledgeBaseExists[0].knowledgeBaseId
    const responseOfContext = await findAssistantContext(userId, question, isKnowledgeBaseExists);
    if (responseOfContext.StatusCodes === 200) {
      return openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: `Based on the following documents, answer the question: ${question}\n\nDocuments:\n${responseOfContext.context}`,
      });
    } else {
      return openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: question,
      });

    }

  }

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
    assistant_id: assistantId,
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
export const retrieveAssistantFromOpenAIv1 = async (openai, assistantId) => {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    return assistant;
  } catch (error) {
    return error
  }
};

export const retrieveAssistantFromOpenAI = async (openai, assistantId) => {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    const assistantInfo = {
      ...assistant,
      file_ids: assistant?.tool_resources?.code_interpreter?.file_ids || []
    }
    return assistant;
  } catch (error) {
    return error
  }
};
export const doesAssistantExist = async (openai, assistantId) => {
  try {
    await openai.beta.assistants.retrieve(assistantId);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Generated an image using OpenAI.
 * @param {string} name - The name of the image.
 * @param {string} dallEModel - The dallEModel to generate image.
 * @param {string} assistantId - The dallEQuality to generate image.
 * @param {string} assistantId - The dallEResolution to generate image.
 * @returns {Promise<Object>} - A promise that resolves to the generated DallE image.
 */
export const dalleGeneratedImage = async (name, dallEModel, dallEQuality, dallEResolution) => {
  const openai = await getOpenAIInstance();

  const image = await openai.images.generate({
    model: dallEModel,
    prompt: name,
    n: 1,
    response_format: 'b64_json',
    quality: dallEModel == "dall-e-3" ? dallEQuality : undefined,
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
export const createOpenAIFileObject = async (openai, file, purpose, assistantInformation) => {
  const fileObjectResponse = await openai.files.create({
    file: fs.createReadStream(file.path),
    purpose,
  });
  if(fileObjectResponse){
    if ("key" in file) {
      assistantInformation?.push({ file_id: fileObjectResponse.id, key: file.key });

    }
  }
  file.id = fileObjectResponse.id;
  return fileObjectResponse;
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
export const isOpenAIFileObjectExist = async (openai,fileId) => {
    try {
      const file = await openai.files.retrieve(fileId);
      return true;
    } catch (error) {
      if (error.status === 404) {
        console.log("File not found in openai");
      } else {
        console.log("An error occurred:", error.message);
      }
      return false;
    }
  
};
