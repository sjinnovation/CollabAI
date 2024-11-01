import mongoose from "mongoose";
const AssistantTypesSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    delete: {
        type: Boolean,
        default: false,
        required : false
    },
}, {
    timestamps: true,
},);
const AssistantTypes = mongoose.model("assistant-Types", AssistantTypesSchema);
export default AssistantTypes;