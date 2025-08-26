import AISuggestionBatchProcessing from "../models/ai-suggestion-batch-processing";
import AISuggestion from "../models/ai-suggestion-settings";
import PromptFeedbackModel from "../models/promptFeedbacks";

export const getAISuggestionSettings = async () => {
    try {
        const settings = await AISuggestion.findOne({});
        if (!settings) {
            throw new Error("AI Suggestion Settings not found");
        }
        return settings;
    } catch (error) {
        console.error("Error fetching AI Suggestion Settings:", error);
        throw new Error("Internal Server Error");
    }
};

export const updateAISuggestionSettings = async (settings) => {
    try {
        if (!settings) {
            throw new Error("Settings data is required");
        }
        const updatedSettings = await AISuggestion.findOneAndUpdate({}, settings, { new: true, upsert: true });
        return updatedSettings;
    } catch (error) {
        console.error("Error updating AI Suggestion Settings:", error);
        throw new Error("Internal Server Error");
    }
};

export const getAISuggestionBatchProcessing = async () => {
    try {
        const batchProcessing = await AISuggestionBatchProcessing.find({});
        if (!batchProcessing || batchProcessing.length === 0) {
            throw new Error("No AI Suggestion Batch Processing records found");
        }
        return batchProcessing;
    } catch (error) {
        console.error("Error fetching AI Suggestion Batch Processing records:", error);
        throw new Error("Internal Server Error");
    }
};

export const updateAISuggestionBatchProcessing = async (batchId, updates) => {
    try {
        if (!batchId || !updates) {
            throw new Error("Batch ID and updates are required");
        }
        const updatedBatch = await AISuggestionBatchProcessing.findOneAndUpdate({ batchId }, updates, { new: true, upsert: true });
        if (!updatedBatch) {
            throw new Error("Batch not found");
        }
        return updatedBatch;
    } catch (error) {
        console.error("Error updating AI Suggestion Batch Processing:", error);
        throw new Error("Internal Server Error");
    }
};
export const getPromptSuggestion = async (userId) => {
    try {
        if (!userId) {
            throw new Error("User ID is required");
        }
        const suggestions = await PromptFeedbackModel.findOne({
            userId: userId
        });
        if (!suggestions) {
            throw new Error("No suggestions found for this user");
        }
        return suggestions;
    } catch (error) {
        console.error("Error fetching prompt suggestions:", error);
        throw new Error("Internal Server Error");
    }
};