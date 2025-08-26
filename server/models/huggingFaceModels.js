import mongoose from "mongoose";

const modelSchema = new mongoose.Schema(
  {
    nickname: {
      type: String,
      required: true,
      unique: true, 
    },
    name: {
      type: String,
      required: true,
      unique: true, 
    },
    inputOutputType: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true, 
    },
    temperature: {
      type: Number,
      required: true,
    },
    maxToken: {
      type: Number,
      required: true,
    },
    topP: {
      type: Number,
      default: 0.9,
    },
    topK: {
      type: Number,
      default: 50,
    },
    frequencyPenalty: {
      type: Number,
      default: 0,
    },
    presencePenalty: {
      type: Number,
      default: 1.2,
    },
    width: {
      type: Number,
      default: 512,
    },
    height: {
      type: Number,
      default: 512,
    },
    guidanceScale: {
      type: Number,
      default: 1,
    },
    seed: {
      type: Number,
      default: 42,
    },
    numInferenceSteps: {
      type: Number,
      default: 50,
    },
    maxSequenceLength: {
      type: Number,
      default: 512,
    },
    randomizeSeed: {
      type: Boolean,
      default: false,
    }, 
    image_url: {
      type: String,
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

const Model = mongoose.model("Model", modelSchema);

export default Model;