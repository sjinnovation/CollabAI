import { getGeminiAIInstance } from "../config/geminiAi.js";
import { GeminiConfig } from "../constants/enums.js";
import { getUserPreferencesById }  from '../utils/getUserPrefenceConfigHelper.js'
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
 * Generates a streaming response from an Gemini  model using a provided payload.
 *
 * @async
 * @function generateGeminiAIStreamResponse
 * @description Creates a stream of responses from gemini based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, socket
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {Object} payload.socket - will get user preference by using this.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */

export const generateGeminiAIStreamResponse = async (payload) => {
  const { prompt, chatLog,userId } = payload;
  try {
    const geminiAi = await getGeminiAIInstance();
    const model = await getOpenAiConfig('geminiModel');
    const contextArray = generatePrevChatHistoryContext(chatLog || []);
    const temperature = parseFloat(await getOpenAiConfig('geminiTemperature'));
    const geminiModelToUse = model ? model : (await getOpenAiConfig('geminiModel'));
    
    const userPreferences = await getUserPreferencesById(userId);
    
    const generationConfig = {
     max_output_tokens:userPreferences?.geminiMaxOutputTokens? userPreferences?.geminiMaxOutputTokens : GeminiConfig.DEFAULT_MAX_TOKEN,
      temperature :userPreferences?.geminiTemperature ? userPreferences.geminiTemperature : temperature,
      topP:userPreferences?.geminiTopP? userPreferences?.geminiTopP : GeminiConfig.DEFAULT_TOP_P,
      topK: userPreferences?.geminiTopK? userPreferences?.geminiTopK : GeminiConfig.DEFAULT_TOP_K,
    };


    const geminiModel = geminiAi.getGenerativeModel({
      model: geminiModelToUse,
      generationConfig,
    });
    const chat = geminiModel.startChat(
      { history: contextArray },
      generationConfig
    );

    const result = await chat.sendMessageStream(prompt);
    const stream = result.stream;

    return { stream, model : geminiModelToUse};
  } catch (error) {
    if (error.name === "GoogleGenerativeAIError") {
      // Handle errors specifically from Gemini:
      console.error("Error from Gemini API:", error.message);
    }
    console.error(error);
  }
};

/**
 * Generates a normal response from an Gemini model using a provided payload.
 *
 * @async
 * @function generateGeminiHttpResponse
 * @description Creates a stream of responses from gemini based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the userPrompt,chatLog and userId
 * @param {string} payload.modifiedPrompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {string} payload.userId - The userId to get user saved details
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */

export const generateGeminiHttpResponse = async (payload) => {
  const { modifiedPrompt,chatLog, userId} = payload;
  try {
    const geminiAi = await getGeminiAIInstance();
    const temperature = parseFloat(await getOpenAiConfig('temperature'));
    const model = await getOpenAiConfig('geminiModel');
    
    const userPreferences = await getUserPreferencesById(userId);
    
    const generationConfig = {
      max_output_tokens:userPreferences?.geminiMaxOutputTokens? userPreferences?.geminiMaxOutputTokens : GeminiConfig.DEFAULT_MAX_TOKEN,
      temperature :userPreferences?.geminiTemperature ? userPreferences?.geminiTemperature : temperature,
      topP:userPreferences?.geminiTopP ? userPreferences?.geminiTopP : GeminiConfig.DEFAULT_TOP_P,
      topK: userPreferences?.geminiTopK ? userPreferences?.geminiTopK : GeminiConfig.DEFAULT_TOP_K,
    };

    const geminiModel = geminiAi.getGenerativeModel({
      model,
      generationConfig,
    });

    const result = await geminiModel.generateContent(modifiedPrompt);    
    const response = result.response.text();
    
    return {
        response,
        modelUsed: model
    };
  } catch (error) {
    if (error.name === "GoogleGenerativeAIError") {
      // Handle errors specifically from Gemini:
      console.error("Error from Gemini API:", error.message);
    }
    console.error(error);
  }
};



