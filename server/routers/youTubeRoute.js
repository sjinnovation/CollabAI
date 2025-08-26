import express from "express";
import { createYouTubeTranscriptKnowledgeBase } from "../controllers/youTubeController.js";
const youTubeTranscriptRouter = express.Router();
youTubeTranscriptRouter.post('/knowledge-base', createYouTubeTranscriptKnowledgeBase);

export default youTubeTranscriptRouter;