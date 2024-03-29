import express from "express";
import { addNewFieldToAllExistingData, createMeetingType, deleteMeetingTypeById, getAllMeetingTypes, getMeetingTypeById, updateMeetingTypeById } from "../controllers/meetingTypeController.js";
import authenticateUser from "../middlewares/login.js";
const meetingTypeRouter = express.Router();

meetingTypeRouter.post("/create",authenticateUser,createMeetingType);
meetingTypeRouter.get("/get-all",authenticateUser,getAllMeetingTypes);
// templateRouter.route("/getTemplatesAdmin").post(getTemplatesAdmin);
meetingTypeRouter.patch("/update/:id",authenticateUser,updateMeetingTypeById);
meetingTypeRouter.get("/get/:id",authenticateUser,getMeetingTypeById);
meetingTypeRouter.delete("/delete/:id",authenticateUser,deleteMeetingTypeById);
meetingTypeRouter.put("/addNewField",authenticateUser, addNewFieldToAllExistingData);
export default meetingTypeRouter;  