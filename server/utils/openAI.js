import OpenAI from 'openai';
import config from '../config.js';

// Initialize once and export for global usage
export const openAIInstance = new OpenAI({
  apiKey: config.OPEN_AI_API_KEY,
});
