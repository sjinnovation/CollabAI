import mongoose, { Schema } from "mongoose";

const publicAssistant = new Schema({
    assistant_id: {
        type: String,
        required: true
    },
    creators_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    is_featured: {
        type: Boolean,
        required: false,
        default: false

    },
    count: {
        type: Number,
        required: false,
        default: 0
    }
});

const PublicAssistant = mongoose.model('public_assistant', publicAssistant);

export default PublicAssistant;

