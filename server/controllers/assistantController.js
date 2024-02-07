import { StatusCodes } from 'http-status-codes';
import OpenAI from 'openai';
import fs from 'fs';
import Assistant from '../models/assistantModel.js';
import AssistantThread from '../models/assistantThreadModel.js';
import { meeting_summary } from '../service/assistantService.js';
import User from '../models/user.js';
import * as errorMessage from '../locale/index.js';
import { AssistantMessages, CommonMessages } from '../constants/enums.js';
import {
	BadRequest,
	Conflict,
	InternalServer,
	NotFound,
} from '../middlewares/customError.js';
import { openAIInstance as openAI } from '../config/openAI.js';
import { createChatPerAssistantSchema } from '../utils/validations.js';

const DALL_E_MODEL = 'dall-e-3';
/**
 * @function createAssistant
 * @async
 * @description Create a new assistant by attributes or retrieval from openai through assistantId
 * @param {Object} req - Request object, should contain the following properties in body: name, instructions, description,
 *     assistantId, tools, model, userId, category, imageGeneratePrompt, staticQuestions
 * @param {Object} res - Response object
 * @param {function} next - Next middleware function
 * @returns {Response} 201 - Returns assistant created message and assistant details
 * @throws {Error} Will throw an error if no assistant found or if assistant creation failed
 */
