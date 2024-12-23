import express from "express";
import authenticateUser from "../middlewares/login.js";
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectsByTeam,
  getProjectsByClient,getProjectByProjectId,
  searchByAllFields
} from "../controllers/projectController.js"; // Use `import` instead of `require`


const projectrouter = express.Router();
projectrouter.get('/project/:id', getProjectByProjectId);

projectrouter.get("/", getAllProjects);
projectrouter.get("/client/:id",authenticateUser, getProjectById);
projectrouter.post("/",authenticateUser, createProject);
projectrouter.put("/:id",authenticateUser, updateProject);
projectrouter.delete("/:id",authenticateUser, deleteProject);
projectrouter.get('/team/:teamId', getProjectsByTeam);
projectrouter.get('/client/:clientId', getProjectsByClient);
projectrouter.get('/search/', searchByAllFields);
export default projectrouter;
