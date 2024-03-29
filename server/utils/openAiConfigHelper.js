let configCache = {};
import ConfigModel from '../models/configurationModel.js';


const getOpenAiConfig = async (key) => {
  if (configCache[key]) {
    return configCache[key];
  }

  const configRec = await ConfigModel.findOne({ key });
  if (configRec) {
    configCache[key] = configRec.value;
  }

  return configCache[key];
};

export const deleteKeyFromOpenAiConfigCache = (key) => {
  delete configCache[key];
};

export default getOpenAiConfig;