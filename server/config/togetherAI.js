import Together from "together-ai";
import config from "../config.js";
import { PromptMessages } from "../constants/enums.js";

export const getTogetherAIClient = () => {
  if (!config.TOGETHER_API_KEY) {
    throw new Error(PromptMessages.TOGETHER_API_KEY_ERROR);
  }

  const client = new Together(config.TOGETHER_API_KEY);
  return client;
};
