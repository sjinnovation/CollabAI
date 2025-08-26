import CustomInstruction from "../models/customInstructionsModel.js";


// Create a new custom instruction
export const createCustomInstruction = async (instructionData) => {
    const customInstruction = new CustomInstruction(instructionData);
    return await customInstruction.save();
};

// Get all custom instructions
export const getAllCustomInstructions = async () => {
    return await CustomInstruction.find();
};

// Get a custom instruction by ID
export const getCustomInstructionById = async (id) => {
    return await CustomInstruction.findById(id);
};

// Update a custom instruction by ID
export const updateCustomInstructionById = async (id, updatedData) => {
    return await CustomInstruction.findByIdAndUpdate(id, updatedData, { new: true, runValidators: true });
};

// Delete a custom instruction by ID
export const deleteCustomInstructionById = async (id) => {
    return await CustomInstruction.findByIdAndDelete(id);
};