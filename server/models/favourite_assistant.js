import mongoose, { Schema } from "mongoose";

const favouriteAssistant = new Schema({
    assistant_id: {
        type: String,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    }
});

const FavouriteAssistant = mongoose.model('favourite_assistant', favouriteAssistant);

export default FavouriteAssistant;

