// /sockets/chat/chatHandler.js

// libraries
import OpenAI from "openai";

import { getOpenAIInstance } from "../../config/openAI.js";

// utils
import { PromptMessages } from "../../constants/enums.js";
import { handleOpenAIError } from "../../utils/openAIErrors.js";
import {
  createAssistantThreadInDb,
  getAssistantByAssistantID,
  validateUserPromptForAssistant,
} from "../../service/assistantService.js";
import {
  createAssistantThread,
  createMessageInThread,
  streamRunInThread,
  submitToolOutputsAndStream,
} from "../../lib/openai.js";
import { onTextDelta, onToolCallDelta, onToolCalls } from "../../utils/assistant.js";
import { calculateCostFromTokenCounts, createTrackUsage } from "../../service/trackUsageService.js";


/**
 * Creates an assistant chat and initiates streaming of responses from the assistant.
 *
 * @param {Object} payload - The payload containing the necessary information for creating the assistant chat.
 * @param {string} payload.question - The user's question.
 * @param {string} payload.thread_id - The ID of the thread (optional).
 * @param {string} payload.assistant_id - The ID of the assistant.
 */
export const createAssistantChatAndStream = async function (payload) {
  const socket = this;
  const resSocketEvent = "chat:created";

  try {
    const { question, thread_id, assistant_id } = payload;

    // Constructing the final response object to emit to the client
    const result = {
      ...payload,
      success: true,
      promptResponse: "",
      codeInterpreterOutput: "",
      isCompleted: false,
      message: PromptMessages.CHAT_CREATION_SUCCESS,
      thread_id: thread_id ? thread_id : null,
    };
    const validationResult = validateUserPromptForAssistant({ question });

    if (validationResult.error) {
      return socket.emit(resSocketEvent, {
        success: false,
        message:
          "The message you submitted was too long, please reload the conversation and submit something shorter.",
      });
    }

    const openai = await getOpenAIInstance();

    // Step 1: create a thread if doesn't exist for the requested user
   if (!result.thread_id) {
      const thread = await createAssistantThread(openai);
      result.thread_id = thread.id;

      await createAssistantThreadInDb(
        assistant_id,
        socket.user.userId,
        thread.id,
        question.substring(0, 50)
      );
    }

    // Step 1.2: check if assistant exists in database
    const existingAssistant = await getAssistantByAssistantID(assistant_id);

    // Step 2: now we have a threadId, create a message in the thread
    await createMessageInThread(openai,assistant_id, result.thread_id, question,socket.user.userId);
    
    const triggerClientUpdate = () => {
      socket.emit(resSocketEvent, {
        ...result,
      });
    }

    const observeRunStream = (stream) => {
      stream
        .on("textDelta", async (textDelta) => {
          let response = await onTextDelta(textDelta);
          if (response) result.promptResponse += response;

          triggerClientUpdate();
        })
        .on("toolCallDelta", async (toolCallDelta) => {
          let response = await onToolCallDelta(toolCallDelta);
          if (response) result.codeInterpreterOutput += response;

          triggerClientUpdate();
        })
        .on("end", async () => {
          const currentRun = stream.currentRun();
          if (
            currentRun.status === "requires_action" &&
            currentRun.required_action.type === "submit_tool_outputs" 
          ) {
            const toolCalls =
              currentRun.required_action.submit_tool_outputs.tool_calls;
              
              const toolOutputs = await onToolCalls(
                assistant_id,
                toolCalls,
                existingAssistant?.functionCalling
              );
            
            const runStreamAfterToolSubmit = submitToolOutputsAndStream(
              openai,
              result.thread_id,
              currentRun.id,
              toolOutputs
            );
            
            observeRunStream(runStreamAfterToolSubmit);
          } else {
            result.isCompleted = true;
          }
          
          triggerClientUpdate();
        }).on("done", async (data) => {
          result.isCompleted = true;
          triggerClientUpdate();
        }).on("error", async (error) => {
          throw new Error(error);
        });
    };

    const runStreams = streamRunInThread(openai, result.thread_id, assistant_id);
    observeRunStream(runStreams);

    // retrieving finalRun object to get usage details
    const finalRun = await runStreams.finalRun();
    const {
      inputTokenPrice,
      outputTokenPrice,
      inputTokenCount,
      outputTokenCount,
      totalCost,
      totalTokens
  } = calculateCostFromTokenCounts(
      finalRun?.usage?.prompt_tokens,
			finalRun?.usage?.completion_tokens,
			finalRun?.model,
			'openai'
		);
    await createTrackUsage({
      userId: socket.user.userId,
      inputTokenCount,
      outputTokenCount,
      modelUsed: finalRun.model,
      inputTokenPrice,
      outputTokenPrice,
      totalTokens,
      totalCost
    });
  } catch (error) {
    console.error("Error in createChat handler:", error);
    let message = PromptMessages.CHAT_CREATION_ERROR;
    
    // Specific error handling for OpenAI errors
    if (error instanceof OpenAI.APIError) {
      message = handleOpenAIError(error).message;
    }
    
    console.log("🚀 ~ createAssistantChatAndStream ~ message:", message)
    

    // Emitting error to the client
    socket.emit(resSocketEvent, {
      success: false,
      message: message,
      error: JSON.stringify(error),
      errorMessage: error?.message
    });
  }
};
