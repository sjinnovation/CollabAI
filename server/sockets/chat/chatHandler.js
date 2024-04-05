// /sockets/chat/chatHandler.js

// libraries
import moment from 'moment';
import OpenAI from 'openai';

// services
import * as chatService from './chatServices.js';
import * as promptServices from '../../service/gptPromptService.js';

// utils
import { PromptMessages } from '../../constants/enums.js';
import { handleOpenAIError } from '../../utils/openAIErrors.js';

/**
 * Creates a new chat using OpenAI's GPT-3 model and emits the response to the client.
 *
 * @param {Object} payload - The payload object containing chat details.
 * @param {string} payload.threadId - The ID of the chat thread.
 * @param {string} payload.userPrompt - The user's chat input.
 * @param {Array} payload.chatLog - The chat history.
 * @param {Array} payload.tags - IDs of tags associated with the chat.
 * @param {Array} payload.botProvider - Name of the AI model used.
 * @throws {Error} Throws an error if there's an issue in chat creation or OpenAI API.
 */
export const createChat = async function (payload) {
	const socket = this;

	try {
		const { threadId, userPrompt, chatLog, tags, botProvider } = payload;

		// Constructing the final response object to emit to the client
		const finalResponseObject = {
			success: true,
			promptResponse: '',
			message: PromptMessages.CHAT_CREATION_SUCCESS,
			...payload,
		};

		let stream,
			tokenCount = 0,
			gptResponse = '',
			model,
			isDone;

		// Choosing the appropriate AI service based on the bot provider
		switch (botProvider) {
			case 'openai':
				// Generating OpenAI stream response
				({ stream, model } =
					await chatService.generateOpenAiStreamResponse({
						prompt: userPrompt,
						chatLog,
					}));
				// Sending OpenAI stream response
				isDone = await chatService.sendOpenAiStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount
				);
				break;

			case 'gemini':
				// Generating Gemini AI stream response
				({ stream, model } =
					await chatService.generateGeminiAIStreamResponse({
						prompt: userPrompt,
						chatLog,
					}));
				// Sending Gemini AI stream response
				isDone = await chatService.sendGeminiAiStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount
				);
				break;

			case 'claude':
				// Generating Claude AI stream response
				({ stream, model } =
					await chatService.generateClaudeAiStreamResponse({
						prompt: userPrompt,
						chatLog,
					}));
				// Sending Claude AI stream response
				isDone = await chatService.sendClaudeAiStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount
				);
		}

		// Handling chat completion and saving the prompt to the database
		if (isDone.completed) {
			const newPrompt = {
				tokenused: isDone.tokenCount,
				botProvider: botProvider,
				threadid: threadId,
				userid: socket.user.userId,
				description: userPrompt,
				promptresponse: isDone.gptResponse,
				promptdate: moment(new Date()).format('YYYY-MM-DD'),
				createdAt: new Date(),
				modelused: model,
				tags,
			};
			await promptServices.createSinglePrompt(newPrompt);
			console.log('Chat creation completed.');
		}
	} catch (error) {
		console.error('Error in createChat handler:', error);
		let message = PromptMessages.CHAT_CREATION_ERROR;

		// Specific error handling for OpenAI errors
		if (error instanceof OpenAI.APIError) {
			message = handleOpenAIError(error).message;
		}

		// Emitting error to the client
		socket.emit('chat:created', {
			success: false,
			message: message,
		});
	}
};
