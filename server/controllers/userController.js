import User, { UserRole } from '../models/user.js';
import StatusCodes from 'http-status-codes';
import sendEmail from '../utils/mailGun.js';
import promptModel from '../models/promptModel.js';
import Company from '../models/companyModel.js';
import {
  CommonMessages,
  TeamMessages,
  UserMessages,
} from '../constants/enums.js';
import { BadRequest } from '../middlewares/customError.js';
import { uploadImageToS3 } from '../lib/s3.js';
import bcrypt from 'bcrypt';
import { deleteLocalFile } from '../utils/assistant.js';
import { generateApiKey } from '../service/userService.js';
import axios from 'axios';
import { 
  encryptN8nSecretKey, 
  decryptN8nSecretKey, 
  isN8nSecretKeyEncrypted,
  cleanupN8nEncryptionMetadata 
} from '../utils/n8nEncryption.js';

/**
 * Asynchronous function for getting all Users.
 *
 * @async
 * @param {Object} req - Request object with user's role and company Id. Also, contains query params for page and limit of result, search string for email matching.
 * @param {Object} res - Response object for sending back all the users.
 * @throws Will throw an error if it fails to retrieve users due to internal server error.
 *
 * @typedef {Object} UsersResponse
 * @property {Array} user - List of users fetched from the database.
 * @property {number} nbhits - Total count of users.
 * @property {number} page - Current page number.
 *
 * @returns {UsersResponse} List of users with pagination details.
 */
