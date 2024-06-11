import express from "express";
const commandsCategoryRouter = express.Router();
import { authenticateSuperAdmin } from '../middlewares/superadminAuth.js';
import {
  addCommandCategory,
  getAllCommandCategories,
} from "../controllers/commandsCategoryController.js";

commandsCategoryRouter.post("/", authenticateSuperAdmin, addCommandCategory);
commandsCategoryRouter.get("/", getAllCommandCategories);

export default commandsCategoryRouter;
