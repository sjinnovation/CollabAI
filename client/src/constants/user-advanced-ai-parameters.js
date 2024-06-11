export const openAIAdvancedConfigData = [
  {
    name: "openAiTemperature",
    label: "Temperature (between 0 and 1)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 1,
        message: "Temperature must be between 0 and 1",
      },
    ],
  },
  {
    name: "openAiPresence_penalty",
    label: "Presence Penalty (between 0 and 2)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 2,
        message: "Presence Penalty must be between 0 and 2",
      },
    ],
  },
  {
    name: "openAiFrequency_penalty",
    label: "Frequency Penalty (between 0 and 2)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 2,
        message: "Frequency Penalty must be between 0 and 2",
      },
    ],
  },
  {
    name: "openAiMax_tokens",
    label: "Max Token (up to 4096 tokens)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 4096,
        message: "Max Token must be up to 4096 tokens",
      },
    ],
  },
  {
    name: "openAiTopP",
    label: "Top P (between 0 and 1)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 1,
        message: "Top P must be between 0 and 1",
      },
    ],
  },
];

export const geminiAdvancedConfigData = [
  {
    name: "geminiTemperature",
    label: "Temperature (between 0 and 1)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 1,
        message: "Temperature must be between 0 and 1",
      },
    ],
  },
  {
    name: "geminiTopK",
    label: "Top K (between 1 and 40)",
    rules: [
      {
        type: "number",
        min: 1,
        max: 40,
        message: "Top K must be between 1 and 40",
      },
    ],
  },
  {
    name: "geminiTopP",
    label: "Top P (between 0 and 1)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 1,
        message: "Top P must be between 0 and 1",
      },
    ],
  },
  {
    name: "geminiMaxOutputTokens",
    label: "Max Token (up to 2048 tokens)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 2048,
        message: "Max Token must be up to 2048 tokens",
      },
    ],
  },
];

export const claudeAdvancedConfigData = [
  {
    name: "claudeAiTemperature",
    label: "Temperature (between 0 and 1)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 1,
        message: "Temperature must be between 0 and 1",
      },
    ],
  },
  {
    name: "ClaudeAIMaxToken",
    label: "Max Token (up to 4096 tokens)",
    rules: [
      {
        type: "number",
        min: 0,
        max: 4096,
        message: "Max Token must be up to 4096 tokens",
      },
    ],
  },
];