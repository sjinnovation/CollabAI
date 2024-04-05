import config from '../models/configurationModel.js';
import StatusCodes from 'http-status-codes';
import User from '../models/user.js';
import { InternalServer } from '../middlewares/customError.js';
import { ConfigMessages } from '../constants/enums.js';
import { deleteKeyFromOpenAiConfigCache } from '../utils/openAiConfigHelper.js';

/**
 * @function getThresholdValue
 * @description Fetches the threshold configuration value.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
export const getThresholdValue = async (req, res, next) => {
	try {
		const threshold = await config.findOne({ key: 'threshold' });
		res.status(StatusCodes.OK).json({
			threshold,
			message: ConfigMessages.THRESHOLD_VALUE_FETCHED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

export const setThresholdValue = async (req, res, next) => {
	const { value } = req.body;
	try {
		const thresholdRec = await config.findOne({ key: 'threshold' });
		if (thresholdRec) {
			var newvalues = { $set: { value: value } };
			config.updateOne(
				{ key: 'threshold' },
				newvalues,
				function (err, res) {
					if (err) throw err;
					console.log('1 document updated');
				}
			);

			deleteKeyFromOpenAiConfigCache('threshold');

			res.status(StatusCodes.OK).json({
				message: ConfigMessages.THRESHOLD_VALUE_UPDATED,
			});
			return;
		} else {
			let key = 'threshold';
			const promptRecord = await config.create({
				key,
				value,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.THRESHOLD_VALUE_SAVED,
			});
			return;
		}
	} catch (error) {
		next(InternalServer(error.message));
	}
};

// insert openai api key
export const setApiKey = async (req, res, next) => {
	const { key } = req.body;
	try {
		// if (key == '') {
		// 	res.status(StatusCodes.BAD_REQUEST).json({
		// 		message: 'Key cannot be empty',
		// 	});
		// 	return;
		// }
		const keyRec = await config.findOne({ key: 'openaikey' });
		if (keyRec) {
			//update key
			var newvalues = { $set: { value: key } };
			config.updateOne(
				{ key: 'openaikey' },
				newvalues,
				function (err, res1) {
					if (err) throw err;
					deleteKeyFromOpenAiConfigCache('openaikey');

					res.status(StatusCodes.OK).json({
						message: ConfigMessages.OPENAI_KEY_UPDATED,
					});
				}
			);
		} else {
			// insert key
			const keyRecord = await config.create({
				key: 'openaikey',
				value: key,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.OPENAI_KEY_SAVED,
			});
		}
	} catch (error) {
		next(InternalServer(error.message));
	}
	// check if key is empty
};

// get openai api key
export const getApiKey = async (req, res, next) => {
	try {
		const key = await config.findOne({ key: 'openaikey' });
		res.status(StatusCodes.OK).json({
			key,
			message: ConfigMessages.OPENAI_KEY_FETCHED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

// add openai temperature to config
export const setTemperature = async (req, res) => {
	const { temperature } = req.body;
	// check if temperature is empty
	if (temperature == '') {
		res.status(StatusCodes.BAD_REQUEST).json({
			message: ConfigMessages.TEMPERATURE_CANNOT_BE_EMPTY,
		});
		return;
	}

	try {
		const keyRec = await config.findOne({ key: 'temperature' });
		if (keyRec) {
			//update key
			var newvalues = { $set: { value: temperature } };
			config.updateOne(
				{ key: 'temperature' },
				newvalues,
				function (err, res1) {
					if (err) throw err;
					deleteKeyFromOpenAiConfigCache('temperature');

					res.status(StatusCodes.OK).json({
						message: ConfigMessages.TEMPERATURE_UPDATED,
					});
				}
			);
		} else {
			// insert key
			const keyRecord = await config.create({
				key: 'temperature',
				value: temperature,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.TEMPERATURE_SAVED,
			});
			return;
		}
	} catch (error) {
		next(InternalServer());
	}
};

// get openai temperature
export const getTemperature = async (req, res, next) => {
	try {
		const temperature = await config.findOne({ key: 'temperature' });
		res.status(StatusCodes.OK).json({
			temperature,
			message: ConfigMessages.TEMPERATURE_FETCHED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

// set openai max tokens
export const setMaxTokens = async (req, res, next) => {
	const { tokens } = req.body;
	try {
		if (tokens == '') {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: ConfigMessages.TOKEN_VALUE_EMPTY,
			});
			return;
		}

		//check if tokens has only numbers
		if (isNaN(tokens)) {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: ConfigMessages.TOKEN_NOT_NUMBER,
			});
			return;
		}
		const keyRec = await config.findOne({ key: 'tokens' });
		if (keyRec) {
			//update key
			var newvalues = { $set: { value: tokens } };
			config.updateOne(
				{ key: 'tokens' },
				newvalues,
				function (err, res1) {
					if (err) throw err;

					deleteKeyFromOpenAiConfigCache('tokens');

					res.status(StatusCodes.OK).json({
						message: ConfigMessages.TOKENS_UPDATED,
					});
				}
			);
		} else {
			// insert key
			const keyRecord = await config.create({
				key: 'tokens',
				value: tokens,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.TOKENS_SAVED,
			});
			return;
		}
	} catch (error) {
		next(InternalServer(error.message));
	}
};

// get openai max tokens
export const getMaxTokens = async (req, res, next) => {
	try {
		const tokens = await config.findOne({ key: 'tokens' });
		res.status(StatusCodes.OK).json({
			tokens,
			message: ConfigMessages.OPENAI_TOKENS_FETCHED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

export const setOpenaiModel = async (req, res) => {
	const { model } = req.body;
	try {
		if (model == '') {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: ConfigMessages.MODEL_ID_CANNOT_BE_EMPTY,
			});
			return;
		}
		const keyRec = await config.findOne({ key: 'model' });
		if (keyRec) {
			//update key
			var newvalues = { $set: { value: model } };
			config.updateOne({ key: 'model' }, newvalues, function (err, res1) {
				if (err) throw err;

				deleteKeyFromOpenAiConfigCache('model');

				res.status(StatusCodes.OK).json({
					message: ConfigMessages.OPEN_AI_MODEL_UPDATED,
				});
			});
		} else {
			// insert key
			const keyRecord = await config.create({
				key: 'model',
				value: model,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.OPEN_AI_MODEL_SAVED,
			});
			return;
		}
	} catch (error) {
		next(InternalServer(error.message));
	}
};

export const getOpenaiModel = async (req, res, next) => {
	try {
		const model = await config.findOne({ key: 'model' });
		res.status(StatusCodes.OK).json({
			model,
			message: ConfigMessages.OPENAI_MODEL_FETCHED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

// add dallEModel, Quality and Resolution to config
export const setDallEConfig = async (req, res) => {
	const { dallEModel, dallEQuality, dallEResolution } = req.body;
	// check if dallEModel or dallEQuality is empty
	if (dallEModel == '' || dallEResolution == '') {
		res.status(StatusCodes.BAD_REQUEST).json({
			message: ConfigMessages.DALLECONFIG_CANNOT_BE_EMPTY,
		});
		return;
	}

	try {
		const keyModel = await config.findOne({ key: 'dallEModel' });
		const keyQuality = await config.findOne({ key: 'dallEQuality' });
		const keyResolution = await config.findOne({ key: 'dallEResolution' });
		if (keyModel && keyQuality && keyResolution) {
			//update key
			var newModelValues = { $set: { value: dallEModel } };
			var newQualityValues = { $set: { value: dallEQuality } };
			var newResolutionValues = { $set: { value: dallEResolution } };
			config.updateOne(
				{ key: 'dallEModel' },
				newModelValues,
				function (err, res1) {
					if (err) throw err;

					deleteKeyFromOpenAiConfigCache('dallEModel');

					res.status(StatusCodes.OK).json({
						message: ConfigMessages.DALLECONFIG_UPDATED,
					});
				}
			);

			config.updateOne(
				{ key: 'dallEQuality' },
				newQualityValues,
				function (err, res1) {
					if (err) throw err;

					deleteKeyFromOpenAiConfigCache('dallEQuality');

					res.status(StatusCodes.OK).json({
						message: ConfigMessages.DALLECONFIG_UPDATED,
					});
				}
			);

			config.updateOne(
				{ key: 'dallEResolution' },
				newResolutionValues,
				function (err, res1) {
					if (err) throw err;

					deleteKeyFromOpenAiConfigCache('dallEResolution');

					res.status(StatusCodes.OK).json({
						message: ConfigMessages.DALLECONFIG_UPDATED,
					});
				}
			);
		} else {
			// insert key
			await config.create({
				key: 'dallEModel',
				value: dallEModel,
			});
			await config.create({
				key: 'dallEQuality',
				value: dallEQuality,
			});
			await config.create({
				key: 'dallEResolution',
				value: dallEResolution,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.DALLECONFIG_SAVED,
			});
			return;
		}
	} catch (error) {
		next(InternalServer());
	}
};

// get Dall-E-Model, Quality and Resolution
export const getDallEConfig = async (req, res, next) => {
	try {
		const dallEModel = await config.findOne({ key: 'dallEModel' });
		const dallEQuality = await config.findOne({ key: 'dallEQuality' });
		const dallEResolution = await config.findOne({
			key: 'dallEResolution',
		});
		res.status(StatusCodes.OK).json({
			dallEModel,
			dallEQuality,
			dallEResolution,
			message: ConfigMessages.DALLECONFIG_FETCHED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

export const getConfigurations = async (req, res, next) => {
	try {
		const keysToFetch = [
			'threshold',
			'openaikey',
			'temperature',
			'tokens',
			'model',
			'geminiModel',
			'geminiTemperature',
			'geminiApiKey',
			'dallEModel',
			'dallEQuality',
			'dallEResolution',
			'claudeModel',
			'claudeTemperature',
			'claudeApiKey',
		];
		const configValues = await config.find({ key: { $in: keysToFetch } });

		if (!configValues || configValues.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: ConfigMessages.CONFIG_VALUES_NOT_FOUND,
			});
		}

		const formattedValues = configValues.reduce((acc, configValue) => {
			acc[configValue.key] = configValue.value;
			return acc;
		}, {});

		res.status(StatusCodes.OK).json({
			configValues: formattedValues,
			message: ConfigMessages.CONFIGURATIONS_FETCHED,
		});
	} catch (error) {
		return next(InternalServer(error.message));
	}
};

export const updateConfigurations = async (req, res, next) => {
	const { _id: userId } = req.user;
	const {
		body: {
			model,
			openaikey,
			temperature,
			geminiModel,
			geminiApiKey,
			geminiTemperature,
			dallEModel,
			dallEQuality,
			dallEResolution,
			claudeModel,
			claudeTemperature,
			claudeApiKey,
		},
	} = req;

	try {
		// Update AI model
		if (model !== undefined) {
			await updateConfiguration(
				'model',
				model,
				ConfigMessages.OPEN_AI_MODEL_UPDATED,
				ConfigMessages.OPEN_AI_MODEL_SAVED
			);
		}

		// Update Secret Key
		if (openaikey !== undefined) {
			await updateConfiguration(
				'openaikey',
				openaikey,
				ConfigMessages.OPENAI_KEY_UPDATED,
				ConfigMessages.OPENAI_KEY_SAVED
			);
		}

		// Update Temperature
		if (temperature !== undefined) {
			await updateConfiguration(
				'temperature',
				temperature,
				ConfigMessages.TEMPERATURE_UPDATED,
				ConfigMessages.TEMPERATURE_SAVED
			);
		}

		// Update Temperature
		if (geminiTemperature !== undefined) {
			await updateConfiguration(
				'geminiTemperature',
				geminiTemperature,
				ConfigMessages.TEMPERATURE_UPDATED,
				ConfigMessages.TEMPERATURE_SAVED
			);
		}

		// Update Gemini AI Model
		if (geminiModel !== undefined) {
			await updateConfiguration(
				'geminiModel',
				geminiModel,
				ConfigMessages.GEMINI_MODEL_UPDATED,
				ConfigMessages.GEMINI_MODEL_SAVED
			);
			deleteKeyFromOpenAiConfigCache('geminiModel');
		}

		// Update Gemini API Key
		if (geminiApiKey !== undefined) {
			await updateConfiguration(
				'geminiApiKey',
				geminiApiKey,
				ConfigMessages.GEMINI_API_KEY_UPDATED,
				ConfigMessages.GEMINI_API_KEY_SAVED
			);
			deleteKeyFromOpenAiConfigCache('geminiApiKey');
		}

		// Update Claude AI Model
		if (claudeModel !== undefined) {
			await updateConfiguration(
				'claudeModel',
				claudeModel,
				ConfigMessages.CLAUDE_MODEL_UPDATED,
				ConfigMessages.CLAUDE_MODEL_SAVED
			);
		}

		// Update Claude API Key
		if (claudeApiKey !== undefined) {
			await updateConfiguration(
				'claudeApiKey',
				claudeApiKey,
				ConfigMessages.CLAUDE_API_KEY_UPDATED,
				ConfigMessages.CLAUDE_API_KEY_SAVED
			);
		}

		// Update Claude Temperature
		if (claudeTemperature !== undefined) {
			await updateConfiguration(
				'claudeTemperature',
				claudeTemperature,
				ConfigMessages.CLAUDE_TEMPERATURE_UPDATED,
				ConfigMessages.CLAUDE_TEMPERATURE_SAVED
			);
		}

		// Update Dall-E-Model
		if (dallEModel !== '') {
			await updateConfiguration(
				'dallEModel',
				dallEModel,
				ConfigMessages.DALLEMODEL_UPDATED,
				ConfigMessages.DALLEMODEL_SAVED
			);
		}

		// Update Dall-E-Quality
		if (dallEQuality !== '') {
			await updateConfiguration(
				'dallEQuality',
				dallEQuality,
				ConfigMessages.DALLEQUALITY_UPDATED,
				ConfigMessages.DALLEQUALITY_SAVED
			);
		}

		// Update Dall-E-Resolution
		if (dallEResolution !== '') {
			await updateConfiguration(
				'dallEResolution',
				dallEResolution,
				ConfigMessages.DALLERESOLUTION_UPDATED,
				ConfigMessages.DALLERESOLUTION_SAVED
			);
		}

		res.status(StatusCodes.OK).json({
			message: ConfigMessages.CONFIGURATIONS_UPDATED,
		});
	} catch (error) {
		console.log(error);
		next(InternalServer(error.message));
	}
};

async function updateConfiguration(key, value, updateMessage, saveMessage) {
	const keyRec = await config.findOne({ key });

	if (keyRec) {
		// const valueToUpdate = typeof value === 'number' ? value.toString() : value;
		const newvalues = { $set: { value } };
		await config.updateOne({ key }, newvalues);

		console.log(`${key} updated`);
		deleteKeyFromOpenAiConfigCache(key);
	} else {
		// const valueToUpdate = typeof value === 'number' ? value.toString() : value;
		await config.create({ key, value });
		console.log(`${key} saved`);
	}

	return {
		message: ConfigMessages[updateMessage] || ConfigMessages[saveMessage],
	};
}
