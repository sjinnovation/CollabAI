import express from 'express';
import authenticateUser from '../middlewares/login.js';
import { createAssistantUsage, getAllAssistantUsageMonthly, getAllUsersForAnAssistant, getAllAssistantsWithUsageCount } from '../controllers/assistantUsageController.js';


const assistantUsageRoute = express.Router();
assistantUsageRoute.post('/:assistantId', authenticateUser, createAssistantUsage);
assistantUsageRoute.get('/get-assistant-usage-monthly', authenticateUser, getAllAssistantUsageMonthly);
assistantUsageRoute.get('/:assistantId', authenticateUser, getAllUsersForAnAssistant);
assistantUsageRoute.get('/usage-count/all', getAllAssistantsWithUsageCount);

export default assistantUsageRoute;
