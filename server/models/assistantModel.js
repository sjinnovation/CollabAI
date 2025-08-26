import mongoose, { Schema } from "mongoose";

const AssistantSchema = mongoose.Schema(
    {
        assistant_id: {
            type: String,
            required: true,
        },
        vectorStoreId: {
            type: String,
            // required: true,
        },
        name: {
            type: String,
            required: true,
        },
        model: {
            type: String,
            required: true,
        },
        description: {
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
        assistantApiId: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "service_api",
                required: false,
            },
        ],
        assistantApiServiceids: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "ServiceList",
                required: false,
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
        imageType: {
            type: String,
            enum: ['DEFAULT', 'UPLOAD', 'DALLE'],
            required: false,
        },
        dalleImageDescription: {
            type: String,
            required: false,
        },
        is_public: {
            type: Boolean,
            default: false
        },

        is_featured: {
            type: Boolean,
            default: false
        },
        is_pinned: {
            type: Boolean,
            default: false
        },
        assistantTypes:
        {
            type: String,
            required: true,
        },
        assistantTypeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AssistantTypes",
            required: false,
        },
        functionCalling: {
            type: Boolean,
            required: false,
            default: false,
        },
        functionDefinitionIds: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "FunctionDefinition",
                required: false
            }
        ],
        connectApps: [
            {
                workBoard: {
                    type: Boolean,
                    required: false,
                },
                googleDrive: {
                    type: Boolean,
                    required: false,
                },
                importWebPages: {
                    type: Boolean,
                    required: false,
                },
                _id: false
            }
        ],
        plugins: [
            {
                type: {
                    type: String,
                    required: true,
                },

            },
        ],
        selectedassistantIds:{
            type: [String],
            default: [],
            required: false
        },
        // n8n integration fields - only keep selectedWorkflowIds since n8n credentials are now stored in user model
        selectedWorkflowIds: {
            type: [String],
            default: [],
            required: false,
        },
    },
    {
        timestamps: true,
    },

);

const Assistant = mongoose.model("assistant", AssistantSchema);

export default Assistant;
