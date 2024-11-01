import { getDistinctPublicAssistantWithQueryService, getPublicAssistantWithQueryService, getPublicFeaturedAssistantWithQueryService, createPublicAssistantService, getAllPublicAssistantService, getSinglePublicAssistantService, getSinglePublicAssistantByIdOrAssistantIdService, deletePublicAssistantService, getAllPublicAssistantPaginatedService, getPublicAssistantWithQueryConditionService } from '../service/publicAssistantService.js';
import { getSingleAssistantByIdService, getSingleAssistantByIdWithUserDetailsService } from '../service/assistantService.js';
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
import AssistantTypes from '../models/assistantTypes.js';
import { getSortedAssistantTypes } from '../service/assistantTypeService.js';
import { doesAssistantExist } from '../lib/openai.js';
import { getOpenAIInstance } from '../config/openAI.js';
import PublicAssistant from '../models/public_assistant.js';

/**
 * @async
 * @function getAllPublicAssistantWithDetails
 * @description Get all categorized public assistant 
 * @param {Object} req - There is request body with loadMoreInfo
 * @param {Object} res - response object will be all the categorized public assistant 
 * @throws {Error} Will throw an error if it fails to get the public assistant 
 * @returns {Response} 201 - Returns success message and public Assistant json array .And 500 - returns internal server error
 */


