import express from "express";
import authenticateUser from '../middlewares/login.js';
import { getKnowledgeBases,getSingleKnowledgeBase,createKnowledgeBase,updateKnowledgeBase,deleteKnowledgeBase,deleteUsersAllKnowledgeBase, deleteMultipleKnowledgeBase } from "../controllers/knowledgeBase.js";

const knowledgeBaseRouter = express.Router();

knowledgeBaseRouter.route('/:userId').post(authenticateUser, getKnowledgeBases);
knowledgeBaseRouter.post('/', authenticateUser, createKnowledgeBase);
knowledgeBaseRouter.patch('/:id', authenticateUser, updateKnowledgeBase);
knowledgeBaseRouter.delete('/multidelete', authenticateUser, deleteMultipleKnowledgeBase);

knowledgeBaseRouter.delete('/all/:userId', authenticateUser, deleteUsersAllKnowledgeBase);
knowledgeBaseRouter.delete('/:id', authenticateUser, deleteKnowledgeBase);

export default knowledgeBaseRouter;

