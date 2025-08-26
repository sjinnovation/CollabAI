import mongoose from "mongoose";
const WorkBoardSyncSchema = mongoose.Schema({
    knowledgeBaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase',
        required: true,
    },
    useCaseData: [
        {
            opeanaiFileId: {
                type: String,
                required: true,
                default: "",

            },
            assistantId: {
                type: String,
                required: true,
                default: "",

            },
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            }
        }

    ],

}, {
    timestamps: true,
},);
const WorkBoardSync = mongoose.model("WorkBoardSync", WorkBoardSyncSchema);
export default WorkBoardSync;
