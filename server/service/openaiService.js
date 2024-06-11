
import { getOpenAIInstance } from '../config/openAI.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';
import { getUserPreferencesById } from '../utils/getUserPrefenceConfigHelper.js';
import { openAiConfig } from "../constants/enums.js";

/**
 * Generates a context array of previous chat history.
 *
 * @param {Array} chatHistory - The chat history array.
 * @returns {Array} - Returns an array of previous chat history with a maximum of 6 chat items.
 */
export const generatePrevChatHistoryContext = (
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
 * @function generateOpenAiStreamResponse
 * @description Creates a stream of responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, socket
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Object} payload.socket - will get user preference by using this.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIStreamResponse = async (payload) => {
	const { prompt, chatLog, userPreferences = "", desiredAiResponse = "", userId } = payload;

	const contextArray = generatePrevChatHistoryContext(chatLog || [], userPreferences, desiredAiResponse);
	const openai = await getOpenAIInstance();
  	const temperature = parseFloat(await getOpenAiConfig('temperature'));
  	const gptModel = await getOpenAiConfig('model');

    const userDefinedAdvancedParameters = await getUserPreferencesById(userId);

	const stream = await openai.chat.completions.create(
		{
			model: gptModel,
			messages: [...contextArray, { content: prompt, role: 'user' }],
			stream: true,
			temperature: userDefinedAdvancedParameters?.openAiTemperature ? userDefinedAdvancedParameters?.openAiTemperature : temperature,
            max_tokens:  userDefinedAdvancedParameters?.openAiMax_tokens ? userDefinedAdvancedParameters?.openAiMax_tokens : openAiConfig.DEFAULT_MAX_TOKEN ,
            top_p: userDefinedAdvancedParameters?.openAiTopP ? userDefinedAdvancedParameters?.openAiTopP : openAiConfig.DEFAULT_TOP_P,
            frequency_penalty: userDefinedAdvancedParameters?.openAiFrequency_penalty ? userDefinedAdvancedParameters?.openAiFrequency_penalty : openAiConfig.DEFAULT_FREQUENCY_PENALTY,
            presence_penalty: userDefinedAdvancedParameters?.openAiPresence_penalty ?userDefinedAdvancedParameters?.openAiPresence_penalty : openAiConfig.DEFAULT_PRESENCE_PENALTY
		},
		{ responseType: 'stream' }
	);

	return {stream,model : gptModel};
};

/**
 * Generates a http response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAIHttpResponse
 * @description Creates a updated responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, userId
 * @param {string} payload.userPrompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Array} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIHttpResponse = async (payload) => {
	const { userPrompt, chatLog ,userId } = payload;
	let temperature, gptModel, openAi;

	const contextArray = generatePrevChatHistoryContext(chatLog || []);

	openAi = await getOpenAIInstance();
	temperature = parseFloat(await getOpenAiConfig('temperature'));
	gptModel = await getOpenAiConfig('model');
    const userPreferences = await getUserPreferencesById(userId);

	const response = await openAi.chat.completions.create({
		model: gptModel,
		messages: [...contextArray, { content: userPrompt, role: 'user' }],
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

