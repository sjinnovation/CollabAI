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
projectrouter.get('/project/:id',authenticateUser, getProjectByProjectId);

projectrouter.get("/",authenticateUser, getAllProjects);
projectrouter.get("/client/:id",authenticateUser, getProjectById);
projectrouter.post("/",authenticateUser, createProject);
projectrouter.put("/:id",authenticateUser, updateProject);
projectrouter.delete("/:id",authenticateUser, deleteProject);
projectrouter.get('/team/:teamId',authenticateUser, getProjectsByTeam);
projectrouter.get('/client/:clientId',authenticateUser, getProjectsByClient);
projectrouter.get('/search/',authenticateUser, searchByAllFields);
export default projectrouter;
