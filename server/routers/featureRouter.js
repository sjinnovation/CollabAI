import express from 'express';
import {
    createFeature, 
    getAllFeatures, 
} from '../controllers/featureController.js';

const featureRouter = express.Router();

featureRouter.post('/',createFeature);
featureRouter.get('/',getAllFeatures);

export default featureRouter;