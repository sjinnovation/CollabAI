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
} from "../controllers/assistantController.js";
import multer from 'multer';
import authenticateUser from '../middlewares/login.js';
import { googleAuth } from '../controllers/googleAuth.js';

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
router.route('/').get(getAllAssistants).post(upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 1 }]) , createAssistant);
router.route('/users').get(authenticateUser, getAllUserAssignedAssistants);
router.route('/all').get(authenticateUser, getAllAssistantsByPagination);
router.patch("/updatedatawithfile/:assistant_id/",upload.fields([{ name: 'files', maxCount: 21 }, { name: 'avatar', maxCount: 1 }]) , updateAssistantDataWithFile);
router.get("/users/stats",authenticateUser,getAllUserAssistantStats);
router.get("/download/:file_id", authenticateUser, downloadAssistantFile)
router.post("/:assistant_id/files", upload.array('files', 21), updateAssistantFiles);
router.get("/:assistant_id/chats", authenticateUser, getChatPerAssistant);
router.post("/:assistant_id/chats", authenticateUser, createChatPerAssistant);
router.patch("/:assistant_id/teams", assignTeamToAssistant);
router.route("/:assistant_id").patch(authenticateUser, updateAssistant).delete(authenticateUser, deleteAssistant);
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

export default router;
