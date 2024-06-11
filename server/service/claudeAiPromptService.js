import { getClaudeAIInstance } from '../config/claudeAI.js';
import { ClaudeConfig } from '../constants/enums.js';
import { getUserPreferencesById }  from '../utils/getUserPrefenceConfigHelper.js'
import getOpenAiConfig from '../utils/openAiConfigHelper.js';

/**
 * Generates a context array of previous chat history.
 *
 * @param {Array} chatHistory - The chat history array.
 * @returns {Array} - Returns an array of previous chat history with a maximum of 6 chat items.
 */

export const generatePreviousChatContentForClaude = (chatHistory) => {
	const maxChatHistoryCount = 6;
	const contextArray = [];
	let chatHistoryCount = 0;

	for (let i = chatHistory.length - 1; i >= 0; i--) {
		const chatItem = chatHistory[i];

		if (chatItem.botMessage && chatHistoryCount < maxChatHistoryCount) {
			contextArray.unshift({
				role: 'assistant',
				content: chatItem.botMessage,
			});
			contextArray.unshift({
				role: 'user',
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
 * Generates a streaming response from an Claude  model using a provided payload.
 *
 * @async
 * @function generateClaudeAIStreamResponse
 * @description Creates a stream of responses from claude based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, socket
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Object} payload.socket - will get user preference by using this.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */

export const generateClaudeAIStreamResponse = async (payload) => {
	const { prompt, chatLog ,userId } = payload;

	try {
		const anthropic = await getClaudeAIInstance();
		const contextArray = generatePreviousChatContentForClaude(
			chatLog || []
		);
		const temperature = parseFloat(await getOpenAiConfig('claudeTemperature'));
		const claudeModel = await getOpenAiConfig('claudeModel');
       
        const userPreferences = await getUserPreferencesById(userId);

		const stream = anthropic.messages.stream({
			messages: [...contextArray, { content: prompt, role: 'user' }],
			model: claudeModel,
			stream: true,
			max_tokens: userPreferences?.ClaudeAIMaxToken ? userPreferences?.ClaudeAIMaxToken : ClaudeConfig.DEFAULT_MAX_TOKEN,
			temperature: userPreferences?.claudeAiTemperature ? userPreferences?.claudeAiTemperature : temperature,
		});

		return { stream, model: claudeModel };
	} catch (error) {
		console.error(error);
	}
};

/**
 * Generates a streaming response from an Claude  model using a provided payload.
 *
 * @async
 * @function generateClaudeHttpResponse
 * @description Creates a stream of responses from claude based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the userPrompt and userId
 * @param {string} payload.userPrompt - The user's input to the model.
 * @param {string} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */

export const generateClaudeHttpResponse = async (payload) => {
	const { userPrompt, userId } = payload;

	try {
		const anthropic = await getClaudeAIInstance();
		const temperature = parseFloat(await getOpenAiConfig('claudeTemperature'));
		const claudeModel = await getOpenAiConfig('claudeModel');
        const userPreferences = await getUserPreferencesById(userId);

		const message = await anthropic.messages.create({
			model:claudeModel,
            max_tokens: userPreferences?.ClaudeAIMaxToken ? userPreferences?.ClaudeAIMaxToken : ClaudeConfig.DEFAULT_MAX_TOKEN,
			temperature: userPreferences?.claudeAiTemperature ? userPreferences?.claudeAiTemperature : temperature,
			stream: false,
			system:"Respond in short and clear sentences.",
			messages: [{ content: userPrompt, role: 'user' }],
		});
		
		return{
             response : message.content[0].text,
             modelUsed : claudeModel 
            };
	} catch (error) {
		console.error(error);
	}
};

