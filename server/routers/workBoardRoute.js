import express from 'express';
import { getWorkBoardAccess,  getWorkBoardActivity,  getWorkBoardGoal,  getWorkBoardTeam,  getWorkBoardUserGoal,  getWorkBoardUserInfo } from '../controllers/workBoardController.js';
import authenticateUser from '../middlewares/login.js';


const workBoardRouter = express.Router();

workBoardRouter.post('/workboard-auth', authenticateUser, getWorkBoardAccess);
workBoardRouter.post('/workboard-user', authenticateUser, getWorkBoardUserInfo);
workBoardRouter.post('/workboard-goal', authenticateUser, getWorkBoardGoal);
workBoardRouter.post('/workboard-activity', authenticateUser, getWorkBoardActivity);
workBoardRouter.post('/workboard-team', authenticateUser, getWorkBoardTeam);
workBoardRouter.post('/workboard-user-goal', authenticateUser, getWorkBoardUserGoal);
export default workBoardRouter;
