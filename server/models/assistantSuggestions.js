import mongoose from "mongoose";

const AssistantSuggestionsSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true,
    index: true,
  },
  suggested_assistants: [{
    assistant_id: {
      type: String,
      required: true,
    },
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    assistantTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    instructions: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    reason: {
      type: String,
      required: false,
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

AssistantSuggestionsSchema.index({ role: 1 }, { unique: true });

const AssistantSuggestions = mongoose.model("AssistantSuggestions", AssistantSuggestionsSchema);
export default AssistantSuggestions;
