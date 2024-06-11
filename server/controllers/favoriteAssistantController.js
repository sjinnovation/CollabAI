import {
	createFavouriteAssistantService,
	getAllFavouriteAssistantService,
	getSingleFavouriteAssistantService,
	getSingleFavouriteAssistantByIdOrUserIdService,
	getFavouriteAssistantByAssistantIdAndUserIdService,
	deleteFavouriteAssistantService,
	deleteManyFavouriteAssistantService,
	updateSingleFavouriteAssistantService,
	countFavouriteAssistantService,
} from '../service/favoriteAssistantService.js';
import { getAllPublicAssistantService } from '../service/publicAssistantService.js';

import { AssistantMessages, CommonMessages, FavoriteAssistantMessages } from '../constants/enums.js';

import { getSingleAssistantByIdService, } from '../service/assistantService.js';
import { StatusCodes } from 'http-status-codes';

/**
 * @async
 * @function addFavouriteAssistant
 * @description add single favorite assistant 
 * @param {Object} req - The request object. The request body will be user_id and assistant_id.
 * @param {Object} res - The response will be a favorite assistant 
 * @throws {Error} Will throw an error if it fails to add the favorite assistant
 * @returns {Response} 200 - Returns success message  and the assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */

//Favourite Assiatant
export const addFavouriteAssistant = async (req, res) => {
	try {
		const { assistant_id, user_id } = req.body;
		const isExistingFavAssistant = await getFavouriteAssistantByAssistantIdAndUserIdService(assistant_id, user_id);
		if (isExistingFavAssistant) {
			return res.status(StatusCodes.BAD_REQUEST).json({ message: FavoriteAssistantMessages.DOCUMENT_ALREADY_EXIST_IN_FAVORITE });
		}
		const responseFromCreateFavorite = await createFavouriteAssistantService(assistant_id, user_id);

		return res.status(StatusCodes.CREATED).json({
			responseFromCreateFavorite,
			message: FavoriteAssistantMessages.ADDED_IN_FAVORITE_SUCCESSFULLY,
		});
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * @async
 * @function getAllFavouriteAssistant
 * @description get all favorite assistants 
 * @param {Object} req - The request object. there is no request body.
 * @param {Object} res - The response will be all favorite assistants json array
 * @throws {Error} Will throw an error if it fails to get favorite assistant
 * @returns {Response} 200 - Returns success message  and assistants details. And 500 - returns internal server error 
 */

export const getAllFavouriteAssistant = async (req, res) => {
	try {
		const allFavoriteAssistant = await getAllFavouriteAssistantService();
		return res.status(StatusCodes.OK).json({
			allFavoriteAssistant,
			message: FavoriteAssistantMessages.FAVORITE_ASSISTANT_FETCH_SUCCESSFULLY,
		});
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * @async
 * @function getSingleFavouriteAssistant
 * @description get single favorite assistants 
 * @param {Object} req - The request object. there is no request body.But 'id' should be pass a parameter with the end point
 * @param {Object} res - The response will be a favorite assistant details
 * @throws {Error} Will throw an error if it fails to get favorite assistant
 * @returns {Response} 200 - Returns success message  and assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const getSingleFavouriteAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const singleFavoriteAssistant = await getSingleFavouriteAssistantByIdOrUserIdService(id);

		if (singleFavoriteAssistant) {
			return res.status(StatusCodes.OK).json({
				singleFavoriteAssistant,
				message: FavoriteAssistantMessages.FAVORITE_ASSISTANT_FETCH_SUCCESSFULLY,
			});
		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * @async
 * @function getSingleUsersFavAssistWithDetails
 * @description get single favorite assistants 
 * @param {Object} req - The request object. there is no request body.But 'id' should be pass a parameter with the end point and 'id' can be documents id or user's id
 * @param {Object} res - The response will be a favorite assistant details
 * @throws {Error} Will throw an error if it fails to get favorite assistant
 * @returns {Response} 200 - Returns success message  and assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const getSingleUsersFavAssistWithDetails = async (req, res, next) => {
	try {
		const { id } = req.params;

		const singleFavouriteAssistantById = await getSingleFavouriteAssistantByIdOrUserIdService(id);

		let result = [];

		for (const favoriteAssistantData of singleFavouriteAssistantById) {
			const assistantId = favoriteAssistantData['assistant_id'];
			const assistant = await getSingleAssistantByIdService(assistantId);

			if (!assistant) {
				return next(NotFound(AssistantMessages.ASSISTANT_NOT_FOUND));
			}
			result.push(assistant);

		}

		if (singleFavouriteAssistantById) {
			return res.status(StatusCodes.OK).json({
				result,
				message: FavoriteAssistantMessages.FAVORITE_ASSISTANT_FETCH_SUCCESSFULLY,
			});
		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};


/**
 * @async
 * @function updateSingleFavouriteAssistant
 * @description update single favorite assistants 
 * @param {Object} req - The request object. Request body : assistant's details.But 'id' should be pass a parameter with the end point 
 * @param {Object} res - The response will be a favorite assistant details
 * @throws {Error} Will throw an error if it fails to update favorite assistant
 * @returns {Response} 200 - Returns success message and assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const updateSingleFavouriteAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const updatedData = req.body;
		const updatedDocument = await updateSingleFavouriteAssistantService(id, updatedData);

		if (updatedDocument) {
			return res.status(StatusCodes.OK).json({
				updatedDocument,
				message: FavoriteAssistantMessages.FAVORITE_ASSISTANT_UPDATED_SUCCESSFULLY,
			});
		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};


/**
 * @async
 * @function deleteSingleFavouriteAssistant
 * @description delete single public assistant 
 * @param {Object} req - The request object.There is not request body.But 'id' should be pass a parameter with the end point 
 * @param {Object} res - The response will be a favorite assistant details
 * @throws {Error} Will throw an error if it fails to delete favorite assistant
 * @returns {Response} 200 - Returns success message . And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const deleteSingleFavouriteAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const deletedDocument = await deleteFavouriteAssistantService(id);

		if (deletedDocument) {
			return res.status(StatusCodes.OK).json({ message: FavoriteAssistantMessages.DELETED_SUCCESSFULLY_FROM_OWN_FAVORITE });
		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};
