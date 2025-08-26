import express from 'express';
import { createWorkBoardKnowledgeBase, deleteWorkBoardAuthCredentials, getAllWorkStream, getWorkBoardAccess,  getWorkBoardActivity,  getWorkBoardCredentials,  getWorkBoardGoal,  getWorkBoardTeam,  getWorkBoardUserGoal,  getWorkBoardUserInfo, syncWorkBoardActivity, syncWorkBoardKnowledgeBase, syncWorkBoardStream } from '../controllers/workBoardController.js';
import authenticateUser from '../middlewares/login.js';


const workBoardRouter = express.Router();

workBoardRouter.post('/workboard-auth/:userId',authenticateUser, getWorkBoardAccess);
workBoardRouter.get('/workboard-auth/:userId',authenticateUser, getWorkBoardCredentials);
workBoardRouter.delete('/workboard-auth/:userId',authenticateUser, deleteWorkBoardAuthCredentials);

workBoardRouter.post('/workboard-user',authenticateUser, getWorkBoardUserInfo);
workBoardRouter.post('/workboard-goal',authenticateUser, getWorkBoardGoal);
workBoardRouter.get('/sync/:userId', authenticateUser,syncWorkBoardActivity);
workBoardRouter.get('/workboard-activity/:userId',authenticateUser, getWorkBoardActivity);
workBoardRouter.post('/workboard-team', authenticateUser,getWorkBoardTeam);
workBoardRouter.post('/workboard-user-goal',authenticateUser, getWorkBoardUserGoal);
workBoardRouter.post('/knowledge-base',authenticateUser, createWorkBoardKnowledgeBase);
workBoardRouter.get('/knowledge-base/sync/:fileId',authenticateUser, syncWorkBoardKnowledgeBase);
workBoardRouter.post('/sync-work-stream/:userId', authenticateUser,syncWorkBoardStream);
workBoardRouter.get('/work-stream-list/:userId', authenticateUser,getAllWorkStream);









export default workBoardRouter;
