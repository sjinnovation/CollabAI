import config from "../models/configurationModel.js";

export const getMaxTokenOfModels = async () => {
    const keysToFetch = [
        'openaiMaxToken',
        'geminiMaxToken',
        'claudeMaxToken'
    ];
    const configValues = await config.find({ key: { $in: keysToFetch } });
    const formattedValues = configValues.reduce((acc, configValue) => {
        acc[configValue.key] = configValue.value !==''?parseInt(configValue.value, 10):1024;
        return acc;
    }, {});
    return formattedValues;
}