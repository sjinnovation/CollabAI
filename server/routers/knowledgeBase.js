import express from "express";
import authenticateUser from '../middlewares/login.js';
import { getKnowledgeBases,getSingleKnowledgeBase,createKnowledgeBase,updateKnowledgeBase,deleteKnowledgeBase,deleteUsersAllKnowledgeBase, deleteMultipleKnowledgeBase, updateKnowledgeBaseFolderName, moveKnowledgeBaseFile, addParentIdToFiles, syncFilesFromNavBar, checkAssistantSyncEnable } from "../controllers/knowledgeBase.js";
import { getExistingAccessedUsersByFolder, getUserForFolderAccess, grantAccessToKnowledgeBase, removeAccessFromSharedKnowledgeBase } from "../controllers/ShareKnowledgeBaseController.js";
import { knowledgeBaseOwner } from "../middlewares/knowledgeBase.js";

const knowledgeBaseRouter = express.Router();

knowledgeBaseRouter.route('/:userId').post(authenticateUser, getKnowledgeBases);
knowledgeBaseRouter.post('/', authenticateUser, createKnowledgeBase);
knowledgeBaseRouter.patch('/:id', authenticateUser, updateKnowledgeBase);
knowledgeBaseRouter.patch('/update-folder-name/:id', authenticateUser, updateKnowledgeBaseFolderName);
knowledgeBaseRouter.patch('/file-move/:id', authenticateUser, moveKnowledgeBaseFile);
knowledgeBaseRouter.delete('/multidelete', authenticateUser, deleteMultipleKnowledgeBase);

knowledgeBaseRouter.delete('/all/:userId', authenticateUser, deleteUsersAllKnowledgeBase);
knowledgeBaseRouter.delete('/:id', authenticateUser, deleteKnowledgeBase);

// folder access
knowledgeBaseRouter.post("/:id/grant-access", grantAccessToKnowledgeBase);
knowledgeBaseRouter.post("/:id/remove-folder-access", removeAccessFromSharedKnowledgeBase);
knowledgeBaseRouter.get("/update-parent",addParentIdToFiles)

// get users for folder access
knowledgeBaseRouter.get("/:id/get-users", authenticateUser, getUserForFolderAccess);
knowledgeBaseRouter.get("/:id/get-accessed-users", authenticateUser, getExistingAccessedUsersByFolder);
knowledgeBaseRouter.get("/sync-from-navbar/:assistantId", authenticateUser, syncFilesFromNavBar);
knowledgeBaseRouter.get("/sync-status-check/:assistantId", authenticateUser, checkAssistantSyncEnable);





export default knowledgeBaseRouter;

