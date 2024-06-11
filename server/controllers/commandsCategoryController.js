import StatusCodes from "http-status-codes";
import CommandsCategory from "../models/commandsCategoryModel.js";
import User from "../models/user.js";
import { BadRequest, InternalServer } from "../middlewares/customError.js";
import { CommandsCategoryMessages } from "../constants/enums.js";

/**
 * @async
 * @function addCommandCategory
 * @description Create a new command category.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object. Expected body: commandsCategoryName
 * @throws {Error} Will throw an error if failed to create command category
 */
export const addCommandCategory = async (req, res, next) => {
  const { commandsCategoryName } = req.body;

  try {
    if (!commandsCategoryName) {
      next(BadRequest(CommandsCategoryMessages.COMMANDS_CATEGORY_NAME_EMPTY));
      return;
    }

    // Convert the category name to lowercase for case-insensitive comparison
    const normalizedCategoryName = commandsCategoryName.toLowerCase();

    // Check for existing category with case-insensitive comparison
    const existingCategory = await CommandsCategory.findOne({
      commandsCategoryName: { $regex: new RegExp(`^${normalizedCategoryName}$`, 'i') }
    });

    if (existingCategory) {
      next(BadRequest(CommandsCategoryMessages.CATEGORY_ALREADY_EXISTS));
      return;
    }

    const newCategory = new CommandsCategory({ commandsCategoryName });

    const savedCategory = await newCategory.save();
    res.status(StatusCodes.CREATED).json({
      message: CommandsCategoryMessages.CATEGORY_ADDED_SUCCESSFULLY,
      savedCategory,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};

/**
 * @async
 * @function getAllCommandCategories
 * @description Fetches all command categories
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @throws {Error} Will throw an error if failed to fetch command categories
 */
export const getAllCommandCategories = async (req, res, next) => {
  try {
    const categories = await CommandsCategory.find({}).select("_id commandsCategoryName");
    res.status(StatusCodes.OK).json({
      categories,
      message: CommandsCategoryMessages.CATEGORIES_FETCHED_SUCCESSFULLY,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};
