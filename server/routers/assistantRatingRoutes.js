import express from 'express'
import { createAssistantRating, getAssistantRating, getAllAssistantRating, getAssistantRatingByUserId } from '../controllers/assistantRatingController.js';
import { getAllAssistantRatingService } from '../service/assistantRatingService.js';
import authenticateUser from '../middlewares/login.js';

const router = express.Router();

router.get("/", authenticateUser, getAllAssistantRating);
router.post("/:assistantId", authenticateUser, createAssistantRating);
router.get("/:assistantId", authenticateUser, getAssistantRating);
router.get("/user/:assistantId", authenticateUser, getAssistantRatingByUserId);

export default router;