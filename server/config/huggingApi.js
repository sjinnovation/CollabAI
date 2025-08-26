import { HfInference } from '@huggingface/inference';
import { HuggingfaceMessages } from '../constants/enums.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';  

export const getHuggingFaceInstance = async () => {
  try {
    // Retrieve the Hugging Face API key from the database
    const apiKey = (await getOpenAiConfig('huggingfacetokenKey')).trim();
    
    if (!apiKey) {
      throw new Error(HuggingfaceMessages.HF_RET_KEY_ERR);
    }

    // Return an instance of HfInference with the retrieved API key
    return new HfInference(apiKey);
  } catch (error) {
    throw error; 
  }
};