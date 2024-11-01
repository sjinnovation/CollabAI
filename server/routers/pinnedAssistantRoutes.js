import { getAllPinnedAssistant, getSinglePinnedAssistant,getSingleUsersPinnedAssistWithDetails,addPinnedAssistant,deleteSinglePinnedAssistant,deleteManyPinnedAssistant} from '../controllers/pinnedAssistantController.js';
import express from 'express'
import authenticateUser from '../middlewares/login.js';
const pinnedRouter = express.Router();

pinnedRouter.route('/').get(authenticateUser, getAllPinnedAssistant);
pinnedRouter.get('/:id', authenticateUser, getSinglePinnedAssistant);
pinnedRouter.get('/:id/info', authenticateUser, getSingleUsersPinnedAssistWithDetails);
pinnedRouter.post('/', authenticateUser, addPinnedAssistant);
pinnedRouter.delete('/:assistantId/:userId', authenticateUser, deleteSinglePinnedAssistant);
pinnedRouter.delete('/:assistantId', authenticateUser, deleteManyPinnedAssistant);

export default pinnedRouter;