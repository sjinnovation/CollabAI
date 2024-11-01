import express from "express";
import authenticateUser from "../middlewares/login.js";
import { createVectorStore, deleteFilesFromVectorStore, getFileIdsFromVectorStoreFunc, getVectorStoresByUserId } from "../controllers/vectorStoreController.js";



const vectorStoreRouter = express.Router();

vectorStoreRouter.post("/",authenticateUser, createVectorStore);
vectorStoreRouter.get("/:id",authenticateUser, getVectorStoresByUserId);
// test routes
vectorStoreRouter.get("/vector/:id",getFileIdsFromVectorStoreFunc);

// delete files from vector store
vectorStoreRouter.delete("/vector/:id",deleteFilesFromVectorStore);


export default vectorStoreRouter;