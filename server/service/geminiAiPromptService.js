import { getGeminiAIInstance } from "../config/geminiAi.js";
import { GeminiConfig } from "../constants/enums.js";
import { getUserPreferencesById } from "../utils/getUserPrefenceConfigHelper.js";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";

/**
 * Generates a context array of previous chat history.
 *
 * @param {Array} chatHistory - The chat history array.
 * @returns {Array} - Returns an array of previous chat history with a maximum of 6 chat items.
 */
export const generatePrevChatHistoryContext = (chatHistory) => {
  const contextArray = [];

  for (const item of chatHistory.slice(-6)) {
    if (item.chatPrompt) {
      contextArray.push({ role: "user", parts: [item.chatPrompt] });
    }
    if (item.botMessage) {
      contextArray.push({ role: "model", parts: [item.botMessage] });
    }
  }

  return contextArray;
};

/**
 * Generates a streaming response from a Gemini model using a provided payload.
 *
 * @async
 * @function generateGeminiAIStreamResponse
 * @description Creates a stream of responses from Gemini based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, socket
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {string} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the Gemini stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */
export const generateGeminiAIStreamResponse = async (payload) => {
  const { prompt, chatLog, userId, selectedmodel } = payload;
  try {
    const geminiAi = await getGeminiAIInstance();
    const model = await getOpenAiConfig("geminiModel");
    const temperature = parseFloat(await getOpenAiConfig("geminiTemperature"));
    const geminiMaxToken = parseFloat(await getOpenAiConfig("geminiMaxToken"));
    const geminiTopP = parseFloat(await getOpenAiConfig("geminiTopP"));
    const geminiTopK = parseFloat(await getOpenAiConfig("geminiTopK"));
    const geminiSystemInstruction = await getOpenAiConfig(
      "geminiSystemInstruction"
    );
    const geminiModelToUse = model || (await getOpenAiConfig("geminiModel"));
    const userPreferences = await getUserPreferencesById(userId);

    let contextArray = generatePrevChatHistoryContext(chatLog || []);
    if (userPreferences && geminiSystemInstruction) {
      contextArray.unshift({ role: "model", parts: [geminiSystemInstruction] });
    }

    const generationConfig = {
      max_output_tokens: userPreferences?.geminiMaxOutputTokens
        ? userPreferences.geminiMaxOutputTokens
        : geminiMaxToken || GeminiConfig.DEFAULT_MAX_TOKEN,
      temperature: userPreferences?.geminiTemperature
        ? userPreferences.geminiTemperature
        : temperature || GeminiConfig.DEFAULT_TEMPERATURE,
      topP: userPreferences?.geminiTopP
        ? userPreferences.geminiTopP
        : geminiTopP || GeminiConfig.DEFAULT_TOP_P,
      topK: userPreferences?.geminiTopK
        ? userPreferences.geminiTopK
        : geminiTopK || GeminiConfig.DEFAULT_TOP_K,
    };

    const geminiModel = geminiAi.getGenerativeModel({
      model: selectedmodel || geminiModelToUse,
      generationConfig,
    });
    const chat = geminiModel.startChat(
      { history: contextArray },
      generationConfig
    );

    const result = await chat.sendMessageStream(prompt);
    const stream = result.stream;

    return { stream, model: geminiModelToUse };
  } catch (error) {
    if (error.name === "GoogleGenerativeAIError") {
      console.error("Error from Gemini API:", error.message);
    }
    console.error(error);
  }
};

/**
 * Generates a normal response from a Gemini model using a provided payload.
 *
 * @async
 * @function generateGeminiHttpResponse
 * @description Creates a response from Gemini based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the userPrompt, chatLog and userId
 * @param {string} payload.modifiedPrompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {string} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the Gemini response object.
 * @throws {Error} Will throw an error if the response cannot be generated.
 */
export const generateGeminiHttpResponse = async (payload) => {
  const { modifiedPrompt, chatLog, userId } = payload;
  try {
    const geminiAi = await getGeminiAIInstance();
    const temperature = parseFloat(await getOpenAiConfig("geminiTemperature"));
    const model = await getOpenAiConfig("geminiModel");
    const geminiSystemInstruction = await getOpenAiConfig(
      "geminiSystemInstruction"
    );
    const userPreferences = await getUserPreferencesById(userId);

    let contextArray = generatePrevChatHistoryContext(chatLog || []);
    if(contextArray.length > 0){
      contextArray = contextArray.map(context => {
        if (context.role === "user" && context.parts && context.parts.length > 0) {
          context.parts = context.parts.map(part => {
            if (typeof part === 'string') {
              return { text: part };
            }
            return part;
          });
        } else if (context.role === "model" && context.parts && context.parts.length > 0) {
          context.parts = context.parts.map(part => {
            if (typeof part === 'string') {
              return { text: part };
            }
            return part;
          });
        }
        return context;
      });

    }
    if (!userPreferences && geminiSystemInstruction) {
      contextArray.unshift({ role: "model", parts: [{ "text":geminiSystemInstruction}] });
    }

    const generationConfig = {
      max_output_tokens: userPreferences?.geminiMaxOutputTokens
        ? userPreferences.geminiMaxOutputTokens
        : GeminiConfig.DEFAULT_MAX_TOKEN,
      temperature: userPreferences?.geminiTemperature
        ? userPreferences.geminiTemperature
        : temperature || GeminiConfig.DEFAULT_TEMPERATURE,
      topP: userPreferences?.geminiTopP
        ? userPreferences.geminiTopP
        : GeminiConfig.DEFAULT_TOP_P,
      topK: userPreferences?.geminiTopK
        ? userPreferences.geminiTopK
        : GeminiConfig.DEFAULT_TOP_K,
    };

    const geminiModel = geminiAi.getGenerativeModel({
      model,
      generationConfig,
    });
    let finalContextArray = [...contextArray, { role: "user", parts: [{ "text":modifiedPrompt}] }]
    const result = await geminiModel.generateContent({
      contents: finalContextArray,
    });

    const response = result.response.text();

    return {
      response,
      tokenUsed: result.response.usageMetadata.totalTokenCount,
      modelUsed: model,
    };
  } catch (error) {
    if (error.name === "GoogleGenerativeAIError") {
      console.error("Error from Gemini API:", error.message);
    }
    console.error(error);
  }
};

