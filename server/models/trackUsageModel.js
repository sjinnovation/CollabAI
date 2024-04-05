import mongoose, { Schema } from "mongoose";

const trackUsageSchema = mongoose.Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "User",
        },
        input_token: {
            type: String,
            required: true
        },
        output_token: {
            type: String,
            required: true
        },
        model_used: {
            type: String,
            required: true
        },
        input_token_price: {
            type: Number,
            required: true
        },
        output_token_price: {
            type: Number,
            required: true
        },
        total_token_cost: {
            type: Number,
            required: true
        },
        total_tokens: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

const TrackUsage = mongoose.model("TrackUsage", trackUsageSchema);

export default TrackUsage;
