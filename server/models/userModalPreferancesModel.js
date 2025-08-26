import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userPreferences = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    openAiTemperature: {
      type: Number,
      required: false,
    },
    openAiMax_tokens: {
      type: Number,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
      required: false,
    },
    openAiFrequency_penalty: {
      type: Number,
      required: false,
    },
    openAiPresence_penalty: {
      type: Number,
      required: false,
    },
    openAiTopP:{
        type: Number,
        required: false
    },
    claudeAiTemperature: {
      type: Number,
      required: false,
    },
    ClaudeAIMaxToken: {
      type: Number,
      required: false,
    },
    geminiTemperature: {
      type: Number,
      required: false,
    },
    geminiTopK: {
      type: Number,
      required: false,
    },
    geminiTopP: {
      type: Number,
      required: false,
    },  
    geminiMaxOutputTokens: {
      type: Number,
      required: false,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    deepseekModel: {
      type: String,
      required: false,
    },
    deepseekTemperature: {
      type: Number,
      required: false,
    },
    deepseekMaxTokens: {
      type: Number,
      required: false,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    deepseekTopP: {
      type: Number,
      required: false,
    },
    deepseekTopK: {
      type: Number,
      required: false,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
    },
    deepseekRepetitionPenalty: {
      type: Number,
      required: false,
    },
  },
  { timestamp: true }
);

const userTokenPreferences = mongoose.model("userPreferences", userPreferences);
export default userTokenPreferences;
