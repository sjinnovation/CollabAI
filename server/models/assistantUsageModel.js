import mongoose from "mongoose";

const assistantUsageSchema = mongoose.Schema(
    {
        assistantId: { 
            type: String,
            ref: 'Assistant' 
        },
        userId: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' 
        },
        usageCount: { 
            type: Number, 
            default: 1 
        }
    }, 
    { timestamps: true }
);

const AssistantUsage = mongoose.model("AssistantUsage", assistantUsageSchema);

export default AssistantUsage;
