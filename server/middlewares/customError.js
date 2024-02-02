import { CommonMessages } from '../constants/enums.js';

export const BadRequest = (message) => {
	const error = new Error(message || CommonMessages.BAD_REQUEST_ERROR);
	error.statusCode = 400;
	return error;
};

export const NotFound = (message) => {
	const error = new Error(message || CommonMessages.NOT_FOUND_ERROR);
	error.statusCode = 404;
	return error;
};

export const InternalServer = (message) => {
	const error = new Error(message || CommonMessages.INTERNAL_SERVER_ERROR);
	error.statusCode = 500;
	return error;
};

export const Unauthorized = (message) => {
	const error = new Error(message || CommonMessages.UNAUTHORIZED_ERROR);
	error.statusCode = 401;
	return error;
};

export const Conflict = (message) => {
	const error = new Error(message || CommonMessages.CONFLICT_ERROR);
	error.statusCode = 409;
	return error;
};