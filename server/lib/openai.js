import cron from "node-cron";

import { getOpenAIInstance } from "../config/openAI.js";
import fs from "fs";
import { checkKnowledgeBasedAssistants } from "../service/knowledgeBase.js";
import { findAssistantContext } from "../controllers/ragImplementationWithS3Files.js";
import { extractAllGoogleDriveLinks, extractFileOrFolderId, extractWorkBoardIdFromQuestion, findAppName, longFileContextToUsableFileContext, replaceGoogleDriveLinks, replaceWorkBoardLinks } from "../utils/googleDriveHelperFunctions.js";
import { downloadFilesFromGoogleDriveLink, downloadGoogleFile, getFileMetadata, getGoogleDocContent } from "../controllers/googleAuth.js";
import { extractText } from "../controllers/preprocessOfRAG.js";
import { getGoogleAuthCredentialService } from "../service/googleAuthService.js";
import AISuggestionBatchProcessing from "../models/ai-suggestion-batch-processing.js";
import {encode, decode} from 'gpt-3-encoder'; 
import { addCommentInWorkBoardAI, getUserBasedWorkBoardActivityService } from "../service/workBoardService.js";
import WebCrawlKnowledgeBase from "../models/webCrawlKnowledgeBase.js";
import { downloadFileFromS3 } from "./s3.js";
import { readJsonFile } from "../service/webCrawlServices.js";
import { checkAppsPrompt, checkAssistantPluginEnable, checkFluxPrompt, createFluxImage, getQuestionAndImageUrl } from "../service/fluxImageGeneratorService.js";
import { checkN8nPrompt, executeWorkFlows, executeSpecificWorkflow } from "../service/n8nWorkflowService.js";
import { createImageGenerationPrompt, createModifiedPrompt } from "../utils/fluxHelperFunctions.js";
import axios from "axios";
import { getUserDetails } from "../service/userService.js";
import { getConfigKeyValue } from "../service/configService.js";
import path from "path";
import { codeInterpreterFileTypes, fileSearchFileTypes } from "../utils/fileSearchFileExtensions.js";
import User from "../models/user.js";
// import Assistant from "../models/assistant.js";
// import AssistantSuggestions from "../models/assistantSuggestions.js";
import fsPromises from "fs/promises";
import os from "os";
import Assistant from "../models/assistantModel.js";
import AssistantSuggestions from "../models/assistantSuggestions.js";
import AISuggestion from "../models/ai-suggestion-settings.js";

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

/**
 * Prepares and submits a batch API call to get assistant suggestions for each user role.
 * After batch completion, inserts suggestions per role into AssistantSuggestions table.
 * @param {Object} openai - The OpenAI instance.
 * @returns {Promise<Object>} - Batch job info
 */
