import mongoose, { Schema } from "mongoose";

const AssistantSchema = mongoose.Schema(
    {
        assistant_id: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        description:{
            type: String,
            required: false,
        },
        instructions: {
            type: String
        },
        file_ids: {
            type: Array,
            default: [],
        },
        is_deleted: {
            type: Boolean,
            default: false,
        },
        model:
        {
            type: String,
            required: false,
        },
        teamId: [
            { 
              
              type: mongoose.Schema.Types.ObjectId,
              ref: "Teams",
              
            },
          ],
          static_questions: [
            {
                type: String,
                required: false,
            }
        ],
        is_active: {
            type: Boolean,
            default: false
        },
        tools: [
            {
                type: {
                    type: String,
                    required: true,
                },
            },
        ],
        category: {
            type: String,
            enum: ["ORGANIZATIONAL", "PERSONAL"],
            required: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: false,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", 
            required: false,
        },
        image_url: {
            type: String,
            required: false,
        },
        functionCalling: {
            type: Boolean,
            required: false,
            default: false,
          },

    },
    {
        timestamps: true,
    },
  
);

const Assistant = mongoose.model("assistant", AssistantSchema);

export default Assistant;
