import express from "express";
import authenticateUser from '../middlewares/login.js';
import { getAllTrackUsageMonthly, getAllTrackUsageDaily,getTrackUsage, getAssistantUsage } from "../controllers/trackUsageController.js";

const trackUsageRouter = express.Router();

trackUsageRouter.get('/get-all-track-usage-monthly', authenticateUser, getAllTrackUsageMonthly);
trackUsageRouter.get('/get-all-track-usage-daily', authenticateUser, getAllTrackUsageDaily);
trackUsageRouter.get('/track-usage', authenticateUser, getTrackUsage);
trackUsageRouter.get('/assistant-usage', authenticateUser, getAssistantUsage);

export default trackUsageRouter;