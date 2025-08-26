import mongoose, { Schema } from "mongoose";

const AISuggestionSchema = mongoose.Schema(
    {
        enableAISuggestion: {
            type: Boolean,
            default: false,
        },
        promptPerUser: {
            type: Number,
            default: 5,
        },
        maxFeaturedAgents: {
            type: Number,
            default: 5,
        },
        cronSuggestionFrequency : {
            type: String,
            default: "daily", // Default to daily at midnight
        },
        cronTime: {
            type: String,
            default: "0 0 * * *", // Default to daily at midnight
        },
        openAIBatchModel: {
            type: String,
            default: "gpt-4o-mini",
        },
        batchModelSystemPrompt: {
            type: String,   
            default: "You are an AI assistant that helps users find relevant assistants based on their needs.",
        },
        batchModelUserPrompt: {
            type: String,
            default: "Please provide a brief description of your needs or the task you want assistance with.",
        },
        maxTokenPerUserForProcessing: {
            type: Number,
            default: 1000,
        },
        batchSize: {
            type: Number,
            default: 10,
        },
        dataRetentionPeriod: {
            type: Number,
            default: 30, // Default to 30 days
        },
        lastBatchRunId: {
            type: String,
            required: false,
            default: null,
        },
        isBatchCompleted: {
            type: Boolean,
            default: false,
        },
        batchModelExamples : {
            type: [String],
            default: [
                "When asking coding questions, include language version and relevant dependencies for more accurate answers.",
                "For creative tasks, provide 1-2 examples of the style/tone you're looking for to get better results.",
                "Instead of asking multi-part questions, try separating them into individual prompts for clearer responses.",
                "When requesting data, mention if you need JSON, tables, or bullet points to get properly structured responses."
            ]
        },
    },
    {
        timestamps: true,
    },

);

const AISuggestion= mongoose.model("ai-suggestion-settings", AISuggestionSchema);

export default AISuggestion;
