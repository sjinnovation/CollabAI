import  express  from "express";
import {createFeedback,getFeedback ,setfeedstatus}from "../controllers/feedbackController.js";

const feedbackRouter = express.Router();


feedbackRouter.route("/createFeedback").post(createFeedback);

feedbackRouter.route("/getFeedback").get(getFeedback);

feedbackRouter.route("/setfeedstatus").put(setfeedstatus);

export default feedbackRouter;