export const getAllUsers = async (req, res) => {
  const { role, companyId } = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const regex = req.query.search
    ? { email: { $regex: req.query.search, $options: 'i' } }
    : {};
  try {
    const filterOptions = {
      ...regex,
      role: { $ne: UserRole.SUPER_ADMIN },
      deletedEmail: { $exists: false },
    };

    if (role !== UserRole.SUPER_ADMIN) {
      filterOptions.companyId = companyId;
    }

    let query = User.find(filterOptions)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip(skip);

    if (role === UserRole.SUPER_ADMIN) {
      query = query.populate('teams');
    }

    const users = await query;
    const count = await User.countDocuments(filterOptions);

    res.status(StatusCodes.OK).json({
      message: UserMessages.ALL_USERS_FETCHED_SUCCESSFULLY,
      user: users,
      nbhits: count,
      page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for getting list of all users along with their prompts.
 *
 * @async
 * @param {Object} req - Request object with `user` containing the user's role, and `query` with page number, limit and a potentially a search string.
 * @param {Object} res - Response object for sending back the result.
 * @throws Will throw an error if any problem happens.
 *
 * @typedef {Object} User
 * @property {string} _id - User ID.
 * @property {string} companyId - User's company ID.
 * @property {number} currentusertokens - Current number of tokens used by the user.
 * @property {string} email - User's email.
 * @property {string} fname - User's first name.
 * @property {string} lname - User's last name.
 * @property {number} maxusertokens - Maximum tokens allowed for the user.
 * @property {Array} prompts - Prompts author by the user.
 * @property {string} role - Role of the user - can be "superadmin", "admin" or "user".
 * @property {string} status - Status of user - can be "active" or "inactive".
 * @property {string} username - Username of the user.
 *
 * @typedef {Object} Response
 * @property {Array.<User>} user - List of users.
 * @property {number} nbhits - Total user count.
 * @property {number} page - Page number of the response.
 *
 * @returns {Response} List of users along with each user's prompts, total user count and page number.
 */
export const getUsersWithPrompts = async (req, res) => {
  const { role } = req.user;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const regex = req.query.search
    ? { email: { $regex: req.query.search, $options: 'i' } }
    : {};

  try {
    const usersWithPrompts = await User.aggregate([
      {
        $match: {
          ...regex,
          role: { $ne: UserRole.SUPER_ADMIN },
          deletedEmail: { $exists: false },
        },
      },
      {
        $lookup: {
          from: 'prompts',
          let: { userid: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$userid', '$$userid'] },
              },
            },
          ],
          as: 'prompts',
        },
      },
      {
        $project: {
          companyId: 1,
          currentusertokens: 1,
          maxusertokens: 1,
          _id: 1,
          email: 1,
          fname: 1,
          lname: 1,
          role: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          prompts: 1,
          username: 1,
          __v: 1,
          promptsCount: { $size: '$prompts' },
        },
      },
      { $sort: { promptsCount: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

    const count = await User.countDocuments({
      ...regex,
      role: { $ne: UserRole.SUPER_ADMIN },
      deletedEmail: { $exists: false },
    });

    if (count === 0) {
      return res.status(StatusCodes.OK).json({ user: [], nbhits: 0, page });
    }

    res.status(StatusCodes.OK).json({
      message: UserMessages.ALL_USER_PROMPTS_FETCHED_SUCCESSFULLY,
      user: usersWithPrompts,
      nbhits: count,
      page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for getting a specific user.
 *
 * @async
 * @param {Object} req - Request object with `body` containing the user's ID.
 * @param {Object} res - Response object for sending back the result.
 * @param {Function} next - Next middleware to be executed.
 * @throws Will throw an error if querying the database fails or user is not found.
 *
 * @typedef {Object} User
 * @property {string} _id - User's ID.
 * @property {number} maxusertokens - Maximum tokens allowed for the user.
 * @property {number} currentusertokens - Current number of tokens used by the user.
 * @property {string} fname - User's first name.
 * @property {string} lname - User's last name.
 * @property {string} username - Username of the user.
 * @property {string} email - User's email
 * @property {string} status - Status of the user - can be "active" or "inactive".
 * @property {string} role - Role of the user - can be "superadmin", "admin" or "user".
 * @property {string} companyId - User's company ID.
 * @property {string} deletedEmail - Deleted email of the user(if any).
 * @property {string} teamId - ID of the team user belongs to.
 * @property {string} createdAt - Creation date of user.
 * @property {string} updatedAt - Latest date user detail was updated.
 *
 * @typedef {Object} Response
 * @property {string} msg - Successful request message.
 * @property {User} user - User data retrieved from the database.
 *
 * @returns {Response} Message and user data.
 */
export const getSingleUserByID = async (req, res, next) => {
  const { userId } = req.body;
  try {
    let user = await User.findOne({ _id: userId })
      .populate('teams');
    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }
    const googleSSOfromEnv = process.env.INITIAL_SSO_LOGIN_PASSWORD
    if(googleSSOfromEnv && bcrypt.compareSync(process.env.INITIAL_SSO_LOGIN_PASSWORD, user.password)) {
      user = {...user.toObject(), password: process.env.INITIAL_SSO_LOGIN_PASSWORD}
    }
    else {
      user = user.toObject();
      delete user.password;
    }
    
    res.status(StatusCodes.OK).json({
      message: UserMessages.SINGLE_USER_FETCHED_SUCCESSFULLY,
      user,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR, error
    });
  }
};

/**
 * @async
 * @function getSingleUserInfoByID
 * @description get Single User Info By ID
 * @param {Object} req - The request object. there is no request body.But 'id' should be pass a parameter with the end point and 'id' will be user's id
 * @param {Object} res - The response will be single user's details
 * @throws {Error} Will throw an error if it fails to get user's info
 * @returns {Response} 200 - Returns success message  and user's details. And 500 - returns internal server error .
 */
export const getSingleUserInfoByID = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }
    return res.status(StatusCodes.OK).json({
      message: UserMessages.SINGLE_USER_FETCHED_SUCCESSFULLY,
      user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
      error,
    });
  }
};

/**
 * Asynchronous function for updating a user.
 *
 * @async
 * @param {Object} req - Request object with `params` containing the ID of the user
 * to be updated and `body` containing the fields to be updated.
 * @param {Object} res - Response object for sending back the result.
 * @param {Function} next - Next middleware to be executed.
 * @throws Will throw an error if the required fields are not provided, querying the
 * database fails or user is not found.
 *
 * @typedef {Object} User
 * @property {string} fname - User's first name to be updated.
 * @property {string} lname - User's last name to be updated.
 * @property {string} email - User's email to be updated.
 * @property {string} teamId - ID of the team user belongs to be updated.
 * @property {string} status - Status of the user - "active" or "inactive" to be updated.
 *
 * @typedef {Object} Response
 * @property {string} msg - Successful request message.
 * @property {User} user - The updated user data retrieved from the database.
 * @property {string} token - JWT Token
 *
 * @returns {Response} Message, updated user data, and token.
 */
export const UpdateUser = async (req, res, next) => {
  const { id } = req.params;
  const {
    body: {
      fname,
      lname,
      email,
      teams,
      status,
      maxTokens,
      designation,
      responsibility,
      companyInformation,
    },
  } = req;

  if (!fname || !lname || !email) {
    return next(BadRequest(UserMessages.PROVIDE_REQUIRED_FIELDS));
  }

  try {
    const updateFields = {
      fname,
      lname,
      email,
      designation,
      responsibility,
      companyInformation,
      ...(teams && { teams }),
      ...(status && { status }),
      maxusertokens: maxTokens,
    };

    console.log(updateFields, 'updateFields');

    const user = await User.findOneAndUpdate({ _id: id }, updateFields, {
      new: true,
    });
    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    const token = await user.createJWT();
    res.status(StatusCodes.OK).json({
      msg: UserMessages.USER_UPDATED_SUCCESSFULLY,
      user,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const uploadUserImage = async (req, res) => {
  try {
    const { id } = req.params;
    const avatarFile = req.file ?? '';
    const avatar = avatarFile ? avatarFile : null;

    let image_url = null;
    if (avatar) {
      image_url = await uploadImageToS3(avatar.path, 'image');
    }

    const user = await User.findOneAndUpdate(
      { _id: id },
      { userAvatar: image_url },
      {
        new: true,
      }
    );

    if (user && avatar) {
      deleteLocalFile(avatar)
        .then(() => {
          console.log('Avatar file deleted');
        })
        .catch((err) => {
          console.error('Failed to delete avatar file:', err);
        });
    }

    return res.status(StatusCodes.OK).json({
      message: UserMessages.USER_PROFILE_IMAGE_UPLOAD_SUCCESSFULLY,
      user,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const checkingUserPassword = async (req, res, next) => {
  try {
    const { id, password } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    const isValidPass = await bcrypt.compare(password, user?.password);

    if (!isValidPass) {
      return next(BadRequest(UserMessages.USER_PASSWORD_NOT_MATCHED));
    }

    return res.status(StatusCodes.OK).json({
      message: UserMessages.USER_PASSWORD_MATCHED,
      matchedPassword: true,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const updateUserAcToken = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userAcToken } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    await User.findByIdAndUpdate(
      id,
      {
        userAcToken: userAcToken,
      },
      { new: true }
    );

    let message = userAcToken
      ? UserMessages.USER_AC_TOKEN_UPDATED_SUCCESSFULLY
      : UserMessages.USER_AC_DISCONNECTED;

    return res.status(StatusCodes.OK).json({
      message: message,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      errorMessage: CommonMessages.INTERNAL_SERVER_ERROR,
      message: message,
    });
  }
};

export const changeUserPassword = async (req, res, next) => {
  try {
    const { id, newPassword, confirmPassword } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    if (newPassword !== confirmPassword) {
      return next(BadRequest(UserMessages.NEW_PASSWORD_NOT_MATCHED));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(confirmPassword, salt);

    await User.findByIdAndUpdate(
      id,
      {
        password: hashedPassword,
      },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      message: UserMessages.PASSWORD_CHANGE_SUCCESSFULLY,
      changedPassword: true,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

export const createNewPasswordForSSOUser = async (req, res) => {
  try {
    const { id, newPassword } = req.body;
  
    const user = await User.findById(id);
  
    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
  
    await User.findByIdAndUpdate(
      id,
      {
      password: hashedPassword,
      },
      { new: true }
    );
  
    return res.status(StatusCodes.OK).json({
      message: UserMessages.PASSWORD_CHANGE_SUCCESSFULLY,
      changedPassword: true,
    }); 

  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
      });
  }
}
export const deleteUserPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    await User.findByIdAndUpdate(
      id,
      {
        userAvatar: '',
      },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      message: UserMessages.USER_PHOTO_DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for updating a user's status.
 *
 * @async
 * @param {Object} req - Request object with `params` containing the user's ID and `body` with the new status.
 * @param {Object} res - Response object for sending back the result.
 * @throws Will throw an error if the status is not provided, querying the database fails or if the user is not found.
 *
 * @typedef Response
 * @property {string} message - Success message.
 *
 * @returns {Response} Success message.
 */
export const UpdateUserStatus = async (req, res, next) => {
  const {
    params: { id: userId },
    body: { status },
  } = req;
  const { role } = req.user;

  if (!status) {
    return next(BadRequest(UserMessages.PROVIDE_STATUS));
  }

  try {
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId },
        { status },
        { new: true }
      );

      if (!updatedUser) {
        return next(BadRequest(UserMessages.USER_NOT_FOUND));
      }

      if (status === 'active') {
        sendEmail(
          updatedUser.email,
          'Account Approved',
          { name: updatedUser.fname, email: updatedUser.email },
          '../utils/template/userSignupApprove.handlebars'
        );
      }

      res.status(StatusCodes.OK).json({
        message: UserMessages.UPDATED_USER_STATUS_SUCCESSFULLY,
      });
    } else {
      res.status(StatusCodes.UNAUTHORIZED).json({
        message: UserMessages.UNAUTHORIZED_TO_UPDATE,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for deleting all users having the role as 'user'.
 *
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object for sending back the deletion success message.
 * @throws Will throw an error if deleting the users fails.
 *
 * @typedef {Object} Response
 * @property {string} message - Success message.
 *
 * @returns {Response} Success message.
 */
export const deleteAllUsers = async (req, res) => {
  try {
    await User.deleteMany({ role: 'user' });
    res.status(StatusCodes.OK).json({
      message: UserMessages.ALL_USERS_DELETED_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for getting all prompts of a user.
 *
 * @async
 * @param {Object} req - Request object with `params` containing user's ID and `body` with date and initFetch flags.
 * Query params `page` and `limit` control the pagination.
 * @param {Object} res - Response object for sending back the prompts.
 * @param {Function} next - Next middleware to be executed.
 * @throws Will throw an error if querying the database fails or prompts not found.
 *
 * @typedef {Object} PromptsResponse
 * @property {Array} prompts - User's prompts.
 * @property {number} nbhits - Total count of user's prompts.
 * @property {number} page - Current page number.
 *
 * @returns {PromptsResponse} User's prompts with pagination details.
 */
export const getAllUserPrompts = async (req, res, next) => {
  const userId = req.params.id;
  const { date, initFetch } = req.body;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    let query = { userid: userId };

    if (initFetch === false && date) {
      const formatDate = new Date(date).toISOString();
      query = { ...query, promptdate: formatDate };
    }

    const count = await promptModel.countDocuments(query);
    const prompts = await promptModel
      .find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    res.status(StatusCodes.OK).json({
      prompts,
      nbhits: count,
      page,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for getting current user's tokens.
 *
 * @async
 * @param {Object} req - Request object with `params` containing user's ID.
 * @param {Object} res - Response object for sending back the tokens.
 * @param {Function} next - Next middleware to be executed.
 * @throws Will throw an error if querying the database fails or if user is not found.
 *
 * @typedef {Object} Response
 * @property {number} tokens - User's token count.
 *
 * @returns {Response} User's token count.
 */
export const getUserTokens = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({ _id: id });
    if (user) {
      const tokens = user.currentusertokens;
      res.status(StatusCodes.OK).json({ tokens });
      return;
    }
    return next(BadRequest(UserMessages.USER_NOT_FOUND));
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Asynchronous function for soft deleting a user.
 * It renames user's email and username to the current time in ISO format.
 * If the user's email also exists in the Company collection,
 * then the company's email is also renamed to current time.
 *
 * @async
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to return the soft deleted user and company.
 * @throws Will throw an error if user not found or deleting the user fails.
 *
 * @typedef {Object} Response
 * @property {Object} softDeletedUser - User data after being soft deleted.
 * @property {Object} softDeletedCompany - Company data after being soft deleted (if any).
 *
 * @returns {Response} Soft deleted user and company data.
 */
export const softUserDelete = async (req, res, next) => {
  const { id } = req.params;
  const currentTime = new Date().toISOString();

  try {
    const softDeletedUser = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          deletedEmail: '$email',
          email: currentTime,
          username: currentTime,
        },
      },
      { new: true }
    );

    if (!softDeletedUser) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    const isCompanyExistWithSameEmail = await Company.findOneAndUpdate(
      { email: softDeletedUser.email },
      {
        $set: {
          deletedEmail: '$email',
          email: currentTime,
        },
      },
      { new: true }
    );

    res.status(StatusCodes.OK).json({
      softDeletedUser,
      softDeletedCompany: isCompanyExistWithSameEmail,
    });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};

/**
 * Asynchronous function for assigning a team to multiple users.
 *
 * @async
 * @param {Object} req - Request object with `body` containing array of selected user IDs and assigned team ID.
 * @param {Object} res - Response object for sending back number of users updated.
 * @throws Will throw an error if updating users fails due to internal server error.
 *
 * @typedef {Object} UpdateResult
 * @property {number} n - Number of users matched.
 * @property {number} nModified - Number of users modified.
 * @property {boolean} ok - If the operation succeeded.
 *
 * @typedef {Object} Response
 * @property {UpdateResult} updatedUser - Count and status of users updated.
 *
 * @returns {Response} Update result for users.
 */

export const bulkTeamAssignToUsers = async (req, res) => {
  const { selectedUsersIds, assignedTeamId } = req.body;

  try {
    // Define the condition to match the documents by their ObjectIds
    const condition = { _id: { $in: selectedUsersIds } };

    // Fetch the existing teams of the selected users
    const users = await User.find(condition);
    const existingTeams = users?.map((user) => user.teams);

    // Check if assignedTeamId already exists in any of the teams arrays
    const teamAlreadyExists = existingTeams.some((teams) =>
      teams.includes(assignedTeamId)
    );

    if (teamAlreadyExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: TeamMessages.TEAM_ALREADY_ASSIGNED });
    }

    // Define the update
    const update = { $addToSet: { teams: assignedTeamId } };

    // Use updateMany to update all documents that match the condition
    const result = await User.updateMany(condition, update);

    res.status(StatusCodes.OK).json({ updatedUser: result });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: CommonMessages.INTERNAL_SERVER_ERROR });
  }
};

export const migrateDBForUserCollection = async (req, res) => {
  try {
    const users = await User.find({});
    // Iterate through each user
    for (const user of users) {
      // Check if the user has a "teamId" field
      if (user.deletedEmail) {
        continue;
      }
      if (user.teamId) {
        // Update the "teams" field with the value of "teamId"
        user.teams = [user.teamId];
        //   console.log(user)
        // Save the updated user
        await user.save();
      }
    }
    res.send({ users });
    console.log("let's migrate", users);
  } catch (error) {
    console.log('Migration Failed:', error);
  }
};

/**
 * Asynchronous function for updating user preferences.
 *
 * @async
 * @param {Object} req - Request object containing parameters and body.
 * @param {Object} req.params - Parameters object containing the user ID.
 * @param {string} req.params.id - The ID of the user to update preferences for.
 * @param {Object} req.body - Body object containing user preferences and desired AI response.
 * @param {Object} req.body.userPreferences - Object containing user preferences.
 * @param {string} req.body.desiredAiResponse - The desired response from AI.
 * @param {Object} req.user - Object containing user information from authentication middleware.
 * @param {string} req.user.role - The role of the user making the request.
 * @param {Object} res - Response object for sending back the status of the update operation.
 * @param {Function} next - Next middleware function to be called in the Express middleware chain.
 * @throws Will pass an error to the next middleware if the user update fails due to user not found.
 *
 * @typedef {Object} UpdateResult
 * @property {string} message - Message indicating the success of updating user preferences.
 *
 * @typedef {Object} Response
 * @property {UpdateResult} message - Object containing the success message.
 *
 * @returns {Response} Success message indicating that user preferences were updated successfully.
 */
export const UpdateUserPreferences = async (req, res, next) => {
  const {
    params: { id: userId },
    body: { userPreferences, desiredAiResponse },
  } = req;
  const { role } = req.user;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { userPreferences, desiredAiResponse },
      { new: true }
    );

    if (!updatedUser) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }

    res.status(StatusCodes.OK).json({
      message: UserMessages.UPDATED_USER_PREFERENCE_SUCCESSFULLY,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};

//function to get all the users without pagination
export const fetchAllUsers = async (req, res) => {
  const { role, companyId } = req.user;
  
  try {
    const filterOptions = {
    role: { $ne: UserRole.SUPER_ADMIN },
    deletedEmail: { $exists: false },
    };
  
    if (role !== UserRole.SUPER_ADMIN) {
    filterOptions.companyId = companyId;
    }
  
    let query = User.find(filterOptions)
    .select('-password')
    .sort({ createdAt: -1 });
  
    if (role === UserRole.SUPER_ADMIN) {
    query = query.populate('teams');
    }
  
    const users = await query;
  
    res.status(StatusCodes.OK).json({
    message: UserMessages.ALL_USERS_FETCHED_SUCCESSFULLY,
    users: users,
    totalCount: users.length,
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
  };

  export const UpdateAllUserPreferences = async (req, res, next) => {
    const {
      body: { userPreferences, desiredAiResponse },
    } = req;
  
    try {
          const formattedDesiredAiResponse = desiredAiResponse.replace(/\\n/g, '\n');
  
      const updatedUsers = await User.updateMany(
        { 
          userPreferences: { $exists: false }, 
          desiredAiResponse: { $exists: false } 
        },
        { 
          $set: { userPreferences, desiredAiResponse :formattedDesiredAiResponse} 
        }
      );
      
  
      res.status(StatusCodes.OK).json({
        data : updatedUsers,
        message: UserMessages.UPDATED_USER_PREFERENCE_SUCCESSFULLY,
      });
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: CommonMessages.INTERNAL_SERVER_ERROR,
      });
    }
  };

/**
 * Connect n8n for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const connectN8n = async (req, res) => {
  try {
    const { userId } = req.params;
    const { secretKey } = req.body;

    if (!secretKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Secret key is required"
      });
    }

    // Test the secret key by fetching workflows
    try {
      const response = await axios.get('https://n8n.buildyourai.consulting/api/v1/workflows', {
        headers: {
          'X-N8N-API-KEY': secretKey
        }
      });

      if (response.status !== 200) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          success: false,
          message: "Invalid n8n secret key"
        });
      }
    } catch (error) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid n8n secret key"
      });
    }

    // Get or create user to get the user ID for encryption
    let user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Encrypt the secret key using n8n-specific encryption
    const encryptedSecretKey = await encryptN8nSecretKey(secretKey, user._id);

    // Update user with encrypted n8n credentials
    user = await User.findByIdAndUpdate(
      userId,
      {
        isN8nConnected: true,
        n8nSecretKey: encryptedSecretKey
      },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "n8n connected successfully",
      isN8nConnected: true
    });

  } catch (error) {
    console.error("Error connecting n8n:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to connect n8n"
    });
  }
};

/**
 * Disconnect n8n for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const disconnectN8n = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get user to check if they have encrypted n8n credentials
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Clean up n8n encryption metadata if it exists
    if (user.n8nSecretKey) {
      try {
        await cleanupN8nEncryptionMetadata(user._id);
      } catch (metadataError) {
        console.error("Error cleaning up n8n encryption metadata:", metadataError);
        // Continue with disconnection even if metadata cleanup fails
      }
    }

    // Update user to remove n8n credentials
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isN8nConnected: false,
        n8nSecretKey: null
      },
      { new: true }
    );

    return res.status(StatusCodes.OK).json({
      success: true,
      message: "n8n disconnected successfully",
      isN8nConnected: false
    });

  } catch (error) {
    console.error("Error disconnecting n8n:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to disconnect n8n"
    });
  }
};

/**
 * Get n8n connection status for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getN8nConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      isN8nConnected: user.isN8nConnected || false
    });

  } catch (error) {
    console.error("Error getting n8n connection status:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to get n8n connection status"
    });
  }
};

/**
 * Get n8n workflows for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getN8nWorkflows = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isN8nConnected || !user.n8nSecretKey) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "n8n not connected. Please connect n8n first."
      });
    }

    // Decrypt the secret key
    let decryptedSecretKey;
    try {
      decryptedSecretKey = await decryptN8nSecretKey(user.n8nSecretKey, user._id);
    } catch (decryptError) {
      console.error("Error decrypting n8n secret key:", decryptError);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to decrypt n8n credentials"
      });
    }

    // Fetch workflows from n8n using decrypted secret key
    const response = await axios.get('https://n8n.buildyourai.consulting/api/v1/workflows', {
      headers: {
        'X-N8N-API-KEY': decryptedSecretKey
      }
    });

    const workflows = response.data.data || [];

    return res.status(StatusCodes.OK).json({
      success: true,
      workflows: workflows,
      message: "Workflows fetched successfully"
    });

  } catch (error) {
    console.error("Error fetching n8n workflows:", error);
    
    if (error.response?.status === 401) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: "Invalid n8n secret key"
      });
    }

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch n8n workflows"
    });
  }
};

export const generateAPIKeyForUser = async (req, res, next) => {
  const { userId } = req.params;
  const {baseUrlBE} = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(BadRequest(UserMessages.USER_NOT_FOUND));
    }
    const apiKeyRegex = /^[A-Za-z0-9_-]+\.[a-f0-9]{64}\.[A-Za-z0-9_-]+$/;
    if (user.apiKey && apiKeyRegex.test(user.apiKey)) {
      return res.status(StatusCodes.OK).json({
        apiKey: user.apiKey,
        message: UserMessages.API_KEY_ALREADY_EXISTS,
      });
    }
    const apiKey = generateApiKey(userId,baseUrlBE);
    user.apiKey = apiKey;
    user.apiKeyCreatedAt = new Date();
    await user.save();
    return res.status(StatusCodes.OK).json({
      message: UserMessages.API_KEY_GENERATED_SUCCESSFULLY,
      apiKey,
    });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: CommonMessages.INTERNAL_SERVER_ERROR,
    });
  }
};