export const createAssistant = async (req, res, next) => {
	const {
		name,
		instructions,
		description,
		assistantId,
		tools: toolsString,
		model: userSelectedModel,
		userId,
		category,
		imageGeneratePrompt,
		staticQuestions,
	} = req.body;
	const files = req.files;
	let newAssistantInstance = null;

	const tools = JSON.parse(toolsString);
	const parsedTools = tools.map((tool) => ({ type: tool }));

	try {
		const openai = openAI;

		const isNameExist = await Assistant.findOne({
			is_deleted: false,
			name: name,
		});
		if (isNameExist) {
			return next(Conflict(AssistantMessages.NAME_EXISTS));
		}

		// Handle file uploads for the new assistant
		const filePromises = files.map(async (file) => {
			const uploadedFile = await openai.files.create({
				file: fs.createReadStream(file.path),
				purpose: 'assistants',
			});

			return uploadedFile.id;
		});

		// TODO: Handle promises here. If one promise is rejected then the entire promises will be rejected
		const newFileIds = await Promise.all(filePromises);

		let image_url = null;

		// Check if imageGeneratePrompt is provided and generate an image
		if (imageGeneratePrompt) {
			const imageResponse = await openai.createImage({
				model: DALL_E_MODEL,
				prompt: imageGeneratePrompt,
				n: 1,
				size: '1024x1024',
			});

			image_url = imageResponse.data.data[0].url;
		}

		// if assistantId is given, then we have to retrieve the assistant and create it in our database
		if (assistantId) {
			// check if already an assistant exists with the given assistantId
			const existingAssistant = await Assistant.findOne({
				assistant_id: assistantId,
			});
			if (existingAssistant)
				return next(
					Conflict(AssistantMessages.ASSISTANT_ALREADY_EXISTS)
				);

			const myAssistant = await openai.beta.assistants.retrieve(
				assistantId
			);
			if (myAssistant) {
				newAssistantInstance = new Assistant({
					assistant_id: myAssistant.id,
					name: myAssistant.name,
					model: myAssistant.model,
					instructions: myAssistant.instructions,
					file_ids: myAssistant.file_ids,
					tools: myAssistant.tools,
					userId: userId,
					category: category,
					description: description,
					image_url: image_url,
					static_questions:  staticQuestions ? parseStaticQuestions(staticQuestions) : []
				});
			}
		} else {
			// create new assistant and save it in our database
			const assistant = await openai.beta.assistants.create({
				name,
				instructions,
				tools: parsedTools,
				model: userSelectedModel || 'gpt-4-1106-preview',
				file_ids: newFileIds,
			});

			if (assistant) {
				newAssistantInstance = new Assistant({
					assistant_id: assistant.id,
					name: assistant.name,
					model: assistant.model,
					instructions: assistant.instructions,
					tools: assistant.tools,
					file_ids: assistant.file_ids,
					userId: userId,
					category: category,
					description: description,
					image_url: image_url,
					static_questions:  staticQuestions ? parseStaticQuestions(staticQuestions) : [],
				});
			}
		}

		if (newAssistantInstance) {
			// Delete the uploaded files from the temporary directory
			files.forEach((file) => {
				fs.unlink(file.path, (err) => {
					if (err) {
						console.error(`Error deleting file: ${file.path}`, err);
					}
				});
			});

			// Save the new assistant instance to the database
			newAssistantInstance.model = userSelectedModel; // Save the user-selected model
			const result = await newAssistantInstance.save();

			if (result) {
				res.status(StatusCodes.CREATED).json({
					message: AssistantMessages.ASSISTANT_CREATED_SUCCESSFULLY,
					assistant: newAssistantInstance,
				});
			}
		} else {
			return next(
				InternalServer(AssistantMessages.ASSISTANT_CREATION_FAILED)
			);
		}
	} catch (error) {
		if (error instanceof OpenAI.APIError) {
			const customOpenAIError = handleOpenAIError(error);
			return next(customOpenAIError);
		}
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function createChatPerAssistant
 * @description Create a new chat for an assistant
 * @param {Object} req - Request object. Should contain the following parameters in body: { question, thread_id [= false] }
 * @param {Object} res - Response object
 * @param {function} next - Next middleware function
 * @returns {Response} 201 - Returns created chat and thread ID
 * @throws {Error} Will throw an error if chat creation failed
 */
export const createChatPerAssistant = async (req, res, next) => {
	const { _id: userId } = req.user;
	const { assistant_id } = req.params;
	const { question, thread_id = false } = req.body;
	let threadId = null,
		finalMessage = [];

	const validationResult = createChatPerAssistantSchema.validate(req.body, {
		abortEarly: false,
		stripUnknown: true,
	});

	if (validationResult.error) {
		return next(
			BadRequest(
				'The message you submitted was too long, please reload the conversation and submit something shorter.'
			)
		);
	}

	try {
		const openai = openAI;

		// Step 1: create a thread if doesn't exist for the requested user
		// const ExistingAssistantThread = await AssistantThread.findOne({ assistant_id, user: userId });
		if (thread_id) {
			threadId = thread_id;
		} else {
			const thread = await openai.beta.threads.create();

			if (thread) {
				const newAssistantThread = new AssistantThread({
					assistant_id,
					user: userId,
					thread_id: thread.id,
					title: question.substring(0, 50),
				});
				await newAssistantThread.save();
			}
			threadId = thread.id;
		}

		// Step 2: now we have a threadId, create a message in the thread
		await openai.beta.threads.messages.create(threadId, {
			role: 'user',
			content: question,
		});

		// Step 3: now we have to create a run that will wait for the response from the assistant
		const run = await openai.beta.threads.runs.create(threadId, {
			assistant_id,
		});
		let runId = run.id;

		let retrieveRun = await openai.beta.threads.runs.retrieve(
			threadId,
			runId
		);

		// Step 4: now we have to create a polling mechanism to check if the assistant has responded
		// TODO: handle all the possible cases including errors that can happen
		let openAIErrorFlag = false;
		while (retrieveRun.status !== 'completed') {			
			console.log(
				`${retrieveRun.status}`,
				'Waiting for the Assistant to process...'
			);
			if (retrieveRun.status === 'requires_action') {
				let retrieveRuntwo = await openai.beta.threads.runs.retrieve(
					threadId,
					runId
				);

				const requiredActions =
					retrieveRuntwo.required_action.submit_tool_outputs
						.tool_calls;

				const toolOutputs = [];

				for (const action of requiredActions) {
					const funcName = action.function.name;
					const argument = JSON.parse(action.function.arguments);
					console.log(argument, 'arg');
					if (funcName === 'meeting_summary') {
						const output = await meeting_summary(
							// argument.tags,
							argument.start_date,
							argument.end_date,
							argument.meeting_type || []
						);
						console.log(runId);
						toolOutputs.push({
							tool_call_id: action.id,
							output: output,
						});
					} else {
						throw new Error(`Unknown function: ${funcName}`);
					}
				}

				console.log('Submitting outputs back to the Assistant...');
				const run = await openai.beta.threads.runs.submitToolOutputs(
					threadId,
					runId,

					{
						tool_outputs: toolOutputs,
					}
				);
			}
			await new Promise((resolve) => setTimeout(resolve, 500));
			retrieveRun = await openai.beta.threads.runs.retrieve(
				threadId,
				runId
			);

			// Check for failed, cancelled, or expired status
			if (
				['failed', 'cancelled', 'expired'].includes(retrieveRun.status)
			) {
				console.log(
					`Run status is '${retrieveRun.status}'. Unable to complete the request.`
				);
				openAIErrorFlag = true;
				break; // Exit the loop if the status indicates a failure or cancellation
			}
		}

		if (openAIErrorFlag) {
			return next(
				BadRequest(
					'Received an error from openAI, please reload the conversation.'
				)
			);
		}
		const threadMessages = await openai.beta.threads.messages.list(
			threadId
		);

		const mostRecentMessage = threadMessages.data
			.filter(
				(message) =>
					message.run_id === run.id && message.role === 'assistant'
			)
			.pop();

		if (mostRecentMessage) {
			// res.status(StatusCodes.CREATED).json({ response: mostRecentMessage });
			res.status(StatusCodes.CREATED).json({
				response: mostRecentMessage.content[0].text.value,
				msg_id: mostRecentMessage.id,
				thread_id: threadId,
			});
			return;
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: AssistantMessages.SOMETHING_WENT_WRONG,
			});
			return;
		}
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			errorMessage: error.message,
		});
	}
};

