import express from 'express';
import { writeToGoogleSheet } from '../controllers/googleSheetController.js';

const googleSheetRouter = express.Router();

googleSheetRouter.post('/write-to-sheet', writeToGoogleSheet);

export default googleSheetRouter;