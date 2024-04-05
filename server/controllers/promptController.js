import {
	CommonMessages,
	GPTModels,
	PromptMessages,
} from '../constants/enums.js';
import getOpenAiConfig from '../utils/openAiConfigHelper.js';
import StatusCodes from 'http-status-codes';
import OpenAI from 'openai';
import moment from 'moment';
import promptModel from '../models/promptModel.js';
import User from '../models/user.js';
import { getGeminiAIPromptService } from '../service/geminiAiPromptService.js';
import { getOpenAIPrompt } from '../service/openaiService.js';
import {
	BadRequest,
	InternalServer,
	NotFound,
} from '../middlewares/customError.js';
import { handleOpenAIError } from '../utils/openAIErrors.js';
import { calculateTokenAndCost } from '../service/trackUsageService.js';
import TrackUsage from '../models/trackUsageModel.js';
import {
	generateOpenAIResponse,
	updatePrompt,
} from '../service/gptPromptService.js';

export const getGptStreamResponse = async (req, res) => {
	try {
		const { _id: userid } = req.user;
		const {
			userPrompt,
			threadId: threadid,
			chatLog,
			compId,
			tags,
		} = req.body;
		let temperature, gptModel, openAiKey;

		// getting configs
		temperature = parseFloat(await getOpenAiConfig('temperature'));
		gptModel = await getOpenAiConfig('model');
		openAiKey = await getOpenAiConfig('openaikey');

		if (!gptModel || !openAiKey) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				success: false,
				message: messages.OPENAI_MODEL_KEY_NOT_FOUND,
			});
		}

		const contextArray =
			promptServices.generatePrevChatHistoryContext(chatLog);

		const openai = new OpenAI({
			apiKey: openAiKey,
		});

		let gptResponse = '',
			tokenCount = 0;
		const stream = await openai.chat.completions.create(
			{
				model: gptModel,
				messages: [
					...contextArray,
					{ content: userPrompt, role: 'user' },
				],
				stream: true,
			},
			{ responseType: 'stream' }
		);

		// eslint-disable-next-line no-restricted-syntax
		for await (const part of stream) {
			tokenCount++;
			if (part.choices[0].finish_reason === 'stop') {
				await promptModel.create({
					tokenused: tokenCount,
					threadid,
					userid,
					description: userPrompt,
					promptresponse: gptResponse,
					promptdate: moment(new Date()).format('YYYY-MM-DD'),
					createdAt: new Date(),
					modelused: gptModel,
					tags,
				});
				res.end();
				return;
			}
			gptResponse += part.choices[0]?.delta?.content || '';
			res.write(part.choices[0]?.delta?.content || '');
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * Asynchronous function to get GPT prompt.
 * @param {Object} req - Request object, expected to contain 'userid', 'temp', 'threadid', 'chatLog', 'compId', and 'tags' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns the GPT prompt response if successful, otherwise an error message.
 */

export const getGptPrompt = async (req, res, next) => {
	const userid = req.params.userid;
	const {
		botProvider,
		temp,
		threadId: threadid,
		chatLog,
		compId,
		tags,
	} = req.body;

	let temperature, gptModel, apiKey;
	let serviceFunction, contextArray;

	try {
		const user = await User.findById(userid);
		if (!user) {
			return next(BadRequest(PromptMessages.USER_NOT_FOUND));
		}

		if (botProvider === 'openai') {
			temperature = parseFloat(await getOpenAiConfig('temperature'));
			gptModel = await getOpenAiConfig('model');
			apiKey = await getOpenAiConfig('openaikey');
			contextArray = chatLog
				.slice(-6)
				.reverse()
				.map((item) => ({
					role: item.botMessage ? 'assistant' : 'user',
					content: item.botMessage
						? item.botMessage
						: item.chatPrompt,
				}));

			serviceFunction = getOpenAIPrompt;
		} else if (botProvider === 'gemini') {
			temperature = parseFloat(await getOpenAiConfig('temperature'));
			gptModel = await getOpenAiConfig('geminiModel');
			apiKey = await getOpenAiConfig('geminiApiKey');

			serviceFunction = getGeminiAIPromptService;
		}

		const promptResponse = await serviceFunction(
			temp,
			chatLog,
			gptModel,
			temperature
		);

		// console.log("TOKENS:", completion.usage)

		const promptDate = new Date().toISOString().slice(0, 10);
		const newPrompt = await promptModel.create({
			tokenused: 0,
			threadid,
			userid,
			description: temp,
			promptresponse: promptResponse,
			promptdate: promptDate,
			createdAt: new Date(),
			modelused: gptModel,
			tags,
		});

		const {
			inputTokenPrice,
			outputTokenPrice,
			inputTokenCount,
			outputTokenCount,
			totalCost,
			totalTokens,
		} = await calculateTokenAndCost(
			newPrompt.description,
			newPrompt.promptresponse,
			newPrompt.modelused
		);

		const trackUsage = await TrackUsage.create({
			user_id: newPrompt.userid,
			input_token: inputTokenCount,
			output_token: outputTokenCount,
			model_used: newPrompt.modelused,
			input_token_price: inputTokenPrice,
			output_token_price: outputTokenPrice,
			total_tokens: totalTokens,
			total_token_cost: totalCost,
		});

		await newPrompt.populate('tags');
		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: {
				promptResponse: newPrompt.promptresponse,
				promptTime: newPrompt.createdAt,
				tags: newPrompt.tags,
				modelUsed: newPrompt.modelused,
				tokenUsed: newPrompt.tokenused,
				promptId: newPrompt._id,
			},
		});
	} catch (error) {
		console.log(error);
		if (error instanceof OpenAI.APIError) {
			const customOpenAIError = handleOpenAIError(error);
			return next(customOpenAIError);
		}
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to get prompts for a specific user.
 * @param {Object} req - Request object, expected to contain 'userid' in the params.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns the user prompts if successful, otherwise an error message.
 */
export const getUserPrompts = async (req, res, next) => {
	const { userid: custUserId } = req.params;
	try {
		const prompts = await promptModel.find({ userid: custUserId });

		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: prompts,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to fetch prompts for a specific thread.
 * @param {Object} req - Request object, expected to contain 'threadid' in the params.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns the prompts for the specified thread if successful, otherwise an error message.
 */
export const fetchprompts = async (req, res, next) => {
	const { threadid } = req.params;
	try {
		const prompts = await promptModel
			.find({ threadid, isDeleted: false })
			.populate('tags');

		return res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: prompts,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to get a prompt by its ID.
 * @param {Object} req - Request object, expected to contain 'id' in the params.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns the prompt with the specified ID if successful, otherwise an error message.
 */
export const getPromptById = async (req, res, next) => {
	const { id: promptId } = req.params;
	try {
		const prompt = await promptModel.findOne({ _id: promptId });

		if (!prompt) {
			return next(NotFound(PromptMessages.NOT_FOUND_ERROR));
		}

		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: prompt,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to clear saved prompts for a specific user.
 * @param {Object} req - Request object, expected to contain 'userid' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if prompts are cleared successfully, otherwise an error message.
 */
export const clearSavedPrompts = async (req, res, next) => {
	const { userid } = req.body;
	try {
		const result = await promptModel.updateMany(
			{ userid, isDeleted: false },
			{ $set: { isDeleted: true } }
		);
		res.status(StatusCodes.OK).json({
			message: PromptMessages.DELETED_SUCCESSFULLY,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to clear saved prompts for a specific thread.
 * @param {Object} req - Request object, expected to contain 'threadid' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if prompts are cleared successfully, otherwise an error message.
 */
export const clearSavedPrompt = async (req, res, next) => {
	const { threadid } = req.body;
	try {
		const result = await promptModel.updateMany(
			{ threadid, isDeleted: false },
			{ $set: { isDeleted: true } }
		);
		res.status(StatusCodes.OK).json({
			message: PromptMessages.DELETED_SUCCESSFULLY,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to fetch chat threads for a specific user.
 * @param {Object} req - Request object, expected to contain 'userid' in the params.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns the chat threads with prompts if successful, otherwise an error message.
 */
export const fetchChatThreads = async (req, res, next) => {
	const {
		params: { userid },
	} = req;
	try {
		const threadIds = await promptModel
			.find({ userid, isDeleted: false })
			.distinct('threadid')
			.exec();
		const queries = threadIds.map((threadId) => {
			return promptModel.findOne({ threadid: threadId }).exec();
		});
		const docs = await Promise.all(queries);
		docs.sort((a, b) => {
			return new Date(b.createdAt) - new Date(a.createdAt);
		});
		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: { prompts: docs },
		});
	} catch (err) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to update edited prompts for a specific user and thread.
 * @param {Object} req - Request object, expected to contain 'userid', 'threadId', and 'lastPrompt' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if prompts are updated successfully, otherwise an error message.
 */
export const updateEditedPrompt = async (req, res, next) => {
	const { userid, threadId, lastPrompt } = req.body;
	try {
		const result = await promptModel.updateMany(
			{ userid, isDeleted: false, createdAt: { $gte: lastPrompt } },
			{ $set: { isDeleted: true } }
		);
		res.status(StatusCodes.OK).json({
			success: true,
			message: PromptMessages.UPDATED_SUCCESSFULLY,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to update edited prompts for a specific user and thread.
 * @param {Object} req - Request object, expected to contain 'id' from params and 'userPrompt' from the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if prompts are updated successfully, otherwise an error message.
 */
export const regeneratePrompt = async (req, res, next) => {
	const { id } = req.params;
	const { userPrompt } = req.body;

	try {
		const existingPrompt = await promptModel.findById(id);

		if (!existingPrompt) {
			return next(BadRequest(PromptMessages.PROMPT_NOT_FOUND));
		}
		const openAIResponse = await generateOpenAIResponse({ userPrompt });
		const payload = {
			description: userPrompt,
			promptresponse: openAIResponse.response,
			tokenused: openAIResponse.totalToken,
			promptdate: new Date(),
		};
		await updatePrompt(id, payload);
		res.status(StatusCodes.OK).json({
			success: true,
			response: openAIResponse.response,
			totalToken: openAIResponse.totalToken,
		});
	} catch (error) {
		console.log(error);
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to update prompt title for a specific thread.
 * @param {Object} req - Request object, expected to contain 'threadId' and 'title' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if prompt title is updated successfully, otherwise an error message.
 */
export const updatePromptTitle = async (req, res, next) => {
	const { threadId, title } = req.body;
	try {
		const result = await promptModel.updateMany(
			{ threadid: threadId },
			{ $set: { prompttitle: title } }
		);
		res.status(StatusCodes.OK).json({
			result: true,
			success: true,
			message: PromptMessages.UPDATED_SUCCESSFULLY,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to get prompt title for a specific thread.
 * @param {Object} req - Request object, expected to contain 'threadId' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns the prompt title for the specified thread if successful, otherwise an error message.
 */
export const getPromptTitle = async (req, res, next) => {
	const { threadId } = req.body;
	try {
		const result = await promptModel.findOne({ threadid: threadId });
		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: result,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to filter prompts by a specified period and GPT model.
 * @param {Date} startDate - Start date for filtering prompts.
 * @param {Date} endDate - End date for filtering prompts (exclusive).
 * @param {string} gptmodel - GPT model to filter prompts. Possible values: "gpt-3", "gpt-4", etc.
 * @returns {Promise<number>} Returns the total token count of filtered prompts.
 */
const filterPromptsByPeriod = async (startDate, endDate, gptmodel) => {
	const query = {
		tokenused: { $exists: true },
		promptdate: { $gte: startDate, $lt: endDate },
		...(gptmodel === GPTModels.GPT_4
			? {
					$or: [
						{ modelused: { $exists: false } },
						{ modelused: GPTModels.GPT_4 },
					],
			  }
			: { modelused: gptmodel }),
	};

	const prompts = await promptModel.find(query).select('tokenused');
	return prompts.reduce((total, { tokenused }) => total + tokenused, 0);
};

/**
 * Asynchronous function to retrieve statistics based on prompt usage for a specified date.
 * @param {Object} req - Request object, expected to contain 'date' in the params.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns prompt usage statistics for the specified date.
 */
export const getStatistics = async (req, res, next) => {
	const { date } = req.params;
	try {
		const today = new Date();
		const currentYear = today.getUTCFullYear();
		const currentMonth = today.getUTCMonth();
		const [inputYear, inputMonth] =
			date === 'default'
				? [currentYear, currentMonth]
				: date.split('-').map(Number);

		const startOfMonth = new Date(Date.UTC(inputYear, inputMonth - 1, 1));
		const startOfDay = new Date(
			Date.UTC(inputYear, inputMonth - 1, today.getUTCDate())
		);
		const startOfWeek = new Date(
			Date.UTC(
				inputYear,
				inputMonth - 1,
				today.getUTCDate() - today.getUTCDay()
			)
		);

		const gpt4MonthlyUsage = await filterPromptsByPeriod(
			startOfMonth,
			startOfDay,
			GPTModels.GPT_4
		);
		const gpt4WeeklyUsage = await filterPromptsByPeriod(
			startOfWeek,
			startOfDay,
			GPTModels.GPT_4
		);
		const gpt4DailyUsage = await filterPromptsByPeriod(
			startOfDay,
			new Date(startOfDay.getTime() + 86400000),
			GPTModels.GPT_4
		);

		const gpt3MonthlyUsage = await filterPromptsByPeriod(
			startOfMonth,
			startOfDay,
			GPTModels.GPT_3_5_TURBO
		);
		const gpt3WeeklyUsage = await filterPromptsByPeriod(
			startOfWeek,
			startOfDay,
			GPTModels.GPT_3_5_TURBO
		);
		const gpt3DailyUsage = await filterPromptsByPeriod(
			startOfDay,
			new Date(startOfDay.getTime() + 86400000),
			GPTModels.GPT_3_5_TURBO
		);

		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: {
				monthly: gpt4MonthlyUsage,
				weekly: gpt4WeeklyUsage,
				daily: gpt4DailyUsage,
				gpt3monthly: gpt3MonthlyUsage,
				gpt3weekly: gpt3WeeklyUsage,
				gpt3daily: gpt3DailyUsage,
			},
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

function convertDateToUTC(dateString) {
	const date = new Date(dateString);
	return new Date(
		Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
	).toISOString();
}

/**
 * Asynchronous function to retrieve statistics based on prompt usage for a specified date range.
 * @param {Object} req - Request object, expected to contain 'startdate' and 'enddate' in the params.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns prompt usage statistics for the specified date range.
 */
export const getRangeStatistics = async (req, res, next) => {
	const { startdate, enddate } = req.params;
	try {
		let query = { tokenused: { $exists: true } };

		if (startdate !== 'default') {
			query.promptdate = { $gte: convertDateToUTC(startdate) };
		}
		if (enddate !== 'default') {
			query.promptdate = {
				...query.promptdate,
				$lt: convertDateToUTC(enddate),
			};
		}

		query.$or = [
			{ modelused: { $exists: false } },
			{ modelused: GPTModels.GPT_4 },
		];
		const totalPrompts = await promptModel.find(query).select('tokenused');
		const total = totalPrompts.reduce(
			(sum, prompt) => sum + prompt.tokenused,
			0
		);

		delete query.$or;
		query.modelused = GPTModels.GPT_3_5_TURBO;
		const gpt3totalPrompts = await promptModel
			.find(query)
			.select('tokenused');
		const gpt3total = gpt3totalPrompts.reduce(
			(sum, prompt) => sum + prompt.tokenused,
			0
		);

		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: {
				total,
				gpt3total,
			},
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

export const fetchDeletedThreads = async (req, res, next) => {
	const userid = req.user._id;
	try {
		const threadIds = await promptModel
			.find({ userid, isDeleted: true })
			.distinct('threadid')
			.exec();
		const queries = threadIds.map((threadId) => {
			return promptModel.findOne({ threadid: threadId }).exec();
		});
		const docs = await Promise.all(queries);
		docs.sort((a, b) => {
			return new Date(b.createdAt) - new Date(a.createdAt);
		});
		res.status(StatusCodes.OK).json({
			message: PromptMessages.RETRIEVED_SUCCESSFULLY,
			data: { prompts: docs },
		});
	} catch (err) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to fetch deleted threads for a specific user.
 * @param {Object} req - Request object, expected to contain 'user._id' for the user ID.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns deleted threads for the specified user if successful, otherwise an error message.
 */
export const recoverDeletedThread = async (req, res, next) => {
	const id = req.params.id;
	const filter = { threadid: id };
	const update = { isDeleted: false };

	try {
		const isThreadExist = await promptModel.findOne(filter);
		if (!isThreadExist) {
			return next(NotFound(PromptMessages.THREAD_NOT_FOUND));
		}
		const recoveredThread = await promptModel.updateMany(filter, update, {
			new: true,
		});
		res.status(StatusCodes.OK).json({
			message: PromptMessages.UPDATED_SUCCESSFULLY,
			data: recoveredThread,
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to recover multiple deleted threads based on selected thread IDs.
 * @param {Object} req - Request object, expected to contain 'body.selectedThreadIds' for the array of selected thread IDs.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message and the count of recovered threads if successful, otherwise an error message.
 */
export const bulkThreadRecover = async (req, res, next) => {
	const { selectedThreadIds } = req.body;
	try {
		const condition = { threadid: { $in: selectedThreadIds } };
		const update = { isDeleted: false };
		const result = await promptModel.updateMany(condition, update);
		res.status(StatusCodes.OK).json({
			message: PromptMessages.UPDATED_SUCCESSFULLY,
			data: { RecoveredThreads: result },
		});
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * Asynchronous function to delete threads based on provided thread IDs.
 * @param {Object} req - Request object, expected to contain 'body.threadIds' for the array of thread IDs to delete.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if threads are deleted successfully, otherwise an error message.
 */
export const threadDelete = async (req, res, next) => {
	const threadIds = req.body.threadIds;
	try {
		if (!threadIds || !Array.isArray(threadIds) || threadIds.length === 0) {
			return next(NotFound(PromptMessages.THREAD_NOT_FOUND));
		}
		const condition = { threadid: { $in: threadIds } };
		const threadsToDelete = await promptModel.find(condition);
		if (threadsToDelete.length === 0) {
			return next(NotFound(PromptMessages.THREAD_NOT_FOUND));
		}
		const result = await promptModel.deleteMany(condition);
		return res
			.status(StatusCodes.OK)
			.json({ message: PromptMessages.DELETED_SUCCESSFULLY });
	} catch (error) {
		next(InternalServer(PromptMessages.INTERNAL_SERVER_ERROR));
	}
};
