import express from 'express';
import { getProjectTeamMembers, getProjectTeamMembersByTeam, getProjectsByTeamId, getAllProjectTeams } from '../controllers/projectTeamController.js';
import authenticateUser from "../middlewares/login.js";

const projectteamrouter = express.Router();

projectteamrouter.get('/project/:projectId' , getProjectTeamMembers);
projectteamrouter.get('/team/:teamId', authenticateUser, getProjectTeamMembersByTeam);
projectteamrouter.get('/projects/team/:teamId', authenticateUser, getProjectsByTeamId);
projectteamrouter.get('/all', authenticateUser, getAllProjectTeams); // New route to get all project teams


export default projectteamrouter;