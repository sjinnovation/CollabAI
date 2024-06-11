import { getGeminiAIInstance } from "../config/geminiAi.js";
import { tokenPrices } from "../constants/tokenPrices.js";
import { encoding_for_model } from 'tiktoken';
import TrackUsage from "../models/trackUsageModel.js";

/**
 * Creates a track usage document and saves it to the database.
 * @param {Object} payload - The payload object.
 * @param {string} payload.userId - The user's ID.
 * @param {number} payload.inputTokenCount - The count of input tokens.
 * @param {number} payload.outputTokenCount - The count of output tokens.
 * @param {string} payload.modelUsed - The model used.
 * @param {number} payload.inputTokenPrice - The price of input tokens.
 * @param {number} payload.outputTokenPrice - The price of output tokens.
 * @param {number} payload.totalTokens - The total count of tokens.
 * @param {number} payload.totalCost - The total cost.
 * @returns {Promise<Object>} The created track usage document.
 */
export const createTrackUsage = async (payload) => {
    const trackUsageDoc = await TrackUsage.create({
        user_id: payload.userId,
        input_token: payload.inputTokenCount,
        output_token: payload.outputTokenCount,
        model_used: payload.modelUsed,
        input_token_price: payload.inputTokenPrice,
        output_token_price: payload.outputTokenPrice,
        total_tokens: payload.totalTokens,
        total_token_cost: payload.totalCost,
    });

    await trackUsageDoc.save();

    return trackUsageDoc;
}

export const calculateTokenAndCost = async (input_token, output_token, model_used, botProvider) => {
    
    const { input: inputTokenPrice, output: outputTokenPrice } = tokenPrices[model_used] || { input: 0.01, output: 0.01 };

    const flattenOutputToken = flattenOutputTokenStructure(output_token);

    let inputTokens = 0;
    let outputTokens = 0;

    if (botProvider == "openai") {
      const encoder = encoding_for_model(model_used);
      inputTokens = encoder.encode(input_token);
      outputTokens = encoder.encode(flattenOutputToken);
    }
    else if(botProvider == "gemini"){
        const geminiAi = await getGeminiAIInstance();
        const model = geminiAi.getGenerativeModel({ model: model_used });
        inputTokens = await model.countTokens(input_token);
        outputTokens = await model.countTokens(output_token);
    }

    let totalInputToken = 0;
    let totalOutputToken = 0;
    let totalCost = 0;
    if(botProvider == 'openai'){
        totalInputToken = inputTokens.length;
        totalOutputToken = outputTokens.length;
        totalCost = (Number(totalInputToken) * inputTokenPrice + Number(totalOutputToken) * outputTokenPrice) / 1000;
    } else if(botProvider == 'gemini'){
        totalInputToken = inputTokens.totalTokens;
        totalOutputToken = outputTokens.totalTokens;
        totalCost = (Number(totalInputToken) * inputTokenPrice) + (Number(totalOutputToken) * outputTokenPrice);
    }else if(botProvider == 'claude'){
        //For now since we don't have any  api or  method to calculate  the cost we are setting it to zero  this can be considered  in future scope 
        totalInputToken = 0;
        totalOutputToken = 0;
        totalCost = 0
    }

    const totalTokens = Number(totalInputToken) + Number(totalOutputToken);

    return {
        inputTokenPrice,
        outputTokenPrice,
        inputTokenCount: totalInputToken,
        outputTokenCount: totalOutputToken,
        totalCost,
        totalTokens,
    };
};

export const calculateCostFromTokenCounts = (inputTokenCount, outputTokenCount, modelUsed, botProvider='openai') => {
    const { input: inputTokenPrice, output: outputTokenPrice } = tokenPrices[modelUsed] || { input: 0.01, output: 0.01 };
    
    let totalCost = 0;

    if (botProvider === 'openai') {
        // If the botProvider is 'openai', divide the total by 1000 (assuming this is a pricing rule for 'openai')
        totalCost = (Number(inputTokenCount) * inputTokenPrice + Number(outputTokenCount) * outputTokenPrice) / 1000;
    } else if (botProvider === 'gemini') {
        // If the botProvider is 'gemini', sum up the costs without division
        totalCost = (Number(inputTokenCount) * inputTokenPrice) + (Number(outputTokenCount) * outputTokenPrice);
    }

    return {
        inputTokenPrice,
        outputTokenPrice,
        inputTokenCount,
        outputTokenCount,
        totalCost,
        totalTokens: inputTokenCount + outputTokenCount
    };
};

const flattenOutputTokenStructure = (output_token) => {
    if (Array.isArray(output_token)) {
        return output_token.map(flattenOutputTokenStructure).join('');
    } else if (typeof output_token === 'object' && output_token !== null) {
        return Object.values(output_token).map(flattenOutputTokenStructure).join('');
    } else {
        return output_token.toString();
    }
};
