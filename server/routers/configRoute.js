import express from 'express';
const configRouter = express.Router();
import {
	getThresholdValue,
	setThresholdValue,
	setApiKey,
	getApiKey,
	setTemperature,
	getTemperature,
	setMaxTokens,
	getMaxTokens,
	setOpenaiModel,
	getOpenaiModel,
	updateConfigurations,
	getConfigurations,
} from '../controllers/configController.js';
import authenticateUser from '../middlewares/login.js';

configRouter.route('/getValue').get(getThresholdValue);

configRouter.route('/addthreshold').post(setThresholdValue);

configRouter.route('/addkey/:userid').post(setApiKey);

configRouter.route('/getkey').get(getApiKey);

configRouter.route('/settemperature/:userid').post(setTemperature);

configRouter.route('/gettemperature').get(getTemperature);

configRouter.route('/setmaxtokens/:userid').post(setMaxTokens);

configRouter.route('/getmaxtokens').get(getMaxTokens);

configRouter.route('/setopenaimodel/:userid').post(setOpenaiModel);

configRouter.route('/getopenaimodel').get(getOpenaiModel);

//configRouter.get('/settings', authenticateUser, getConfigurations).patch(authenticateUser, updateConfigurations);

export default configRouter;
