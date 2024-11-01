import express from "express";

import authenticateUser from "../middlewares/login.js";
import { deleteGoogleAuthCredentials, downloadAllGoogleDriveFiles, getGoogleAuthCredentials, googleAuth, googleDriveInfoToKnowledgeBase } from "../controllers/googleAuth.js";

const googleDriveRouter = express.Router();

googleDriveRouter.route('/google-drive-to-knowledgebase').post(authenticateUser, googleDriveInfoToKnowledgeBase);
googleDriveRouter.route('/').post(authenticateUser, googleAuth);
googleDriveRouter.get('/sync-files/:userId', authenticateUser, downloadAllGoogleDriveFiles);
googleDriveRouter.get('/:userId', authenticateUser, getGoogleAuthCredentials);
googleDriveRouter.delete('/:userId', authenticateUser, deleteGoogleAuthCredentials);




export default googleDriveRouter;
