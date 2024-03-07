import User from "../models/user.js"
import Company from "../models/companyModel.js";
import Team from "../models/teamModel.js";
import { StatusCodes } from 'http-status-codes';
import Config from "../models/configurationModel.js";
import sendEmail from "../utils/mailGun.js";
import { AuthMessages } from "../constants/enums.js";
import { BadRequest, Unauthorized } from "../middlewares/customError.js";
import ResetToken from "../models/token.js";
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import BcryptSalt from 'bcrypt-salt';
import config from '../config.js';

/**
 * Registers a new user.
 *
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next middleware function
 * @returns AuthMessages.USER_REGISTERED_SUCCESSFULLY if user successfully registered
 */
export const registerUser = async (req, res, next) => {
  try {
    const { fname, lname, password, email, username, companyId, teams, status } = req.body;

    // Check if email already exists
    const emailExist = await User.findOne({ email });
    if (emailExist) {
      return next(BadRequest(AuthMessages.EMAIL_ALREADY_EXISTS));
    }

    // Check if username already exists
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return next(BadRequest(AuthMessages.USERNAME_ALREADY_EXISTS));
    }

    // Determine user role (superadmin for the first account, user for subsequent accounts)
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? "superadmin" : "user";

    // Fetch max user tokens from configuration
    const tokens = await Config.findOne({ key: 'tokens' });
    let maxUserTokens = tokens.maxusertokens ? parseInt(tokens.maxusertokens) : 5000;

    // Create the new user
    const newUser = await User.create({
      fname,
      lname,
      password,
      email,
      role,
      username,
      companyId,
      maxusertokens: maxUserTokens,
      teams,
      status
    });

    // Send confirmation email
    sendEmail(newUser.email, "User Signup", { name: newUser.fname, email: newUser.email, password }, "../utils/template/adminApprovedUser.handlebars", false);

    res.status(StatusCodes.CREATED).json({ msg: AuthMessages.USER_REGISTERED_SUCCESSFULLY });
  } catch (error) {
    // Handle any errors
    //console.error("Error registering user:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: AuthMessages.FAILED_TO_REGISTER_USER });
  }
};

/**
 * Asynchronous function for logging in a user.
 * 
 * @async
 * @param {Object} req - The request object, containing `body` which holds login information.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<response>} The response object providing token and user details in case of success or an error.
 * @throws Will return error if input parameters are missing or if login attempt is unsuccessful.
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email: tempEmail, password } = req.body;
    const email = tempEmail.toLowerCase();


    if (!email || !password) {
      return next(BadRequest(AuthMessages.EMPTY_EMAIL_OR_PASSWORD));
    }

    const user = await User.findOne({ email });

    if (!user || user?.deletedEmail === email) {
      return next(Unauthorized(AuthMessages.USER_NOT_FOUND));
    }

    const correctPassword = await user.comparePasword(password);
    if (!correctPassword) {
      return next(Unauthorized(AuthMessages.INVALID_PASSWORD));
    }

    if (user.status === "inactive") {
      return next(Unauthorized(AuthMessages.INACTIVE_USER));
    }

    const comp = await Company.findOne({ _id: user.companyId });
    if (comp && comp.status === "inactive") {
      return next(Unauthorized(AuthMessages.INACTIVE_COMPANY));
    }


    const teams = user?.teams?.length ? await Team.find({ _id: { $in: user?.teams } }) : [];

    let hasAccess = false;

    for (const team of teams) {
      if (team.hasAssistantCreationAccess) {
        hasAccess = true
        break
      } else {
        hasAccess = false
      }

    }

    const token = await user.createJWT();
    return res.status(StatusCodes.OK).json({
      token,
      userName: user.fname,
      userid: user._id,
      compId: user.companyId,
      role: user.role,
      user_email: user.email,
      teams: user.teams,
      hasAccess: hasAccess
    });
  } catch (error) {
    console.log("Error:", error)
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: AuthMessages.FAILED_TO_LOGIN });
  }
};

/**
 * Asynchronous function for updating a user's password.
 * 
 * @async
 * @param {Object} req - The request object, containing `body` which holds the user's email.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<response>} The response object providing password reset link in case of success or an error message in case of failure.
 * @throws Will return error if email does not exist in system or if process fails.
 */
export const UpdateUserPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return next(Unauthorized(AuthMessages.EMAIL_DOES_NOT_EXIST));
    }

    // Delete existing reset tokens for the user
    await ResetToken.deleteOne({ userId: user._id });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hash = bcrypt.hashSync(resetToken, 10);

    // Store new reset token in the database
    await new ResetToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();

    const clientUrl = config.CLIENT_URL;
    const link = `${clientUrl}/passwordReset/${resetToken}/${user._id}`;

    // Send password reset email
    sendEmail(user.email, "Password Reset Request", { name: user.fname, link }, "../utils/template/requestResetPassword.handlebars", false);

    res.status(StatusCodes.OK).json({ msg: link });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: AuthMessages.FAILED_TO_UPDATE_PASSWORD });
  }
};

/**
 * Asynchronous function for resetting a user's password.
 * 
 * @async
 * @param {Object} req - The request object, containing `body` which holds the user's userId, password reset token and new password.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {Promise<response>} The response object providing success message in case of successful password reset or an error message in case of failure.
 * @throws Will return error if password reset token is invalid or expired, or if process fails.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { userId, token, password } = req.body;

    const passwordResetToken = await ResetToken.findOne({ userId });

    if (!passwordResetToken) {
      return next(Unauthorized(AuthMessages.TOKEN_NOT_FOUND));
    }

    const storedTokenHash = passwordResetToken.token;
    const isValidToken = await bcrypt.compare(token, storedTokenHash);
    if (!isValidToken) {
      return next(Unauthorized(AuthMessages.INVALID_TOKEN));
    }

    const hashedPassword = await bcrypt.hash(password, Number(BcryptSalt));
    const user = await User.findById(userId);
    if (user.password === hashedPassword) {
      return next(BadRequest(AuthMessages.SAME_PASSWORD));
    }
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    // Send password reset success email (uncomment if needed)
    // const user = await User.findById(userId);
    // sendEmail(user.email, "Password Reset Successfully", { name: user.fname }, "../utils/template/requestResetPassword.handlebars");

    await passwordResetToken.deleteOne();

    res.status(StatusCodes.OK).json({ msg: AuthMessages.PASSWORD_UPDATED_SUCCESSFULLY });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: AuthMessages.FAILED_TO_RESET_PASSWORD });
  }
};