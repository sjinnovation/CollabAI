import config from "../models/configurationModel.js";

export const getMaxTokenOfModels = async () => {
    const keysToFetch = [
        'openaiMaxToken',
        'geminiMaxToken',
        'claudeMaxToken',
        'huggingfacetokenMaxToken',
    ];
    const configValues = await config.find({ key: { $in: keysToFetch } });
    const formattedValues = configValues.reduce((acc, configValue) => {
        acc[configValue.key] = configValue.value !==''?parseInt(configValue.value, 10):1024;
        return acc;
    }, {});
    return formattedValues;
}

export const getConfigKeyValue = async (key)=>{
    const configValues = await config.findOne({ key: key });
    return configValues?.value;
};