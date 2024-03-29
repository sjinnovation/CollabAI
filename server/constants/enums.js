export const CommonMessages = {
	BAD_REQUEST_ERROR: 'Bad request error',
	INTERNAL_SERVER_ERROR: 'Internal server error',
	FORBIDDEN_ERROR: 'Forbidden',
	UNAUTHORIZED_ERROR: 'Unauthorized',
	NOT_FOUND_ERROR: 'Not found',
};

export const InitSetupMessages = {
	INIT_REQ_BODY_MISSING_ERROR: 'fname, lname, email, password are required fields to initialize the request.',
	DB_NOT_EMPTY_ERROR: "Data in DB already exists, can't do initial setup.",
	INIT_SETUP_SUCCESS_MESSAGE: "Successfully completed initial setup, created user and company.",
};

export const PromptMessages = {
	THREAD_NOT_FOUND: 'Thread not found',
	THREAD_RECOVER_FAILED: 'Thread recover failed',
	THREAD_DELETION_FAILED: 'Thread deletion failed',
	USER_NOT_FOUND: 'User Not Found',
	NO_ACTIVE_SUBSCRIPTION: 'No active subscription found',
	TOKEN_LIMIT_EXCEEDED: 'You have exceeded the monthly token limit',
	OPENAI_KEY_NOT_FOUND: 'OpenAI key not found',
	MODEL_NOT_FOUND: 'Model not found',
	PROMPT_NOT_FOUND: 'Prompt not found',
	UPDATED_SUCCESSFULLY: 'Updated successfully',
	RETRIEVED_SUCCESSFULLY: 'Retrieved successfully',
	DELETED_SUCCESSFULLY: 'Deleted successfully',
	NOT_FOUND_ERROR: 'Prompt Not found',
	INTERNAL_SERVER_ERROR: 'Internal server error',
	BAD_REQUEST_OPEN_API: 'Invalid request was made to OpenAI',
};

export const ImageMessages = {
	IMAGE_NOT_FOUND: 'Image not found',
	IMAGE_URL_FETCHED_SUCCESSFULLY: 'Image fetched successfully',
	CANNOT_GENERATE_URL: 'Error generating signed URL',
};

export const GPTModels = {
	GPT_4: 'gpt-4',
	GPT_3_5_TURBO: 'gpt-3.5-turbo',
};

export const OrganizationMessages = {
	ORGANIZATION_ALREADY_EXIST: 'Company already exist with the given email',
	USER_ALREADY_EXIST: 'User already exist with the given email',
	ORGANIZATION_THREAD_NOT_FROUND: 'Organization not found with given id.',
	ORGANIZATION_DELETED_SUCCESSFULLY: 'Organization deleted successfully.',
	ORGANIZATION_CREATED_SUCCESSFULLY:
		'Your company profile has been created successfully',
	INTERNAL_SERVER_ERROR: 'Internal Server Error',
	RETRIEVED_SUCCESSFULLY: 'Retrieved successfully',
	UPDATED_SUCCESSFULLY: 'Updated successfully',
};

export const AuthMessages = {
	USER_REGISTERED_SUCCESSFULLY: 'User registered successfully',
	EMAIL_ALREADY_EXISTS: 'Email already in use',
	USERNAME_ALREADY_EXISTS: 'Please use a different username',
	FAILED_TO_REGISTER_USER: 'Failed to register user',
	EMPTY_EMAIL_OR_PASSWORD: 'Please provide Email and Password',
	INVALID_EMAIL_OR_PASSWORD: 'Invalid email or password',
	USER_LOGGED_IN_SUCCESSFULLY: 'User logged in successfully',
	INACTIVE_USER: 'Not an active user',
	INACTIVE_COMPANY: 'Not an active company',
	USER_NOT_FOUND: 'User not found',
	INVALID_PASSWORD: 'Invalid password',
	EMAIL_DOES_NOT_EXIST: 'User Email Does not Exist',
	FAILED_TO_UPDATE_PASSWORD: 'Failed to update password',
	TOKEN_NOT_FOUND: 'Token does not exist',
	INVALID_TOKEN: 'Invalid or expired password reset token',
	PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully',
	FAILED_TO_RESET_PASSWORD: 'Failed to update password',
	SAME_PASSWORD: 'New password cannot be same as old password',
	FAILED_TO_LOGIN: 'Failed to log in'
};

