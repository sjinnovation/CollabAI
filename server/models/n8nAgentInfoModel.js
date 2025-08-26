import e from "express";
import mongoose from "mongoose";
const n8nAgentInfoSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
        threadId: {
            type: String,
            required: false,
        },
        agentId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);
const n8nAgentInfoModel = mongoose.model("N8nAgentInfo", n8nAgentInfoSchema);
export default n8nAgentInfoModel;
