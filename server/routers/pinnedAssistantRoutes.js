import { getAllPinnedAssistant, getSinglePinnedAssistant,getSingleUsersPinnedAssistWithDetails,addPinnedAssistant,deleteSinglePinnedAssistant} from '../controllers/pinnedAssistantController.js';
import express from 'express'
import authenticateUser from '../middlewares/login.js';
const pinnedRouter = express.Router();

pinnedRouter.route('/').get(authenticateUser, getAllPinnedAssistant);
pinnedRouter.get('/:id', authenticateUser, getSinglePinnedAssistant);
pinnedRouter.get('/:id/info', authenticateUser, getSingleUsersPinnedAssistWithDetails);
pinnedRouter.post('/', authenticateUser, addPinnedAssistant);
pinnedRouter.delete('/:id', authenticateUser, deleteSinglePinnedAssistant);
export default pinnedRouter;