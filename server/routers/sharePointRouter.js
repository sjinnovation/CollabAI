import express from "express";
import { sharePointInfoToKnowledgeBase } from "../controllers/sharePointController.js";

const sharePointRouter = express.Router();

sharePointRouter.route('/files-to-knowledge-base').post(sharePointInfoToKnowledgeBase);

export default sharePointRouter;