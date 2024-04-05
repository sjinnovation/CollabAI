export const tokenPrices = {
    // GPT-4 Turbo
    'gpt-4-0125-preview': { input: 0.01, output: 0.03 },
    'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
    'gpt-4-1106-vision-preview': { input: 0.01, output: 0.03 },

    // GPT-4
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },

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
};
