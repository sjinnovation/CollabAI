import { getGeminiAIInstance } from "../config/geminiAi.js";
import { GeminiConfig } from "../constants/enums.js";

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
 * @function getGeminiAIPromptService
 * @description Creates a stream of responses from gemini based on dialogue context and a user prompt.
 * @param {Object} payload - An object containing the prompt, chatLog, temperature, gptModel
 * @param {string} payload.prompt - The user's input to the model.
 * @param {Array} payload.chatLog - The chat history to provide context for the model's response.
 * @param {number} payload.temperature - Controls randomness in the response generation.
 * @param {string} payload.Model - The specific gemini model to use for generating responses.
 * @returns {Promise<Object>} A promise that resolves with the OpenAI stream response object.
 * @throws {Error} Will throw an error if the streaming response cannot be generated.
 */

export const getGeminiAIPromptService = async (payload) => {
  const { prompt, chatLog, model, temperature } = payload;
  try {
    const geminiAi = await getGeminiAIInstance();
    const contextArray = generatePrevChatHistoryContext(chatLog || []);

    const generationConfig = {
      maxOutputTokens: GeminiConfig.DEFAULT_MAX_TOKEN,
      temperature,
      topP:GeminiConfig.DEFAULT_TOP_P,
      topK: GeminiConfig.DEFAULT_TOP_K,
    };

    const geminiModel = geminiAi.getGenerativeModel({
      model,
      generationConfig,
    });
    const chat = geminiModel.startChat(
      { history: contextArray },
      generationConfig
    );

    const result = await chat.sendMessageStream(prompt);

    const response = result.stream;

    return response;
  } catch (error) {
    if (error.name === "GoogleGenerativeAIError") {
      // Handle errors specifically from Gemini:
      console.error("Error from Gemini API:", error.message);
    }
    console.error(error);
  }
};
