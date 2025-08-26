import mongoose, { Schema } from "mongoose";

const AssistantRatingSchema = mongoose.Schema(
    {
        assistantIdRef: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "assistant",
            required: true,
        },
        assistant_id: {
            type: String,
            required: true,
        },
        user_id: {
            type: String,
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        }
    },
    {
        timestamps: true,
    },

);

const AssistantRating = mongoose.model("assistantRating", AssistantRatingSchema);

export default AssistantRating;