import { tokenPrices } from "../constants/tokenPrices.js";
import tiktoken from 'tiktoken-node';

export const calculateTokenAndCost = async (input_token, output_token, model_used) => {
    console.log({ input_token, output_token, model_used });

    const { input: inputTokenPrice, output: outputTokenPrice } = tokenPrices[model_used] || { input: 0.01, output: 0.01 };

    const flattenOutputToken = flattenOutputTokenStructure(output_token);

    const inputTokens = tiktoken.encodingForModel(model_used).encode(input_token);
    const outputTokens = tiktoken.encodingForModel(model_used).encode(flattenOutputToken);

    const totalInputToken = inputTokens.length;
    const totalOutputToken = outputTokens.length;

    const totalCost = (totalInputToken * inputTokenPrice + totalOutputToken * outputTokenPrice) / 1000;

    const totalTokens = totalInputToken + totalOutputToken;

    return {
        inputTokenPrice,
        outputTokenPrice,
        inputTokenCount: totalInputToken,
        outputTokenCount: totalOutputToken,
        totalCost,
        totalTokens,
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
