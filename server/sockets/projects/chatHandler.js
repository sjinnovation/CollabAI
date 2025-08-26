// /sockets/chat/chatHandler.js

// libraries
import moment from "moment";
import OpenAI from "openai";

// services
import * as chatService from "./chatServices.js";
import * as promptServices from "../../service/gptPromptService.js";
import * as deepseekService from '../../service/deepseekAIPromptService.js';

// utils
import TrackUsage from "../../models/trackUsageModel.js";

//service
import { getUserCustomization, updateMaxUserTokens ,checkMaxUserTokensExhausted } from "../../service/userService.js";

// utils
import { PromptMessages } from "../../constants/enums.js";
import { handleOpenAIError } from "../../utils/openAIErrors.js";
import { generateOpenAIStreamResponse } from "../../service/openaiService.js";
import { generateGeminiAIStreamResponse } from "../../service/geminiAiPromptService.js";
import { generateClaudeAIStreamResponse } from "../../service/claudeAiPromptService.js";
import { calculateTokenAndCost } from "../../service/trackUsageService.js";
import { generateOpenAIStreamResponseOfProjects } from "../../service/openaiProjectsService.js";
import { getFileInfoWithThreadIdAndMsgId, getFolderChatByIdService, getFolderChatsByUserId, updateWaitingFileInfo } from "../../service/folderChatService.js";
import { checkImageLinks } from "./imageLinkFinding.js";


 // Object to track ongoing chats
let ongoingChats = {};

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
export const createProjectsChat = async function (payload) {
	const socket = this;
	const socketEvent = 'chat:created';

  const { userPreferences, desiredAiResponse } = await getUserCustomization(socket.user.userId);
  try {
    const { threadId, userPrompt, chatLog, tags, botProvider,folderId=null,msg_id = null,uploadedFiles = [] } = payload;
	console.log("payload : ",payload);

    if (uploadedFiles.length > 0 && folderId) {
		const updateWaitingFile = await updateWaitingFileInfo(uploadedFiles, folderId, threadId, msg_id);
		console.log("updateWaitingFile : ", updateWaitingFile);
	  }
	  const { links : imageLink, isImage } = checkImageLinks(userPrompt);
	  console.log("imageLink : ", imageLink);
	  console.log("isImage : ", isImage);

	let modifiedPrompt =  userPrompt;
    const checkMaxToken = await checkMaxUserTokensExhausted(socket.user.userId);
	console.log("checkMaxToken : ", checkMaxToken);

    // Constructing the final response object to emit to the client
    const finalResponseObject = {
      success: true,
      promptResponse: "",
      message: PromptMessages.CHAT_CREATION_SUCCESS,
      ...payload,
    };

    let stream,
      tokenCount = 0,
      gptResponse = "",
      model,
      isDone;
    const userId = socket?.user?.userId;
	console.log("userId : ", userId);

    let isActive = () => ongoingChats[userId]?.isActive || false;
	console.log("isActive outside: ", isActive());
		// Choosing the appropriate AI service based on the bot provider
		switch (botProvider) {
			case 'openai':
				// Generating OpenAI stream response
				({ stream, model } =
					await generateOpenAIStreamResponseOfProjects({
						prompt:modifiedPrompt, //userPrompt,
						chatLog,
						userPreferences,
						desiredAiResponse,
                        userId,
						folderId,
						msg_id,
						threadId,
						imageLink
					}));
				// Sending OpenAI stream response
				ongoingChats[userId] = { isActive: true };
				isDone = await chatService.sendOpenAIStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount,
					socketEvent,
					isActive
				);
				break;

		}

		// Handling chat completion and saving the prompt to the database
		if (isDone?.completed) {
			const newPrompt = {
				isResponseThread: true,
				folderId : folderId,
				tokenused: isDone.tokenCount,
				botProvider: botProvider,
				threadid: threadId,
				userid: socket.user.userId,
				description: userPrompt,
				promptresponse: isDone.gptResponse,
				promptdate: moment(new Date()).format('YYYY-MM-DD'),
				createdAt: new Date(),
				modelused: model,
				msgId : msg_id,
				tags,

			};
			console.log("newPrompt : ", newPrompt);


			const createdPrompt = await promptServices.createSinglePrompt(newPrompt);
			console.log("createdPrompt : ",createdPrompt);
			console.log('Chat creation completed.');
			
			const {
				inputTokenPrice,
				outputTokenPrice,
				inputTokenCount,
				outputTokenCount,
				totalCost,
				totalTokens,
			} = await calculateTokenAndCost(
				newPrompt.description,
				newPrompt.promptresponse,
				newPrompt.modelused,
				botProvider
			);
			console.log("inputTokenPrice : ", inputTokenPrice);
			console.log("outputTokenPrice : ", outputTokenPrice);
			console.log("inputTokenCount : ", inputTokenCount);
			console.log("outputTokenCount : ", outputTokenCount);
			console.log("totalCost : ", totalCost);
			console.log("totalTokens : ", totalTokens);

            const maxTokenUpdate = await updateMaxUserTokens(socket.user.userId, totalTokens);
			console.log("maxTokenUpdate : ",maxTokenUpdate);
			const trackUsage = await TrackUsage.create({
				user_id: newPrompt.userid,
				input_token: inputTokenCount,
				output_token: outputTokenCount,
				model_used: newPrompt.modelused,
				input_token_price: inputTokenPrice,
				output_token_price: outputTokenPrice,
				total_tokens: totalTokens,
				total_token_cost: totalCost,
			});
			console.log("trackUsage : ", trackUsage);
			console.log('Track usage created successfully:', trackUsage);
			

			socket.emit(socketEvent, {
				...finalResponseObject,
				promptResponse: isDone.gptResponse,
				isCompleted: true,
				promptId: createdPrompt._id,
			});
		}
	} catch (error) {
		console.error('Error in createChat handler:', error.message);  
        let message = error.message || PromptMessages.CHAT_CREATION_ERROR; 

    // Specific error handling for OpenAI errors
    if (error instanceof OpenAI.APIError) {
      message = handleOpenAIError(error).message;
    }
		// Emitting error to the client
		socket.emit(socketEvent, {
			success: false,
			message: message,
		});
	}finally {
		ongoingChats = {};
    }
};

