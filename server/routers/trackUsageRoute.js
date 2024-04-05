import express from "express";
import authenticateUser from '../middlewares/login.js';
import { getAllTrackUsageMonthly, getAllTrackUsageDaily } from "../controllers/trackUsageController.js";

const trackUsageRouter = express.Router();

trackUsageRouter.get('/get-all-track-usage-monthly', authenticateUser, getAllTrackUsageMonthly);
trackUsageRouter.get('/get-all-track-usage-daily', authenticateUser, getAllTrackUsageDaily);

export default trackUsageRouter;