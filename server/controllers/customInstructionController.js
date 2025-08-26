import {
    createCustomInstruction,
    deleteCustomInstructionById,
    getAllCustomInstructions,
    getCustomInstructionById,
    updateCustomInstructionById
} from "../service/customInstructionsService.js";



/**
 * @async
 * @function addCustomInstruction
 * @description
 * Creates a new custom instruction and saves it to the database.
 * 
 * @param {Object} req - Express request object with instruction data in body
 * @param {Object} res - Express response object with creation status
 * 
 * @returns {Response} 201 on success, 500 on server error
 */

// Controller to create a new custom instruction
export const addCustomInstruction = async (req, res) => {
    try {
        const instructionData = req.body;
        const newCustomInstruction = await createCustomInstruction(instructionData);
        res.status(201).json({
            message: "Custom instruction created successfully!",
            customInstruction: newCustomInstruction
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @async
 * @function getCustomInstructions
 * @description
 * Retrieves all custom instructions.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response returning instructions or error
 * 
 * @returns {Response} 200 with instructions list, 500 on error
 */

// Controller to get all custom instructions
export const getCustomInstructions = async (req, res) => {
    try {
        const instructions = await getAllCustomInstructions();
        res.status(200).json(instructions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @async
 * @function getCustomInstructionByIds
 * @description
 * Fetches a custom instruction by its ID.
 * 
 * @param {Object} req - Express request with params.instructionId
 * @param {Object} res - Express response returning the instruction or error
 * 
 * @returns {Response} 200 with instruction data, 404 if not found, 500 on error
 */

// Controller to get a custom instruction by ID
export const getCustomInstructionByIds = async (req, res) => {
    const { instructionId } = req.params;

    try {
        const customInstruction = await getCustomInstructionById(instructionId);
        if (!customInstruction) {
            return res.status(404).json({ message: "Custom instruction not found" });
        }
        res.status(200).json(customInstruction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * @async
 * @function updateCustomInstruction
 * @description
 * Updates a custom instruction by ID with given data.
 * 
 * @param {Object} req - Express request with params.id and body data.
 * @param {Object} res - Express response with update result.
 * 
 * @returns {Response} 200 if updated, 404 if not found, 500 on error.
 */

// Controller to update a custom instruction
export const updateCustomInstruction = async (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    try {
        const updatedCustomInstruction = await updateCustomInstructionById(id, updatedData);
        if (!updatedCustomInstruction) {
            return res.status(404).json({ message: "Custom instruction not found" });
        }
        res.status(200).json({ message: "Custom instruction updated successfully", customInstruction: updatedCustomInstruction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/**
 * Deletes a custom instruction by its ID.
 *
 * @param {Object} req - Express request object with param `id` as the instruction ID.
 * @param {Object} res - Express response object used to send status and message.
 * 
 * @returns {Response} 200 if deleted, 404 if not found, 500 on server error.
 */

// Controller to delete a custom instruction
export const deleteCustomInstruction = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedCustomInstruction = await deleteCustomInstructionById(id);
        if (!deletedCustomInstruction) {
            return res.status(404).json({ message: "Custom instruction not found" });
        }
        res.status(200).json({ message: "Custom instruction deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};