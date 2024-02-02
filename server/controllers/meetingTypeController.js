import { StatusCodes } from 'http-status-codes';
import { CommonMessages, MeetingTypeMessages } from '../constants/enums.js';
import {
	BadRequest,
	InternalServer,
	NotFound,
} from '../middlewares/customError.js';
import MeetingType from '../models/meetingTypeModel.js';

/**
 * @async
 * @function createMeetingType
 * @description Creates a new meeting type
 * @param {Object} req - The request object. Expected body: meetingTitle
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to create the meeting type
 * @returns {Response} 201 - Returns success message and the created meeting type
 */
export const createMeetingType = async (req, res, next) => {
	const { meetingTitle } = req.body;
	try {
		if (!meetingTitle) {
			next(BadRequest(MeetingTypeMessages.MEETING_TITLE_REQUIRED));
			return;
		}

		const titleExist = await MeetingType.findOne({
			isDeleted: false,
			title: meetingTitle,
		});
		if (titleExist) {
			return next(
				BadRequest(MeetingTypeMessages.MEETING_TITLE_ALREADY_EXISTS)
			);
		}
		const meetingType = await MeetingType.create({
			title: meetingTitle,
		});

		if (meetingType) {
			return res.status(StatusCodes.CREATED).json({
				meetingType,
				message: MeetingTypeMessages.MEETING_TYPE_CREATED_SUCCESSFULLY,
			});
		}
	} catch (error) {
		next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * @async
 * @function getAllMeetingTypes
 * @description Fetches all meeting types that are not deleted
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch meeting types
 * @returns {Response} 200 - Returns the count and list of meeting types
 */
export const getAllMeetingTypes = async (req, res, next) => {
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	try {
		const meetingTypes = await MeetingType.find({ isDeleted: false });
		const count = meetingTypes.length;
		res.status(StatusCodes.OK).json({
			meetingTypes,
			message: MeetingTypeMessages.MEETING_TYPES_FETCHED_SUCCESSFULLY,
			count,
		});
	} catch (error) {
		next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * @async
 * @function updateMeetingTypeById
 * @description Update a meeting type by ID
 * @param {Object} req - The request object. Expected params: id
 * @param {Object} res - The response object. Expected body: meetingTitle
 * @throws {Error} Will throw an error if it fails to update the meeting type
 * @returns {Response} 200 - Returns success message and the updated meeting type
 */
export const updateMeetingTypeById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { meetingTitle } = req.body;

		if (!meetingTitle) {
			next(BadRequest(MeetingTypeMessages.MEETING_TITLE_REQUIRED));
			return;
		}

		const updatedMeetingType = await MeetingType.findByIdAndUpdate(
			id,
			{ title: meetingTitle },
			{ new: true }
		);

		if (!updatedMeetingType) {
			return next(NotFound(MeetingTypeMessages.MEETING_TYPE_NOT_FOUND));
		}

		return res.status(StatusCodes.OK).json({
			updatedMeetingType,
			message: MeetingTypeMessages.MEETING_TYPE_UPDATED_SUCCESSFULLY,
		});
	} catch (error) {
		console.log(error);
		return next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * @async
 * @function deleteMeetingTypeById
 * @description Delete a meeting type by ID
 * @param {Object} req - The request object. Expected body: id
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to delete the meeting type
 * @returns {Response} 200 - Returns a success message
 */
export const deleteMeetingTypeById = async (req, res, next) => {
	const { id } = req.params;

	// Find the Meeting type by ID
	try {
		const meetingType = await MeetingType.findById(id);

		if (meetingType) {
			// Soft deletion
			await MeetingType.findByIdAndUpdate(
				meetingType._id,
				{ isDeleted: true },
				{ new: true }
			);
			res.status(StatusCodes.OK).json({
				message: MeetingTypeMessages.MEETING_TYPE_DELETED_SUCCESSFULLY,
			});
		} else {
			return next(NotFound(MeetingTypeMessages.MEETING_TYPE_NOT_FOUND));
		}
	} catch (error) {
		return next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * @async
 * @function getMeetingTypeById
 * @description Fetch a meeting type by its ID
 * @param {Object} req - The request object. Expected body: id
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to fetch the meeting type
 * @returns {Response} 200 - Returns the meeting type
 */
export const getMeetingTypeById = async (req, res, next) => {
	const { id } = req.params;
	// Find the Meeting type by ID
	try {
		const meetingType = await MeetingType.findById(id);

		if (meetingType) {
			res.status(StatusCodes.OK).json({
				meetingType,
				message: MeetingTypeMessages.MEETING_TYPES_FETCHED_SUCCESSFULLY,
			});
		} else {
			return next(NotFound(MeetingTypeMessages.MEETING_TYPE_NOT_FOUND));
		}
	} catch (error) {
		return next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};

/**
 * @async
 * @function addNewFieldToAllExistingData
 * @description Adds 'isDeleted' field to all existing meeting types
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @throws {Error} Will throw an error if it fails to add new field to existing meeting types
 * @returns {Response} 200 - Returns a success message
 */
export const addNewFieldToAllExistingData = async (req, res, next) => {
	try {
		const newFieldAdded = await MeetingType.updateMany(
			{},
			{ $set: { isDeleted: false } },
			{ multi: true }
		);

		res.status(StatusCodes.OK).json({
			newFieldAdded,
			message: MeetingTypeMessages.ADDED_NEW_FIELD,
		});
	} catch (error) {
		return next(InternalServer(CommonMessages.INTERNAL_SERVER_ERROR));
	}
};
