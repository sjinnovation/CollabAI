import express from 'express';
import { getProjectTeamMembers } from '../controllers/projectTeamController.js';
import authenticateUser from "../middlewares/login.js";
const projectteamrouter = express.Router();

projectteamrouter.get('/project/:projectId',authenticateUser, getProjectTeamMembers);

export default projectteamrouter;

