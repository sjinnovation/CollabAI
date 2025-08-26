import mongoose from "mongoose";

const customInstructionsSchema = new mongoose.Schema(
    {
        imageURL: {
            type: String,
            required: true,
        },
        instructionTitle: {
            type: String,
            required: true,
        },
        instruction: {
            type: String,
            required: true,
        },
        isActive: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const CustomInstruction = mongoose.model("CustomInstruction", customInstructionsSchema);
export default CustomInstruction;