import express from 'express';
import { fetchAndSyncDvDsSheet, fetchDvDsData } from '../controllers/activeCollabController.js';

const activeCollabRouter = express.Router();

activeCollabRouter.post('/sync-dvds-sheet', fetchAndSyncDvDsSheet);

activeCollabRouter.get('/fetch-dvds-data', fetchDvDsData);

export default activeCollabRouter;