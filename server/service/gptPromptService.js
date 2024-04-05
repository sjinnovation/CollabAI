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
 * Generates a streaming response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAiStreamResponse
 * @description Creates a stream of responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, temperature, gptModel
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {number} payload.temperature - Controls randomness in the response generation.
 * @param {string} payload.gptModel - The specific GPT model to use for generating responses.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAiStreamResponse = async (payload) => {
	const { prompt, chatLog, temperature, gptModel } = payload;

	const contextArray = generatePrevChatHistoryContext(chatLog || []);

	const openai = await getOpenAIInstance();

	const stream = await openai.chat.completions.create(
		{
			model: gptModel,
			messages: [...contextArray, { content: prompt, role: 'user' }],
			stream: true,
			temperature,
		},
		{ responseType: 'stream' }
	);

	return stream;
};

/**
 * Generates a streaming response from an OpenAI GPT model using a provided payload.
 *
 * @async
 * @function generateOpenAIResponse
 * @description Creates a updated responses from OpenAI based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog
 * @param {string} payload.userPrompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateOpenAIResponse = async (payload) => {
	const { userPrompt, chatLog } = payload;
	let temperature, gptModel, openAi;

	const contextArray = generatePrevChatHistoryContext(chatLog || []);

	openAi = await getOpenAIInstance();
	temperature = parseFloat(await getOpenAiConfig('temperature'));
	gptModel = await getOpenAiConfig('model');

	const response = await openAi.chat.completions.create({
		model: gptModel,
		messages: [...contextArray, { content: userPrompt, role: 'user' }],
		temperature,
	});

	return {
		response: response.choices[0].message.content,
		inputToken: response.usage.prompt_tokens,
		outputToken: response.usage.completion_tokens,
		totalToken: response.usage.total_tokens,
	};
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
 * Creates a single prompt record in the database using the provided payload.
 *
 * @async
 * @function updatePrompt
 * @param {object} payload - An object containing the properties to update the existing prompt record.
 * @returns {Promise<object>} A promise that resolves with the created prompt document.
 * @throws {Error} Will throw an error if prompt creation fails.
 */
export const updatePrompt = async (id, payload) => {
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
