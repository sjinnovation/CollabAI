import express from 'express';
import { storeClientLog } from '../../controllers/logger/socketController.js';

const router = express.Router();

// Store client logs
router.post('/socket', storeClientLog);

// Get logs for analysis (optional - for debugging)
//router.get('/api/client-logs', getLogs);

// Get error statistics
//router.get('/api/client-logs/stats', getErrorStats);

export default router;