export const UserMessages = {
	USER_NOT_FOUND: 'User not found',
	SINGLE_USER_FETCHED_SUCCESSFULLY: 'Single user fetched successfully',
	USER_UPDATED_SUCCESSFULLY: 'User updated successfully',
	PROVIDE_REQUIRED_FIELDS: 'Please provide all the required fields',
	PROVIDE_STATUS: 'Please specify the status',
	ALL_USERS_FETCHED_SUCCESSFULLY: 'All users fetched successfully',
	ALL_USER_PROMPTS_FETCHED_SUCCESSFULLY:
		'All user prompts fetched successfully',
	UPDATED_USER_STATUS_SUCCESSFULLY: 'Updated user status successfully',
	UNAUTHORIZED_TO_UPDATE: 'You are not authorized to update user status',
	ALL_USERS_DELETED_SUCCESSFULLY: 'All users deleted successfully',
};

export const CategoryMessages = {
	CATEGORIES_FETCHED_SUCCESSFULLY: 'Categories fetched successfully',
	CATEGORY_ADDED_SUCCESSFULLY: 'Category added successfully',
	CATEGORY_ALREADY_EXISTS: 'Category already exists',
	FAILED_TO_ADD_CATEGORY: 'Failed to add category',
	CATEGORY_NOT_FOUND: 'Category not found',
	CATEGORY_FETCHED_SUCCESSFULLY: 'Category fetched successfully',
	CATEGORY_DELETED_SUCCESSFULLY: 'Category deleted successfully',
	FAILED_TO_DELETE_CATEGORY: 'Failed to delete category',
	CATEGORY_UPDATED_SUCCESSFULLY: 'Category updated successfully',
	FAILED_TO_UPDATE_CATEGORY: 'Failed to update category',
	USER_NOT_FOUND: 'User not found',
	USER_ID_EMPTY: 'User id cannot be empty',
	CATEGORY_NAME_EMPTY: 'Category name cannot be empty',
	ONLY_ADMIN_CAN_ADD_CATEGORIES: 'Only admin can add categories',
};

export const MeetingTypeMessages = {
	MEETING_TYPES_FETCHED_SUCCESSFULLY: 'Meeting types fetched successfully',
	MEETING_TYPE_CREATED_SUCCESSFULLY: 'Meeting type created successfully',
	MEETING_TITLE_ALREADY_EXISTS: 'Title already exists',
	FAILED_TO_ADD_MEETING_TYPE: 'Failed to add meeting type',
	MEETING_TYPE_NOT_FOUND: 'Meeting type not found',
	MEETING_TYPE_DELETED_SUCCESSFULLY: 'Meeting type deleted successfully',
	FAILED_TO_DELETE_MEETING_TYPE: 'Failed to delete meeting type',
	MEETING_TYPE_UPDATED_SUCCESSFULLY: 'Meeting type updated successfully',
	FAILED_TO_UPDATE_MEETING_TYPE: 'Failed to update meeting type',
	ADDED_NEW_FIELD: 'Added new field',
	MEETING_TITLE_REQUIRED: 'Meeting title is required',
	ONLY_ADMIN_CAN_ADD_MEETING_TYPES: 'Only admin can add meeting types',
};

export const TemplateMessages = {
	INVALID_CATEGORY: 'Category is not valid',
	TEMPLATE_CREATED_SUCCESSFULLY: 'Template created successfully',
	TEMPLATE_UPDATED_SUCCESSFULLY: 'Template updated successfully',
	TEMPLATE_DELETED_SUCCESSFULLY: 'Template deleted successfully',
	TEMPLATES_FETCHED_SUCCESSFULLY: 'Templates fetched successfully',
	TEMPLATE_FETCHED_SUCCESSFULLY: 'Template fetched successfully',
	TEMPLATE_NOT_FOUND: 'Template not found',
	TEMPLATE_ALREADY_EXISTS: 'Template already exists',
	TEMPLATE_CREATION_FAILED: 'Failed to create template',
};

export const TeamMessages = {
	TITLE_REQUIRED: 'Team Title is required',
	TITLE_ALREADY_EXISTS: 'This title already exists',
	TEAM_CREATED_SUCCESSFULLY: 'Team created successfully',
	TEAM_UPDATED_SUCCESSFULLY: 'Team updated successfully',
	TEAM_DELETED_SUCCESSFULLY: 'Team deleted successfully',
	TEAMS_FETCHED_SUCCESSFULLY: 'Teams fetched successfully',
	TEAM_FETCHED_SUCCESSFULLY: 'Team fetched successfully',
	TEAM_NOT_FOUND: 'Team not found',
	TEAMS_CREATION_FAILED: 'Failed to create team',
	NEW_FIELD_ADDED: 'New field added successfully',
	TEAM_ALREADY_ASSIGNED: 'Team already assigned to selected users.'
};

