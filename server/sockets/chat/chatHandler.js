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
import { HuggingfaceMessages ,PromptMessages } from "../../constants/enums.js";
import { handleOpenAIError } from "../../utils/openAIErrors.js";
import { generateOpenAIStreamResponse } from "../../service/openaiService.js";
import { generateGeminiAIStreamResponse } from "../../service/geminiAiPromptService.js";
import { generateClaudeAIStreamResponse } from "../../service/claudeAiPromptService.js";
import { calculateTokenAndCost } from "../../service/trackUsageService.js";
import { processModel } from "../../controllers/huggingFaceController.js";

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
export const createChat = async function (payload) {
	const socket = this;
	const socketEvent = 'chat:created';

  const { userPreferences, desiredAiResponse } = await getUserCustomization(socket.user.userId);
  try {
    const { threadId, userPrompt, chatLog, tags, botProvider, selectedmodel } = payload;
	console.log("payload : ",payload);

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

		// Handling Hugging Face API request dynamically
		const isHuggingFaceModel = !["openai", "gemini", "claude", "deepseek"].includes(botProvider);
		console.log("isHuggingFaceModel : ", isHuggingFaceModel);

		//Start huggingface
	
		if (isHuggingFaceModel) {
		  try {
			const cleanedBotProvider = selectedmodel.replace("-hf", "");
			let promptResponse = "";

			// Validate model existence first (optional but recommended)
			const modelExists = await validateModel(selectedmodel);
			if (!modelExists) {
				throw new Error(`Model ${cleanedBotProvider} not found on Hugging Face`);
			}
		
			const internalReq = {
			  body: {
				modelName: cleanedBotProvider,
				inputData: modifiedPrompt,
			  },
			};
		
			const internalRes = {
			  status: function (code) {
				this.statusCode = code;
				return this;
			  },
			  json: function (data) {
				this.data = data;
				return this;
			  },
			};
		
			await processModel(internalReq, internalRes);
		
			const result = internalRes.data?.result;
		
			// if (!result) throw new Error(HuggingfaceMessages.HF_RESPONSE_ERROR);

			if (!result) {
			if (internalRes.data?.error || internalRes.data?.detail) {
			  console.error("HuggingFace API Error:", internalRes.data);
			  throw new Error(internalRes.data.error || internalRes.data.detail);
			} else {
			  console.error("HuggingFace Unknown Format:", internalRes.data);
			  throw new Error("Unexpected response format from Hugging Face");
			}
		  }
		
			// Response parsing logic
			if (Array.isArray(result)) {	
			  if (result[0].label) {
				promptResponse = result.map((entry) =>
				  `${entry.label}: ${entry.score.toFixed(4)}`
				).join("\n");
		
			  } else if (result[0].entity_group) {
				promptResponse = result.map((entry) =>
				  `${entry.entity_group}: ${entry.word} (Score: ${entry.score.toFixed(4)})`
				).join("\n");
			  }
		
			  finalResponseObject.promptResponse = promptResponse;
		
			} else if (result.generated_text) {
			  finalResponseObject.promptResponse = result.generated_text;
		
			} else if (typeof result === "string") {
			  if (result.startsWith("data:image") || result.startsWith("http")) {
				finalResponseObject.promptResponse = result;
			  } else {
				throw new Error(HuggingfaceMessages.HF_RESPONSE_ERROR);		  
			  }
			} else {
			  throw new Error(HuggingfaceMessages.HF_RESPONSE_ERROR);
			}
		
			socket.emit(socketEvent, finalResponseObject);
			socket.emit("chat:done", { success: true });
		
		isDone = await chatService.sendHuggingFaceStreamResponse({
			result,
			gptResponse: promptResponse,
			completed: true,
			tokenCount: 0
		  });
	  
		  if (isDone.completed) {
			const newPrompt = {
			  tokenused: isDone.tokenCount,
			botProvider: 'huggingface',
			  threadid: threadId,
			  userid: socket.user.userId,
			  description: userPrompt,
			  promptresponse: isDone.gptResponse,
			  promptdate: moment(new Date()).format('YYYY-MM-DD'),
			  createdAt: new Date(),
			  modelused: cleanedBotProvider,
			};
			console.log("newPrompt : ", newPrompt);
	  
			const createdPrompt = await promptServices.createSinglePrompt(newPrompt);
			console.log("createdPrompt : ",createdPrompt);
	
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

			const updateMaxToken  = await updateMaxUserTokens(socket.user.userId, totalTokens);
			console.log("updateMaxToken : ", updateMaxToken);
	  
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
			console.log('Track usage created:', trackUsage);

	  
			socket.emit(socketEvent, {
			  ...finalResponseObject,
			  promptResponse:isDone.gptResponse,
			  isCompleted: true,
			  promptId: createdPrompt._id,
			});
		  }
	  
		} catch (error) {
		  socket.emit(socketEvent, { success: false, message: HuggingfaceMessages.HF_INPUT_ERROR });
		  socket.emit("chat:done", { success: false });
		}
	  
		return;
		}
		
		//end hugginface
	
		// Choosing the appropriate AI service based on the bot provider
		switch (botProvider) {
			case 'openai':
				// Generating OpenAI stream response
				({ stream, model } =
					await generateOpenAIStreamResponse({
						prompt:modifiedPrompt, //userPrompt,
						chatLog,
						userPreferences,
						desiredAiResponse,
                        userId,
						selectedmodel,
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

			case 'gemini':
				// Generating Gemini AI stream response
				({ stream, model } =
					await generateGeminiAIStreamResponse({
						prompt: modifiedPrompt,//userPrompt,
						chatLog,
                        userId,
						selectedmodel,
					}));
				// Sending Gemini AI stream response
				ongoingChats[userId] = { isActive: true };
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
						prompt: modifiedPrompt, //userPrompt,
						chatLog,
                        userId,
						selectedmodel,
					}));
				// Sending Claude AI stream response
				isDone = await chatService.sendClaudeAIStreamResponse(
					socket,
					stream,
					gptResponse,
					finalResponseObject,
					tokenCount,
					socketEvent
				);
				break;

			case 'deepseek':
				({ stream, model } = await deepseekService.generateDeepseekAIStreamResponse({
					prompt: modifiedPrompt,
					chatLog,
					userId,
					selectedmodel,
				}));

				ongoingChats[userId] = { isActive: true };

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
			};

			const createdPrompt = await promptServices.createSinglePrompt(newPrompt);
			console.log("createdPrompt : ", createdPrompt);
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

            const updateMaxToken = await updateMaxUserTokens(socket.user.userId, totalTokens);
			console.log("updateMaxToken : ", updateMaxToken);
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
    console.log(message,'message')
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
export const lastEditPrompt = async function (payload) {
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

export const stopChat = async function () {
    const socket = this;
    const userId = socket?.user?.userId;
	if (ongoingChats[userId]) {
		ongoingChats[userId].isActive = false;
	}
	console.log("ongoingChats", ongoingChats)
};
