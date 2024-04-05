import express from "express";
import {
  updateEditedPrompt,
  getGptPrompt,
  getUserPrompts,
  getPromptById,
  getStatistics,
  getRangeStatistics,
  fetchprompts,
  fetchChatThreads,
  clearSavedPrompts,
  updatePromptTitle,
  getPromptTitle,
  clearSavedPrompt,
  fetchDeletedThreads,
  recoverDeletedThread,
  bulkThreadRecover,
  threadDelete,
  getGptStreamResponse,
  regeneratePrompt,
} from "../controllers/promptController.js";
import authenticateUser from "../middlewares/login.js";

const promptRouter = express.Router();

promptRouter.post("/getprompt/:userid", authenticateUser, getGptPrompt);

promptRouter.post('/stream', authenticateUser, getGptStreamResponse);

promptRouter.get("/userprompts/:userid", authenticateUser, getUserPrompts);

promptRouter.get("/fetchprompts/:threadid", authenticateUser, fetchprompts);

promptRouter.get(
  "/fetchchatthreads/:userid",
  authenticateUser,
  fetchChatThreads
);

promptRouter.get("/fetchdeletedthreads", authenticateUser, fetchDeletedThreads);

promptRouter.put("/threadrecover/:id", authenticateUser, recoverDeletedThread);

promptRouter.patch("/multithreadrecover", authenticateUser, bulkThreadRecover);

promptRouter.delete("/thread", authenticateUser, threadDelete);

promptRouter.get("/getsingleprompt/:id", authenticateUser, getPromptById);

promptRouter.put("/clearconversations/", authenticateUser, clearSavedPrompts);

promptRouter.put("/updateprompts/", authenticateUser, updateEditedPrompt);

promptRouter.put("/regenerate/:id", authenticateUser, regeneratePrompt);

promptRouter.get("/getstatistics/:date", authenticateUser, getStatistics);

promptRouter.get(
  "/getrangestatistics/:startdate/:enddate",
  authenticateUser,
  getRangeStatistics
);

promptRouter.put("/updateprompttitle/", authenticateUser, updatePromptTitle);

promptRouter.post("/getprompttitle/", authenticateUser, getPromptTitle);

promptRouter.put(
  "/clearsingleconversation/",
  authenticateUser,
  clearSavedPrompt
);

export default promptRouter;
