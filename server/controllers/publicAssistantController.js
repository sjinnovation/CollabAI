import { getDistinctPublicAssistantWithQueryService, getPublicAssistantWithQueryService, getPublicFeaturedAssistantWithQueryService, createPublicAssistantService, getAllPublicAssistantService, getSinglePublicAssistantService, getSinglePublicAssistantByIdOrAssistantIdService, deletePublicAssistantService } from '../service/publicAssistantService.js';
import { getSingleAssistantByIdService } from '../service/assistantService.js';
import {
	createFavouriteAssistantService,
	getAllFavouriteAssistantService,
	getSingleFavouriteAssistantService,
	getSingleFavouriteAssistantByIdOrUserIdService,
	getFavouriteAssistantByAssistantIdAndUserIdService,
	deleteFavouriteAssistantService,
	deleteManyFavouriteAssistantService,
	updateSingleFavouriteAssistantService,
	countFavouriteAssistantService
} from '../service/favoriteAssistantService.js';
import { PublicAssistantMessages, FavoriteAssistantMessages, } from '../constants/enums.js';
import { StatusCodes } from 'http-status-codes';
import { CommonMessages } from '../constants/enums.js';
import Assistant from '../models/assistantModel.js';
import {
	InternalServer,
} from "../middlewares/customError.js";


/**
 * @async
 * @function getAllPublicAssistantWithDetails
 * @description Get all categorized public assistant 
 * @param {Object} req - There is no  request body
 * @param {Object} res - response object will be all the categorized public assistant 
 * @throws {Error} Will throw an error if it fails to get the public assistant 
 * @returns {Response} 201 - Returns success message and public Assistant json array .And 500 - returns internal server error
 */
export const getAllPublicAssistantWithDetails = async (req, res, next) => {
	try {
		const { search, type } = req.query;
		const queryConditions = { is_public: true };

		if (search) {
			queryConditions['$or'] = [
				{ name: { $regex: search, $options: 'i' } },
				{ assistantTypes: { $regex: search, $options: 'i' } }
			];
		}

		if (type) {
			queryConditions['assistantTypes'] = type;
		}

		const assistantTypes = await getDistinctPublicAssistantWithQueryService(queryConditions);

		const assistantByTypes = [];


		for (const type of assistantTypes) {
			const page = parseInt(req.query[`${type}_page`] || '1');
			const limit = parseInt(req.query[`${type}_limit`] || '20');
			const skip = (page - 1) * limit;
			const assistants = await getPublicAssistantWithQueryService(type, queryConditions, skip, limit);
			assistantByTypes.push({ "categoryName": type,"categoryInfo": { page, limit, assistants } });
		}


		const featuredPage = parseInt(req.query['featured_page'] || '1');
		const featuredLimit = parseInt(req.query['featured_limit'] || '20');
		const featuredSkip = (featuredPage - 1) * featuredLimit;

		const featuredAssistants = await getPublicFeaturedAssistantWithQueryService(queryConditions, featuredSkip, featuredLimit);

		const featuredAssistant = {
			page: featuredPage,
			limit: featuredLimit,
			assistants: featuredAssistants
		};

		res.status(StatusCodes.OK).json({ data: { featuredAssistant, assistantByTypes }, message: PublicAssistantMessages.PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY });
	} catch (error) {
		return next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));

	}
};


/**
 * @async
 * @function addPublicAssistant
 * @description Add new public assistant
 * @param {Object} req - The request object. Request Body: assistant_id, creators_id in the request body
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to add the public assistant
 * @returns {Response} 201 - Returns success message and  assistant details . And 500 - returns internal server error
 */
