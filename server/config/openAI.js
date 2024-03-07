// openAI.js

import OpenAI from 'openai';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';

export const getOpenAIInstance = async () => {
  try {
    const apiKey = await getOpenAiConfig('openaikey');
    if (!apiKey) {
      throw new Error('Failed to retrieve OpenAI API key from database, Please change the key and try again.');
    }

    return new OpenAI({ apiKey: apiKey });
  } catch (error) {
    console.error('Error initializing OpenAI instance:', error);
    throw error; 
  }
};