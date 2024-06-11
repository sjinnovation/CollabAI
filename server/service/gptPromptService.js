import { getOpenAIInstance } from '../config/openAI.js';
import PromptModel from '../models/promptModel.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';

/**
 * Generates a context array of previous chat history.
 *
 * @param {Array} chatHistory - The chat history array.
 * @returns {Array} - Returns an array of previous chat history with a maximum of 6 chat items.
 */
export const generatePrevChatHistoryContext = (chatHistory) => {
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
 * Creates a single prompt record in the database using the provided payload.
 *
 * @async
 * @function createSinglePrompt
 * @param {object} payload - An object containing the properties to instantiate a new prompt record.
 * @returns {Promise<object>} A promise that resolves with the created prompt document.
 * @throws {Error} Will throw an error if prompt creation fails.
 */
export const createSinglePrompt = async (payload) => {
	const prompt = await PromptModel.create({
		...payload,
	});

	return prompt;
};

/**
 * Update the prompt record in the database using the provided payload.
 *
 * @async
 * @function updatePromptByID
 * @param {object} payload - An object containing the properties to update the existing prompt record.
 * @returns {Promise<object>} A promise that resolves with the created prompt document.
 * @throws {Error} Will throw an error if prompt creation fails.
 */
export const updatePromptByID = async (id, payload) => {
	try {
		const prompt = await PromptModel.findByIdAndUpdate(id, payload, {
			new: true,
		});
		if (!prompt) {
			throw new Error(`Prompt with id ${id} not found`);
		}
		return prompt;
	} catch (error) {
		throw error;
	}
};
