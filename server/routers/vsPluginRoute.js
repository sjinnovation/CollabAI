import express from 'express';
import { signup, trackUsage, getUsage,getUsageForTower, savePrompt, getThreadList, getThreadsById } from '../controllers/vsPluginController.js';
import vsPluginMiddleware from '../middlewares/vsPluginMiddleware.js';


const vsPluginRouter = express.Router();

// User signup
vsPluginRouter.post('/signup', signup);

//user track usage
vsPluginRouter.post('/trackUsage', vsPluginMiddleware, trackUsage);

// Get usage report
vsPluginRouter.get('/getUsage', getUsage);

//Get usage for SJ Control Tower
vsPluginRouter.get('/getUsageForTower', getUsageForTower);

// save prompt to db
vsPluginRouter.post("/save-prompt", vsPluginMiddleware, savePrompt);

// get all the threads for a user
vsPluginRouter.get('/get-threads', vsPluginMiddleware, getThreadList);

// get thread by id threadid
vsPluginRouter.get('/get-thread-by-id', vsPluginMiddleware, getThreadsById);


export default vsPluginRouter;