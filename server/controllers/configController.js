import config from '../models/configurationModel.js';
import StatusCodes from 'http-status-codes';
import User from '../models/user.js';
import { InternalServer } from '../middlewares/customError.js';
import { ConfigMessages } from '../constants/enums.js';
import { deleteKeyFromOpenAiConfigCache } from '../utils/openAiConfigHelper.js';
import { decrypt, encrypt, isEncrypted } from '../utils/configEncription.js';
 import EncryptionMetadata from '../models/encryptionMetadataModel.js';

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
            'openaiMaxToken',
            'geminiMaxToken',
            'claudeMaxToken',
            'openaiTopP',
            'openaiFrequency',
            'openaiPresence',
            'geminiTopP',
            'geminiTopK',
			'personalizeAssistant',
            'deepseekModel',
            'deepseekTemperature',
            'deepseekMaxTokens',
            'deepseekTopP',
            'deepseekTopK',
            'deepseekRepetitionPenalty',
			'togetheraiKey',
			'fluxModel',
			'fluxImageWidth',
			'fluxImageHeight',
			'fluxImageSeed',
			'fluxSteps',
			'fluxPreviews',
			'fluxStatus',
			'linkedinClientId',
            'linkedinClientSecret',
			"openaiSystemInstruction",
			"geminiSystemInstruction",
			"claudeSystemInstruction",
			"deepseekSystemInstruction",
			"huggingfacetokenKey",
			"vsCodeOpenaikey",
			"vsCodeOpenaiTemperature",
			"vsCodeOpenaiMaxToken",
			"vsCodeClaudeTemperature",
			"vsCodeClaudeMaxToken",
			"vsCodeClaudeApiKey",
		];
		const configValues = await config.find({ key: { $in: keysToFetch } });
		if (!configValues || configValues.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: ConfigMessages.CONFIG_VALUES_NOT_FOUND,
			});
		}

		const formattedValues = await Promise.all(configValues.map(async (configValue) => {
			const sensitiveKeys = [
				'openaikey',
				'geminiApiKey',
				'claudeApiKey',
				'togetheraiKey',
				'linkedinClientId',
				'linkedinClientSecret',
				'vsCodeOpenaikey',
				'vsCodeClaudeApiKey',
			];

			if (sensitiveKeys.includes(configValue.key)) {
				try {
					const isEncryptedValue = await isEncrypted(configValue._id);
					if (isEncryptedValue) {
						const decryptedValue = await decrypt(configValue.value, configValue._id)
						return {
							
							[configValue.key]: maskKey(decryptedValue)
						};
					} else {
						return {
							[configValue.key]: maskKey(configValue.value)
						};
					}
					
				} catch (e) {
					console.error(`Error processing ${configValue.key}:`, e);
					return {
						[configValue.key]: maskKey(configValue.value)
					};
				}
			} else {
				return {
					[configValue.key]: configValue.value
				};
			}
		}));

		const finalValues = formattedValues.reduce((acc, curr) => ({ ...acc, ...curr }), {});

		return res.status(StatusCodes.OK).json({
			configValues: finalValues,
			message: ConfigMessages.CONFIGURATIONS_FETCHED,
		});
	} catch (error) {
		return next(InternalServer(error.message));
	}
};

function maskKey(key) {
	if (key.length > 6) {
		const firstThree = key.slice(0, 3);
		const lastThree = key.slice(-3);
		const middlePart = key.slice(3, -3).replace(/./g, "*");
		return firstThree + middlePart + lastThree;
	} else {
		return key;
	}
}

export const getPersonalizeAssistantSetting = async (req, res, next) => {
	try {
		const keysToFetch = 'personalizeAssistant';
		const configValues = await config.findOne({ key: keysToFetch });
		if (!configValues || configValues.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: ConfigMessages.CONFIG_VALUES_NOT_FOUND,
			});
		}
		return res.status(StatusCodes.OK).json({
			personalizeAssistant: configValues.value,
			message: ConfigMessages.CONFIGURATIONS_FETCHED,
		});
	} catch (error) {
		return next(InternalServer(error.message));
	}
};

