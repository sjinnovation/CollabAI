import mongoose from "mongoose";

const AiPersonaSchema = new mongoose.Schema(
  {
    personaName: {
        type: String,
        required: true,
      },
      avatar: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAs: {
        type: String,
        required: true,
      },
      isActive: {
        type: Boolean,
        default: false,
      },
      image_url: {
        type: String,
        required: false,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
      isFeatured: { 
        type: Boolean,
        default: false,
      },
  },
  { timestamps: true }
);

const AiPersona = mongoose.model("AiPersona", AiPersonaSchema);

export default AiPersona;
