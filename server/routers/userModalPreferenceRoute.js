import express from 'express';
const userPreferenceRouter = express.Router();
import {
	getAllModelConfigurations,
	updateAllModelConfigurations,
} from '../controllers/userModalPreferanceController.js';

import authenticateUser from '../middlewares/login.js';

userPreferenceRouter.get('/settings', authenticateUser, getAllModelConfigurations).patch('/settings',authenticateUser, updateAllModelConfigurations);

export default userPreferenceRouter;
