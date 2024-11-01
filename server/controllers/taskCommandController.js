import { StatusCodes } from "http-status-codes";
import { TaskCommandMessages } from "../constants/enums.js";
import TaskCommands from "../models/taskCommandsModel.js";
import {
  NotFound,
  BadRequest,
  InternalServer,
} from "../middlewares/customError.js";
import CommandsCategory from "../models/commandsCategoryModel.js";

/**
 * @async
 * @function createTaskCommand
 * @description Create a new task command
 * @param {Object} req - The request object.
 * @param {Object} res - The response object. Expected body: label, icon, description, commandsCategoryName
 * @param {Object} next - The next middleware function in the Express request-response cycle.
 * @throws {Error} Will throw an error if failed to create task command
 */
export const createTaskCommand = async (req, res, next) => {
  const { label, icon, description, commandsCategoryName } = req.body;

  try {
    if (!label || !icon || !description) {
      next(BadRequest(TaskCommandMessages.COMMANDS_REQUIRED));
      return;
    }

    if (!commandsCategoryName) {
      next(BadRequest(TaskCommandMessages.COMMANDS_CATEGORY_NAME_REQUIRED));
      return;
    }

    const existingCommand = await TaskCommands.findOne({
      "commands.label": label,
      "commands.icon": icon,
      commandsCategoryName,
    });
    if (existingCommand) {
      next(BadRequest(TaskCommandMessages.COMMAND_ALREADY_EXISTS));
      return;
    }

    const newTaskCommand = new TaskCommands({
      commands: { label, icon, description },
      commandsCategoryName,
    });

    const savedTaskCommand = await newTaskCommand.save();
    res.status(StatusCodes.CREATED).json({
      message: TaskCommandMessages.TASK_COMMAND_CREATED_SUCCESSFULLY,
      savedTaskCommand,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};

/**
 * @async
 * @function getAllTaskCommands
 * @description Fetches all task commands
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} next - The next middleware function in the Express request-response cycle.
 * @throws {Error} Will throw an error if failed to fetch task commands
 */
export const getAllTaskCommands = async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  try {
    const totalTaskCommands = await TaskCommands.countDocuments();
    const taskCommands = await TaskCommands.find({})
      .populate("commandsCategoryName", "commandsCategoryName")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const formattedTaskCommands = taskCommands.map((taskCommand) => ({
      ...taskCommand.toObject(),
      commandsCategoryName:
        taskCommand.commandsCategoryName.commandsCategoryName,
    }));

    res.status(StatusCodes.OK).json({
      taskCommands: formattedTaskCommands,
      total: totalTaskCommands,
      page,
      totalPages: Math.ceil(totalTaskCommands / limit),
      message: TaskCommandMessages.FETCH_SUCCESSFUL,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};


/**
 * @async
 * @function getTaskCommandById
 * @description Fetches a task command by ID
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} next - The next middleware function in the Express request-response cycle.
 * @throws {Error} Will throw an error if failed to fetch task command
 */
export const getTaskCommandById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const taskCommand = await TaskCommands.findById(id).populate(
      "commandsCategoryName",
      "commandsCategoryName -_id"
    );

    if (!taskCommand) {
      next(NotFound(TaskCommandMessages.TASK_COMMAND_NOT_FOUND));
      return;
    }

    // Simplify the structure
    const simplifiedTaskCommand = {
      ...taskCommand.toObject(),
      commandsCategoryName:
        taskCommand.commandsCategoryName.commandsCategoryName,
    };

    res.status(StatusCodes.OK).json({
      taskCommand: simplifiedTaskCommand,
      message: TaskCommandMessages.FETCH_SUCCESSFUL,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};

/**
 * @async
 * @function updateTaskCommandById
 * @description Update a task command by ID
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} next - The next middleware function in the Express request-response cycle.
 * @throws {Error} Will throw an error if failed to update task command
 */
export const updateTaskCommandById = async (req, res, next) => {
  const { id } = req.params;
  const { label, icon, description, commandsCategoryName } = req.body;

  try {
    if (!label || !icon || !description) {
      next(BadRequest(TaskCommandMessages.COMMANDS_REQUIRED));
      return;
    }
    if (!commandsCategoryName) {
      next(BadRequest(TaskCommandMessages.COMMANDS_CATEGORY_NAME_REQUIRED));
      return;
    }

    const category = await CommandsCategory.findById(commandsCategoryName);

    if (!category) {
      next(NotFound(TaskCommandMessages.CATEGORY_NOT_FOUND));
      return;
    }

    const updatedTaskCommand = await TaskCommands.findByIdAndUpdate(
      id,
      { $set: { commands: { label, icon, description }, commandsCategoryName: category._id } },
      { new: true }
    );

    if (!updatedTaskCommand) {
      next(NotFound(TaskCommandMessages.TASK_COMMAND_NOT_FOUND));
      return;
    }

    res.status(StatusCodes.OK).json({
      message: TaskCommandMessages.TASK_COMMAND_UPDATED_SUCCESSFULLY,
      updatedTaskCommand,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};

/**
 * @async
 * @function deleteTaskCommandById
 * @description Deletes a task command by ID
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} next - The next middleware function in the Express request-response cycle.
 * @throws {Error} Will throw an error if failed to delete task command
 */
export const deleteTaskCommandById = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedTaskCommand = await TaskCommands.findByIdAndDelete(id);

    if (!deletedTaskCommand) {
      next(NotFound(TaskCommandMessages.TASK_COMMAND_NOT_FOUND));
      return;
    }

    res.status(StatusCodes.OK).json({
      message: TaskCommandMessages.TASK_COMMAND_DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};

/**
 * @async
 * @function getTaskCommandsGroupedByCategory
 * @description Fetches all task commands by category using aggregate
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Object} next - The next middleware function in the Express request-response cycle.
 * @throws {Error} Will throw an error if failed to fetch task commands
 */
export const getTaskCommandsGroupedByCategory = async (req, res, next) => {
  try {
    const taskCommands = await TaskCommands.aggregate([
      {
        $group: {
          _id: "$commandsCategoryName",
          commands: { $push: "$$ROOT" }
        }
      }
    ]);

    const populatedTaskCommands = await CommandsCategory.populate(taskCommands, {
      path: "_id",
      select: "commandsCategoryName"
    });

    // Format the result to include commandsCategoryName details
    const formattedTaskCommands = populatedTaskCommands.map(group => ({
      commandsCategoryName: group._id.commandsCategoryName,
      commands: group.commands
    }));

    res.status(StatusCodes.OK).json({
      groupedTaskCommands: formattedTaskCommands,
      message: TaskCommandMessages.FETCH_SUCCESSFUL,
    });
  } catch (error) {
    next(InternalServer(error.message));
  }
};