//Public Assistant
export const addPublicAssistant = async (req, res) => {
	try {
		const { assistant_id, creators_id } = req.body;
		const isExistingPubAssistant = await getSinglePublicAssistantService(assistant_id);

		if (isExistingPubAssistant) {
			return res.status(StatusCodes.BAD_REQUEST).json({ message: PublicAssistantMessages.DOCUMENT_ALREADY_EXIST_IN_PUBLIC });
		}
		const assistantInfo = await createPublicAssistantService(assistant_id, creators_id);
		return res.status(StatusCodes.CREATED).json({
			assistantInfo,
			message: PublicAssistantMessages.ADDED_SUCCESSFULLY
		});
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};


/**
 * @async
 * @function getAllPublicAssistant
 * @description Get all public assistant
 * @param {Object} req - There is no  request body
 * @param {Object} res - response object will be all the public assistant along with the favorite count
 * @throws {Error} Will throw an error if it fails to get the public assistant 
 * @returns {Response} 201 - Returns success message and public Assistant json array .And 500 - returns internal server error
 */

export const getAllPublicAssistant = async (req, res) => {
	try {
		const publicAssistant_json_array = []
		const publicAssistantDocuments = await getAllPublicAssistantService();
		for (const publicAssistantDoc of publicAssistantDocuments) {
			const count = await countFavouriteAssistantService(publicAssistantDoc.assistant_id);
			const plainPublicAssistantDocument = publicAssistantDoc.toObject();
			const documentWithCount = { ...plainPublicAssistantDocument, 'count': count };
			publicAssistant_json_array.push(documentWithCount);
		}

		return res.status(StatusCodes.OK).json({
			publicAssistant_json_array,
			message: PublicAssistantMessages.PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY
		});
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * @async
 * @function getSinglePublicAssistant
 * @description get single public assistant with it's id
 * @param {Object} req - The request object. there is no request body but 'id' should pass as a parameter with endpoint 
 * @param {Object} res - The response will be a public assistant with favorite count
 * @throws {Error} Will throw an error if it fails to get the public assistant
 * @returns {Response} 200 - Returns success message and assistant details . And 500 - returns internal server error
 */

export const getSinglePublicAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const publicAssistantDocument = await getSinglePublicAssistantByIdOrAssistantIdService(id);

		if (publicAssistantDocument) {
			const count = await countFavouriteAssistantService(publicAssistantDocument.assistant_id);
			const plainPublicAssistantDocument = publicAssistantDocument.toObject();
			const documentWithCount = { ...plainPublicAssistantDocument, 'count': count };
			return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY, documentWithCount });

		} else {
			const count = 0;
			return res.status(StatusCodes.OK).json({ message: CommonMessages.NOT_FOUND_ERROR, count });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * @async
 * @function updateSinglePublicAssistant
 * @description update single public assistant with it's id
 * @param {Object} req - The request object. Request Body : updated information of the assistant  and  'id' should pass as a parameter with endpoint 
 * @param {Object} res - The response will be a public assistant 
 * @throws {Error} Will throw an error if it fails to update the public assistant
 * @returns {Response} 200 - Returns success message and assistant details . And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const updateSinglePublicAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const { assistant_id = null, creators_id = null, is_featured = null, count = 0 } = req.body;
		const isExistingAssistant = await getSinglePublicAssistantService(id);

		if (isExistingAssistant) {
			isExistingAssistant.assistant_id = assistant_id || isExistingAssistant.assistant_id;
			isExistingAssistant.creators_id = creators_id || isExistingAssistant.creators_id;
			isExistingAssistant.is_featured = is_featured !== null ? is_featured : isExistingAssistant.is_featured;
			let num = isExistingAssistant.count
			isExistingAssistant.count = count !== 0 ? (num + count) : isExistingAssistant.count;
			const updatedDocument = await isExistingAssistant.save();

			if (updatedDocument) {
				return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.PUBLIC_ASSISTANT_UPDATED_SUCCESSFULLY, updatedDocument });

			} else {
				return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
			}
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * @async
 * @function deleteSinglePublicAssistant
 * @description delete single public assistant with it's id
 * @param {Object} req - The request object. There is no request body but 'id' should pass as a parameter with endpoint 
 * @param {Object} res - The response will be a public assistant 
 * @throws {Error} Will throw an error if it fails to delete the public assistant
 * @returns {Response} 200 - Returns success message  . And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const deleteSinglePublicAssistant = async (req, res) => {
	try {
		const { id } = req.params;
		const publicAssistantDocument = await getSinglePublicAssistantService(id);

		if (publicAssistantDocument) {

			const deletedDocument = await deletePublicAssistantService(id);
			if (deletedDocument) {
				const findFromFavourite = await getSingleFavouriteAssistantService(publicAssistantDocument.assistant_id);

				if (findFromFavourite != null && findFromFavourite) {
					const deleteFromFavourite = await deleteManyFavouriteAssistantService(publicAssistantDocument.assistant_id);

					if (deleteFromFavourite) {
						return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.DELETED_SUCCESSFULLY_FROM_PUBLIC });
					}
					else {
						return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
					}
				}
				else {
					res.json({ message: PublicAssistantMessages.DELETED_SUCCESSFULLY_FROM_PUBLIC });

				}
			} else {
				return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
			}
		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}

	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};


/**
 * @async
 * @function getSingleUsersPubAssistWithDetails
 * @description get  all public assistants 
 * @param {Object} req - The request object. there is no request body.But 'id' should be pass a parameter with the end point 
 * @param {Object} res - The response will be a public assistant details
 * @throws {Error} Will throw an error if it fails to get public assistant
 * @returns {Response} 200 - Returns success message  and assistant details. And 500 - returns internal server error . And 404 - if the assistant is not found
 */

export const getSingleUsersPubAssistWithDetails = async (req, res, next) => {
	try {
		const allPublicAssistant = await getAllPublicAssistantService();
		let result = [];
		for (const publicAssistantData of allPublicAssistant) {
			const assistantId = publicAssistantData['assistant_id'];
			const assistant = await getSingleAssistantByIdService(assistantId);

			if (!assistant) {
				continue
			}
			result.push(assistant);
		}


		if (allPublicAssistant) {
			return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY, result });

		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};