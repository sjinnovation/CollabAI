import mongoose from "mongoose";

const AISuggestionBatchProcessingHistorySchema = mongoose.Schema(
    {
        batchId: {
            type: String,
            required: true,
        },
        status: {   
            type: String,
            enum: ["pending", "in_progress", "completed", "failed", "validating", "expired", "cancelling", "cancelled"],
            default: "pending",
        },
        startTime: {
            type: Date,
            default: Date.now,
        },
        endTime: {
            type: Date,
            default: null,
        },
        error: {
            type: Array,
            default: [],
        },
        processedUsers: {
            type: Number,
            default: 0,
        },
        totalUsers: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
const AISuggestionBatchProcessingHistory = mongoose.model("ai-suggestion-batch-processing-history", AISuggestionBatchProcessingHistorySchema);

export default AISuggestionBatchProcessingHistory;