import { StatusCodes } from "http-status-codes";
import Company from "../models/companyModel.js";
import * as organizationServices from "../service/organizationService.js";
import User from "../models/user.js";
import Config from "../models/configurationModel.js";
import { OrganizationMessages } from "../constants/enums.js";
import {
  BadRequest,
  InternalServer,
  NotFound,
} from "../middlewares/customError.js";
import sendEmail from "../utils/mailGun.js";
import config from '../config.js';

/**
 * Asynchronous function to create a new organization and admin user.
 * @param {Object} req - Request object, expected to contain 'name', 'email', 'password', 'employeeCount', 'firstName', and 'lastName' in the body.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if the organization and admin user are created successfully, otherwise an error message.
 */
export const createOrganization = async (req, res, next) => {
  const { name, email, password, employeeCount, firstName, lastName } =
    req.body;

  try {
    const existingCompany = await Company.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingCompany) {
      return next(BadRequest(OrganizationMessages.ORGANIZATION_ALREADY_EXIST));
    }

    if (existingUser) {
      return next(BadRequest(OrganizationMessages.USER_ALREADY_EXIST));
    }

    const newCompany = await Company.create({
      name,
      email,
      employeeCount,
      status: "active",
    });

    const tokensConfig = await Config.findOne({ key: "tokens" });
    const maxUserTokens = tokensConfig.maxusertokens
      ? parseInt(tokensConfig.maxusertokens)
      : 5000;

    const newUser = await User.create({
      fname: firstName,
      lname: lastName,
      maxusertokens: maxUserTokens,
      password,
      email,
      role: "admin",
      username: email,
      status: "active",
      companyId: newCompany._id,
    });

    if (newCompany) {
      sendEmail(
        email,
        "Welcome to CollaborativeAI",
        { name: firstName, link: config.CLIENT_URL },
        "../utils/template/userregister.handlebars",
        false
      );
      sendEmail(
        config.ADMIN_EMAIL,
        "Notification CollaborativeAI : New User Onboarded ",
        { name, email },
        "../utils/template/adminNotifyNewCompany.handlebars",
        true
      );
      return res.status(StatusCodes.OK).json({
        message: OrganizationMessages.ORGANIZATION_CREATED_SUCCESSFULLY,
      });
    }
  } catch (error) {
    next(InternalServer(OrganizationMessages.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Asynchronous function to retrieve a list of organizations with optional filters, sorting, and pagination.
 * @param {Object} req - Request object, expected to contain optional query parameters for filtering, sorting, and pagination.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a list of organizations, along with pagination details, if successful, otherwise an error message.
 */
export const getAllOrganizations = async (req, res, next) => {
  try {
    let filters = { is_deleted: false, ...req.query };
    const queries = {};

    const excludeFields = ["sort", "page", "limit", "category", "level"];
    excludeFields.forEach((field) => delete filters[field]);

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      queries.sortBy = sortBy;
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
      queries.fields = fields;
    }

    if (req.query.page) {
      const { page = 1, limit = 2 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      queries.skip = skip;
      queries.limit = Number(limit);
      queries.page = Number(req.query.page);
    }

    let filtersString = JSON.stringify(filters);
    filtersString = filtersString.replace(
      /\b(gt|gte|lt|lte|regex)\b/g,
      (match) => `$${match}`
    );
    filters = JSON.parse(filtersString);

    if (req.query.search) {
      filters.name = new RegExp(req.query.search, "i");
    }

    const organizations = await Company.find(filters)
      .skip(queries.skip)
      .limit(queries.limit)
      .select(queries.fields)
      .sort({ ...queries.sortBy, createdAt: -1 });

    const totalOrganizations = await Company.countDocuments(filters);

    const pageCount = Math.ceil(totalOrganizations / queries.limit);

    res.status(StatusCodes.OK).json({
      message: OrganizationMessages.RETRIEVED_SUCCESSFULLY,
      data: {
        organizations,
        pagination: {
          page: queries?.page || 1,
          pageSize: queries.limit,
          totalItems: totalOrganizations,
          totalPages: pageCount,
        },
      },
    });
  } catch (error) {
    next(InternalServer(OrganizationMessages.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Asynchronous function to update the status of an organization.
 * @param {Object} req - Request object, expected to contain 'params.id' for the organization ID and 'body.status' for the new status.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if the organization is updated successfully, otherwise an error message.
 */
export const updateOrganization = async (req, res, next) => {
  const { id: org_id } = req.params;
  const { status } = req.body;

  try {
    const isExistingCompany = await organizationServices.getOrganizationById(
      org_id
    );

    if (isExistingCompany) {
      isExistingCompany.status = status ?? isExistingCompany.status;

      const result = await isExistingCompany.save();

      return res.status(StatusCodes.OK).json({
        success: true,
        message: OrganizationMessages.UPDATED_SUCCESSFULLY,
      });
    } else {
      return next(
        NotFound(OrganizationMessages.ORGANIZATION_THREAD_NOT_FROUND)
      );
    }
  } catch (error) {
    next(InternalServer(OrganizationMessages.INTERNAL_SERVER_ERROR));
  }
};

/**
 * Asynchronous function to delete an organization by marking it as 'is_deleted'.
 * @param {Object} req - Request object, expected to contain 'params.id' for the organization ID.
 * @param {Object} res - Response object.
 * @param {Function} next - Next function for error handling.
 * @returns {JSON} Returns a success message if the organization is marked as deleted successfully, otherwise an error message.
 */
export const deleteOrganizationById = async (req, res, next) => {
  const { id: org_id } = req.params;

  try {
    const isExistingCompany = await organizationServices.getOrganizationById(
      org_id
    );

    if (isExistingCompany) {
      isExistingCompany.is_deleted = true;

      const result = await isExistingCompany.save();

      return res.status(StatusCodes.OK).json({
        success: true,
        message: OrganizationMessages.ORGANIZATION_DELETED_SUCCESSFULLY,
      });
    } else {
      return next(
        NotFound(OrganizationMessages.ORGANIZATION_THREAD_NOT_FROUND)
      );
    }
  } catch (error) {
    next(InternalServer(OrganizationMessages.INTERNAL_SERVER_ERROR));
  }
};
