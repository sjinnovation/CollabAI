let configCache = {};
import ConfigModel from '../models/configurationModel.js';
import { decrypt, isEncrypted } from './configEncription.js';


const getOpenAiConfig = async (key) => {
  if (configCache[key]) {
    return configCache[key];
  }

  const keyRec = await ConfigModel.findOne({ key });
  if (keyRec) {
    try {
      // Check if the value is encrypted before attempting decryption
      const isValueEncrypted = await isEncrypted(keyRec._id);
      if (isValueEncrypted) {
        try {
          const decryptedValue = await decrypt(keyRec.value, keyRec._id);
          configCache[key] = decryptedValue;
        } catch (decryptError) {
          console.error(`Decryption failed for key ${key}:`, decryptError);
          // If decryption fails, use the original value
          configCache[key] = keyRec.value;
        }
      } else {
        configCache[key] = keyRec.value;
      }
    } catch (error) {
      console.error(`Error processing config for key ${key}:`, error);
      // If any error occurs, use the original value
      configCache[key] = keyRec.value;
    }
  }

  return configCache[key];
};

export const deleteKeyFromOpenAiConfigCache = (key) => {
  delete configCache[key];
};

export default getOpenAiConfig;