import mongoose, { Schema } from "mongoose";

const PromptPatternSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User", // Reference your User model, adjust collection if needed
      index: true,
    },
    batchIndex: {
      type: Number,
      required: true,
      index: true,
    },
    pattern: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "prompt_patterns",
    timestamps: false, // Using custom createdAt, not auto-timestamps
  }
);

const PromptPatternModel = mongoose.model("PromptPattern", PromptPatternSchema);

export default PromptPatternModel;