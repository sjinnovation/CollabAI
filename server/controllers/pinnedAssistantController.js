import {
	createPinnedAssistantService,
	getAllPinnedAssistantService,
	getSinglePinnedAssistantService,
	getSinglePinnedAssistantByIdOrUserIdService,
	getPinnedAssistantByAssistantIdAndUserIdService,
	deletePinnedAssistantService,
	deleteManyPinnedAssistantService,
	updateSinglePinnedAssistantService
} from "../service/PinnedAssistantService.js";

import { StatusCodes } from "http-status-codes";
import {
	InternalServer,
} from "../middlewares/customError.js";
import { CommonMessages, PinnedAssistantMessages } from "../constants/enums.js";

/**
 * @async
 * @function getAllPinnedAssistant
 * @description get all Pinned assistant 
 * @param {Object} req - There is no request body.
 * @param {Object} res - The response will be all pinned assistant 
 * @throws {Error} Will throw an error if it fails to get assistants
 * @returns {Response} 200 - Returns success message  and the assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */
export const getAllPinnedAssistant = async (req, res) => {
	const allPinnedAssistant = await getAllPinnedAssistantService();
	return res.status(StatusCodes.OK).json({
		data: allPinnedAssistant,
		message: PinnedAssistantMessages.PINNED_ASSISTANT_FETCHED_SUCCESSFULLY,
	});

};
/**
 * @async
 * @function getSinglePinnedAssistant
 * @description get a Pinned assistant 
 * @param {Object} req - There is no request body.
 * @param {Object} res - The response will be a pinned assistant 
 * @throws {Error} Will throw an error if it fails to get assistants
 * @returns {Response} 200 - Returns success message  and the assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */
export const getSinglePinnedAssistant = async (req, res) => {
	const { assistant_id } = req.params;
	const data = await getAllPinnedAssistantService({ assistant_id });
	return res.status(StatusCodes.OK).json({ message: PinnedAssistantMessages.PINNED_ASSISTANT_FETCHED_SUCCESSFULLY, data });
};


/**
 * @async
 * @function getSingleUsersPinnedAssistWithDetails
 * @description get single users all Pinned assistant with details 
 * @param {Object} req - There is no request body.
 * @param {Object} res - The response will be single users all Pinned assistant 
 * @throws {Error} Will throw an error if it fails to get assistants
 * @returns {Response} 200 - Returns success message  and the assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */
export const getSingleUsersPinnedAssistWithDetails = async (req, res) => {
	const singleUsersPinnedAssistants = await getAllPinnedAssistantService({ assistant_id });
	return res.status(StatusCodes.OK).json({ data: singleUsersPinnedAssistants, message: PinnedAssistantMessages.PINNED_ASSISTANT_FETCHED_SUCCESSFULLY });
};

/**
 * @async
 * @function addPinnedAssistant
 * @description add single Pinned assistant 
 * @param {Object} req - The request object. The request body will be user_id and assistant_id.
 * @param {Object} res - The response will be a pinned assistant 
 * @throws {Error} Will throw an error if it fails to add the pinned assistant
 * @returns {Response} 200 - Returns success message  and the assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */
export const addPinnedAssistant = async (req, res, next) => {
	const { assistantId, userId } = req.body;
	try {

		const isExistingPinnedAssistant = await getPinnedAssistantByAssistantIdAndUserIdService(assistantId, userId);
		if (isExistingPinnedAssistant) {
			return res.status(StatusCodes.BAD_REQUEST).json({ message: PinnedAssistantMessages.ALREADY_EXIST_IN_PINNED_ASSISTANT_LIST_OF_USER });
		}
		const responseFromCreatePinned = await createPinnedAssistantService(assistantId, userId);
		return res.status(StatusCodes.CREATED).json({
			responseFromCreatePinned,
			message: PinnedAssistantMessages.ADDED_IN_PINNED_ASSISTANT_LIST_SUCCESSFULLY,
		});
	} catch (error) {
		next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));

	}
};


/**
 * @async
 * @function deleteSinglePinnedAssistant
 * @description DELETE single Pinned assistant 
 * @param {Object} req - The request do not have any body.But it will contain pinned assistant ID in the params.
 * @param {Object} res - The response will be a message confirming the deletion 
 * @throws {Error} Will throw an error if it fails to delete
 * @returns {Response} 200 - Returns success message And 500 - returns internal server error . And 404 - if the assistant is not found
 */
export const deleteSinglePinnedAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedDocument = await deletePinnedAssistantService(id);

		if (deletedDocument) {
			return res.status(StatusCodes.OK).json({ message: PinnedAssistantMessages.DELETED_SUCCESSFULLY_FROM_PINNED_ASSISTANT_LIST });
		}
	} catch (error) {
		next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};
