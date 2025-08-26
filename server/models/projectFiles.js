import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
    {
        folderId: {
            type: String,
            required: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        fileName: {
            type: String,
            required: true
        },
        s3Key :{
            type: String,
            required: true 
        },
        threadId :{
            type: String,
            required: true
        },
        messageId :{
            type: String,
            required: true
        }

    },
    { timestamps: true }
);

const Project = mongoose.model("Project", projectSchema);
export default Project;