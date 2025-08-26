import express from 'express'
import {
  getAssistantById,
  getAssistantInfo,
  createAssistantWithFunctionCalling,
  updateFunctionCallingAssistantdata,
  validateFunctionDefinition,
  getFunctionCallingAssistantsByPagination,
  fetchFunctionNamesPerAssistant,
  addFunctionDefinition,
  functionsParametersPerFunctionName,
  getAllFunctionCallingAssistants,
  getAssistantsCreatedByUser,
  getAllUserAssistantStats,
  createAssistant,
  createChatPerAssistant,
  getAllAssistants,
  getChatPerAssistant,
  updateAssistantFiles,
  assignTeamToAssistant,
  getAllUserAssignedAssistants,
  deleteAssistant,
  updateAssistant,
  updateAssistantDataWithFile,
  getAllAssistantsByPagination,
  downloadAssistantFile,
  getAllFunctionDefinitions,
  assistantClone,
  migrateAssistantsFromV1toV2,
  createVectorStoreForAllAssistantWhereStoreNotExist,
  stopGeneratingResponse,
  getSingleFunctionDefinitions,
  deleteFunctionDefinition,
  updateFunctionDefinition,
  getAllAssistantsIds,
  getAssistantUsages,
  getAssistantDetailsController,
  getAssistantCategoryCount,
  fetchN8nWorkflows,
  getN8nWorkflowsForAssistant,
  saveSelectedN8nWorkflows
} from "../controllers/assistantController.js";
import multer from 'multer';
import authenticateUser from '../middlewares/login.js';
import { googleAuth } from '../controllers/googleAuth.js';
import { createChatPerAssistantOFn8nNode, getAssistantsCreatedByUserForN8N } from '../controllers/assistantControllerForN8N.js';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "docs/"); 
    },
    filename: (req, file, cb) => {
      const uniqueFilename = file.originalname;
      cb(null, uniqueFilename);
    },
  });
const upload = multer({ storage: storage });
const router = express.Router();
router.patch("/migrate", migrateAssistantsFromV1toV2);
router.patch("/createVectorStoresForExistingAssistant", createVectorStoreForAllAssistantWhereStoreNotExist);
router.route('/').get(getAllAssistants).post(upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 2 }]) , createAssistant);
router.route('/users').get(authenticateUser, getAllUserAssignedAssistants);
router.route('/all').get(authenticateUser, getAllAssistantsByPagination);
router.patch("/updatedatawithfile/:assistant_id/",upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 2 }]) , updateAssistantDataWithFile);
router.get("/users/stats",authenticateUser,getAllUserAssistantStats);
router.get("/download/:file_id", authenticateUser, downloadAssistantFile)
router.post("/:assistant_id/files", upload.array('files', 21), updateAssistantFiles);
router.get("/:assistant_id/chats", authenticateUser, getChatPerAssistant);
router.post("/:assistant_id/chats", authenticateUser, createChatPerAssistant);
router.post("/n8n/:assistant_id/chats", createChatPerAssistantOFn8nNode);
router.get("/n8n/assistant-list", getAssistantsCreatedByUserForN8N);

router.patch("/:assistant_id/teams", assignTeamToAssistant);
router.route("/:assistant_id").patch(authenticateUser, updateAssistant).delete(authenticateUser, deleteAssistant);
router.get("/all-assistant-ids/:userId", getAllAssistantsIds);
///user/stats/
router.get("/users/created/:userId", getAssistantsCreatedByUser);
router.get("/:id/info", getAssistantById);

//Function calling routes
router.post("/function-definition", addFunctionDefinition);
router.post("/fetchFunctionNamesPerAssistant", fetchFunctionNamesPerAssistant);
router.post(
  "/fetchfunctionsParametersPerFunctionName",
  functionsParametersPerFunctionName
);
router.get("/getAllFunctionCallingAssistants", getAllFunctionCallingAssistants);
router.get("/function-definitions", getAllFunctionDefinitions);
router.get("/function-definitions/singleUser/:userId", getSingleFunctionDefinitions);
router.delete('/function-definitions/delete/:id', deleteFunctionDefinition);
router.patch('/function-definitions/update/:id', updateFunctionDefinition);
router.post("/validateFunctionDefinition", validateFunctionDefinition);
router.get(
  "/users/createdFunctionCalling",
  getFunctionCallingAssistantsByPagination
);

router.post(
  "/createassistantFunctionCalling",
  createAssistantWithFunctionCalling
);

router
  .route("/updateFunctionCallingAssistantdata/:assistant_id")
  .patch(updateFunctionCallingAssistantdata);
router.route("/getAssistantInfo/:assistant_id").get(getAssistantInfo);
router.post("/clone-assistant",assistantClone);
router.post("/google-auth",googleAuth);
router.post("/stop-generating-response",authenticateUser,stopGeneratingResponse);
router.get('/:assistant_id/usage', authenticateUser, getAssistantUsages);
router.get('/assistant-details', authenticateUser, getAssistantDetailsController);
router.get('/all-assistants',authenticateUser, getAssistantCategoryCount);
router.post('/fetch-n8n-workflows', authenticateUser, fetchN8nWorkflows);
router.get('/:assistant_id/n8n-workflows', authenticateUser, getN8nWorkflowsForAssistant);
router.post('/:assistant_id/n8n-workflows/selected', authenticateUser, saveSelectedN8nWorkflows);

export default router;
