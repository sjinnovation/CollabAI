// geminiAI.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import getOpenAiConfig from "../utils/openAiConfigHelper.js";

export const getGeminiAIInstance = async () => {
  try {
    const apiKey = await getOpenAiConfig("geminiApiKey");
    if (!apiKey) {
      throw new Error(
        "Failed to retrieve GeminiAI API key from database, Please change the key and try again."
      );
    }

    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error("Error initializing OpenAI instance:", error);
    throw error;
  }
};
