import { StatusCodes } from 'http-status-codes';
import { CommonMessages, TeamMessages } from '../constants/enums.js';
import Teams from '../models/teamModel.js';
import { NotFound,BadRequest } from '../middlewares/customError.js';

/**
* This function creates a new team.
* @static
* @param {Object} req - Request object. Expects teamTitle, hasAssistantCreationAccess.
* @param {Object} res - Response object.
* @param {Function} next - Next middleware function.
* @returns {Object} - Returns created team object.
*/
export const createTeam = async (req, res, next) => {
	const { teamTitle, hasAssistantCreationAccess } = req.body;

	try {
		if (!teamTitle) {
			next(BadRequest(TeamMessages.TITLE_REQUIRED));
			return;
		}

		const titleExist = await Teams.findOne({ isDeleted: false, teamTitle });
		if (titleExist) {
			return next(BadRequest(TeamMessages.TITLE_ALREADY_EXISTS));
		}

		const createdTeam = await Teams.create({
			teamTitle,
			hasAssistantCreationAccess: hasAssistantCreationAccess || false,
		});

		if (createdTeam) {
			return res.status(StatusCodes.CREATED).json({
				message: TeamMessages.TEAM_CREATED_SUCCESSFULLY,
				createdTeam,
			});
		}

		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: TeamMessages.TEAMS_CREATION_FAILED });
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
* This function gets all teams. 
* @static
* @param {Object} req - Request object.
* @param {Object} res - Response object.
* @returns {Array} - Returns array of team objects.
*/
export const getAllTeams = async (req, res) => {
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	try {
		const teams = await Teams.find({ isDeleted: false });
		const count = teams.length;
		const totalPages = Math.ceil(count / limit);
		res.status(StatusCodes.OK).json({
			message: TeamMessages.TEAMS_FETCHED_SUCCESSFULLY,
			teams,
		});
		return;
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
* This function updates a team by id.
* @static
* @param {Object} req - Request object. Expects teamTitle, hasAssistantCreationAccess.
* @param {Object} res - Response object.
* @returns {Object} - Returns updated team object.
*/
export const updateTeamById = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { teamTitle, hasAssistantCreationAccess } = req.body;

		const existingTeam = await Teams.findById(id);

		if (!existingTeam) {
			return next(NotFound(TeamMessages.TEAM_NOT_FOUND));
		}

		const updatedHasAssistantCreationAccess =
			hasAssistantCreationAccess !== undefined
				? hasAssistantCreationAccess
				: existingTeam.hasAssistantCreationAccess;

		const updatedTeam = await Teams.findByIdAndUpdate(
			id,
			{
				teamTitle,
				hasAssistantCreationAccess: updatedHasAssistantCreationAccess,
			},
			{ new: true }
		);

		return res.status(StatusCodes.OK).json({
			message: TeamMessages.TEAM_UPDATED_SUCCESSFULLY,
			updatedTeam,
		});
	} catch (error) {
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
* This function deletes a team by id. 
* @static
* @param {Object} req - Request object.
* @param {Object} res - Response object.
* @returns {Object} - Returns object with deletion message.
*/
export const deleteTeamById = async (req, res, next) => {
	const { id } = req.params;
	try {
		const team = await Teams.findById(id);

		if (team) {
			await Teams.findByIdAndUpdate(
				team._id,
				{ isDeleted: true },
				{ new: true }
			);
			return res.status(StatusCodes.OK).json({
				message: TeamMessages.TEAM_DELETED_SUCCESSFULLY,
			});
		} else {
			return next(NotFound(TeamMessages.TEAM_NOT_FOUND));
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
* This function gets a team by id. 
* @static
* @param {Object} req - Request object.
* @param {Object} res - Response object.
* @returns {Object} - Returns a team object.
*/
export const getTeamById = async (req, res, next) => {
	const { id } = req.params;
	try {
		const team = await Teams.findById(id);

		if (team) {
			return res.status(StatusCodes.OK).json({
				message: TeamMessages.TEAM_FETCHED_SUCCESSFULLY,
				team,
			});
		} else {
			return next(NotFound(TeamMessages.TEAM_NOT_FOUND));
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
* This function adds a new field to all existing teams. 
* @static
* @param {Object} req - Request object.
* @param {Object} res - Response object.
* @returns {Object} - Returns object with update status.
*/
export const addNewFieldToAllExistingData = async (req, res) => {
	try {
		const newFieldAdded = await Teams.updateMany(
			{},
			{ $set: { isDeleted: false } },
			{ multi: true }
		);

		return res
			.status(StatusCodes.OK)
			.json({ message: TeamMessages.NEW_FIELD_ADDED, newFieldAdded });
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};
