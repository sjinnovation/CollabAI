import express from "express";
const taskCommandRouter = express.Router();
import authenticateUser from "../middlewares/login.js";
import {
  createTaskCommand,
  getAllTaskCommands,
  updateTaskCommandById,
  getTaskCommandById,
  deleteTaskCommandById,
  getTaskCommandsGroupedByCategory,
} from "../controllers/taskCommandController.js";

taskCommandRouter.post("/", authenticateUser, createTaskCommand);
taskCommandRouter.get("/", authenticateUser, getAllTaskCommands);
taskCommandRouter.get("/:id", authenticateUser, getTaskCommandById);
taskCommandRouter.patch("/:id", authenticateUser, updateTaskCommandById);
taskCommandRouter.delete("/:id", authenticateUser, deleteTaskCommandById);
taskCommandRouter.get("/groupBy/category", authenticateUser, getTaskCommandsGroupedByCategory);
export default taskCommandRouter;
