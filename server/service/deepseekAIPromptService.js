import { getTogetherAIClient } from "../config/togetherAI.js";
import { DeepseekConfig, PromptMessages } from "../constants/enums.js";
import { getUserPreferencesById } from "../utils/getUserPrefenceConfigHelper.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";

/**
 * Generates a streaming response from DeepSeek via Together AI
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} Stream and model information
 */
export const generateDeepseekAIStreamResponse = async (payload) => {
  const { prompt, chatLog, userId, selectedmodel } = payload;
  try {
    const together = getTogetherAIClient();
    const userPreferences = await getUserPreferencesById(userId);
    const deepseekModel = await getOpenAiConfig("deepseekModel");
    const deepseekTemperature = parseFloat(
      await getOpenAiConfig("deepseekTemperature")
    );
    const deepseekMaxTokens = parseInt(
      await getOpenAiConfig("deepseekMaxTokens")
    );
    const deepseekTopP = parseFloat(await getOpenAiConfig("deepseekTopP"));
    const deepseekTopK = parseInt(await getOpenAiConfig("deepseekTopK"));
    const deepseekRepetitionPenalty = parseFloat(
      await getOpenAiConfig("deepseekRepetitionPenalty")
    );
    const deepseekSystemInstruction = await getOpenAiConfig(
      "deepseekSystemInstruction"
    );

    const messages = [
      {
        role: "system",
        content:
          userPreferences?.deepseekSystemInstruction ||
          deepseekSystemInstruction ||
          "You're DeepSeek AI, a helpful AI assistant.",
      },
      ...generatePreviousChatContextForDeepSeek(chatLog, 6),
      { role: "user", content: prompt },
    ];

    const stream = await together.chat.completions.create({
      messages: messages,
      model:
      selectedmodel || userPreferences?.deepseekModel ||
        deepseekModel ||
        DeepseekConfig.DEFAULT_MODEL,
      stream: true,
      temperature:
        userPreferences?.deepseekTemperature ||
        deepseekTemperature ||
        DeepseekConfig.DEFAULT_TEMPERATURE,
      max_tokens:
        userPreferences?.deepseekMaxTokens ||
        deepseekMaxTokens ||
        DeepseekConfig.DEFAULT_MAX_TOKENS,
      top_p:
        userPreferences?.deepseekTopP ||
        deepseekTopP ||
        DeepseekConfig.DEFAULT_TOP_P,
      top_k:
        userPreferences?.deepseekTopK ||
        deepseekTopK ||
        DeepseekConfig.DEFAULT_TOP_K,
      repetition_penalty:
        userPreferences?.deepseekRepetitionPenalty ||
        deepseekRepetitionPenalty ||
        DeepseekConfig.DEFAULT_REPETITION_PENALTY,
    });

    return {
      stream: stream,
      model:
        userPreferences?.deepseekModel ||
        deepseekModel ||
        DeepseekConfig.DEFAULT_MODEL,
    };
  } catch (error) {
    console.error("Deepseek Stream Error:", error);
    const errorType = error?.error?.error?.type;
    const errorMessage = error?.error?.error?.message;
    if (errorType === "credit_limit") {
      throw new Error(errorMessage);
    } else {
      throw new Error(PromptMessages.DEEPSEEK_STREAM_ERROR);
    }
  }
};

/**
 * Generates an HTTP response from DeepSeek via Together AI
 * @param {Object} payload - Request payload
 * @param {string} payload.modifiedPrompt - The user's input to the model
 * @param {Array} payload.chatLog - The chat history to provide context
 * @param {string} payload.userId - The user ID to fetch preferences
 * @returns {Promise<Object>} Response object containing generated text and token usage
 */
export const generateDeepseekAIHttpResponse = async (payload) => {
  const { modifiedPrompt, chatLog, userId } = payload;
  try {
    const together = getTogetherAIClient();
    const userPreferences = await getUserPreferencesById(userId);
    const deepseekModel = await getOpenAiConfig("deepseekModel");
    const deepseekTemperature = parseFloat(
      await getOpenAiConfig("deepseekTemperature")
    );
    const deepseekMaxTokens = parseInt(
      await getOpenAiConfig("deepseekMaxTokens")
    );
    const deepseekTopP = parseFloat(await getOpenAiConfig("deepseekTopP"));
    const deepseekTopK = parseInt(await getOpenAiConfig("deepseekTopK"));
    const deepseekRepetitionPenalty = parseFloat(
      await getOpenAiConfig("deepseekRepetitionPenalty")
    );
    const deepseekSystemInstruction = await getOpenAiConfig(
      "deepseekSystemInstruction"
    );

    const messages = [
      {
        role: "system",
        content:
          userPreferences?.deepseekSystemInstruction ||
          deepseekSystemInstruction ||
          "You're DeepSeek AI, a helpful AI assistant.",
      },
      ...generatePreviousChatContextForDeepSeek(chatLog, 6),
      { role: "user", content: modifiedPrompt },
    ];

    const response = await together.chat.completions.create({
      messages: messages,
      model:
        userPreferences?.deepseekModel ||
        deepseekModel ||
        DeepseekConfig.DEFAULT_MODEL,
      temperature:
        userPreferences?.deepseekTemperature ||
        deepseekTemperature ||
        DeepseekConfig.DEFAULT_TEMPERATURE,
      max_tokens:
        userPreferences?.deepseekMaxTokens ||
        deepseekMaxTokens ||
        DeepseekConfig.DEFAULT_MAX_TOKENS,
      top_p:
        userPreferences?.deepseekTopP ||
        deepseekTopP ||
        DeepseekConfig.DEFAULT_TOP_P,
      top_k:
        userPreferences?.deepseekTopK ||
        deepseekTopK ||
        DeepseekConfig.DEFAULT_TOP_K,
      repetition_penalty:
        userPreferences?.deepseekRepetitionPenalty ||
        deepseekRepetitionPenalty ||
        DeepseekConfig.DEFAULT_REPETITION_PENALTY,
    });

    return {
      response: response.choices[0].message.content,
      inputToken: response.usage.prompt_tokens,
      outputToken: response.usage.completion_tokens,
      totalToken: response.usage.total_tokens,
      modelUsed: response.model,
    };
  } catch (error) {
    console.error("Deepseek HTTP Response Error:", error);
    const errorType = error?.error?.error?.type;
    const errorMessage = error?.error?.error?.message;

    if (errorType === "credit_limit") {
      throw new Error(errorMessage);
    } else {
      throw new Error(PromptMessages.DEEPSEEK_HTTP_RESPONSE_ERROR);
    }
  }
};

/**
 * Shared chat history formatter for providers using similar schema
 * @param {Array} chatHistory - Raw chat history
 * @param {number} maxItems - Maximum context items
 * @returns {Array} Formatted messages (only user and assistant messages)
 */
export const generatePreviousChatContextForDeepSeek = (
  chatHistory,
  maxItems = 6
) => {
  const context = [];
  let count = 0;

  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const item = chatHistory[i];

    if (item.botMessage && count < maxItems) {
      context.unshift({ role: "assistant", content: item.botMessage });
      context.unshift({ role: "user", content: item.chatPrompt });
      count++;
    }

    if (count === maxItems) break;
  }

  return context;
};
