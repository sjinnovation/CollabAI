let configCache = {};


const getOpenAiConfig = async (key, configModel) => {
  if (configCache[key]) {
    return configCache[key];
  }

  const configRec = await configModel.findOne({ key });
  if (configRec) {
    configCache[key] = configRec.value;
  }

  return configCache[key];
};

export default getOpenAiConfig;