export const encryptConfigs = async (req, res, next) => {
	const {text} = req.body;
	try {
		const configValues = encrypt(text);
		if (!configValues || configValues.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				data : configValues || null,
				message: "could not encrypted text",


			});
		}
		return res.status(StatusCodes.OK).json({
			data : configValues,
			message: "encrypted text",
		});
	} catch (error) {
		return next(InternalServer(error.message));
	}
};

export const decryptConfigs = async (req, res, next) => {
	const {text} = req.body;
	try {
		const configValues = decrypt(text);
		if (!configValues || configValues.length === 0) {
			return res.status(StatusCodes.NOT_FOUND).json({
				data : configValues || null,
				message: "could not encrypted text",
			});
		}
		return res.status(StatusCodes.OK).json({
			data : configValues,
			message: "encrypted text",
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
            tokens,
            claudeMaxToken,
            openaiMaxToken,
            openaiTopP,
            openaiFrequency,
            openaiPresence,
            geminiTopP,
            geminiTopK,
            geminiMaxToken,
			personalizeAssistant,
			togetheraiKey,
			fluxModel,
			fluxImageWidth,
			fluxImageHeight,
			fluxImageSeed,
			fluxSteps,
			fluxPreviews,
			fluxStatus,
			deepseekModel,
			deepseekTemperature,
			deepseekMaxTokens,
			deepseekTopP,
			deepseekTopK,
			deepseekRepetitionPenalty,
			linkedinClientId,
			linkedinClientSecret,
			openaiSystemInstruction,
			geminiSystemInstruction,
			claudeSystemInstruction,
			deepseekSystemInstruction,
			huggingfacetokenKey,
			vsCodeOpenaikey,
			vsCodeOpenaiTemperature,
			vsCodeOpenaiMaxToken,
			vsCodeClaudeApiKey,
			vsCodeClaudeTemperature,
			vsCodeClaudeMaxToken,
		},
	} = req;

	try {

		// Update HuggingFace Token Key
		if (huggingfacetokenKey !== undefined) {
			await updateConfiguration(
				'huggingfacetokenKey',
				huggingfacetokenKey,
				ConfigMessages.HUGGINGFACE_TOKEN_KEY_UPDATED,
				ConfigMessages.HUGGINGFACE_TOKEN_KEY_SAVED
			);
		}
		
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
		if (openaikey !== undefined && !isMasked(openaikey)) {
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

        // Update Token
		if (tokens !== undefined) {
			await updateConfiguration(
				'tokens',
				tokens,
				ConfigMessages.MAX_TOKEN_UPDATED,
				ConfigMessages.MAX_TOKEN_SAVED
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
		if (geminiApiKey !== undefined && !isMasked(geminiApiKey)) {
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
		if (claudeApiKey !== undefined && !isMasked(claudeApiKey)) {
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
				ConfigMessages.TEMPERATURE_UPDATED,
				ConfigMessages.TEMPERATURE_SAVED
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
        // Update claude max token 
		if (claudeMaxToken !== undefined) {
			await updateConfiguration(
				'claudeMaxToken',
				claudeMaxToken,
				ConfigMessages.MAX_TOKEN_UPDATED,
				ConfigMessages.MAX_TOKEN_SAVED
			);
		}
        
        // Update openai max token 
		if (openaiMaxToken !== undefined) {
			await updateConfiguration(
				'openaiMaxToken',
				openaiMaxToken,
				ConfigMessages.MAX_TOKEN_UPDATED,
				ConfigMessages.MAX_TOKEN_SAVED
			);
		}
        
        // Update open ai top p 
		if (openaiTopP !== undefined) {
			await updateConfiguration(
				'openaiTopP',
				openaiTopP,
				ConfigMessages.OPENAI_TOP_P_UPDATED,
				ConfigMessages.OPENAI_TOP_P_SAVED
			);
		}
        
        // Update open ai frequency penalty 
		if (openaiFrequency !== undefined) {
			await updateConfiguration(
				'openaiFrequency',
				openaiFrequency,
				ConfigMessages.OPENAI_FREQUENCY_PENALTY_UPDATED,
				ConfigMessages.OPENAI_FREQUENCY_PENALTY_SAVED
			);
		}
        
        // Update open ai presence penalty 
		if (openaiPresence !== undefined) {
			await updateConfiguration(
				'openaiPresence',
				openaiPresence,
				ConfigMessages.OPENAI_PRESENCE_PENALTY_UPDATED,
				ConfigMessages.OPENAI_PRESENCE_PENALTY_SAVED
			);
		}
        
        // Update gemini top p
		if (geminiTopP !== undefined) {
			await updateConfiguration(
				'geminiTopP',
				geminiTopP,
				ConfigMessages.GEMINI_TOP_P_UPDATED,
				ConfigMessages.GEMINI_TOP_P_SAVED
			);
		}
        
        // Update  gemini top k
		if (geminiTopK !== undefined) {
			await updateConfiguration(
				'geminiTopK',
				geminiTopK,
				ConfigMessages.GEMINI_TOP_K_UPDATED,
				ConfigMessages.GEMINI_TOP_K_SAVED
			);
		}

        // Update gemini max token 
		if (geminiMaxToken !== undefined) {
			await updateConfiguration(
				'geminiMaxToken',
				geminiMaxToken,
				ConfigMessages.MAX_TOKEN_UPDATED,
				ConfigMessages.MAX_TOKEN_SAVED
			);
		} 

		// Update togetherai key
		if (togetheraiKey !== undefined && !isMasked(togetheraiKey)) {
			await updateConfiguration(
				'togetheraiKey',
				togetheraiKey,
				ConfigMessages.TOGETHERAI_KEY_UPDATED,
				ConfigMessages.TOGETHERAI_KEY_SAVED
			);
		} 
		if (fluxModel !== undefined) {
			await updateConfiguration(
				'fluxModel',
				fluxModel,
				ConfigMessages.FLUX_IMAGE_MODEL_UPDATED,
				ConfigMessages.FLUX_IMAGE_MODEL_SAVED
			);
		} 
		if (fluxImageWidth !== undefined) {
			await updateConfiguration(
				'fluxImageWidth',
				fluxImageWidth,
				ConfigMessages.FLUX_IMAGE_WIDTH_UPDATED,
				ConfigMessages.FLUX_IMAGE_WIDTH_SAVED
			);
		} 
		if (fluxImageHeight !== undefined) {
			await updateConfiguration(
				'fluxImageHeight',
				fluxImageHeight,
				ConfigMessages.FLUX_IMAGE_HEIGHT_UPDATED,
				ConfigMessages.FLUX_IMAGE_HEIGHT_SAVED
			);
		} 
		if (fluxImageSeed !== undefined) {
			await updateConfiguration(
				'fluxImageSeed',
				fluxImageSeed,
				ConfigMessages.FLUX_IMAGE_SEED_UPDATED,
				ConfigMessages.FLUX_IMAGE_SEED_SAVED
			);
		} 
		if (fluxSteps !== undefined) {
			await updateConfiguration(
				'fluxSteps',
				fluxSteps,
				ConfigMessages.FLUX_IMAGE_STEPS_UPDATED,
				ConfigMessages.FLUX_IMAGE_STEPS_SAVED
			);
		} 
		if (fluxPreviews !== undefined) {
			await updateConfiguration(
				'fluxPreviews',
				fluxPreviews,
				ConfigMessages.FLUX_IMAGE_PREVIEWS_UPDATED,
				ConfigMessages.FLUX_IMAGE_PREVIEWS_SAVED
			);
		} 
		if (fluxStatus !== undefined) {
			await updateConfiguration(
				'fluxStatus',
				fluxStatus,
				ConfigMessages.FLUX_IMAGE_STATUS_UPDATED,
				ConfigMessages.FLUX_IMAGE_STATUS_SAVED
			);
		} 
		

		// Update gemini max token 
		if (personalizeAssistant !== undefined) {
			await updateConfiguration(
				'personalizeAssistant',
				personalizeAssistant,
				ConfigMessages.PERSONALIZED_ASSISTANT_ENABLED,
				ConfigMessages.PERSONALIZED_ASSISTANT_SAVED
			);
			if(personalizeAssistant === true){
				return res.status(StatusCodes.OK).json({
					message: ConfigMessages.PERSONALIZED_ASSISTANT_ENABLED,
				});
			}
			else if(personalizeAssistant === false){
				return res.status(StatusCodes.OK).json({
					message: ConfigMessages.PERSONALIZED_ASSISTANT_DISABLED,
				});

			}

		}

		// Update Deepseek Model
		if (deepseekModel !== undefined) {
			await updateConfiguration(
				'deepseekModel',
				deepseekModel,
				ConfigMessages.DEEPSEEK_MODEL_UPDATED,
				ConfigMessages.DEEPSEEK_MODEL_SAVED
			);
		}

		// Update Deepseek Temperature
		if (deepseekTemperature !== undefined) {
			await updateConfiguration(
				'deepseekTemperature',
				deepseekTemperature,
				ConfigMessages.DEEPSEEK_TEMPERATURE_UPDATED,
				ConfigMessages.DEEPSEEK_TEMPERATURE_SAVED
			);
		}

		// Update Deepseek Max Tokens
		if (deepseekMaxTokens !== undefined) {
			await updateConfiguration(
				'deepseekMaxTokens',
				deepseekMaxTokens,
				ConfigMessages.DEEPSEEK_MAX_TOKENS_UPDATED,
				ConfigMessages.DEEPSEEK_MAX_TOKENS_SAVED
			);
		}

		// Update Deepseek Top P
		if (deepseekTopP !== undefined) {
			await updateConfiguration(
				'deepseekTopP',
				deepseekTopP,
				ConfigMessages.DEEPSEEK_TOP_P_UPDATED,
				ConfigMessages.DEEPSEEK_TOP_P_SAVED
			);
		}

		// Update Deepseek Top K
		if (deepseekTopK !== undefined) {
			await updateConfiguration(
				'deepseekTopK',
				deepseekTopK,
				ConfigMessages.DEEPSEEK_TOP_K_UPDATED,
				ConfigMessages.DEEPSEEK_TOP_K_SAVED
			);
		}

		// Update Deepseek Repetition Penalty
		if (deepseekRepetitionPenalty !== undefined) {
			await updateConfiguration(
				'deepseekRepetitionPenalty',
				deepseekRepetitionPenalty,
				ConfigMessages.DEEPSEEK_REPETITION_PENALTY_UPDATED,
				ConfigMessages.DEEPSEEK_REPETITION_PENALTY_SAVED
			);
		}
		
		// Update LinkedIn Client Id
		if (linkedinClientId !== undefined && !isMasked(linkedinClientId)) {
			await updateConfiguration(
				'linkedinClientId',
				linkedinClientId,
				ConfigMessages.LINKEDIN_CLIENT_ID_UPDATED,
				ConfigMessages.LINKEDIN_CLIENT_ID_SAVED
			);
		}

		// Update LinkedIn Client Secret
		if (linkedinClientSecret !== undefined && !isMasked(linkedinClientSecret)) {
			await updateConfiguration(
				'linkedinClientSecret',
				linkedinClientSecret,
				ConfigMessages.LINKEDIN_CLIENT_SECRET_UPDATED,
				ConfigMessages.LINKEDIN_CLIENT_SECRET_SAVED
			);
		}

		// Update openai system instruction
		if (openaiSystemInstruction !== undefined) {
			await updateConfiguration(
				"openaiSystemInstruction",
				openaiSystemInstruction,
				ConfigMessages.OPENAI_SYSTEM_INSTRUCTION_UPDATED,
				ConfigMessages.OPENAI_SYSTEM_INSTRUCTION_SAVED
			);
		}

		// Update gemini system instruction
		if (geminiSystemInstruction !== undefined) {
			await updateConfiguration(
				"geminiSystemInstruction",
				geminiSystemInstruction,
				ConfigMessages.GEMINI_SYSTEM_INSTRUCTION_UPDATED,
				ConfigMessages.GEMINI_SYSTEM_INSTRUCTION_SAVED
			);
		}

		// Update claude system instruction
		if (claudeSystemInstruction !== undefined) {
			await updateConfiguration(
				"claudeSystemInstruction",
				claudeSystemInstruction,
				ConfigMessages.CLAUDE_SYSTEM_INSTRUCTION_UPDATED,
				ConfigMessages.CLAUDE_SYSTEM_INSTRUCTION_SAVED
			);
		}

		// Update deepseek system instruction
		if (deepseekSystemInstruction !== undefined) {
			await updateConfiguration(
				"deepseekSystemInstruction",
				deepseekSystemInstruction,
				ConfigMessages.DEEPSEEK_SYSTEM_INSTRUCTION_UPDATED,
				ConfigMessages.DEEPSEEK_SYSTEM_INSTRUCTION_SAVED
			);
		}
		if (vsCodeOpenaikey !== undefined && !isMasked(vsCodeOpenaikey)) {
			await updateConfiguration(
				"vsCodeOpenaikey",
				vsCodeOpenaikey,
				ConfigMessages.OPENAI_KEY_UPDATED,
				ConfigMessages.OPENAI_KEY_SAVED
			);
		}
		if (vsCodeOpenaiTemperature !== undefined) {
			await updateConfiguration(
				"vsCodeOpenaiTemperature",
				vsCodeOpenaiTemperature,
				ConfigMessages.OPENAI_TEMPERATURE_UPDATED,
				ConfigMessages.OPENAI_TEMPERATURE_SAVED
			);
		}
		if (vsCodeOpenaiMaxToken !== undefined) {
			await updateConfiguration(
				"vsCodeOpenaiMaxToken",
				vsCodeOpenaiMaxToken,
				ConfigMessages.MAX_TOKEN_UPDATED,
				ConfigMessages.MAX_TOKEN_SAVED
			);
		}
		if (vsCodeClaudeApiKey !== undefined && !isMasked(vsCodeClaudeApiKey)) {
			await updateConfiguration(
				"vsCodeClaudeApiKey",
				vsCodeClaudeApiKey,
				ConfigMessages.CLAUDE_API_KEY_UPDATED,
				ConfigMessages.CLAUDE_API_KEY_SAVED
			);
		}
		if (vsCodeClaudeTemperature !== undefined) {
			await updateConfiguration(
				"vsCodeClaudeTemperature",
				vsCodeClaudeTemperature,
				ConfigMessages.CLAUDE_TEMPERATURE_UPDATED,
				ConfigMessages.CLAUDE_TEMPERATURE_SAVED
			);
		}
		if (vsCodeClaudeMaxToken !== undefined) {
			await updateConfiguration(
				"vsCodeClaudeMaxToken",
				vsCodeClaudeMaxToken,
				ConfigMessages.MAX_TOKEN_UPDATED,
				ConfigMessages.MAX_TOKEN_SAVED
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
	// List of keys that should be encrypted
	const sensitiveKeys = [
		'openaikey',
		'geminiApiKey',
		'claudeApiKey',
		'togetheraiKey',
		'linkedinClientId',
		'linkedinClientSecret',
		'vsCodeOpenaikey',
		'vsCodeClaudeApiKey',
	];

	let valueToStore = value;



	if (sensitiveKeys.includes(key) && !isMasked(value)) {
		if (keyRec) {
			await EncryptionMetadata.findOneAndDelete({ configId: keyRec._id });
			// If record exists, encrypt with existing configId
			valueToStore = await encrypt(value, keyRec._id);
			
			await config.updateOne(
				{ _id: keyRec._id },
				{ $set: { value: valueToStore } }
			);

		} else {
			// If record doesn't exist, create it first with unencrypted value
			const newConfig = await config.create({ key, value: valueToStore });
			// Then encrypt with the new configId
			valueToStore = await encrypt(value, newConfig._id);
			// Update the config with encrypted value
			await config.updateOne(
				{ _id: newConfig._id },
				{ $set: { value: valueToStore } }
			);
			deleteKeyFromOpenAiConfigCache(key);
			return {
				message: ConfigMessages[saveMessage],
			};
		}
	}
	if (keyRec) {
		// const valueToUpdate = typeof value === 'number' ? value.toString() : value;
		const newvalues = { $set: { value: valueToStore } };
		await config.updateOne({ key }, newvalues);

		deleteKeyFromOpenAiConfigCache(key);
	} else {
		// const valueToUpdate = typeof value === 'number' ? value.toString() : value;
		await config.create({ key, value: valueToStore });
	}
	return {
		message: ConfigMessages[updateMessage] || ConfigMessages[saveMessage],
	};
}

function isMasked(key) {
	return key.includes('***');
}

// Helper function to get decrypted config value
export const getDecryptedConfigValue = async (key) => {
	try {
		const configValue = await config.findOne({ key });
		if (!configValue) return null;

		const sensitiveKeys = [
			'openaikey',
			'geminiApiKey',
			'claudeApiKey',
			'togetheraiKey',
			'linkedinClientId',
			'linkedinClientSecret',
			'vsCodeOpenaikey',
			'vsCodeClaudeApiKey'
		];

		if (sensitiveKeys.includes(key)) {
			const isEncryptedValue = await isEncrypted(configValue._id);
			if (isEncryptedValue) {
				return await decrypt(configValue.value, configValue._id);
			}
		}
		return configValue.value;
	} catch (error) {
		console.error(`Error getting decrypted value for ${key}:`, error);
		return null;
	}
};

const sensitiveKeys = [
	'openaikey',
	'geminiApiKey',
	'claudeApiKey',
	'togetheraiKey',
	'linkedinClientId',
	'linkedinClientSecret',
	'huggingfacetokenKey',
	'vsCodeOpenaikey',
	'vsCodeClaudeApiKey',
];

// const isMasked = (value) => {
//     return value.includes('***');
// };

export const migrateConfigs = async (req, res, next) => {
	try {
		console.log('Starting config encryption migration...');

		for (const key of sensitiveKeys) {
			const configDoc = await config.findOne({ key });
			if (configDoc && !isMasked(configDoc.value)) {
				try {
					// Encrypt the value
					const encryptedValue = await encrypt(configDoc.value, configDoc._id);

					// Update the config with encrypted value
					await config.updateOne(
						{ _id: configDoc._id },
						{ $set: { value: encryptedValue } }
					);

					console.log(`Successfully migrated ${key}`);
				} catch (error) {
					console.error(`Error migrating ${key}:`, error);
				}
			}
		}

		console.log('Migration completed successfully');
		res.status(StatusCodes.OK).json({
			message: 'Migration completed successfully',
		});
	} catch (error) {
		console.error('Migration failed:', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error,
		});
	}
};

export const reverseMigration = async (req, res, next) => {
	try {
		console.log('Starting config encryption reversal...');

		for (const key of sensitiveKeys) {
			const configDoc = await config.findOne({ key });
			if (configDoc) {
				try {
					// Check if the value is encrypted
					const isEncryptedValue = await isEncrypted(configDoc._id);

					if (isEncryptedValue) {
						// Decrypt the value
						const decryptedValue = await decrypt(configDoc.value, configDoc._id);

						// Update the config with decrypted value
						await config.updateOne(
							{ _id: configDoc._id },
							{ $set: { value: decryptedValue } }
						);

						// Remove encryption metadata
						await EncryptionMetadata.deleteOne({ configId: configDoc._id });

						console.log(`Successfully reversed encryption for ${key}`);
					} else {
						console.log(`Skipping ${key} as it's not encrypted`);
					}
				} catch (error) {
					console.error(`Error reversing encryption for ${key}:`, error);
				}
			}
		}

		console.log('Reversal completed successfully');
		res.status(StatusCodes.OK).json({
			message: 'Encryption reversal completed successfully',
		});
	} catch (error) {
		console.error('Reversal failed:', error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message || 'Failed to reverse encryption',
		});
	}
}; 