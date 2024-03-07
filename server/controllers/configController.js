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
					message: ConfigMessages.MODEL_UPDATED,
				});
			});
		} else {
			// insert key
			const keyRecord = await config.create({
				key: 'model',
				value: model,
			});
			res.status(StatusCodes.OK).json({
				message: ConfigMessages.MODEL_SAVED,
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

export const getConfigurations = async (req, res, next) => {
	try {
		const keysToFetch = [
			'threshold',
			'openaikey',
			'temperature',
			'tokens',
			'model',
		];
		const configValues = await config.find({ key: { $in: keysToFetch } });

		if (!configValues || configValues.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: ConfigMessages.CONFIG_VALUES_NOT_FOUND,
			});
		}

		const formattedValues = configValues.reduce((acc, configValue) => {
			acc[configValue.key] = configValue;
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
	const {
		params: { userid: userId },
		body: { aiModel, secretKey, temperature },
	} = req;

	try {
		// check if user is admin or superadmin
		const user = await User.findOne({ _id: userId });

		if (!user || !(user.role == 'admin' || user.role == 'superadmin')) {
			res.status(StatusCodes.UNAUTHORIZED).json({
				message: ConfigMessages.UNAUTHORIZED_TO_MODIFY_CONFIGURATIONS,
			});
			return;
		}

		// Update AI model
		if (aiModel !== '') {
			await updateConfiguration(
				'model',
				aiModel,
				ConfigMessages.MODEL_UPDATED,
				ConfigMessages.MODEL_SAVED
			);
		}

		// Update Secret Key
		if (secretKey !== '') {
			await updateConfiguration(
				'openaikey',
				secretKey,
				ConfigMessages.OPENAI_KEY_UPDATED,
				ConfigMessages.OPENAI_KEY_SAVED
			);
		}

		// Update Temperature
		if (temperature !== '') {
			await updateConfiguration(
				'temperature',
				temperature,
				ConfigMessages.TEMPERATURE_UPDATED,
				ConfigMessages.TEMPERATURE_SAVED
			);
		}

		res.status(StatusCodes.OK).json({
			message: ConfigMessages.CONFIGURATIONS_UPDATED,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

async function updateConfiguration(key, value, updateMessage, saveMessage) {
	const keyRec = await config.findOne({ key });

	if (keyRec) {
		const newvalues = { $set: { value } };
		await config.updateOne({ key }, newvalues);
		console.log(`${key} updated`);
	} else {
		await config.create({ key, value });
		console.log(`${key} saved`);
	}

	return {
		message: ConfigMessages[updateMessage] || ConfigMessages[saveMessage],
	};
}
