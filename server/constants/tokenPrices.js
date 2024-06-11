export const tokenPrices = {
    // GPT-4 Turbo
    'gpt-4-0125-preview': { input: 0.01, output: 0.03 },
    'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
    'gpt-4-turbo-2024-04-09': { input: 0.01, output: 0.03 },
    'gpt-4-1106-vision-preview': { input: 0.01, output: 0.03 },

    // GPT-4
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },

    // GPT-4o
    'gpt-4o': { input: 0.005, output: 0.015 },

    // GPT-3.5 Turbo
    'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
    'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.0020 },


    // GPT-3.5 Additional models
    'gpt-3.5-turbo-1106': { input: 0.0010, output: 0.0020 },
    'gpt-3.5-turbo-0613': { input: 0.0015, output: 0.0020 },
    'gpt-3.5-turbo-16k-0613': { input: 0.0030, output: 0.0040 },
    'gpt-3.5-turbo-0301': { input: 0.0015, output: 0.0020 },

    // Assistants API
    'code-interpreter': { input: 0.03, output: 0.03 },
    'retrieval': { input: 0.20, output: 0.20 },
    'gemini-pro': {input: 0.001, output: 0.002},
    "claude-3-haiku-20240307": { input: 0.00000000025, output: 0.00000125 },
    "claude-3-sonnet-20240229": { input: 0.000000003, output: 0.000000015 },
    "claude-3-opus-20240229": { input: 0.000000015, output: 0.000000075 }
};
