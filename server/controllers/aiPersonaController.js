import { StatusCodes } from "http-status-codes";
import AiPersona from "../models/aiPersonaModel.js";
import { CommonMessages } from "../constants/enums.js";
import { BadRequest } from "../middlewares/customError.js";
import User from "../models/user.js";
import { uploadImageToS3 } from "../lib/s3.js";
import { deleteLocalFile } from "../utils/assistant.js";

/**
 * This function creates a new AI persona.
 * @static
 * @param {Object} req - Request object. Expects personaName, icon, description.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware function.
 * @returns {Object} - Returns created AI persona object.
 */
export const createAiPersona = async (req, res, next) => {
  const { personaName, description, createdAs, isFeatured } = req.body;
  try {

    // Safely access avatar files with fallbacks
    const avatarFile = req.files && req.files['avatar'] && req.files['avatar'].length > 0
      ? req.files['avatar'][0]
      : null;

    if (!personaName || !description || !createdAs) {
      return next(BadRequest('Persona name, description and createdAs are required.'));
    }
    
    const existingPersona = await AiPersona.findOne({ personaName,  createdBy: req.user._id, isDeleted: false });
    if (existingPersona) {
      return next(BadRequest('AI persona already exists with same name.'));
    }

    let isFeaturedBoolean = isFeatured;
    if (typeof isFeaturedBoolean === 'string') {
      isFeaturedBoolean = isFeaturedBoolean.toLowerCase() === 'true'; 
    }
 
    if (isFeaturedBoolean) {
      await AiPersona.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    let image_url = null;
    image_url = await uploadImageToS3(avatarFile.path, 'image')
    // Create the AI persona with the avatar file path if it exists
    const createdAiPersona = await AiPersona.create({
      personaName,
      avatar: image_url,
      description,
      createdBy: req.user._id,
      isActive: false,
      isDeleted: false,
      createdAs: createdAs,
      isFeatured: isFeaturedBoolean  || false,
    });
    const filesToDelete = [avatarFile];
    Promise.all(filesToDelete.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
    return res.status(StatusCodes.CREATED).json({
      message: 'AI persona created successfully.',
      createdAiPersona,
    });
  } catch (error) {
    console.error("Error creating AI persona:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};


/**
 * This function retrieves all AI personas.
 * @static
 * @param {Object} req - Request object. Expects search, page, limit as query parameters.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware function.
 * @returns {Object} - Returns list of AI personas with pagination.
 */
export const getAllAiPersonas = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { search = '', page = 1, limit = 10 } = req.query;

    // Convert page and limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    // Fetch all superadmin users
    const superadminUsers = await User.find({ role: 'superadmin' });
    const superadminIds = superadminUsers.map(user => user._id);

    // Build the query
    const query = {
      isDeleted: false, // Only include not deleted personas
      createdAs: { $ne: "user" }, // Exclude personas created as "user"
      createdBy: { $in: superadminIds }, // Only include personas created by superadmins
      personaName: { $regex: search, $options: 'i' } // Search by persona name
    };

    // Fetch total count of matching personas
    const totalCount = await AiPersona.countDocuments(query);

    // Calculate pagination
    const skip = (pageNumber - 1) * limitNumber;

    // Fetch the personas with limit and skip
    const personas = await AiPersona.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate('createdBy', 'fname lname');

    // Create response object
    const response = {
      totalCount,
      totalPages: Math.ceil(totalCount / limitNumber),
      currentPage: pageNumber,
      personas,
    };

    return res.status(StatusCodes.OK).json({
      message: 'All Ai personas fetched successfully.',
      allPersona: response,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};


/**
* @async
* @function getAiPersonaById
* @description Get a single AI persona by ID
* @param {Object} req - The request object. Expected params: id
* @param {Object} res - The response object.
* @param {Object} next - The next middleware function in the Express request-response cycle.
* @throws {Error} Will throw an error if persona not found
*/
export const getAiPersonaById = async (req, res, next) => {
  try {
    const persona = await AiPersona.findById(req.params.id);
    if (!persona) {
      return next(BadRequest('AI persona not found.'));
    }
    return res.status(StatusCodes.OK).json({
      message: "AI persona fetched successfully.",
      persona,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};



/**
 * This function updates an existing AI persona.
 * @static
 * @param {Object} req - Request object. Expects personaId, personaName, avatar, description.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware function.
 * @returns {Object} - Returns updated AI persona object.
 */
export const updateAiPersona = async (req, res, next) => {
  const { id } = req.params;
  const { personaName, description, isActive, isDeleted, isFeatured } = req.body;

  try {
    // Get avatar file if uploaded
    const avatarFile = req.files && req.files['avatar'] && req.files['avatar'].length > 0
      ? req.files['avatar'][0]
      : null;

    let isFeaturedBoolean = isFeatured;
    if (typeof isFeaturedBoolean === 'string') {
      isFeaturedBoolean = isFeaturedBoolean.toLowerCase() === 'true';
    }
    if (isFeaturedBoolean) {
      await AiPersona.updateMany({ isFeatured: true }, { isFeatured: false });
    }

    // Create update object with only the fields that are provided
    const updateObject = {};

    if (personaName) updateObject.personaName = personaName;
    if (description) updateObject.description = description;
    if (isActive !== undefined) updateObject.isActive = isActive;
    if (isDeleted !== undefined) updateObject.isDeleted = isDeleted;
    if (isFeaturedBoolean !== undefined) updateObject.isFeatured = isFeaturedBoolean;

    

    // If avatar file is uploaded, upload it to S3
    if (avatarFile) {
      const image_url = await uploadImageToS3(avatarFile.path, 'image');
      updateObject.avatar = image_url;
    }

    const updatedAiPersona = await AiPersona.findOneAndUpdate(
      { _id: id },
      updateObject,
      { new: true }
    );

    if (!updatedAiPersona) {
      return next(BadRequest('AI persona not found or it is deleted.'));
    }

    // Delete local files after upload to S3
    if (avatarFile) {
      const filesToDelete = [avatarFile];
      Promise.all(filesToDelete.map(deleteLocalFile))
        .then(() => console.log('All files deleted'))
        .catch(err => console.error('Failed to delete some files:', err));
    }

    return res.json({
      message: 'AI persona updated successfully.',
      updatedAiPersona,
    });
  } catch (error) {
    console.error("Error updating AI persona:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * This function deletes an existing AI persona.
 * @static
 * @param {Object} req - Request object. Expects personaId as a parameter.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware function.
 * @returns {Object} - Returns a success message.
 */
export const deleteAiPersona = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedAiPersona = await AiPersona.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!deletedAiPersona) {
      return next(BadRequest('AI persona not found or it is already deleted.'));
    }

    return res.json({
      message: 'AI persona updated successfully.',
      deletedAiPersona,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const getAllAiPersonasWithPersonalPersonas = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch all superadmin users
    const superadminUsers = await User.find({ role: 'superadmin' });
    const superadminIds = superadminUsers.map(user => user._id);

    const personas = await AiPersona.find({
      $and: [
        { isDeleted: false },
        {
          $or: [
            // User's own personas (regardless of createdAs)
            { createdBy: userId },
            // Superadmin personas but only if createdAs is "superadmin"
            { 
              $and: [
                { createdBy: { $in: superadminIds } },
                { createdAs: "superadmin" }
              ]
            }
          ]
        }
      ]
    }).sort({ isActive: -1, createdAt: -1 });

    return res.status(StatusCodes.OK).json({
      message: 'All Ai personas fetched successfully.',
      allPersona: personas,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};