import express from 'express';
import {
    addCustomInstruction,
    deleteCustomInstruction,
    getCustomInstructionByIds,
    getCustomInstructions,
    updateCustomInstruction
} from '../controllers/customInstructionController.js';


const customInstructionsRouter = express.Router();

customInstructionsRouter.post('/', addCustomInstruction);
customInstructionsRouter.get('/', getCustomInstructions);
customInstructionsRouter.get('/:instructionId', getCustomInstructionByIds);
customInstructionsRouter.put('/:id', updateCustomInstruction);
customInstructionsRouter.delete('/:id', deleteCustomInstruction);

export default customInstructionsRouter;