import express from "express";
import authenticateUser from "../middlewares/login.js";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByTeam,
  getProjectsByClient,
} from "../controllers/projectController.js"; // Use `import` instead of `require`

const projectrouter = express.Router();

projectrouter.get("/", getAllProjects);
projectrouter.get("/:id", getProjectById);
projectrouter.post("/", createProject);
projectrouter.put("/:id", updateProject);
projectrouter.delete("/:id", deleteProject);
projectrouter.get('/team/:teamId', getProjectsByTeam);
projectrouter.get('/client/:clientId', getProjectsByClient)

export default projectrouter;
