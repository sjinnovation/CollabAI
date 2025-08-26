import mongoose from "mongoose";

const WebCrawlKnowledgeBaseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    size:{
        type : Number,
        required : false
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
    title :{
        type : String,
        required : true,
    },
    url :{
        type : String,
        required : true,
    },

}, 
{ timestamps: true }


);

const WebCrawlKnowledgeBase = mongoose.model("WebCrawlKnowledgeBase", WebCrawlKnowledgeBaseSchema);

export default WebCrawlKnowledgeBase;
