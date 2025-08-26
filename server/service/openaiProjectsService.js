
import { getOpenAIInstance } from '../config/openAI.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';
import { getUserPreferencesById } from '../utils/getUserPrefenceConfigHelper.js';
import { openAiConfig } from "../constants/enums.js";
import { getFileInfoWithThreadIdAndMsgId, getFolderChatByIdService } from './folderChatService.js';

/**
 * Generates a context array of previous chat history.
 *
 * @param {Array} chatHistory - The chat history array.
 * @returns {Array} - Returns an array of previous chat history with a maximum of 6 chat items.
 */
export const generatePrevChatHistoryContextForProjects = (
  chatHistory,
  userPreferences = "",
  desiredAiResponse = ""
) => {
  const maxChatHistoryCount = 6;
  const contextArray = [];
  let chatHistoryCount = 0;

  if (userPreferences.length > 0 && desiredAiResponse.length > 0) {
    contextArray.push({
      role: "system",
      content: `User Details: ${userPreferences}. Desired AI response: ${desiredAiResponse}.`,
    });
  }

  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const chatItem = chatHistory[i];

    if (chatItem.botMessage && chatHistoryCount < maxChatHistoryCount) {
      contextArray.unshift({
        role: "assistant",
        content: chatItem.botMessage,
      });
      contextArray.unshift({
        role: "user",
        content: chatItem.chatPrompt,
      });
      chatHistoryCount++;
    }

    if (chatHistoryCount === maxChatHistoryCount) {
      break;
    }
  }

  return contextArray;
};

