//TODO: Delete this file and its routes. It is no longer used in front end
import feedbackModel from "../models/feebackModel.js";
import StatusCodes from "http-status-codes";

export const createFeedback = async (req, res) => {
    const { userId, feedback } = req.body;
    const feedbackRecord = await feedbackModel.create({
        userId,
        feedback
    });
    res.status(StatusCodes.CREATED).json({ feedbackRecord });
}
export const getFeedback = async (req, res) => {
    const feedbackRecord = await feedbackModel.find();
    res.status(StatusCodes.OK).json({ feedbackRecord });
}
export const setfeedstatus = async (req, res) => {
    try{
      const { feedbackID } = req.body;
      const data = await feedbackModel.findOne({ _id: feedbackID });
      data.isResolved = true; // set isDeleted to true
      await data.save();
      res.status(StatusCodes.OK).json({ data: "Status saved  Successfully" })
    }
    catch(err){
      console.log(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ data: [] })
    }
  }