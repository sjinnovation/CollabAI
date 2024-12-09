import express from "express";
import { createTechStack,getAllTechStack } from "../controllers/techStackController.js";

const router = express.Router();

router.post("/", createTechStack);
router.get("/", getAllTechStack);

export default router;