/**
 * Generates a streaming response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAIStreamResponseOfProjects
 * @description Creates a stream of responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, socket
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Object} payload.socket - will get user preference by using this.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIStreamResponseOfProjects = async (payload) => {
  const { prompt, chatLog, userPreferences = "", desiredAiResponse = "", userId, folderId,msg_id,threadId ,imageLink = []} = payload;
  const openai = await getOpenAIInstance();
  const temperature = parseFloat(await getOpenAiConfig('temperature'));
  const openaiMaxToken = parseFloat(await getOpenAiConfig('openaiMaxToken'));
  const openaiTopP = parseFloat(await getOpenAiConfig('openaiTopP'));
  const openaiFrequency = parseFloat(await getOpenAiConfig('openaiFrequency'));
  const openaiPresence = parseFloat(await getOpenAiConfig('openaiPresence'));
  const gptModel = await getOpenAiConfig('model');
  let contextArray = [];
  let finalTemperature = 1;
  let finalTop_p = 1;
  let finalFrequencyPenalty = 0;
  let finalPresencePenalty = 0;
  const userDefinedAdvancedParameters = await getUserPreferencesById(userId);

  if (gptModel === "o1-preview" || gptModel === "o1-mini") {
    const userPreferencesString = "";
    const desiredAiResponseString = ""
    contextArray = generatePrevChatHistoryContextForProjects(chatLog || [], userPreferencesString, desiredAiResponseString);
  } else {
    contextArray = generatePrevChatHistoryContextForProjects(chatLog || [], userPreferences, desiredAiResponse);
    finalTemperature = (userDefinedAdvancedParameters?.openAiTemperature
      ? userDefinedAdvancedParameters.openAiTemperature
      : (temperature ? temperature : openAiConfig.DEFAULT_TEMPERATURE));
    finalTop_p = (userDefinedAdvancedParameters?.openAiTopP
      ? userDefinedAdvancedParameters.openAiTopP
      : (openaiTopP ? openaiTopP : openAiConfig.DEFAULT_TOP_P));
    finalFrequencyPenalty = (userDefinedAdvancedParameters?.openAiFrequency_penalty
      ? userDefinedAdvancedParameters.openAiFrequency_penalty
      : (openaiFrequency ? openaiFrequency : openAiConfig.DEFAULT_FREQUENCY_PENALTY));
    finalPresencePenalty = (userDefinedAdvancedParameters?.openAiPresence_penalty
      ? userDefinedAdvancedParameters.openAiPresence_penalty
      : (openaiPresence ? openaiPresence : openAiConfig.DEFAULT_PRESENCE_PENALTY));
  }

  const { 
    msgAndThreadBasedFiles, 
    threadBasedFiles,
    filesOfTheThread, 
    filesOfThreadMsg,
    allFileInfo,
    base64Images,
    threadLevelImages
  } = await getFileInfoWithThreadIdAndMsgId(folderId, msg_id, threadId);

  // Initialize arrays for different types of content
  let inputContent = [];

  if ((filesOfThreadMsg && filesOfThreadMsg.length > 0) || (base64Images && base64Images.length > 0) || imageLink.length > 0) {
    if (base64Images && base64Images.length > 0) {
      const imageContents = base64Images.map(imageData => ({
        type: "input_image",
        image_url: imageData.base64Data // This now contains the proper data URL format
      }));
      inputContent.push(...imageContents);
    }
    const fileContents = filesOfThreadMsg.map(fileId => ({
      type: "input_file",
      file_id: fileId
    }));
    inputContent.push(...fileContents);


  } else if (threadBasedFiles?.threadFilesInfo?.length > 0) {
    // Process thread-level files
    threadBasedFiles.threadFilesInfo.forEach(file => {
      if (file.threadId === threadId) {
        if (file.isImage && file.base64Data) {
          // Handle thread-level images
          inputContent.push({
            type: "input_image",
            image_url: file.base64Data
          });
        } else if (file.fileId) {
          // Handle regular files
          inputContent.push({
            type: "input_file",
            file_id: file.fileId
          });
        }
      }
    });
  }

  // Add the text prompt
  inputContent.push({
    type: "input_text",
    text: prompt
  });
  let input = [
    ...contextArray,
    {
      role: "user",
      content: inputContent
    }
  ];

  // Handle tools setup
  let tools = [];
  const folderInfo = await getFolderChatByIdService(folderId);
  if (folderInfo?.fileInfo?.length > 0) {
    const fileSearchTool = {
      type: "file_search",
      vector_store_ids: [folderInfo?.fileInfo?.[0]?.vectorStoreId]
    };
    tools.push(fileSearchTool);
  }

  if (folderInfo?.webSearch) {
    tools.push({
      type: "web_search_preview"
    });
  }
//"gpt-4.1-mini"
console.log("gptModel : ",gptModel);
console.log("folderInfo?.model : ",folderInfo?.model);

const folderModel = folderInfo?.model
  const stream = await openai.responses.create(
    {
      model: folderModel || "gpt-4.1", 
      stream: true,
      instructions: folderInfo?.personaId?.description,
      input: input,
      tools: tools
    },
  );

  return { stream, model: gptModel };

};

/**
 * Generates a http response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAIHttpResponse
 * @description Creates a updated responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, userId
 * @param {string} payload.modifiedPrompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Array} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIHttpResponse = async (payload) => {
	const { modifiedPrompt, chatLog ,userId } = payload;
	let temperature, gptModel, openAi;

	const contextArray = generatePrevChatHistoryContext(chatLog || []);

	openAi = await getOpenAIInstance();
	temperature = parseFloat(await getOpenAiConfig('temperature'));
	gptModel = await getOpenAiConfig('model');
    const userPreferences = await getUserPreferencesById(userId);

	const response = await openAi.chat.completions.create({
		model: gptModel,
		messages: [...contextArray, { content: modifiedPrompt, role: 'user' }],
        temperature: userPreferences?.openAiTemperature ? userPreferences?.openAiTemperature : temperature,
        max_tokens:  userPreferences?.openAiMax_tokens ? userPreferences?.openAiMax_tokens : openAiConfig.DEFAULT_MAX_TOKEN ,
        top_p: userPreferences?.openAiTopP ? userPreferences?.openAiTopP : openAiConfig.DEFAULT_TOP_P,
        frequency_penalty: userPreferences?.openAiFrequency_penalty ? userPreferences?.openAiFrequency_penalty : openAiConfig.DEFAULT_FREQUENCY_PENALTY,
        presence_penalty: userPreferences?.openAiPresence_penalty ?userPreferences?.openAiPresence_penalty : openAiConfig.DEFAULT_PRESENCE_PENALTY
	});

	return {
		response: response.choices[0].message.content,
		inputToken: response.usage.prompt_tokens,
		outputToken: response.usage.completion_tokens,
		totalToken: response.usage.total_tokens,
        modelUsed :gptModel
	};
};

