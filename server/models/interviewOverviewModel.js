import mongoose, { Schema } from "mongoose";

const InterviewOverviewSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        threadId: {
            type: String,
            required: true,
        },
        assistant_id: {
            type: String,
            required: true, 
        },
        overview: {
            type: Object,
            required: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        submissionDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        totalMessages: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const InterviewOverview = mongoose.model("interview_overview", InterviewOverviewSchema);

export default InterviewOverview; 