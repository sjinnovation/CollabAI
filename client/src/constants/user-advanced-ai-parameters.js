export const openAIAdvancedConfigData = [
  {
    name: "openAiTemperature",
    label: "Temperature (0 - 2)",
    subtitle:
      "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic.",
    rules: [
      {
        type: "number",
        min: 0.0,
        max: 2.0,
        message: "Temperature must be between 0 and 2",
        step: 0.1,
      },
    ],
  },
  {
    name: "openAiPresence_penalty",
    label: "Presence Penalty (0 - 2)",
    subtitle:
      "This setting determines how much to penalize new tokens based on their appearance in the text so far. It increases the model's likelihood of discussing new topics.",
    rules: [
      {
        type: "number",
        min: 0.0,
        max: 2.0,
        message: "Presence Penalty must be between 0 and 2",
        step: 0.1,
      },
    ],
  },
  {
    name: "openAiFrequency_penalty",
    label: "Frequency Penalty (0 - 2)",
    subtitle:
      "This penalty controls how much new tokens are penalized according to their existing frequency in the text. It decreases the model's likelihood of repeating the same line verbatim.",
    rules: [
      {
        type: "number",
        min: 0.0,
        max: 2.0,
        message: "Frequency Penalty must be between 0 and 2",
        step: 0.1,
      },
    ],
  },
  {
    name: "openAiTopP",
    label: "Top P (0 - 1)",
    subtitle:
      "This is an alternative to sampling with temperature, known as nucleus sampling. Here, the model considers tokens that comprise the top P probability mass. For example, a value of 0.1 implies that only the tokens making up the top 10% of probability mass are considered.",
    rules: [
      {
        type: "number",
        min: 0.0,
        max: 1.0,
        message: "Top P must be between 0 and 1",
        step: 0.1,
      },
    ],
  },
  {
    name: "openAiMax_tokens",
    label: "Max Token (up to 16383 tokens)",
    subtitle:
      "This indicates the maximum number of tokens to generate before the process stops.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 16383,
        message: "Max Token must be up to 16383 tokens",
        step: 1,
      },
    ],
  },
  {
    name: "reasoningEffort",
    label: "Reasoning Effort (Reasoning models only)",
    subtitle:
      "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
  },
];

export const geminiAdvancedConfigData = [
  {
    name: "geminiTemperature",
    label: "Temperature (0 - 2)",
    subtitle:
      "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 2,
        message: "Temperature must be between 0 and 2",
        step: 0.1,
      },
    ],
  },
  {
    name: "geminiTopP",
    label: "Top P (0 - 1)",
    subtitle:
      "This is an alternative to sampling with temperature, known as nucleus sampling. Here, the model considers tokens that comprise the top P probability mass. For example, a value of 0.1 implies that only the tokens making up the top 10% of probability mass are considered.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 1,
        message: "Top P must be between 0 and 1",
        step: 0.1,
      },
    ],
  },
  {
    name: "geminiTopK",
    label: "Top K (1 - 100)",
    subtitle:
      "This setting allows sampling only from the top K options for each subsequent token. It is used to eliminate 'long tail' low-probability responses. The minimum value is 1.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 100,
        message: "Top K must be between 1 and 100",
        step: 1,
      },
    ],
  },
  {
    name: "geminiMaxOutputTokens",
    label: "Max Token (up to 8192 tokens)",
    subtitle:
      "This indicates the maximum number of tokens to generate before the process stops.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 8192,
        message: "Max Token must be up to 8192 tokens",
        step: 1,
      },
    ],
  },
  {
    name: "reasoningEffort",
    label: "Reasoning Effort (Reasoning models only)",
    subtitle:
      "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
  },
];

export const claudeAdvancedConfigData = [
  {
    name: "claudeAiTemperature",
    label: "Temperature (0 - 2)",
    subtitle:
      "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 2,
        message: "Temperature must be between 0 and 2",
        step: 0.1,
      },
    ],
  },
  {
    name: "ClaudeAIMaxToken",
    label: "Max Token (up to 64000 tokens)",
    subtitle: "This indicates the maximum number of tokens to generate before the process stops.",
    rules: [
      {
        type: "number",
        min: 0,
        max: 64000,
        message: "Max Token must be up to 64000 tokens",
        step: 1
      },
    ],
  },
  {
    name: "reasoningEffort",
    label: "Reasoning Effort (Reasoning models only)",
    subtitle:
      "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
  },
];

export const deepseekAdvancedConfigData = [
  {
    name: "deepseekTemperature",
    label: "Temperature (0 - 2)",
    subtitle:
      "Higher values, like 0.8, will result in more random output, while lower values, such as 0.2, will yield results that are more focused and deterministic.",
    rules: [
      {
        required: false,
        type: "number",
        min: 0,
        max: 2,
        step: 0.1,
      },
    ],
  },
  {
    name: "deepseekRepetitionPenalty",
    label: "Frequency Penalty (0 - 2)",
    subtitle:
      "This penalty controls how much new tokens are penalized according to their existing frequency in the text. It decreases the model's likelihood of repeating the same line verbatim.",
    rules: [
      {
        required: false,
        type: "number",
        min: 1,
        max: 2,
        step: 0.01,
      },
    ],
  },
  {
    name: "deepseekTopP",
    label: "Top P (0 - 1)",
    subtitle:
      "This is an alternative to sampling with temperature, known as nucleus sampling. Here, the model considers tokens that comprise the top P probability mass. For example, a value of 0.1 implies that only the tokens making up the top 10% of probability mass are considered.",
    rules: [
      {
        required: false,
        type: "number",
        min: 0,
        max: 1,
        step: 0.1,
      },
    ],
  },
  {
    name: "deepseekTopK",
    label: "Top K (1 - 100)",
    subtitle:
      "This setting allows sampling only from the top K options for each subsequent token. It is used to eliminate 'long tail' low-probability responses. The minimum value is 1.",
    rules: [
      {
        required: false,
        type: "number",
        min: 0,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    name: "deepseekMaxTokens",
    label: "Max Token (up to 16384 tokens)",
    subtitle:
      "This indicates the maximum number of tokens to generate before the process stops.",
    rules: [
      {
        required: false,
        type: "number",
        min: 0,
        max: 16384,
        message: "Max Token must be up to 16384 tokens",
        step: 10,
      },
    ],
  },
  {
    name: "reasoningEffort",
    label: "Reasoning Effort (Reasoning models only)",
    subtitle:
      "This setting constrains the effort on reasoning for reasoning models. Reducing the reasoning effort can lead to faster responses and fewer tokens used during reasoning in a response.",
  },
];
