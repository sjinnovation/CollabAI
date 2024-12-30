import express from "express";
import { createTechStack, getAllTechStack, getTechStackById } from "../controllers/techStackController.js";
import authenticateUser from "../middlewares/login.js";

const techstackrouter = express.Router();

techstackrouter.post("/", authenticateUser, createTechStack);
techstackrouter.get("/", authenticateUser, getAllTechStack);
techstackrouter.get("/:id",authenticateUser, getTechStackById); // New route to get a tech stack by ID

export default techstackrouter;
