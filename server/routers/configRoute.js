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
	setDallEConfig,
	getDallEConfig,
} from '../controllers/configController.js';
import { authenticateSuperAdmin } from '../middlewares/superadminAuth.js';

//configRouter.route('/getValue').get(getThresholdValue);
configRouter.get('/threshold', authenticateSuperAdmin, getThresholdValue);

//configRouter.route('/addthreshold').post(setThresholdValue);
configRouter.post('/add-threshold', authenticateSuperAdmin, setThresholdValue);

//configRouter.route('/addkey/:userid').post(setApiKey);
configRouter.post('/set-key/:userid', authenticateSuperAdmin, setApiKey);

//configRouter.route('/getkey').get(getApiKey);
configRouter.get('/key', authenticateSuperAdmin, getApiKey);

//configRouter.route('/settemperature/:userid').post(setTemperature);
configRouter.post('/set-temperature/:userid', authenticateSuperAdmin, setTemperature);

//configRouter.route('/gettemperature').get(getTemperature);
configRouter.get('/temperature', authenticateSuperAdmin, getTemperature);

//set the user selected dall-e-config
configRouter.post('/dall-e/:userid', authenticateSuperAdmin, setDallEConfig);

//get the user selected dall-e-config
configRouter.get('/dall-e', authenticateSuperAdmin, getDallEConfig);

//configRouter.route('/setmaxtokens/:userid').post(setMaxTokens);
configRouter.post('/set-max-tokens/:userid', authenticateSuperAdmin, setMaxTokens);

//configRouter.route('/getmaxtokens').get(getMaxTokens);
configRouter.get('/max-tokens', authenticateSuperAdmin, getMaxTokens);

//configRouter.route('/setopenaimodel/:userid').post(setOpenaiModel);
configRouter.post('/set-openai-model/:userid', authenticateSuperAdmin, setOpenaiModel);

//configRouter.route('/getopenaimodel').get(getOpenaiModel);
configRouter.get('/openai-model', authenticateSuperAdmin, getOpenaiModel);

configRouter.get('/settings', authenticateSuperAdmin, getConfigurations).patch('/settings',authenticateSuperAdmin, updateConfigurations);

export default configRouter;
