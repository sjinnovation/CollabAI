import mongoose, { Schema } from "mongoose";

const PromptFeedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    feedback: {
      type: Array,
      default: [],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "prompt_feedbacks",
    timestamps: false, // Using custom createdAt
  }
);

const PromptFeedbackModel = mongoose.model("PromptFeedback", PromptFeedbackSchema);

export default PromptFeedbackModel;