import { Int32 } from "mongodb";
import mongoose from "mongoose";

const KnowledgeBaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    size:{
        type : Number,
        required : true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    s3_link: {
        type: String,
        required: true,
    },
    isPublic:{
        type:Boolean,
        default : false,
        required : false
    },
    spaceIndex : {
        type: Array,
        default: [],
    },

}, 
{ timestamps: true }


);

const KnowledgeBase = mongoose.model("KnowledgeBase", KnowledgeBaseSchema);

export default KnowledgeBase;
