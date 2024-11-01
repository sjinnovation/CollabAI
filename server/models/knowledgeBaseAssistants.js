import { Type } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
const KnowledgeBaseAssistantsSchema = mongoose.Schema({
    assistantId: {
        type: String,
        ref: 'Assistant',
        required: true,
    },
    assistantObjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assistant',
        required: true,
    },
    knowledgeBaseId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase',
        required: true,
    }],
    file_ids: {
        type: Array,
        default: [],
    },
    knowledgeSource: {
        type: Boolean,
        default: false,

    }
},
    { timestamps: true }

);

const KnowledgeBaseAssistants = mongoose.model("KnowledgeBaseAssistants", KnowledgeBaseAssistantsSchema);
export default KnowledgeBaseAssistants;