/**
 * Edit the last chat using OpenAI's GPT-3 model and emits the response to the client.
 *
 * @param {Object} payload - The payload object containing chat details.
 * @param {string} payload.id - The ID of the chat object.
 * @param {string} payload.threadId - The ID of the chat thread.
 * @param {string} payload.userPrompt - The user's chat input.
 * @param {Array} payload.chatLog - The chat history.
 * @param {Array} payload.tags - IDs of tags associated with the chat.
 * @param {Array} payload.botProvider - Name of the AI model used.
 * @throws {Error} Throws an error if there's an issue in chat creation or OpenAI API.
 */
export const lastEditPromptOfProjects = async function (payload) {
	const socket = this;
	const socketEvent = 'chat:updated-prompt';

  try {
    const { promptId, threadId, userPrompt, chatLog, tags, botProvider } = payload;
	

    // Constructing the final response object to emit to the client
    const finalResponseObject = {
      success: true,
      promptResponse: "",
      message: PromptMessages.CHAT_EDIT_SUCCESS,
      ...payload,
    };

	socket.emit(socketEvent, finalResponseObject)

    let stream,
      tokenCount = 0,
      gptResponse = "",
      model,
      isDone;
    const userId = socket?.user?.userId;
	ongoingChats[userId] = { isActive: true };

    let isActive = () => ongoingChats[userId]?.isActive || false;

		// Choosing the appropriate AI service based on the bot provider
		switch (botProvider) {
			case 'openai':
				// Generating OpenAI stream response
				({ stream, model } =
					await generateOpenAIStreamResponse({
						prompt: userPrompt,
						chatLog,
						userId
					}));
				// Sending OpenAI stream response
				isDone = await chatService.sendOpenAIStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount,
					socketEvent,
					isActive
				);
				break;


			case 'gemini':
				// Generating Gemini AI stream response
				({ stream, model } =
					await generateGeminiAIStreamResponse({
						prompt: userPrompt,
						chatLog,
						userId
					}));
				// Sending Gemini AI stream response
				isDone = await chatService.sendGeminiAIStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount,
					socketEvent,
					isActive
				);
				break;

			case 'claude':
				// Generating Claude AI stream response
				({ stream, model } =
					await generateClaudeAIStreamResponse({
						prompt: userPrompt,
						chatLog,
						userId
					}));
				// Sending Claude AI stream response
				isDone = await chatService.sendClaudeAIStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount,
					socketEvent,
					
				);
				break;

			case 'deepseek':
					// Generating Deepseek AI stream response
					({ stream, model } = await deepseekService.generateDeepseekAIStreamResponse({
					  prompt: userPrompt,
					  chatLog,
					  userId
					}));
					// Sending Deepseek AI stream response
					isDone = await chatService.sendDeepseekStreamResponse(
					  socket,
					  stream,
					  gptResponse,
					  finalResponseObject,
					  tokenCount,
					  socketEvent,
					  isActive
					);
					break;
		}

    // Handling chat completion and saving the prompt to the database
    if (isDone?.completed) {
      const newPrompt = {
        tokenused: isDone.tokenCount,
        botProvider: botProvider,
        threadid: threadId,
        userid: socket.user.userId,
        description: userPrompt,
        promptresponse: isDone.gptResponse,
        promptdate: moment(new Date()).format("YYYY-MM-DD"),
        createdAt: new Date(),
        modelused: model,
        tags,
      };
     const updatedPrompt = await promptServices.updatePromptByID(promptId, newPrompt);
	  socket.emit(socketEvent, {
		...finalResponseObject,
		promptResponse: isDone.gptResponse,
		isCompleted: true,
		promptId: updatedPrompt._id,
	  });
	
    }
  } catch (error) {
    console.error("Error in updateChat handler:", error);
    let message = PromptMessages.CHAT_EDIT_ERROR;

    // Specific error handling for OpenAI errors
    if (error instanceof OpenAI.APIError) {
      message = handleOpenAIError(error).message;
    }

		// Emitting error to the client
		socket.emit(socketEvent, {
			success: false,
			message: message,
		});
	}
};

export const stopProjectsChat = async function () {
    const socket = this;
    const userId = socket?.user?.userId;
	if (ongoingChats[userId]) {
		ongoingChats[userId].isActive = false;
	}
};
