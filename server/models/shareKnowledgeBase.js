import mongoose from "mongoose";

const ShareKnowledgeBaseSchema = new mongoose.Schema({
    knowledgeBaseId: { // folder id
        type: mongoose.Schema.Types.ObjectId,
        ref: 'KnowledgeBase',
        required: true,
    },
    owner: { // creator of the folder
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    collaborator: { // got access user
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    permissions: {
        upload: { type: Boolean, default: true }, // Permission to upload files
        deleteOwn: { type: Boolean, default: true }, // Permission to delete their own files
        move: { type: Boolean, default: true }, // Permission to move files they uploaded
        view: { type: Boolean, default: true }, // Permission to view the folder
        deleteShared: { type: Boolean, default: false }, // Permission to delete files not owned by them
        share: { type: Boolean, default: false } // Permission to share the folder with others
    }
}, 
{ timestamps: true }
);

const ShareKnowledgeBase = mongoose.model("ShareKnowledgeBase", ShareKnowledgeBaseSchema);

export default ShareKnowledgeBase;