export const getAllPublicAssistantWithDetails = async (req, res, next) => {
	try {
		const { search, type } = req.query;
		const {data} = req.body;

		const loadMoreInfo = data;
		const queryConditions = { is_public: true };

		if (search) {
			queryConditions['$or'] = [
				{ name: { $regex: search, $options: 'i' } },
				{ assistantTypes: { $regex: search, $options: 'i' } },
			];
		}
		if (type ) {
			queryConditions['assistantTypes'] = type;
		}
		const assistantTypesWithoutIcon = await getSortedAssistantTypes();
		let countOfAssistant = 0;
		const assistantByTypes = await Promise.all(
			assistantTypesWithoutIcon.map(async (type,i) => {
				let page = 1
				let limit = 6;
				let skip = 0;
				const isTypeInLoadMore =loadMoreInfo?.length > 0 ? loadMoreInfo?.find((info)=> info?.type?.toString() === type?.name ):null;
				if(loadMoreInfo?.length > 0 && isTypeInLoadMore?.page > 1){
					page = isTypeInLoadMore?.page;
					limit = 6*isTypeInLoadMore?.page;
					skip = 0;

				}else{
					page = parseInt(req.query[`${type.name}_page`] || '1');
					limit = parseInt(req.query[`${type.name}_limit`] || '6');
					skip = (page - 1)*limit;
				}
				const { assistants, totalCount } = await getPublicAssistantWithQueryConditionService(type?._id, queryConditions,limit,skip);

				if (assistants.length > 0) {
					countOfAssistant+=assistants?.length;
					return {
						categoryName: type?.name,
						categoryInfo: {
							page,
							limit,
							assistants: assistants?.length > 0 ? assistants : [], 
							totalAssistantCount : totalCount
 
						},
					};
				}
				
				return {
					categoryName: type?.name,
					categoryInfo: {
					  page,
					  limit,
					  assistants: [],  
					  totalAssistantCount : 0
					},
				  };

			})
		);

		let filteredAssistantByTypes = assistantByTypes?.filter(Boolean);
		if(type){
			const indexOfType = filteredAssistantByTypes?.findIndex((assistantInfo)=> assistantInfo?.categoryName === type );
			filteredAssistantByTypes = [filteredAssistantByTypes[indexOfType]];
		}
		if(search && countOfAssistant > 0){
			filteredAssistantByTypes = [filteredAssistantByTypes?.find((assistantInfo)=> assistantInfo?.categoryInfo?.assistants?.length > 0)];
		}
		if(search && countOfAssistant === 0){
			filteredAssistantByTypes=[];
		}

		let featuredPage = 1;
		let featuredLimit = 6;
		let featuredSkip = 0;


		if(loadMoreInfo?.length > 0 && loadMoreInfo[loadMoreInfo?.length-1]?.type ==='featured' &&  loadMoreInfo[loadMoreInfo?.length-1]?.page > 1){
			featuredPage = loadMoreInfo[loadMoreInfo.length-1].page;
			featuredLimit = loadMoreInfo[loadMoreInfo.length-1].page * 6

		}else{
			featuredPage = parseInt(req.query['featured_page'] || '1');
			featuredLimit = parseInt(req.query['featured_limit'] || '6');
			featuredSkip = (featuredPage - 1) * featuredLimit;
		}



		const {featuredAssistants, totalCount} = await getPublicFeaturedAssistantWithQueryService(
			queryConditions,
			featuredSkip,
			featuredLimit
		);

		const featuredAssistant = {
			page: featuredPage,
			limit: featuredLimit,
			assistants: featuredAssistants,
			totalAssistantCount : totalCount
		};

		res.status(StatusCodes.OK).json({
			data: { featuredAssistant, assistantByTypes: filteredAssistantByTypes },
			message: PublicAssistantMessages.PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY,
		});
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
		if (publicAssistantDocuments && publicAssistantDocuments?.length > 0) {
			for (const publicAssistantDoc of publicAssistantDocuments) {
				const count = await countFavouriteAssistantService(publicAssistantDoc?.assistant_id);
				const plainPublicAssistantDocument = publicAssistantDoc?.toObject();
				const documentWithCount = { ...plainPublicAssistantDocument, 'count': count };
				publicAssistant_json_array.push(documentWithCount);
			}

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
			const count = await countFavouriteAssistantService(publicAssistantDocument?.assistant_id);
			const plainPublicAssistantDocument = publicAssistantDocument?.toObject();
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
			isExistingAssistant.assistant_id = assistant_id || isExistingAssistant?.assistant_id;
			isExistingAssistant.creators_id = creators_id || isExistingAssistant?.creators_id;
			isExistingAssistant.is_featured = is_featured !== null ? is_featured : isExistingAssistant?.is_featured;
			let num = isExistingAssistant.count
			isExistingAssistant.count = count !== 0 ? (num + count) : isExistingAssistant?.count;
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
				const findFromFavourite = await getSingleFavouriteAssistantService(publicAssistantDocument?.assistant_id);
				if (findFromFavourite !== null && findFromFavourite) {
					const deleteFromFavourite = await deleteManyFavouriteAssistantService(publicAssistantDocument?.assistant_id);
					if (deleteFromFavourite) {
						return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.DELETED_SUCCESSFULLY_FROM_PUBLIC });
					}
					else {
						return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
					}
				}
				else {
					return res.json({ message: PublicAssistantMessages.DELETED_SUCCESSFULLY_FROM_PUBLIC });

				}
			} else {
				return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
			}
		}
		return res.json({ message: PublicAssistantMessages.DELETED_SUCCESSFULLY_FROM_PUBLIC });
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
		const { page = 1, pageSize = 10, searchQuery = "" } = req.query;
		const skip = (Number(page) - 1) * Number(pageSize);
		const limit = parseInt(pageSize);
		const openai = await getOpenAIInstance();

		let query = {}

		if (typeof searchQuery === "string" && searchQuery?.length) {
			query = {
				name: { $regex: new RegExp(searchQuery, "i") },
				is_public: true
			}
		}


		const { allPublicAssistant, totalCount } = await getAllPublicAssistantPaginatedService(skip, limit, query);
		let allPublicAssistantList = [];
		let result = [];

		if (allPublicAssistant && allPublicAssistant?.length > 0) {
			for (const assistant of allPublicAssistant) {
				const isExistingAssistant = await doesAssistantExist(openai, assistant?.assistant_id);
				if (isExistingAssistant === true) {
					allPublicAssistantList.push(assistant);

				}

			}
			for (const publicAssistantData of allPublicAssistantList) {
				const assistantId = publicAssistantData['assistant_id'];
				const assistantData = await getSingleAssistantByIdWithUserDetailsService(assistantId);
				const count = await countFavouriteAssistantService(assistantId);

				if (!assistantData) {
					continue
				}
				let assistant = {
					...assistantData,
					count
				};
				assistant.userInfo = assistant?.userId?.fname + " " + assistant?.userId?.lname
				assistant.userId = assistant?.userId?._id;
				result.push(assistant);
			}

		}



		if (allPublicAssistant) {
			return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY, result, totalCount });

		} else {
			return res.status(StatusCodes.NOT_FOUND).json({ message: CommonMessages.NOT_FOUND_ERROR });
		}
	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

export const syncAllAssistantWithOpenAI = async (req, res) => {
	try {
		const openai = await getOpenAIInstance();
		const allPublicAssistantInfo = await PublicAssistant.find();

		for (const assistant of allPublicAssistantInfo) {
			const isExistingAssistant = await doesAssistantExist(openai, assistant?.assistant_id);
			if (isExistingAssistant === false) {
				const deleteAssistantFromPublicList = await PublicAssistant.deleteOne({ assistant_id: assistant?.assistant_id });
				const updateAssistantPublicStatus = await Assistant.findOneAndUpdate({ assistant_id: assistant?.assistant_id }, {
					is_public: false
				});
			}
		}
		return res.status(StatusCodes.OK).json({ message: PublicAssistantMessages.PUBLIC_ASSISTANT_SYNCED_SUCCESSFULLY });

	} catch (error) {
		return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: CommonMessages.INTERNAL_SERVER_ERROR });

	}

}