/**
 * @async
 * @function getAllAssistants
 * @description Get a list of assistants with optional category filter and pagination
 * @param {Object} req - The request object. Query string may contain 'page' and 'limit' parameters for pagination
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns assistants list and total assistant count
 */
export const getAllAssistants = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;

		//openai init
		const openai = openAI;

		// Define the query object with the is_deleted condition
		const query = { is_deleted: false, category: 'ORGANIZATIONAL' };

		// Find assistants based on the query
		const assistants = await Assistant.find(query)

			.populate({
				path: 'userId',
				model: 'User',
				select: 'fname',
			})

			.populate('teamId')
			.sort({ createdAt: -1 })
			.skip((page - 1) * limit)
			.limit(limit)
			.lean();

		// Iterate over each assistant and fetch filenames for file_ids
		for (const assistant of assistants) {
			const fileNames = await Promise.all(
				assistant.file_ids.map(async (fileId) => {
					const fileInfo = await openai.files.retrieve(fileId);
					return fileInfo.filename;
				})
			);
			// Update the assistant object with fileNames
			assistant.fileNames = fileNames;
		}
		const totalAssistants = await Assistant.find(query);

		res.status(StatusCodes.OK).json({
			assistants,
			totalAssistantCount: totalAssistants.length,
			message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function getAssistantById
 * @description Get assistant by id
 * @param {Object} req - The request object. The params should contain the assistant ID
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistant
 * @returns {Response} 200 - Returns fetched assistant
 */
export const getAssistantById = async (req, res) => {
	try {
		const { id: assistant_id } = req.params;

		//openai init
		const openai = openAI;
		// console.log(assistant_id, "assistant_id");

		// Find assistants based on the query
		const assistant = await Assistant.findOne({ assistant_id })
			//   .populate("teamId")
			.lean();

		if (!assistant) {
			return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
		}

		// Check if the assistant has file_ids
		if (assistant.file_ids && assistant.file_ids.length > 0) {
			// Iterate over each assistant and fetch filenames for file_ids
			const fileNames = await Promise.all(
				assistant.file_ids.map(async (fileId) => {
					const fileInfo = await openai.files.retrieve(fileId);
					return fileInfo.filename;
				})
			);

			// Update the assistant object with fileNames
			assistant.fileNames = fileNames;
		} else {
			// Set an empty array for fileNames if file_ids is not present
			assistant.fileNames = [];
		}

		res.status(StatusCodes.OK).json({
			assistant,
			message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function getAllUserAssistantStats
 * @description Get statistics of assistants for all users with pagination
 * @param {Object} req - The request object. The query may contain 'page' and 'limit' parameters for pagination
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the statistics
 * @returns {Response} 200 - Returns statistics of assistants for all users
 */
export const getAllUserAssistantStats = async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;

		// Use Aggregation Framework for counting
		const userStats = await Assistant.aggregate([
			{
				$match: {
					userId: { $exists: true, $ne: null },
					is_deleted: false,
					category: 'PERSONAL',
				},
			},
			{
				$group: {
					_id: '$userId',
					totalAssistants: { $sum: 1 },
					activeAssistants: {
						$sum: {
							$cond: [{ $eq: ['$is_active', true] }, 1, 0],
						},
					},
				},
			},
			{
				$lookup: {
					from: 'users', // Collection name for the User model
					localField: '_id',
					foreignField: '_id',
					as: 'userDetails',
				},
			},
			{
				$unwind: '$userDetails',
			},
			{
				$project: {
					_id: 1,
					username: '$userDetails.fname',
					totalAssistants: 1,
					activeAssistants: 1,
					status: '$userDetails.status',
				},
			},
			{ $sort: { totalAssistants: -1 } },
			{ $skip: (page - 1) * limit },
			// { $limit: limit },
		]);

		res.status(StatusCodes.OK).json({
			userStats,
			message: AssistantMessages.ASSISTANT_STATS_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function getAssistantsCreatedByUser
 * @description Get assistants created by a specific user with a given category, considering pagination
 * @param {Object} req - The request object. Expected params: userId. Expected query: page, pageSize
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns a list of assistants created by the user
 */
export const getAssistantsCreatedByUser = async (req, res) => {
	try {
		const { userId } = req.params;
		const { page = 1, pageSize = 10 } = req.query;

		//openai init
		const openai = openAI;

		const skip = (page - 1) * pageSize;
		const limit = parseInt(pageSize);

		const query = {
			userId: userId,
			category: 'PERSONAL', // Filter by category "PERSONAL"
			is_deleted: false,
			//  is_active: true
		};

		const assistants = await Assistant.find(query)
			.skip(skip)
			.sort({ createdAt: -1 })
			.limit(limit)
			.lean();
		// Iterate over each assistant and fetch filenames for file_ids
		for (const assistant of assistants) {
			try {
				const fileNames = await Promise.all(
					assistant.file_ids.map(async (fileId) => {
						try {
							const fileInfo = await openai.files.retrieve(fileId);
							return fileInfo.filename;
						} catch (fileError) {
							console.error(`Error retrieving file ${fileId}: ${fileError.message}`);
							return null; // Handle file retrieval error gracefully
						}
					})
				);

				// Update the assistant object with fileNames
				assistant.fileNames = fileNames;
			} catch (error) {
				console.error(`Error processing assistant ${assistant._id}: ${error.message}`);
				// Handle assistant processing error gracefully
			}
		}


		res.status(StatusCodes.OK).json({
			assistants,
			message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function getAllUserAssignedAssistants
 * @description Get a list of assistants that are assigned to the user
 * @param {Object} req - The request object. Expected params: none. Expected query: pageSize, page. Request object should contain user details
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns a list of assistants assigned to the user including pagination details
 */
export const getAllUserAssignedAssistants = async (req, res) => {
	const { _id: user_id } = req.user;
	const pageSize = parseInt(req.query.pageSize) || 10;
	const currentPage = parseInt(req.query.page) || 1;

	try {
		const reqUser = await User.findById(user_id);

		if (!reqUser) {
			return next(BadRequest(AssistantMessages.USER_DOES_NOT_EXIST));
		}
		let query = {};
		let notDeletedAndActive = { is_deleted: false, is_active: true };
		let getPersonalAssistant = {
			...notDeletedAndActive,
			userId: reqUser._id,
			category: 'PERSONAL',
		};

		if (reqUser.role === 'superadmin') {
			// Query for superadmin to fetch all active organizational assistants and personal created assistants
			query = {
				$or: [
					{ ...notDeletedAndActive, category: 'ORGANIZATIONAL' }, // Organizational assistants
					{ ...getPersonalAssistant }, // Personal created assistants by the user
				],
			};
		} else if (reqUser.teamId) {
			// Query for normal user to fetch organizational assistants for the user's team and personal created assistants
			query = {
				$or: [
					{
						...notDeletedAndActive,
						teamId: { $in: reqUser.teamId },
						category: 'ORGANIZATIONAL',
					}, // Organizational assistants for the user's team
					{ ...getPersonalAssistant }, // Personal created assistants by the user
				],
			};
		} else if (!reqUser.teamId) {
			return res.status(StatusCodes.OK).json({ assistants: [] });
		}

		const [assistants, totalCount] = await Promise.all([
			Assistant.find(query)
				.skip((currentPage - 1) * pageSize)
				.limit(pageSize)
				.sort({ createdAt: -1 }),
			Assistant.countDocuments(query),
		]);

		const totalPages = Math.ceil(totalCount / pageSize);

		console.log(
			'totalPages:',
			totalPages,
			'totalCount:',
			totalCount,
			'pageSize:',
			pageSize
		);
		return res.status(StatusCodes.OK).json({
			assistants,
			totalPages,
			message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function getAllAssistantsByPagination
 * @description Get list of assistants that are assigned to the user with pagination
 * @param {Object} req - The request object. Expected params: none. Expected query: pageSize, page. Request object should contain user details
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the assistants
 * @returns {Response} 200 - Returns a list of assistants assigned to the user including pagination details
 */
export const getAllAssistantsByPagination = async (req, res) => {
	const { _id: user_id } = req.user;
	const pageSize = parseInt(req.query.pageSize) || 10;
	const currentPage = parseInt(req.query.page) || 1;
	try {
		let query = {};
		const reqUser = await User.findById(user_id);

		if (!reqUser) {
			return next(BadRequest(AssistantMessages.USER_DOES_NOT_EXIST));
		}
		const totalAssistants = await Assistant.find({ is_deleted: false });
		const totalPages = Math.ceil(totalAssistants.length / pageSize);

		if (reqUser.teamId) {
			query.teamId = reqUser.teamId;
		} else if (reqUser.role !== 'superadmin') {
			return res.status(StatusCodes.OK).json({ assistants: [] });
		}

		const allAssistants = await Assistant.find({ is_deleted: false })
			.skip((currentPage - 1) * pageSize + 3)
			.limit(pageSize)
			.sort({ createdAt: -1 });

		res.status(StatusCodes.OK).json({
			allAssistants,
			currentPage,
			totalPages,
			message: AssistantMessages.ASSISTANT_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function getChatPerAssistant
 * @description Get all chats for a specific assistant by the user
 * @param {Object} req - The request object. Expected params: assistant_id. Expected query: thread_id (required), limit, after, before.
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the chat
 * @returns {Response} 200 - Returns chat messages and metadata
 */
export const getChatPerAssistant = async (req, res, next) => {
	const { _id: user_id } = req.user;
	const { assistant_id } = req.params;
	const { thread_id, limit, after, before } = req.query;

	if (!thread_id) {
		return next(BadRequest(AssistantMessages.ASSISTANT_THREAD_NOT_FROUND));
	}

	let messages = [],
		directResponse = [],
		metadata = { first_id: null, last_id: null, has_more: false };

	let query = {
		order: 'desc', // changing order in future will require change in formatting data at line 239
		limit: limit || 20,
	};

	if (after) {
		query.after = after;
	}

	if (before) {
		query.before = before;
	}

	try {
		const existingThread = await AssistantThread.findOne({
			assistant_id,
			user: user_id,
			thread_id,
		}).lean();

		if (existingThread) {
			console.log(existingThread);
			// initialize openai to retrieve messages
			const openai = openAI;

			const threadMessages = await openai.beta.threads.messages.list(
				existingThread.thread_id,
				query
			);
			if (threadMessages.data) {
				directResponse = threadMessages;
				// formatting the data as per our need
				messages = threadMessages.data.reduce((result, message) => {
					const { id, created_at, role, content, thread_id } =
						message;
					// in DESC => [[0]assistant -> [1]user], in ASC => [[0]user -> [1]assistant] <=> array order of responses
					if (message.role === 'assistant') {
						result.push({
							botMessage: content[0]?.text.value,
							chatPrompt: '',
						});
					} else if (message.role === 'user') {
						result[result.length - 1].chatPrompt =
							content[0]?.text.value;
						result[result.length - 1].msg_id = id;
						result[result.length - 1].created_at = new Date(
							created_at * 1000
						).toISOString();
					}
					return result;
				}, []);

				// sending metadata for pagination
				metadata = {
					first_id: threadMessages.body?.first_id || null,
					last_id: threadMessages.body?.last_id || null,
					has_more: threadMessages.body?.has_more || false,
				};
			}
		}

		res.status(StatusCodes.OK).json({ messages: messages, metadata });
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function updateAssistantFiles
 * @description Update the file associations of specific assistant
 * @param {Object} req - The request object. Expected params: assistant_id. Files in request object body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to update the assistant
 * @returns {Response} 201 - Returns successfully updated assistant
 */
export const updateAssistantFiles = async (req, res, next) => {
	const { assistant_id } = req.params;
	const files = req.files;

	try {
		const existingAssistant = await Assistant.findOne({ assistant_id });

		// TODO: Handle the case when the assistant is not found in a separate function
		if (!existingAssistant) {
			next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
			return;
		}

		const openai = openAI;

		const myAssistant = await openai.beta.assistants.retrieve(assistant_id);

		let fileIds = [...myAssistant.file_ids];

		/*
        You can attach a maximum of 20 files per Assistant, and they can be at most 512 MB each.
        ref: https://platform.openai.com/docs/assistants/how-it-works/creating-assistants
         */
		if (fileIds.length === 20 || fileIds.length + files.length >= 20) {
			return next(
				BadRequest(AssistantMessages.FILES_AND_PROPERTIES_UPDATED)
			);
		}

		if (files) {
			const filePromises = files.map(async (file) => {
				const uploadedFile = await openai.files.create({
					file: fs.createReadStream(file.path),
					purpose: 'assistants',
				});

				return uploadedFile.id;
			});

			fileIds = [...fileIds, ...(await Promise.all(filePromises))];

			// Delete the uploaded files from the "docs" directory
			files.forEach((file) => {
				fs.unlink(file.path, (err) => {
					if (err) {
						console.error(`Error deleting file: ${file.path}`, err);
					}
				});
			});
		}

		const myUpdatedAssistant = await openai.beta.assistants.update(
			assistant_id,
			{
				file_ids: [...fileIds],
			}
		);

		if (myUpdatedAssistant) {
			existingAssistant.file_ids = fileIds;
			existingAssistant.save();
		}

		res.status(StatusCodes.CREATED).json({
			message: AssistantMessages.FILES_UPDATED,
			assistant: myAssistant,
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * @async
 * @function assignTeamToAssistant
 * @description Assign a team to an assistant
 * @param {Object} req - The request object. Expected params: assistant_id. Expected body: teamIds
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to assign the team to the assistant
 * @returns {Response} 200 - Returns success message and result of the operation
 */
export const assignTeamToAssistant = async (req, res, next) => {
	const { assistant_id } = req.params;
	const { teamIds } = req.body;

	try {
		const isExistingAssistant = await Assistant.findOne({
			_id: assistant_id,
		});

		if (isExistingAssistant && Array.isArray(teamIds)) {
			isExistingAssistant.teamId = teamIds;
			const result = await isExistingAssistant.save();

			res.status(StatusCodes.OK).json({
				result,
				message: AssistantMessages.ASSISTANT_ASSIGNED_TO_TEAM,
			});
		} else {
			next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
			return;
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/**
 * @async
 * @function updateAssistant
 * @description Perform updating fields for an existing assistant
 * @param {Object} req - The request object. Expected params: assistant_id. Assistant properties in the body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to update the assistant
 * @returns {Response} 200 - Returns success message and result of the operation
 */
export const updateAssistant = async (req, res, next) => {
	const { assistant_id } = req.params;
	const { name, model, is_active = null } = req.body; // add more value as per the requirements

	try {
		const isExistingAssistant = await Assistant.findOne({
			_id: assistant_id,
		});

		if (isExistingAssistant) {
			isExistingAssistant.name = name || isExistingAssistant.name;
			isExistingAssistant.model = model || isExistingAssistant.model;
			isExistingAssistant.is_active =
				is_active !== null ? is_active : isExistingAssistant.is_active;

			const result = await isExistingAssistant.save();

			res.status(StatusCodes.OK).json({
				result,
				message: AssistantMessages.ASSISTANT_UPDATED_SUCCESSFULLY,
			});
			return;
		} else {
			next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
			return;
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

const softDeleteAssistant = async (existingAssistant) => {
	existingAssistant.is_deleted = true;
	await existingAssistant.save();
};

const hardDeleteAssistant = async (openai, assistantId, existingAssistant) => {
	try {
		await openai.beta.assistants.del(assistantId);
		await existingAssistant.delete();
	} catch (error) {
		res.status(StatusCodes.BAD_REQUEST).json({
			message: errorMessage.ASSISTANT_NOT_FOUND,
		});
		return;
	}
};

/**
 * @async
 * @function deleteAssistant
 * @description Delete an existing assistant
 * @param {Object} req - The request object. Expected params: assistant_id
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to delete the assistant
 * @returns {Response} 200 - Returns success message
 */
export const deleteAssistant = async (req, res) => {
	const { assistant_id } = req.params;

	try {
		const openai = openAI;

		const existingAssistant = await Assistant.findOne({
			assistant_id: assistant_id,
		});

		console.log(existingAssistant, 'existingAssistant');

		if (!existingAssistant) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.json({ message: AssistantMessages.ASSISTANT_NOT_FOUND });
		}

		if (existingAssistant.category === 'ORGANIZATIONAL') {
			// Perform a soft delete
			await softDeleteAssistant(existingAssistant);
		} else {
			// Perform a hard delete
			await hardDeleteAssistant(openai, assistant_id, existingAssistant);
		}

		res.status(StatusCodes.OK).json({
			message: errorMessage.ASSISTANT_DELETED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * @async
 * @function updateAssistantDataWithFile
 * @description Update assistant data and associated files
 * @param {Object} req - The request object. Expected params: assistant_id. Assistant properties and files in the request body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to update the assistant
 * @returns {Response} 201 - Returns success message and updated assistant
 */
export const updateAssistantDataWithFile = async (req, res) => {
	try {
		const { assistant_id } = req.params;
		const files = req.files;
		const {
			name,
			instructions,
			model,
			tools: toolsString,
			teamId,
			staticQuestions,
			category,
			deleted_files,
			description,
		} = req.body;

		const openai = openAI;

		const existingAssistant = await Assistant.findOne({ assistant_id });

		if (!existingAssistant) {
			return res.status(StatusCodes.NOT_FOUND).json({
				message: AssistantMessages.ASSISTANT_NOT_FOUND,
			});
		}

		const myAssistant = await openai.beta.assistants.retrieve(assistant_id);

		let fileIds = [...myAssistant.file_ids];

		if (deleted_files) {
			fileIds = await deleteAssistantFilesAndFilterIds(
				openai,
				assistant_id,
				fileIds,
				JSON.parse(deleted_files)
			);
		}

		if (
			fileIds.length === 20 ||
			(files && fileIds.length + files.length >= 20)
		) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: AssistantMessages.FILE_LIMIT_REACHED,
			});
		}

		if (files) {
			fileIds = [...fileIds, ...(await uploadFiles(openai, files))];

			files.forEach((file) => {
				fs.unlink(file.path, (err) => {
					if (err) {
						console.error(`Error deleting file: ${file.path}`, err);
					}
				});
			});
		}

		const updateData = {
			file_ids: fileIds,
			name,
			instructions,
			model,
			tools: toolsString ? parseTools(toolsString) : [],
			// teamId,
			// static_questions: staticQuestions,
			// category,
			// description,
		};

		const myUpdatedAssistant = await updateAssistantProperties(
			openai,
			assistant_id,
			updateData
		);

		if (myUpdatedAssistant) {
			Object.assign(existingAssistant, {
				file_ids: fileIds,
				name: myUpdatedAssistant.name,
				instructions: myUpdatedAssistant.instructions,
				model: myUpdatedAssistant.model,
				tools: updateData.tools,
				teamId,
				static_questions: staticQuestions ? parseStaticQuestions(staticQuestions) : [],
				category,
				description,
			});

			await existingAssistant.save();
		}

		res.status(StatusCodes.CREATED).json({
			message: AssistantMessages.FILES_AND_PROPERTIES_UPDATED,
			assistant: existingAssistant,
		});
	} catch (error) {
		console.error(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};

/** ============== UTILITY FUNCTION =================== */
const parseTools = (toolsString) => {
	try {
		return JSON.parse(toolsString).map((tool) => ({ type: tool }));
	} catch (error) {
		console.error('Error parsing tools:', error);
		throw new Error('Invalid tools format');
	}
};

const parseStaticQuestions = (staticQuestionsString) => {
	try {
	  return JSON.parse(staticQuestionsString);
	} catch (error) {
	  console.error('Error parsing static questions:', error);
	  throw new Error('Invalid static questions format');
	}
  };
  

  const deleteAssistantFilesAndFilterIds = async (openai, assistantId, fileIds, deletedFileIds) => {
	try {
	  for (const deletedFileId of deletedFileIds) {
		await openai.beta.assistants.files.del(assistantId, deletedFileId);
	  }
	  return fileIds.filter((fileId) => !deletedFileIds.includes(fileId));
	} catch (error) {
	  console.error('Error deleting assistant files:', error);
	  throw error;
	}
  };
  

const uploadFiles = async (openai, files) => {
	const filePromises = files.map(async (file) => {
		const uploadedFile = await openai.files.create({
			file: fs.createReadStream(file.path),
			purpose: 'assistants',
		});

		return uploadedFile.id;
	});

	return Promise.all(filePromises);
};

const updateAssistantProperties = async (openai, assistantId, updateData) => {
	return openai.beta.assistants.update(assistantId, updateData);
};
