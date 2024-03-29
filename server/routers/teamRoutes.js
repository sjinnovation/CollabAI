import express from "express";

import authenticateUser from "../middlewares/login.js";
import { addNewFieldToAllExistingData, createTeam, deleteTeamById, getAllTeams, getTeamById, updateTeamById } from "../controllers/teamController.js";


const teamRouter = express.Router();

teamRouter.post("/",authenticateUser, createTeam);
teamRouter.get("/",authenticateUser,getAllTeams);
teamRouter.patch("/:id",authenticateUser,updateTeamById);
teamRouter.get("/:id",authenticateUser,getTeamById);
teamRouter.delete("/:id",authenticateUser,deleteTeamById);
teamRouter.put("/add-new-field", addNewFieldToAllExistingData);
export default teamRouter;