export const ConfigMessages = {
	THRESHOLD_VALUE_FETCHED: 'Threshold value fetched successfully',
	THRESHOLD_VALUE_UPDATED: 'Threshold value updated successfully',
	THRESHOLD_VALUE_SAVED: 'Threshold value saved successfully',
	OPENAI_KEY_SAVED: 'openai key saved successfully',
	OPENAI_KEY_UPDATED: 'openai key updated successfully',
	OPENAI_KEY_FETCHED: 'openai key fetched successfully',
	OPENAI_TOKENS_FETCHED: 'openai tokens fetched successfully',
	OPENAI_MODEL_FETCHED: 'openai model fetched successfully',
	UNAUTHORIZED_TO_ADD_KEY: 'You are not authorized to add api key',
	TEMPERATURE_CANNOT_BE_EMPTY: 'Temperature cannot be empty',
	TEMPERATURE_UPDATED: 'Temperature updated successfully',
	TEMPERATURE_FETCHED: 'Temperature fetched successfully',
	TEMPERATURE_SAVED: 'Temperature saved successfully',
	UNAUTHORIZED_TO_MODIFY_TEMPERATURE:
		'You are not authorized to modify temperature',
	TOKEN_VALUE_EMPTY: 'Token value cannot be empty',
	TOKEN_NOT_NUMBER: 'Token value should be a number',
	TOKENS_UPDATED: 'Tokens updated successfully',
	TOKENS_SAVED: 'Tokens saved successfully',
	UNAUTHORIZED_TO_MODIFY_TOKENS: 'You are not authorized to modify tokens',
	MODEL_ID_CANNOT_BE_EMPTY: 'Model Id cannot be empty',
	MODEL_UPDATED: 'Model updated successfully',
	MODEL_SAVED: 'Model saved successfully',
	UNAUTHORIZED_TO_MODIFY_MODEL: 'You are not authorized to modify model',
	CONFIG_VALUES_NOT_FOUND:
		'No configuration values found for the specified keys.',
	CONFIGURATIONS_UPDATED: 'Configuration values updated successfully',
	CONFIGURATIONS_FETCHED: 'Configuration values fetched successfully.',
};

export const AssistantMessages = {
	FILE_LIMIT_REACHED: 'File limit (20) per assistant has been reached!',
	ASSISTANT_NOT_FOUND: 'Assistant not found',
	FILES_AND_PROPERTIES_UPDATED: 'Updated Files and Other Properties!',
	ASSISTANT_DELETED_SUCCESSFULLY: 'Assistant deleted successfully.',
	ASSISTANT_DELETED_FAILED: 'Assistant deletion failed.',
	ASSISTANT_UPDATED_SUCCESSFULLY: 'Assistant updated successfully.',
	ASSISTANT_UPDATED_FAILED: 'Assistant update failed.',
	ASSISTANT_CREATED_SUCCESSFULLY: 'Assistant created successfully.',
	ASSISTANT_CREATION_FAILED: 'Assistant creation failed.',
	ASSISTANT_FETCHED_SUCCESSFULLY: 'Assistant fetched successfully.',
	ASSISTANT_STATS_FETCHED_SUCCESSFULLY:
		'Assistant stats fetched successfully.',
	ASSISTANT_ASSIGNED_TO_TEAM: 'Assistant assigned to team successfully',
	FILES_UPDATED: 'Updated Files!',
	NAME_EXISTS: 'This name already exists',
	SOMETHING_WENT_WRONG: 'Something went wrong',
	ASSISTANT_THREAD_ID_REQUIRED: 'Thread id is required.',
	ASSISTANT_THREAD_NOT_FROUND: 'Assistant thread not found.',
	USER_DOES_NOT_EXIST: 'User does not exist.',
	ASSISTANT_NOT_FOUND_ON_OPENAI: 'This assistant is not available on the OpenAI platform. Please delete this assistant and create a new one if necessary.',
	ASSISTANT_FILE_NOT_FOUND_MESSAGE: 'File not found in openai.',
	ASSISTANT_FILE_DOWNLOAD_ERROR_MESSAGE: 'Error downloading file, please try again later.'
};
export const AssistantThreadMessages = {
	ASSISTANT_THREAD_NOT_FROUND: 'Assistant thread not found.',
	UNAUTHORIZED_ACTION: 'You are not authorized to perform this action.',
	RETRIEVED_SUCCESSFULLY: 'Retrieved successfully',
	INTERNAL_SERVER_ERROR: 'Internal Server Error',
	THREAD_UPDATED_SUCCESSFULLY: 'Thread updated successfully',
	DELETED_SUCCESSFULLY: 'Deleted successfully',
	SOMETHING_WENT_WRONG: 'Something went wrong',
};
