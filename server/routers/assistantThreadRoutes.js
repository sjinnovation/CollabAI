import express from 'express';
import authenticateUser from '../middlewares/login.js';
import {
    getAssistantThreadsPerUser,
    updateAssistantThread,
    deleteAssistantThread,
    getAssistantThreadsById
} from '../controllers/assistantThreadController.js';

const router = express.Router();

router.get('/', authenticateUser, getAssistantThreadsPerUser);
router.get('/:threadId', getAssistantThreadsById);
router.patch('/:id', authenticateUser, updateAssistantThread);
router.delete('/:id', authenticateUser, deleteAssistantThread);

export default router;