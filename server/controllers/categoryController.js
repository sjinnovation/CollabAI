import StatusCodes from 'http-status-codes';
import Category from '../models/categoryModel.js';
import User from '../models/user.js';
import {
	BadRequest,
	InternalServer,
	Unauthorized,
} from '../middlewares/customError.js';
import { CategoryMessages } from '../constants/enums.js';

/**
 * @async
 * @function getAllActiveCategories
 * @description Fetches all categories that are not deleted
 * @param {Object} req - The request object. 
 * @param {Object} res - The response object.
 * @throws {Error} Will throw an error if failed to fetch categories
 */
export const getAllActiveCategories = async (req, res, next) => {
	try {
		const categories = await Category.find({ is_deleted: false });
		res.status(StatusCodes.OK).json({
			categories,
			message: CategoryMessages.CATEGORIES_FETCHED_SUCCESSFULLY,
		});
	} catch (error) {
		next(InternalServer(error.message));
	}
};

/**
 * @async
 * @function addCategory
 * @description Create a new category for a user if they're an admin
 * @param {Object} req - The request object. 
 * @param {Object} res - The response object. Expected params: userid. Expected body: category_name
 * @throws {Error} Will throw an error if failed to create category
 */
export const addCategory = async (req, res, next) => {
	const { userid } = req.params;
	const { category_name } = req.body;
	try {
		if (!userid) {
			next(BadRequest(CategoryMessages.USER_ID_EMPTY));
			return;
		}
		if (!category_name) {
			next(BadRequest(CategoryMessages.CATEGORY_NAME_EMPTY));
			return;
		}

		const user = await User.findOne({ _id: userid });
		if (!user) {
			next(BadRequest(CategoryMessages.USER_NOT_FOUND));
			return;
		}

		if (user.role == 'user') {
			next(Unauthorized(CategoryMessages.ONLY_ADMIN_CAN_ADD_CATEGORIES));
			return;
		}

		const category = await Category.findOne({
			category_name,
			is_deleted: false,
		});
		if (category) {
			next(BadRequest(CategoryMessages.CATEGORY_ALREADY_EXISTS));
			return;
		}
		const newCategory = await Category.create({
			category_name,
		});
		res.status(StatusCodes.OK).json({
			message: CategoryMessages.CATEGORY_ADDED_SUCCESSFULLY,
			newCategory,
		});
	} catch (error) {
        next(InternalServer(error.message));
    }
};

/**
 * @async
 * @function deleteCategory
 * @description Soft delete a category by marking it as deleted
 * @param {Object} req - The request object. Expected params: category_id.
 * @param {Object} res - The response object.
 * @throws {Error} Will throw an error if failed to mark category as deleted
 */
export const deleteCategory = async (req, res, next) => {
	const { category_id } = req.params;
    try {
        const category = await Category.findOne({ _id: category_id });
        if (!category) {
            next(BadRequest(CategoryMessages.CATEGORY_NOT_FOUND));
            return;
        }
        const newCategory = await Category.updateOne(
            { _id: category_id },
            { is_deleted: true }
        );
        res.status(StatusCodes.OK).json({
            message: CategoryMessages.CATEGORY_DELETED_SUCCESSFULLY,
            newCategory,
        });   
    } catch (error) {
        next(InternalServer(error.message));
    }
};

/**
 * @async
 * @function updateCategory
 * @description Update an existing category's name
 * @param {Object} req - The request object. Expected params: category_id. Expected body: category_name
 * @param {Object} res - The response object.
 * @throws {Error} Will throw an error if failed to update category
 */
export const updateCategory = async (req, res, next) => {
	const { category_id } = req.params;
	const { category_name } = req.body;
    try {
        if (!category_name) {
            next(BadRequest(CategoryMessages.CATEGORY_NAME_EMPTY));
            return;
        }
        const category = await Category.findOne({ _id: category_id });
        if (!category) {
            next(BadRequest(CategoryMessages.CATEGORY_NOT_FOUND));
            return;
        }
    
        const updatedCategory = await Category.updateOne(
            { _id: category_id },
            { category_name }
        );
        res.status(StatusCodes.OK).json({
            message: CategoryMessages.CATEGORY_UPDATED_SUCCESSFULLY,
            updatedCategory,
        });   
    } catch (error) {
        next(InternalServer(error.message));
    }
};

/**
 * @async
 * @function getCategoryById
 * @description Fetch a category using its id
 * @param {Object} req - The request object. Expected params: category_id
 * @param {Object} res - The response object.
 * @throws {Error} Will throw an error if failed to fetch category
 * @returns {Response} 200 - Returns fetched category
 */
export const getCategoryById = async (req, res, next) => {
	const { category_id } = req.params;
	try {
        const category = await Category.findOne({
            _id: category_id,
            is_deleted: false,
        });
        if (!category) {
            next(BadRequest(CategoryMessages.CATEGORY_NOT_FOUND));
            return;
        }
        res.status(StatusCodes.OK).json({ category, message: CategoryMessages.CATEGORY_FETCHED_SUCCESSFULLY });
    } catch (error) {
        next(InternalServer(error.message));
    }
};
