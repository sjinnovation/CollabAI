import {
	BadRequest,
	InternalServer,
	NotFound,
} from '../middlewares/customError.js';
import { AssistantMessages } from '../constants/enums.js';

/**
 * Handles OpenAI errors and returns a custom error object.
 * @param {Object} error - The OpenAI API error object.
 * @returns {Error} Returns a custom error object based on the OpenAI error type.
 */
export const handleOpenAIError = (error) => {
    console.log(error.type,"error")
	if (error.type === 'invalid_request_error') {
		const badRequestMessage = handleInvalidRequestError(error);
		return BadRequest(badRequestMessage);   
	} else if (error.type === 'internal_server_error') {
		// Handle internal server error
		return InternalServer('OpenAI internal server error');
	} else if (error.type === 'not_found_error') {
		// Handle not found error
		return NotFound('Resource not found on OpenAI API');
	} else {
		// Handle other types of errors or fallback
		return InternalServer('An unexpected error occurred with OpenAI API');
	}
};

/**
 * Handles invalid request errors from the OpenAI API.
 * @param {Object} error - The OpenAI API error object.
 * @returns {Error} Returns a custom error object based on the OpenAI error type.
 */
function handleInvalidRequestError(error) {
    if (error.status === 404 && error?.error?.message.startsWith("No assistant found")) {
		return AssistantMessages.ASSISTANT_NOT_FOUND_ON_OPENAI;
	}

	if (error.code === null) {
		return 'Invalid request made to OpenAI API. Please reload the page and try again.';
	}
    
	if (errorMappings.invalid_request_error && errorMappings.invalid_request_error[error.code]) {
        const message = errorMappings.invalid_request_error[error.code].description;
        return message;
    } else {
        return 'Unknown OpenAI error occurred';
    }
}

const errorMappings = {
	invalid_request_error: {
		context_length_exceeded: {
			description:
				'The message you submitted was too long, please reload the conversation and submit something shorter.',
		},
		invalid_api_key: {
			description:
				'Invalid API key provided. Please check the API key and try again.',
		},
	},
	// Add other error types if needed
};
