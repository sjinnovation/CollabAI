import Template from '../models/templateModel.js';
import Category from '../models/categoryModel.js';
import { StatusCodes } from 'http-status-codes';
import { CommonMessages } from '../constants/enums.js';
import { TemplateMessages } from '../constants/enums.js';
import { BadRequest, NotFound } from '../middlewares/customError.js';

/**
 * Asynchronous function to create a new template.
 * @param {Object} req - Request object, expected to contain 'title', 'description', and 'category' in the body.
 * @param {Object} res - Response object.
 * @function next - Calls the next function in the middleware stack.
 * @returns {JSON} Returns the created template if successful, otherwise an error message.
 */
export const createTemplate = async (req, res, next) => {
	const { title, description, category } = req.body;
	try {
		if (
			!isRequired(title, 'Title', next) ||
			!isRequired(description, 'Description', next) ||
			!isRequired(category, 'Category', next)
		)
			return;
		const categoryrec = await Category.findById(category);
		if (!categoryrec) {
			res.status(StatusCodes.BAD_REQUEST).json({
				message: TemplateMessages.INVALID_CATEGORY,
			});
			return;
		}
		const template = await Template.create({
			title,
			description,
			category,
		});
		if (template) {
			res.status(StatusCodes.CREATED).json({
				message: TemplateMessages.TEMPLATE_CREATED_SUCCESSFULLY,
				template,
			});
		} else {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
				message: TemplateMessages.TEMPLATE_CREATION_FAILED,
			});
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * Asynchronous function to get all templates grouped by category.
 * @async
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @returns {JSON} Returns grouped templates if successful, otherwise an error message.
 */
export const getTemplates = async (req, res) => {
	try {
		const templates = await Template.aggregate([
			{
				$lookup: {
					from: 'categories',
					localField: 'category',
					foreignField: '_id',
					as: 'category',
				},
			},
			{
				$unwind: '$category',
			},
			{
				$group: {
					_id: '$category.category_name',
					templates: {
						$push: {
							_id: '$_id',
							title: '$title',
							description: '$description',
						},
					},
				},
			},
		]);
		res.status(StatusCodes.OK).json({
			message: TemplateMessages.TEMPLATES_FETCHED_SUCCESSFULLY,
			templates,
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * Asynchronous function to get all templates for admin with pagination.
 * @async
 * @param {Object} req - Request object, expected to contain 'page' and 'limit' as query parameters.
 * @param {Object} res - Response object.
 * @returns {JSON} Returns paginated templates if successful.
 */
export const getTemplatesAdmin = async (req, res) => {
	const page = Number(req.query.page) || 1;
	const limit = Number(req.query.limit) || 10;
	const skip = (page - 1) * limit;
	try {
		const templates = await Template.find({}).limit(limit).skip(skip);

		const count = await Template.countDocuments({});

		res.send({
			message: TemplateMessages.TEMPLATES_FETCHED_SUCCESSFULLY,
			templates,
			page,
			pages: Math.ceil(count / limit),
		});
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * Asynchronous function to update a template by id.
 * @async
 * @param {Object} req - Request object, expected to contain 'id' as a path parameter and 'title', 'description',
 * and 'category' in the body.
 * @param {Object} res - Response object.
 * @returns {JSON} Returns updated template if successful, otherwise an error message.
 */
export const updateTemplateById = async (req, res, next) => {
	const { id } = req.params;
	const { title, description, category } = req.body;
	try {
		if (
			!isRequired(title, 'Title', next) ||
			!isRequired(description, 'Description', next) ||
			!isRequired(category, 'Category', next)
		)
			return;
		const categoryrec = await Category.findById(category);
		if (!categoryrec) {
			next(BadRequest(TemplateMessages.INVALID_CATEGORY));
			return;
		}

		const updatedTemplate = await Template.findByIdAndUpdate(
			id,
			{ title, description, category },
			{ new: true }
		);

		if (!updatedTemplate) {
			return next(NotFound(TemplateMessages.TEMPLATE_NOT_FOUND));
		}

		return res.status(StatusCodes.OK).json({
			message: TemplateMessages.TEMPLATE_UPDATED_SUCCESSFULLY,
			updatedTemplate,
		});
	} catch (error) {
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
	}
};

/**
 * Asynchronous function to delete a template by id.
 * @async
 * @param {Object} req - Request object, expected to contain 'id' as a path parameter.
 * @param {Object} res - Response object.
 * @returns {JSON} Returns success message if successful, otherwise an error message.
 */
export const deleteTemplate = async (req, res, next) => {
	const { id } = req.params;
	try {
		const template = await Template.findById(id);

		if (template) {
			await template.remove();

			res.status(StatusCodes.OK).json({
				message: TemplateMessages.TEMPLATE_DELETED_SUCCESSFULLY,
			});
			return;
		} else {
			return next(NotFound(TemplateMessages.TEMPLATE_NOT_FOUND));
		}
	} catch (error) {
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/**
 * Asynchronous function to get a template by id.
 * @async
 * @param {Object} req - Request object, expected to contain 'id' as a path parameter.
 * @param {Object} res - Response object.
 * @returns {JSON} Returns template if found, otherwise an error message.
 */
export const getTemplateById = async (req, res, next) => {
	const { id } = req.params;
	try {
		const template = await Template.findById(id);

		if (template) {
			res.status(StatusCodes.OK).json({
				message: TemplateMessages.TEMPLATE_FETCHED_SUCCESSFULLY,
				template,
			});
		} else {
			return next(NotFound(TemplateMessages.TEMPLATE_NOT_FOUND));
		}
	} catch (error) {
		console.log(error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: CommonMessages.INTERNAL_SERVER_ERROR,
		});
	}
};

/** ----------------- UTILITY FUNCTIONS -----------------*/
// Add all utility functions here with JSdoc.
// TODO: In later stages of refactoring move this to a separate file if needed.
/**
 * Function to check a required field.
 * @param {*} input - the value to be checked.
 * @param {*} field - the name of the field.
 * @param {*} res - Response object.
 * @returns {boolean} Returns true if the input exists otherwise false.
 */
const isRequired = (input, field, next) => {
	if (!input) {
		next(BadRequest(`${field} is required`));
		return false;
	}
	return true;
};
