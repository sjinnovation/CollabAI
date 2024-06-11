import mongoose from "mongoose";

const PinnedAssistantModelSchema =mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        required : true
    },
    assistantId:{
        type : String,
        required : true
    }
});

const PinnedAssistant = mongoose.model("pinned-assistant",PinnedAssistantModelSchema);

export default PinnedAssistant;