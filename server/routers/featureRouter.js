import express from 'express';
import {
    createFeature, 
    getAllFeatures, 
} from '../controllers/featureController.js';
import authenticateUser from "../middlewares/login.js";

const featureRouter = express.Router();

featureRouter.post('/',authenticateUser,createFeature);
featureRouter.get('/',authenticateUser,getAllFeatures);

export default featureRouter;