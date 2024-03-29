// models
import Config from '../models/configurationModel.js';
import Company from '../models/companyModel.js';
import Prompt from '../models/promptModel.js';
import User from '../models/user.js';

// libraries
import { StatusCodes } from "http-status-codes";

// others
import { InitSetupMessages } from '../constants/enums.js';
import configData from '../migrations/initial-config.js';

/**
 * @function initSetup
 * @async
 * @description Create initial user & company in database and insert dependent data initially
 * @param {Object} req - Request object, should contain the following properties in body: fname, lname, email, password, employeeCount, companyName
 * @param {Object} res - Response object
 * @param {function} next - Next middleware function
 * @returns {Response} 201 - Returns company, user created message and user details
 * @throws {Error} Will throw an error if db is not empty or couldn't create user/company
 */
export const initSetup = async (req, res, next) => {
	const {
		fname, lname, email, password, employeeCount=100, companyName='INIT_COMPANY'
	} = req.body;

    // first level validation 
    if(!fname || !lname || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ message: InitSetupMessages.INIT_REQ_BODY_MISSING_ERROR });
    }

    let status = 'active';

	try {
		// first check if db is fresh or totally empty
        const userCount = await User.countDocuments();
        const companyCount = await Company.countDocuments();
        const configCount = await Config.countDocuments();
        const promptCount = await Prompt.countDocuments();

        if(userCount !== 0 || companyCount !== 0 || configCount !== 0 || promptCount !== 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: InitSetupMessages.DB_NOT_EMPTY_ERROR });
        }

        // db is fresh, inserting config data
        await Config.insertMany(configData);

        // creating init company document
        const newCompany = {
            name: companyName,
            email,
            employeeCount,
            status,
        }
        const createdCompany = await Company.create(newCompany);

        // creating init user (superadmin) document
        const newUser = {
            fname,
            lname,
            maxusertokens: 5000,
            password,
            email,
            role: "superadmin",
            username: email,
            status,
            companyId: createdCompany._id,
        }
        const createdUser = await User.create(newUser);

        if(createdUser) {
            delete createdUser.password;
        }

        res.status(StatusCodes.CREATED).json({
            message: InitSetupMessages.INIT_SETUP_SUCCESS_MESSAGE,
            data: { user: createdUser },
        });
	} catch (error) {
		console.log("🚀 ~ initSetup ~ error:", error);
		res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
			message: error.message,
		});
	}
};