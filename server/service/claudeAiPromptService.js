import { getClaudeAIInstance } from '../config/claudeAI.js';
import { ClaudeConfig } from '../constants/enums.js';

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
 * @function getClaudeAIResponsePromptService
 * @description Creates a stream of responses from claude based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, temperature, gptModel
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {number} payload.temperature - Controls randomness in the response generation.
 * @param {string} payload.Model - The specific claude model to use for generating responses.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */

export const getClaudeAIResponsePromptService = async (payload) => {
	const { prompt, chatLog, claudeModel, temperature } = payload;

	try {
		const anthropic = await getClaudeAIInstance();
		const contextArray = generatePreviousChatContentForClaude(
			chatLog || []
		);
		const stream = anthropic.messages.stream({
			messages: [...contextArray, { content: prompt, role: 'user' }],
			model: claudeModel,
			stream: true,
			max_tokens: ClaudeConfig.DEFAULT_MAX_TOKEN,
			temperature: temperature,
		});

		return stream;
	} catch (error) {
		console.error(error);
	}
};
