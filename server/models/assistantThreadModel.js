import mongoose, { Schema } from "mongoose";

const AssistantThreadSchema = mongoose.Schema(
    {
        assistant_id: {
            type: String,
            required: true,
        },
        thread_id: {
            type: String,
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "Users",
            required: true,
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        title: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const AssistantThread = mongoose.model(
    "assistant_threads",
    AssistantThreadSchema
);

export default AssistantThread;