export const getAssistantSuggestionsForRolesBatch = async (openai) => {
  // 1. Get all unique roles from User table
  const roles = await User.distinct("role");
  // 2. Get all featured assistants
  const assistants = await Assistant.find({ is_featured: true }, "assistant_id description instructions").lean();
  if (!roles.length || !assistants.length) throw new Error("No roles or featured assistants found");

  // 3. Prepare batch file: for each role, for each assistant, create a prompt
  const batchModel = "gpt-4o-mini";
  const batchSystemPrompt =
    "You are an expert prompt engineer. For the given assistant description and instructions, provide actionable suggestions to improve the assistant for the specified user role. Return JSON: {role, assistant_id, suggestions:[]}";

  const batchLines = [];
  for (const role of roles) {
    for (const assistant of assistants) {
      batchLines.push(
        JSON.stringify({
          custom_id: `${role}_${assistant.assistant_id}`,
          method: "POST",
          url: "/v1/chat/completions",
          body: {
            model: batchModel,
            messages: [
              { role: "system", content: batchSystemPrompt },
              {
                role: "user",
                content: `Role: ${role}\nAssistant Description: ${assistant.description}\nInstructions: ${assistant.instructions}`,
              },
            ],
            max_tokens: 2048,
          },
        })
      );
    }
  }

  // 4. Write batch file
  const TMP_DIR = path.join(process.cwd(), "tmp_assistant_role_batches");
  await fsPromises.mkdir(TMP_DIR, { recursive: true });
  const batchFilePath = path.join(TMP_DIR, `assistant_role_batch_${Date.now()}.jsonl`);
  await fsPromises.writeFile(batchFilePath, batchLines.join(os.EOL), "utf8");

  // 5. Upload file to OpenAI
  const fileObj = {
    path: batchFilePath,
    originalname: path.basename(batchFilePath),
  };
  const openaiFile = await openai.files.create({ file: fs.createReadStream(fileObj.path), purpose: "batch" });

  // 6. Create batch job
  const batchJob = await openai.batches.create({
    input_file_id: openaiFile.id,
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  });

  // 7. Monitor batch job and insert results when complete
  startBatchOutputMonitorCron(openai, batchJob.id, async (outputFile) => {
    // Download output file
    const outputPath = path.join(TMP_DIR, `assistant_role_batch_output_${Date.now()}.jsonl`);
    const writer = fs.createWriteStream(outputPath);
    outputFile.data.pipe(writer);
    await new Promise((resolve) => writer.on("finish", resolve));

    // Read and parse output
    const outputLines = (await fsPromises.readFile(outputPath, "utf8")).split(os.EOL);
    for (const line of outputLines) {
      if (!line.trim()) continue;
      try {
        const result = JSON.parse(line);
        const customId = result.custom_id;
        const [role, assistant_id] = customId.split("_");
        let suggestions = [];
        try {
          const content = result.response.choices[0].message.content;
          const parsed = JSON.parse(content);
          suggestions = parsed.suggestions || parsed.suggestion || content;
        } catch (e) {
          suggestions = result.response.choices[0].message.content;
        }
        // Insert into AssistantSuggestions table
        await AssistantSuggestions.updateOne(
          { role, assistant_id },
          {
            $set: {
              role,
              assistant_id,
              suggestions,
              updatedAt: new Date(),
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("Error parsing batch output line:", err);
      }
    }
    // Clean up files
    await fsPromises.unlink(batchFilePath);
    await fsPromises.unlink(outputPath);
    try { await openai.files.del(openaiFile.id); } catch (e) {}
  });

  return batchJob;
};

export const createAssistantInOpenAIv2 = async (openai,name,instructions,description,tools,userSelectedModel,file_ids, vectorStoreId) => {
  const payload = {
        name,
        instructions,
        description,
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
  const deleteFromAssistant =  await openai.beta.assistants?.files?.del(assistantId, deletedFileId);
  return await openai.files.del(deletedFileId);
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

  const {enableSync,fluxEnable,mermaid} = await checkAssistantPluginEnable(assistantId);
const{originalPrompt,cleanedPrompt,hasImageTag} = checkAppsPrompt(question);
const userDetails = await getUserDetails(userId);
const fluxStatus = await getConfigKeyValue('fluxStatus');

  // Check for n8n workflow execution with new format @n8n @{workflow name}
  const n8nPattern = /@n8n\s*@\{([^}]+)\}/;
  const n8nMatch = question.match(n8nPattern);
  
  if (n8nMatch) {
    try {
      const workflowName = n8nMatch[1];
      const enhancedQuestion = await executeSpecificWorkflow(openai, assistantId, threadId, question, userId, workflowName);
      return openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: enhancedQuestion,
      });
    } catch (n8nError) {
      console.error("Error in n8n workflow execution:", n8nError.message);
      // Fall back to original question if n8n execution fails
      return openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: `Error executing n8n workflow: ${n8nError.message}. Please answer the original question: ${question}`,
      });
    }
  }

  if (hasImageTag && (userDetails.role ==='superadmin' ||userDetails.role ==='admin' ||fluxStatus ==='Public')) {
    const tools = [
      {
        type: "function",
        function: {
          name: "createFluxImage",
          description:"call the function.",
          parameters: {
            type: "object",
            properties: {
              description: { type: "string" }
            },
          },
        },
      }
    ];

    const threadMessages = await openai.beta.threads.messages.list(threadId);

    let allThreadMessages = [];
    for (const data of threadMessages.data) {
      allThreadMessages.push({ 'role': data.role, 'content': data.content[0].text.value });
    }
    allThreadMessages.reverse();
    const prompt = createImageGenerationPrompt(question);
    allThreadMessages.push({ "role": "user", "content": prompt });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: allThreadMessages,
      tools: tools,
    });

    if (response?.choices[0]?.message?.tool_calls?.[0]?.function) {
      const description = JSON.parse(response?.choices[0]?.message?.tool_calls[0]?.function.arguments)
      let s3_link = await createFluxImage(description.description, userId, threadId);
      const modifiedPrompt = createModifiedPrompt(question,s3_link,cleanedPrompt);
      return openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: modifiedPrompt,
      });

    }

  }

  if (mermaid) {
    const tools = [
      {
        type: "function",
        function: {
          name: "isMermaidCalling",
          description: "check if there is any mermaid library call needed work have or not.If user wants to generate or create anything related to graph , flowchart,diagram or anything related to mermaid chart generation then return mermaid : true otherwise return mermaid: false",
          parameters: {
            type: "object",
            properties: {
              isMermaid: { type: "boolean" }
            },
          },
        },
      }
    ];

    let allThreadMessages = [];
    allThreadMessages.push({ "role": "user", "content": question });
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: allThreadMessages,
      tools: tools,
    });

    if (response?.choices[0]?.message?.tool_calls?.[0]?.function) {
      const isMermaidCall = JSON.parse(response?.choices[0]?.message?.tool_calls[0]?.function.arguments)
      const modifiedPrompt= isMermaidCall.isMermaid?`${question}. <mermaid>generate mermaid code only.Do not generate anything else.Do not put any comments or anything else that can probably generate any error during compile. And provide full code within your ability ,do not give any code portion or cut between codes,give full code withing your response limit</mermaid>  `:question
      return openai.beta.threads.messages.create(threadId, {
        role: "user",
        content: modifiedPrompt,
      });
    }

  }

  const restoreFileName = false;

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
export const createOpenAIFileObject = async (openai, file, purpose, assistantInformation = [],fileIdWithExtension=[],fileSearchIds=[]) => {
  try {
    const extension = getFileExtension(file.path);
    const fileType = extension.replace('.', '');
    
    const fileObjectResponse = await openai.files.create({
      file: fs.createReadStream(file.path),
      purpose,
    });
    if (!fileObjectResponse) {
      throw new Error('Failed to create OpenAI file object');
    }
    if (fileObjectResponse) {
      if ("key" in file) {
        assistantInformation?.push({ file_id: fileObjectResponse.id, key: file.key, url: file?.url });

      }
    }
    file.id = fileObjectResponse.id;
    if (codeInterpreterFileTypes.includes(extension)) {
      fileIdWithExtension.push({ 'fileId': file?.id, 'extension': getFileExtension(file.path) });
    }
    if (fileSearchFileTypes.includes(extension)) {
      fileIdWithExtension.push({ 'fileId': file?.id, 'extension': getFileExtension(file.path) });
      fileSearchIds.push(file.id);
    }
    return fileObjectResponse;
  } catch (error) {
    console.error('Error creating OpenAI File Object:', error.message);
    throw new Error(`Failed to create OpenAI File Object for ${file.originalname}`);
  }
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


/**
 * @async
 * @function stopGeneratingResponseByThreadAndRunId
 * @description It will stop generating response for an assistant based on the provided thread and run id
 * @param {string} openai  threadId, runId - To stop the response generation.
 * @throws {Error} Will throw an error if there are issues during the stop generating response API call.
 */

export const stopGeneratingResponseByThreadAndRunId = async (threadId, runId) => {
  const openai = await getOpenAIInstance();
  try {
    const run = await openai.beta.threads.runs.cancel(
      threadId,
      runId
    );
    return run;
  } catch (error) {
    return error.message;
  }
  
};


export const checkAssistantAsPerChatQuestion = async(question,userId,assistantId)=>{
  const restoreFileName = false;
  let modifiedPrompt = '';
  let changedQuestionWithDataContext = '';
  let fileDataContext = [];
  let ids = [];
  let links =[];
  let purifiedQuestion = '';
  const {WorkBoardUpdateComment,appName,fileIdOrUrl} = await findAppName(question);
  if((appName !== 'null'|| appName !== null)){
    if(appName === 'WorkBoard'){
      ids  = extractWorkBoardIdFromQuestion(question);
      if(WorkBoardUpdateComment !=='null' && WorkBoardUpdateComment !== null){
        const addComment = await addCommentInWorkBoardAI(userId,ids[0],WorkBoardUpdateComment);
      }
      if(ids?.length > 0){
        changedQuestionWithDataContext = replaceWorkBoardLinks(question);
        purifiedQuestion = changedQuestionWithDataContext;
        const getInfo = await getUserBasedWorkBoardActivityService(userId,ids[0]);
        modifiedPrompt = `Based on the following documents, answer the question: ${changedQuestionWithDataContext}  ,ignore if there is any 'ENCODED_LINK' found in the question and do not try to access ENCODED_LINK. \n\nDocuments:\n${JSON.stringify(getInfo.data)}`;
      }
    }else if(appName === 'GoogleDrive'){
      links = extractAllGoogleDriveLinks(question);
      if(links?.length > 0){
        const fileIds = links?.map(link => extractFileOrFolderId(link));
        const { fileName, mimeType,fileSize } = await getFileMetadata(fileIds[0],userId);
        if(fileName !== '' && mimeType !== '' && fileSize !== 0){
          if(fileSize < 5000000){
            fileDataContext = await downloadFilesFromGoogleDriveLink(links,userId);
          }
          changedQuestionWithDataContext = replaceGoogleDriveLinks(question);
          purifiedQuestion = changedQuestionWithDataContext;
          modifiedPrompt = fileDataContext.length > 0?`Based on the following documents, answer the question: ${changedQuestionWithDataContext},ignore if there is any 'ENCODED_LINK' found in the question and do not try to access ENCODED_LINK.\n\nDocuments:\n${fileDataContext}`: "show this message only 'File Size Exceeds 5MB,please download it and upload for great experience'";
        }else{
          modifiedPrompt = "Write this message only 'Please Connect Your Apps First'";
          purifiedQuestion = modifiedPrompt;

        }
      }

    }
  }
  if(purifiedQuestion === ''){
    purifiedQuestion = question;
  }
  let isKnowledgeBaseExists = null;
  if(fileDataContext?.length ===0 && ids?.length ===0 && links?.length ===0){

  }

  isKnowledgeBaseExists = await checkKnowledgeBasedAssistants(assistantId,restoreFileName);

  return {modifiedPrompt,changedQuestionWithDataContext,fileDataContext,ids,links,purifiedQuestion,isKnowledgeBaseExists};

};

export const getFileExtension = (filePath) =>{
  return path.extname(filePath) // Removes the leading dot
}

export const createBatchFileInOpenai = async (openai,fileId) => {
 return await openai.batches.create({
  input_file_id: fileId,
  endpoint: "/v1/chat/completions",
  completion_window: "24h"
});
}
export const getOpenaiBatchProgressStatus = async (openai, batchId) => {
  try {
    const batch = await openai.batches.retrieve(batchId);
    console.log("Batch status response:", batch);
    return batch;
  } catch (error) {
    console.error("Error retrieving OpenAI batch progress status:", error.message);
    // throw new Error(`Failed to retrieve OpenAI batch progress status for batch ID: ${batchId}`);
  return {
    status: "error",
    message: error.message,
    request_counts: {
      completed: 0,
      total: 0
      },
      in_progress_at: null,
      completed_at: null,
      failed_at: null,
      errors: []
    };  
  }
};
export const getOpenaiBatchFile = async (openai, batchId) => {
  try {
    const batchFile = await openai.batches.files.retrieve(batchId);
    return batchFile;
  } catch (error) {
    console.error("Error retrieving OpenAI batch file:", error.message);
    throw new Error(`Failed to retrieve OpenAI batch file for batch ID: ${batchId}`);
  }
};
export const getBatchOutputFile = async (openai, batchId, fileId) => {
  try {
    const fileResponse = await openai.files.content(fileId);
    const fileContents = await fileResponse.text();
    // const batchOutputFile = await openai.batches.files.retrieve(batchId, "output");
    return fileContents;
  } catch (error) {
    console.error("Error retrieving OpenAI batch output file:", error.message);
    throw new Error(`Failed to retrieve OpenAI batch output file for batch ID: ${batchId}`);
  }
};

/**
 * Cron job to monitor OpenAI batch job status and fetch output file when completed.
 * @param {Object} openai - The OpenAI instance.
 * @param {String} batchId - The batch job ID to monitor.
 * @param {Function} onComplete - Callback to handle output file when batch is completed.
 */
export const startBatchOutputMonitorCron = async (openai, batchId, onComplete) => {
  // Run every 2 minutes (customize as needed)
  const ai = await AISuggestion.findOne({ batchId: batchId });
  console.log("Cron time for batch job:", ai);
  const task = cron.schedule("*/2 * * * *", async () => {
    try {
      const status = await getOpenaiBatchProgressStatus(openai, batchId);
      console.log(`Batch ${batchId} status:`, status.status);
      
      // Update AISuggestionBatchProcessing with current batch information
      const updateData = {
        status: status.status,
        processedUsers: status.request_counts?.completed || 0,
        totalUsers: status.request_counts?.total || 0,
      };

      // Add timestamps based on status
      if (status.status === "in_progress" && status.in_progress_at) {
        updateData.startTime = new Date(status.in_progress_at * 1000);
      }
      else if (status.status === "completed" && status.completed_at) {
        updateData.endTime = new Date(status.completed_at * 1000);
      }
      else if (status.status === "failed" && status.failed_at) {
        updateData.endTime = new Date(status.failed_at * 1000);
        if (status.errors && status.errors.length > 0) {
          updateData.error = status.errors;
        }
      }

      // Update the batch processing record
      await AISuggestionBatchProcessing.findOneAndUpdate(
        { batchId },
        { $set: updateData },
        { upsert: false } // Don't create if doesn't exist
      );
      
      console.log(`Updated batch ${batchId} progress: ${updateData.processedUsers}/${updateData.totalUsers} users processed`);
      
      if (status.status === "completed") {
        const fileId = status.output_file_id;
        const outputFile = await getBatchOutputFile(openai, batchId, fileId);
        console.log(`Batch ${batchId} output file retrieved. with ${outputFile.length} lines. and file id is ${fileId}`);
        if (onComplete) onComplete(outputFile);
        task.stop(); // Stop cron after completion
      } else if (status.status === "failed" || status.status === "cancelled" || status.status === "expired") {
        console.log(`Batch ${batchId} finished with status: ${status.status}`);
        task.stop(); // Stop cron for terminal states
      }
    } catch (err) {
      console.error(`Error monitoring batch ${batchId}:`, err.message);
    }
  });
  return task;
};

/**
 * Cron job to run analyzePromptsBatchAPI based on cronTime from AISuggestion table
 * @param {Function} analyzePromptsBatchAPIFunction - The analyzePromptsBatchAPI function to execute
 */
export const startAnalyzePromptsBatchCron = async (analyzePromptsBatchAPIFunction) => {
  try {
    // Get cron time from AISuggestion table
    const aiSettings = await AISuggestion.findOne({});
    if (!aiSettings) {
      console.log("No AI Suggestion settings found, skipping batch analysis cron setup");
      return null;
    }

    const cronTime = aiSettings.cronTime || "0 0 * * *"; // Default to daily at midnight
    const isEnabled = aiSettings.enableAISuggestion !== false; // Default to enabled
    if (!isEnabled) {
      console.log("AI Suggestion is disabled, skipping batch analysis cron setup");
      return null;
    }

    console.log(`Setting up analyzePromptsBatchAPI cron with schedule: ${cronTime}`);
    console.log(" cronTime type: ", typeof cronTime);
    let task = null;
    try {
      task = cron.schedule(cronTime, async () => {
        try {
          console.log("Starting scheduled batch analysis of prompts...");
          // Check if AI Suggestion is still enabled before running
          const currentSettings = await AISuggestion.findOne({});
          if (!currentSettings || currentSettings.enableAISuggestion === false) {
            console.log("AI Suggestion is disabled, skipping this batch run");
            return;
          }

          // --- Check if lastBatchRunId exists and is running ---
          if (currentSettings.lastBatchRunId) {
            try {
              const openAiKey = await getConfigKeyValue("openaikey");
              const openai = getOpenAIInstance(openAiKey);
              const batchInfo = await getOpenaiBatchProgressStatus(openai, currentSettings.lastBatchRunId);
              if (batchInfo && (batchInfo.status === 'in_progress' || batchInfo.status === 'validating' || batchInfo.status === 'queued')) {
                console.log(`A batch is already running on OpenAI (batchId: ${currentSettings.lastBatchRunId}, status: ${batchInfo.status}). Skipping new batch start.`);
                return;
              }
            } catch (batchCheckErr) {
              console.error("Error checking OpenAI batch status:", batchCheckErr);
              // If error checking batch, skip starting new batch to be safe
              return;
            }
          }

          // Create a mock request/response object for the function
          const mockReq = {};
          const mockRes = {
            status: (code) => ({
              json: (data) => {
                console.log(`Batch analysis completed with status ${code}:`, data);
                return { status: code, data };
              }
            }),
            json: (data) => {
              console.log("Batch analysis completed successfully:", data);
              return data;
            }
          };

          // Execute the batch analysis function
          await analyzePromptsBatchAPIFunction(mockReq, mockRes);

        } catch (error) {
          console.error("Error in scheduled batch analysis:", error);
        }
      }, {
        scheduled: true,
        timezone: "UTC" // You can change this to your preferred timezone
      });
      console.log("Batch analysis cron job started successfully");
    } catch (error) {
      console.error("Error starting batch analysis cron job:", error);
      return null;
    }

    return task;
  } catch (error) {
    console.error("Error setting up batch analysis cron:", error);
    return null;
  }
};


