export const tokenPrices = {
    /*
    ---->> Old models Commenting for now, will remove this later.
    */
    // // GPT-4 Turbo
    // 'gpt-4-0125-preview': { input: 0.01, output: 0.03 },
    // 'gpt-4-1106-preview': { input: 0.01, output: 0.03 },
    // 'gpt-4-turbo-2024-04-09': { input: 0.01, output: 0.03 },
    // 'gpt-4-1106-vision-preview': { input: 0.01, output: 0.03 },

    // // GPT-4
    // 'gpt-4': { input: 0.03, output: 0.06 },
    // 'gpt-4-32k': { input: 0.06, output: 0.12 },

    // // GPT-4o
    // 'gpt-4o': { input: 0.005, output: 0.015 },

    // // GPT-3.5 Turbo
    // 'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
    // 'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.0020 },


    // // GPT-3.5 Additional models
    // 'gpt-3.5-turbo-1106': { input: 0.0010, output: 0.0020 },
    // 'gpt-3.5-turbo-0613': { input: 0.0015, output: 0.0020 },
    // 'gpt-3.5-turbo-16k-0613': { input: 0.0030, output: 0.0040 },
    // 'gpt-3.5-turbo-0301': { input: 0.0015, output: 0.0020 },

    // // Assistants API
    // 'code-interpreter': { input: 0.03, output: 0.03 },
    // 'retrieval': { input: 0.20, output: 0.20 },
    // 'gemini-pro': {input: 0.001, output: 0.002},
    // "claude-3-haiku-20240307": { input: 0.00000000025, output: 0.00000125 },
    // "claude-3-sonnet-20240229": { input: 0.000000003, output: 0.000000015 },
    // "claude-3-opus-20240229": { input: 0.000000015, output: 0.000000075 },


    // GPT-4o
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-2024-05-13': { input: 0.005, output: 0.015 },
   
    // GPT-4 Turbo
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4-turbo-2024-04-09': { input: 0.01, output: 0.03 },
    // GPT-4
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-32k': { input: 0.06, output: 0.12 },
    
    // GPT-3.5 Turbo
    'gpt-3.5-turbo-0125': { input: 0.0005, output: 0.0015 },
    'gpt-3.5-turbo-instruct': { input: 0.0015, output: 0.0020 },
    /**
     * We are calculating based on Models, not based on tools,
     */
    // Assistants API
    //     'code-interpreter': { $0.03 / session },
    //     'retrieval': { $0.10 / GB of vector-storage per day (1 GB free) },
    
    // Older models
    'gpt-4-0125-preview': { input: 0.0100, output: 0.0300 },
    'gpt-4-1106-preview': { input: 0.0100, output: 0.0300 },
    'gpt-4-vision-preview': { input: 0.0100, output: 0.0300 },
    'gpt-3.5-turbo-1106': { input: 0.0010, output: 0.0020 },
    'gpt-3.5-turbo-0613': { input: 0.0015, output: 0.0020 },
    'gpt-3.5-turbo-16k-0613': { input: 0.0030, output: 0.0040 },
    'gpt-3.5-turbo-0301': { input: 0.0015, output: 0.002 },
    
    
    
    // Embedding models
    'text-embedding-3-small': { input: 0.00002, output: 0.00002 },
    'text-embedding-3-large': { input: 0.00013, output: 0.00013 }, 
    'ada v2': { input: 0.00010, output: 0.00010 },
    // Base models
    'davinci-002': { input: 0.0020, output: 0.0020 }, 
    'babbage-002': { input: 0.0004, output: 0.0004 },
    
    // Audio models
    'Whisper': { input: 0.006, output: 0.006 }, 
    'TTS': { input: 0.015, output: 0.015 }, 
    'TTS HD': { input: 0.030, output: 0.030 }, 
    
    //Image models
    'DALL·E 3 Standard 1024×1024': { input: 0.040, output: 0.040 }, 
    'DALL·E 3 Standard 1024×1792': { input: 0.080, output: 0.080 }, 
    'DALL·E 3 Standard 1792×1024': { input: 0.080, output: 0.080 }, 
    'DALL·E 3 HD 1024×1024': { input: 0.080, output: 0.080 }, 
    'DALL·E 3 HD 1024×1792': { input: 0.120, output: 0.120 }, 
    'DALL·E 3 HD 1792×1024': { input: 0.120, output: 0.120 }, 
    'DALL·E 2 1024×1024': { input: 0.020, output: 0.020 }, 
    'DALL·E 2 512×512': { input: 0.018, output: 0.018 }, 
    'DALL·E 2 256×256': { input: 0.016, output: 0.016 },
    
    // Gemini
    'gemini-1.0-pro': {input: 0.0005, output: 0.0015},
    'gemini-1.5-pro-128k': {input: 0.0035, output: 0.0105},
    'gemini-1.5-pro-128k': {input: 0.0070, output: 0.0210}, //For Prompts Longer Than 128K Tokens
    'gemini-1.5-flash': {input: 0.00035, output: 0.00105 },
    'gemini-1.5-flash': {input: 0.00070, output: 0.00210 }, //For Prompts Longer Than 128K Tokens
    
    // Claude
    "claude-3-haiku-20240307": { input: 0.00025, output: 0.00125 },
    "claude-3-sonnet-20240229": { input: 0.003, output: 0.015 },
    "claude-3-opus-20240229": { input: 0.015, output: 0.075 },
};
