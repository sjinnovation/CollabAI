import express from 'express'
import  { getAssistantById, getAssistantsCreatedByUser ,getAllUserAssistantStats,createAssistant, createChatPerAssistant, getAllAssistants, getChatPerAssistant, updateAssistantFiles, assignTeamToAssistant, getAllUserAssignedAssistants, deleteAssistant, updateAssistant,updateAssistantDataWithFile, getAllAssistantsByPagination} from '../controllers/assistantController.js';

import multer from 'multer';
import authenticateUser from '../middlewares/login.js';

// const storage = multer.memoryStorage(); // You can adjust the storage configuration as needed
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "docs/"); // Directory where the uploaded files will be stored
    },
    filename: (req, file, cb) => {
      const uniqueFilename = file.originalname;
      cb(null, uniqueFilename);
    },
  });
const upload = multer({ storage: storage });

const router = express.Router();

//  router.post("/testing",tesingfunction)
router.route('/').get(getAllAssistants).post(upload.array('files',5),createAssistant);
// router.post("/createassistant", upload.array('files', 5), createAssistant);
router.route('/users').get(authenticateUser, getAllUserAssignedAssistants);
router.route('/all').get(authenticateUser, getAllAssistantsByPagination);
router.post("/createassistant", upload.array('files', 5), createAssistant);
router.post("/:assistant_id/files", upload.array('files', 5), updateAssistantFiles);
router.get("/:assistant_id/chats", authenticateUser, getChatPerAssistant);
router.post("/:assistant_id/chats", authenticateUser, createChatPerAssistant);
router.patch("/:assistant_id/teams", assignTeamToAssistant);
router.route("/:assistant_id").patch(authenticateUser, updateAssistant).delete(authenticateUser, deleteAssistant);
router.patch("/updatedatawithfile/:assistant_id/",upload.array('files', 5),updateAssistantDataWithFile);
 router.get("/users/stats",authenticateUser,getAllUserAssistantStats);
///user/stats/
router.get("/users/created/:userId",getAssistantsCreatedByUser);
router.get("/:id/info", getAssistantById);

export default router;
