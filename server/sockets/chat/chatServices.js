import getOpenAiConfig from '../../utils/openAiConfigHelper.js';
import * as gptPromptServices from '../../service/gptPromptService.js';
import * as geminiPromptService from '../../service/geminiAiPromptService.js';
import * as claudePromptService from '../../service/claudeAiPromptService.js';

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
	const { prompt, chatLog } = payload;

	// getting configs
	const temperature = parseFloat(await getOpenAiConfig('temperature'));
	const gptModel = await getOpenAiConfig('model');

	const stream = await gptPromptServices.generateOpenAiStreamResponse({
		prompt: prompt,
		chatLog,
		temperature,
		gptModel,
	});

	return { stream, model: gptModel };
};

export const generateClaudeAiStreamResponse = async (payload) => {
	const { prompt, chatLog } = payload;

	// getting configs
	const temperature = parseFloat(await getOpenAiConfig('claudeTemperature'));
	const claudeModel = await getOpenAiConfig('claudeModel');

	const stream = await claudePromptService.getClaudeAIResponsePromptService({
		prompt: prompt,
		chatLog,
		claudeModel,
		temperature,
	});

	return { stream, model: claudeModel };
};

/**
 *
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
export const generateGeminiAIStreamResponse = async (payload) => {
	const { prompt, chatLog } = payload;

	const temperature = parseFloat(await getOpenAiConfig('geminiTemperature'));
	const model = await getOpenAiConfig('geminiModel');

	const stream = await geminiPromptService.getGeminiAIPromptService({
		prompt,
		chatLog,
		model,
		temperature,
	});

	return { stream, model };
};

/**
 * Sends a Gemini AI stream response to a socket.
 *
 * @async
 * @function sendGeminiAiStreamResponse
 * @param {object} socket - The socket to which the response will be sent.
 * @param {object} stream - The stream of responses from Gemini AI.
 * @param {string} gptResponse - The accumulated response from Gemini AI.
 * @param {object} finalResponseObject - The final response object to be emitted to the socket.
 * @param {number} tokenCount - The number of tokens in the response.
 * @returns {Promise<object>} A promise that resolves with an object indicating completion and token count.
 * @throws {Error} Will throw an error if there's an issue sending the response.
 */

export const sendGeminiAiStreamResponse = async (
	socket,
	stream,
	gptResponse,
	finalResponseObject,
	tokenCount
) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				// eslint-disable-next-line no-restricted-syntax
				for await (const part of stream) {
					let finishReason;
					finishReason = part.candidates[0]?.finishReason;
					const chunkText = part.text();
					gptResponse += chunkText;
					tokenCount += chunkText.length;

					socket.emit('chat:created', {
						...finalResponseObject,
						promptResponse: gptResponse,
						isCompleted: finishReason === 'STOP',
					});
				}
				resolve({
					completed: true,
					tokenCount: tokenCount,
					gptResponse: gptResponse,
				});
			} catch (error) {
				reject(error);
			}
		})();
	});
};

/**
 * Sends a streaming response from an OpenAI GPT model over a socket connection.
 *
 * @async
 * @function sendOpenAiStreamResponse
 * @param {Socket} socket - The socket connection over which to send the response.
 * @param {Stream} stream - The streaming response from the OpenAI model.
 * @param {string} gptResponse - The response generated by the OpenAI model.
 * @param {object} finalResponseObject - The final response object to be sent over the socket.
 * @param {number} tokenCount - The number of tokens in the response.
 * @returns {Promise<object>} A promise that resolves when the streaming response is complete.
 * @throws {Error} Will throw an error if there is an issue with sending the response.
 */

export const sendOpenAiStreamResponse = async (
	socket,
	stream,
	gptResponse,
	finalResponseObject,
	tokenCount
) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				// eslint-disable-next-line no-restricted-syntax
				for await (const part of stream) {
					let finishReason;
					finishReason = part.choices[0]?.finish_reason;
					gptResponse += part.choices[0]?.delta?.content || '';

					tokenCount++;
					socket.emit('chat:created', {
						...finalResponseObject,
						promptResponse: gptResponse,
						isCompleted:
							finishReason === 'stop' ||
							finishReason === 'length',
					});

					if (finishReason === 'stop' || finishReason === 'length') {
						resolve({
							completed: true,
							tokenCount: tokenCount,
							gptResponse: gptResponse,
						});
						return;
					}
				}
			} catch (error) {
				reject(error);
			}
		})();
	});
};

/**
 * Sends Claude AI streaming response to the client via socket.
 *
 * @async
 * @function sendClaudeAiStreamResponse
 * @param {object} socket - The socket object to emit responses to the client.
 * @param {object} stream - The streaming response object from Claude AI.
 * @param {string} gptResponse - The accumulated response from GPT model.
 * @param {object} finalResponseObject - The final response object to emit to the client.
 * @param {number} tokenCount - The count of tokens in the response.
 * @returns {Promise<object>} A promise that resolves when streaming is completed.
 * @throws {Error} Will throw an error if there is an issue with streaming.
 */

export const sendClaudeAiStreamResponse = async (
	socket,
	stream,
	gptResponse,
	finalResponseObject,
	tokenCount
) => {
	return new Promise((resolve, reject) => {
		(async () => {
			try {
				stream.on('text', (response) => {
					tokenCount += response.length;
					gptResponse += response;
					socket.emit('chat:created', {
						...finalResponseObject,
						promptResponse: gptResponse,
						isCompleted: false,
					});
				});

				stream.on('end', () => {
					// Once the stream ends, emit the final message with isCompleted: true
					socket.emit('chat:created', {
						...finalResponseObject,
						promptResponse: gptResponse,
						isCompleted: true,
					});
					// If streaming ends, resolve with completed true
					resolve({
						completed: true,
						gptResponse,
						tokenCount,
					});
				});
			} catch (error) {
				reject(error);
			}
		})();
	});
};
