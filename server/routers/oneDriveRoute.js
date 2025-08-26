import express from "express";

import authenticateUser from "../middlewares/login.js";
import { oneDriveInfoToKnowledgeBase } from "../controllers/oneDriveController.js";

const oneDriveRouter = express.Router();

oneDriveRouter.route('/files-to-knowledge-base').post(authenticateUser, oneDriveInfoToKnowledgeBase);


export default oneDriveRouter;
