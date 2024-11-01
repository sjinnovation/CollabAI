import express from "express";
import { ragImplementation } from "../controllers/ragImplementationWithS3Files.js";
import { preprocessPDFs } from "../controllers/preprocessOfRAG.js";
import authenticateUser from "../middlewares/login.js";

const ragRouter = express.Router();

ragRouter.route('/').post(authenticateUser, ragImplementation);
ragRouter.post('/create-vector', authenticateUser, preprocessPDFs);


export default ragRouter;
