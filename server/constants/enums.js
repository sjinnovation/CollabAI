export const CommonMessages = {
	BAD_REQUEST_ERROR: 'Bad request error',
	INTERNAL_SERVER_ERROR: 'Internal server error',
	FORBIDDEN_ERROR: 'Forbidden',
	UNAUTHORIZED_ERROR: 'Unauthorized',
	NOT_FOUND_ERROR: 'Not found',
  };

  export const HuggingfaceMessages = {
	// Input & Validation
	HF_INPUT_ERROR: 'Please provide valid input. This input could not be processed.',
	HF_INPUT_REQ: 'Model and input data are required.',
	HF_INV_IMA_INP: 'Invalid image input. Please provide a base64 string or a valid image URL.',
	HF_INVL_IMAGE: 'Invalid base64 image data.',
	HF_ADD_MODEL: 'All required fields must be provided.',
	HF_EDIT_MODEL: 'All required fields must be provided to edit the model.',
  
	// API & Response Errors
	HF_RESPONSE_ERROR: 'Unexpected response format from the Hugging Face API.',
	HF_FORMAT_ERR: 'Invalid response format from the Hugging Face API.',
	HF_CALL_ERR: 'An error occurred while calling the Hugging Face API.',
	HF_NO_RES: 'No result was found in the Hugging Face response.',
	HF_UNS_MODEL: 'Unsupported model type.',
  
	// Resource/Key Issues
	HF_MODEL_NOT: 'Model not found.',
	HF_RET_KEY_ERR: 'Failed to retrieve the Hugging Face API key from the database. Please update the key and try again.',
	HF_FETCH_IMA_ERR: 'Unable to fetch the image from the provided URL.',
  
	// Server Errors
	HF_SERVER_ERR: 'A server error occurred.',
  };	
  
  export const InitSetupMessages = {
	INIT_REQ_BODY_MISSING_ERROR:
	  'fname, lname, email, password are required fields to initialize the request.',
	DB_NOT_EMPTY_ERROR: "Data in DB already exists, can't do initial setup.",
	INIT_SETUP_SUCCESS_MESSAGE:
	  'Successfully completed initial setup, created user and company.',
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
	CHAT_CREATION_SUCCESS: 'Chat created successfully.',
	CHAT_EDIT_SUCCESS: 'Chat edited successfully.',
	CHAT_CREATION_ERROR: 'Failed to create chat, please try again later.',
	CHAT_EDIT_ERROR: 'Failed to edit chat, please try again later.',
	CLAUDE_KEY_NOT_FOUND: 'Claude key not found',
	DEEPSEEK_STREAM_ERROR: 'Failed to generate Deepseek stream response',
    DEEPSEEK_HTTP_ERROR: 'Failed to generate Deepseek HTTP response',
	DEEPSEEK_HTTP_RESPONSE_ERROR: 'Failed to generate Deepseek HTTP response',
	TOGETHER_API_KEY_ERROR: "TOGETHER_API_KEY is not defined in environment variables",
	THREAD_NOT_FOUND: 'Thread not found',
	THREAD_ID_REQUIRED: 'Thread ID is required',
	THREAD_ID_PROMPT_REQUIRED: 'Thread ID and Prompt are required',
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
	USER_NOT_FOUND: 'Email not found',
	INVALID_PASSWORD: 'Invalid password. Please try again',
	EMAIL_DOES_NOT_EXIST: 'User Email Does not Exist',
	FAILED_TO_UPDATE_PASSWORD: 'Failed to update password',
	TOKEN_NOT_FOUND: 'Token does not exist',
	INVALID_TOKEN: 'Invalid or expired password reset token',
	PASSWORD_UPDATED_SUCCESSFULLY: 'Password updated successfully',
	FAILED_TO_RESET_PASSWORD: 'Failed to update password',
	SAME_PASSWORD: 'New password cannot be same as old password',
	FAILED_TO_LOGIN: 'Failed to log in',
	COMPANY_NOT_EXISTS: 'Company does not exist'
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
	UPDATED_USER_PREFERENCE_SUCCESSFULLY: 'Updated user preference successfully',
	UNAUTHORIZED_TO_UPDATE: 'You are not authorized to update user status',
	ALL_USERS_DELETED_SUCCESSFULLY: 'All users deleted successfully',
	MAX_TOKEN_LIMIT : "User exhausted the  max token limit ",
	USER_PROFILE_IMAGE_UPLOAD_SUCCESSFULLY: "Photo successfully updated",
	USER_PASSWORD_NOT_MATCHED: "Password is incorrect",
	USER_PASSWORD_MATCHED: "Password is matched",
	NEW_PASSWORD_NOT_MATCHED: "Passwords do not matched",
	PASSWORD_CHANGE_SUCCESSFULLY: "Password successfully updated",
	USER_PHOTO_DELETED_SUCCESSFULLY: "Image successfully deleted",
	USER_AC_TOKEN_UPDATED_SUCCESSFULLY: "AC Token successfully updated",
	USER_AC_DISCONNECTED: "Disconnected from Active Collab!",
	API_KEY_ALREADY_EXISTS : "API Key already exists for this user",
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
  
  export const CommandsCategoryMessages = {
	COMMANDS_CATEGORY_NAME_EMPTY: 'Commands category name is empty',
	CATEGORY_ALREADY_EXISTS: 'Category name already exists',
	CATEGORY_ADDED_SUCCESSFULLY: 'Category added successfully',
	CATEGORIES_FETCHED_SUCCESSFULLY: 'Categories fetched successfully',
  };
  
  export const TaskCommandMessages = {
	COMMANDS_REQUIRED: 'Label, icon, and description are required for the task command',
	COMMANDS_CATEGORY_NAME_REQUIRED: 'Category name is required for the task command',
	COMMAND_ALREADY_EXISTS: 'Task command already exists',
	CATEGORY_NOT_FOUND: 'Commands category not found',
	TASK_COMMAND_CREATED_SUCCESSFULLY: 'Task command created successfully',
	TASK_COMMAND_NOT_FOUND: 'Task command not found',
	TASK_COMMAND_UPDATED_SUCCESSFULLY: 'Task command updated successfully',
	TASK_COMMAND_DELETED_SUCCESSFULLY: 'Task command deleted successfully',
	FETCH_SUCCESSFUL: 'Task commands fetched successfully',
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
	TEAM_ALREADY_ASSIGNED: 'Team already assigned to selected users.',
  };
  
  export const ConfigMessages = {
	GEMINI_MODEL_UPDATED: 'Gemini AI Model updated successfully',
	GEMINI_MODEL_SAVED: 'Gemini AI Model saved successfully',
	GEMINI_API_KEY_UPDATED: 'Gemini key updated successfully',
	GEMINI_API_KEY_SAVED: 'Gemini key saved successfully',
	GEMINI_TEMPERATURE_UPDATED: 'Gemini temperature updated successfully',
	GEMINI_TEMPERATURE_SAVED: 'Gemini temperature saved successfully',
  
	GEMINI_TOP_K_UPDATED: 'Gemini top k value updated successfully',
	GEMINI_TOP_K_SAVED: 'Gemini top k value saved successfully',
	GEMINI_TOP_P_UPDATED: 'Gemini top p value updated successfully',
	GEMINI_TOP_P_SAVED: 'Gemini top p value saved successfully',
	GEMINI_MAX_OUTPUT_TOKENS_UPDATED: 'Gemini max output tokens updated successfully',
	GEMINI_MAX_OUTPUT_TOKENS_SAVED: 'Gemini max output tokens saved successfully',
  
	CLAUDE_AI_TEMPERATURE_UPDATED: 'Claude AI temperature updated successfully',
	CLAUDE_AI_TEMPERATURE_SAVED: 'Claude AI temperature saved successfully',
	CLAUDE_AI_MAX_TOKEN_UPDATED: 'Claude AI max token updated successfully',
	CLAUDE_AI_MAX_TOKEN_SAVED: 'Claude AI max token saved successfully',
  
	CLAUDE_MODEL_UPDATED: 'Claude AI Model updated successfully',
	CLAUDE_MODEL_SAVED: 'Claude AI Model saved successfully',
	CLAUDE_API_KEY_UPDATED: 'Claude key updated successfully',
	CLAUDE_API_KEY_SAVED: 'Claude key saved successfully',
  
	THRESHOLD_VALUE_FETCHED: 'Threshold value fetched successfully',
	THRESHOLD_VALUE_UPDATED: 'Threshold value updated successfully',
	THRESHOLD_VALUE_SAVED: 'Threshold value saved successfully',
  
	OPENAI_TEMPERATURE_SAVED : 'OpenAI temperature saved successfully',
	OPENAI_TEMPERATURE_UPDATED: 'OpenAI temperature updated successfully',
	OPENAI_MAX_TOKENS_UPDATED: 'OpenAI max tokens updated successfully',
	OPENAI_MAX_TOKENS_SAVED: 'OpenAI max tokens saved successfully',
	OPENAI_FREQUENCY_PENALTY_UPDATED: 'OpenAI frequency penalty updated successfully',
	OPENAI_FREQUENCY_PENALTY_SAVED: 'OpenAI frequency penalty saved successfully',
	OPENAI_TOP_P_UPDATED: 'OpenAI top p saved successfully',
	OPENAI_TOP_P_SAVED:'OpenAI top p updated successfully',
	OPENAI_PRESENCE_PENALTY_UPDATED: 'OpenAI presence penalty updated successfully',
	OPENAI_PRESENCE_PENALTY_SAVED: 'OpenAI presence penalty saved successfully',
	OPENAI_KEY_SAVED: 'openai key saved successfully',
	OPENAI_KEY_UPDATED: 'openai key updated successfully',
	OPENAI_KEY_FETCHED: 'openai key fetched successfully',
	OPENAI_TOKENS_FETCHED: 'openai tokens fetched successfully',
	OPENAI_MODEL_FETCHED: 'openai model fetched successfully',
	UNAUTHORIZED_TO_ADD_KEY: 'You are not authorized to add api key',
	TEMPERATURE_CANNOT_BE_EMPTY: 'Temperature cannot be empty',
	TEMPERATURE_UPDATED: 'Temperature updated successfully',
	MAX_TOKEN_UPDATED : " Max user Token updated successfully",
	MAX_TOKEN_SAVED: ' Max user Token saved successfully',
	TEMPERATURE_FETCHED: 'Temperature fetched successfully',
	TEMPERATURE_SAVED: 'Temperature saved successfully',
	UNAUTHORIZED_TO_MODIFY_TEMPERATURE:
	  'You are not authorized to modify temperature',
	DALLEMODEL_CANNOT_BE_EMPTY: 'Dall-E Model cannot be empty',
	DALLEMODEL_UPDATED: 'Dall-E Modelel updated successfully',
	DALLEMODEL_FETCHED: 'Dall-E Model fetched successfully',
	DALLEMODEL_SAVED: 'Dall-E Model saved successfully',
	UNAUTHORIZED_TO_MODIFY_DALLEMODEL:
	  'You are not authorized to modify Dall-E Model',
	DALLEQUALITY_CANNOT_BE_EMPTY: 'Dall-E Quality cannot be empty',
	DALLEQUALITY_UPDATED: 'Dall-E Quality updated successfully',
	DALLEQUALITY_FETCHED: 'Dall-E Quality fetched successfully',
	DALLEQUALITY_SAVED: 'Dall-E Quality saved successfully',
	UNAUTHORIZED_TO_MODIFY_DALLEQUALITY:
	  'You are not authorized to modify Dall-E Quality',
	DALLERESOLUTION_CANNOT_BE_EMPTY: 'Dall-E Resolution cannot be empty',
	DALLERESOLUTION_UPDATED: 'Dall-E Resolution updated successfully',
	DALLERESOLUTION_FETCHED: 'Dall-E Resolution fetched successfully',
	DALLERESOLUTION_SAVED: 'Dall-E Resolution saved successfully',
	UNAUTHORIZED_TO_MODIFY_DALLERESOLUTION:
	  'You are not authorized to modify Dall-E Resolution',
	DALLECONFIG_CANNOT_BE_EMPTY:
	  'Dall-E Model and Dall-E Resolutiuon cannot be empty',
	DALLECONFIG_FETCHED: 'Dall-E Config fetched successfully',
	DALLECONFIG_SAVED: 'Dall-E Config saved successfully',
	DALLECONFIG_UPDATED: 'Dall-E Config updated successfully',
	TOKEN_VALUE_EMPTY: 'Token value cannot be empty',
	TOKEN_NOT_NUMBER: 'Token value should be a number',
	TOKENS_UPDATED: 'Tokens updated successfully',
	TOKENS_SAVED: 'Tokens saved successfully',
	UNAUTHORIZED_TO_MODIFY_TOKENS: 'You are not authorized to modify tokens',
	MODEL_ID_CANNOT_BE_EMPTY: 'Model Id cannot be empty',
	OPEN_AI_MODEL_UPDATED: 'Open AI Model updated successfully',
	OPEN_AI_MODEL_SAVED: 'Open AI Model saved successfully',
	UNAUTHORIZED_TO_MODIFY_MODEL: 'You are not authorized to modify model',
	CONFIG_VALUES_NOT_FOUND:
	  'No configuration values found for the specified keys.',
	CONFIGURATIONS_UPDATED: 'Configuration values updated successfully',
	CONFIGURATIONS_FETCHED: 'Configuration values fetched successfully.',
	PERSONALIZED_ASSISTANT_ENABLED :"Assistant Personalization Enabled",
	PERSONALIZED_ASSISTANT_DISABLED :"Assistant Personalization Disabled",
	PERSONALIZED_ASSISTANT_SAVED: ' Assistant Personalization state saved successfully',
  	TOGETHERAI_KEY_UPDATED : 'TogetherAI Key updated successfully',
    TOGETHERAI_KEY_SAVED: 'TogetherAI Key saved successfully',
	FLUX_IMAGE_HEIGHT_SAVED:'Flux Image height saved successfully',
	FLUX_IMAGE_HEIGHT_UPDATED:'Flux Image height updated successfully',
	FLUX_IMAGE_WIDTH_SAVED:'Flux Image width saved successfully',
	FLUX_IMAGE_WIDTH_UPDATED:'Flux Image width updated successfully',
	FLUX_IMAGE_SEED_SAVED:'Flux Image seed saved successfully',
	FLUX_IMAGE_SEED_UPDATED:'Flux Image seed updated successfully',
	FLUX_IMAGE_STEPS_SAVED:'Flux Image Steps saved successfully',
	FLUX_IMAGE_STEPS_UPDATED:'Flux Image Steps updated successfully',
	FLUX_IMAGE_MODEL_SAVED:'Flux Image Model saved successfully',
	FLUX_IMAGE_MODEL_UPDATED:'Flux Image Model updated successfully',
	FLUX_IMAGE_PREVIEWS_SAVED:'Flux Image Previews saved successfully',
	FLUX_IMAGE_PREVIEWS_UPDATED:'Flux Image Previews updated successfully',
	FLUX_IMAGE_STATUS_SAVED:'Flux Image Status saved successfully',
	FLUX_IMAGE_STATUS_UPDATED:'Flux Image Status updated successfully',
	DEEPSEEK_MODEL_UPDATED: 'Deepseek model updated successfully',
    DEEPSEEK_MODEL_SAVED: 'Deepseek model saved successfully',
    DEEPSEEK_TEMPERATURE_UPDATED: 'Deepseek temperature updated successfully',
    DEEPSEEK_TEMPERATURE_SAVED: 'Deepseek temperature saved successfully',
    DEEPSEEK_MAX_TOKENS_UPDATED: 'Deepseek max tokens updated successfully',
    DEEPSEEK_MAX_TOKENS_SAVED: 'Deepseek max tokens saved successfully',
    DEEPSEEK_TOP_P_UPDATED: 'Deepseek top P updated successfully',
    DEEPSEEK_TOP_P_SAVED: 'Deepseek top P saved successfully',
    DEEPSEEK_TOP_K_UPDATED: 'Deepseek top K updated successfully',
    DEEPSEEK_TOP_K_SAVED: 'Deepseek top K saved successfully',
    DEEPSEEK_REPETITION_PENALTY_UPDATED: 'Deepseek repetition penalty updated successfully',
    DEEPSEEK_REPETITION_PENALTY_SAVED: 'Deepseek repetition penalty saved successfully',
	OPENAI_SYSTEM_INSTRUCTION_UPDATED:
      "OpenAI system instruction updated successfully",
    OPENAI_SYSTEM_INSTRUCTION_SAVED:
      "OpenAI system instruction saved successfully",
    GEMINI_SYSTEM_INSTRUCTION_UPDATED:
      "Gemini system instruction updated successfully",
    GEMINI_SYSTEM_INSTRUCTION_SAVED:
      "Gemini system instruction saved successfully",
    CLAUDE_SYSTEM_INSTRUCTION_UPDATED:
      "Claude system instruction updated successfully",
    CLAUDE_SYSTEM_INSTRUCTION_SAVED:
      "Claude system instruction saved successfully",
    DEEPSEEK_SYSTEM_INSTRUCTION_UPDATED:
      "DeepSeek system instruction updated successfully",
    DEEPSEEK_SYSTEM_INSTRUCTION_SAVED:
      "DeepSeek system instruction saved successfully",
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
	ASSISTANT_ASSIGNED_TO_TEAM: 'Agent assigned to team successfully',
	FILES_UPDATED: 'Updated Files!',
	NAME_EXISTS: 'This name already exists',
	SOMETHING_WENT_WRONG: 'Something went wrong',
	ASSISTANT_THREAD_ID_REQUIRED: 'Thread id is required.',
	ASSISTANT_THREAD_NOT_FROUND: 'Assistant thread not found.',
	USER_DOES_NOT_EXIST: 'User does not exist.',
	ASSISTANT_TYPE_EXIST: 'Assistant Type Already Exist',
	ASSISTANT_TYPE_CREATED_SUCCESSFULLY: 'Assistant Type Created Successfully',
	ASSISTANT_TYPE_CREATION_FAILED: 'Assistant Type Creation failed',
  
	ASSISTANT_TYPE_NOT_FOUND: 'Assistant type not found',
	ASSISTANT_TYPE_FETCH_SUCCESS: 'Assistant type Fetched Successfully',
	ASSISTANT_TYPE_FETCH_FAILED: 'Assistant type Fetching Failed',
  
	ASSISTANT_TYPE_UPDATE_SUCCESS: 'Assistant type Updated successfully',
	ASSISTANT_TYPE_UPDATE_FAILED: 'Assistant type Updating Failed',
  
	ASSISTANT_TYPE_DELETE_SUCCESS: 'Assistant type Deleted successfully',
	ASSISTANT_TYPE_DELETE_FAILED: 'Assistant type Deletion Failed',
	ASSISTANT_TYPE_ICON_IN_THE_MID_OR_END : 'Do not put Icon in the middle or in the end of Assistant Type ',
  
  
	ASSISTANT_NOT_FOUND_ON_OPENAI:
	  'This assistant is not available on the OpenAI platform. Please delete this assistant and create a new one if necessary.',
	ASSISTANT_FILE_NOT_FOUND_MESSAGE: 'File not found in openai.',
	ASSISTANT_FILE_DOWNLOAD_ERROR_MESSAGE:
	  'Error downloading file, please try again later.',
	ASSISTANT_CLONED_SUCCESSFULLY: 'Assistant successfully cloned and you will find it under your personal Assistant list',
	ASSISTANT_CLONING_FAILED: 'Assistant Personalization Failed',
	ASSISTANT_NAME_REQUIRED: 'Assistant name is required',
  
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
  
  export const PublicAssistantMessages = {
	DOCUMENT_ALREADY_EXIST_IN_PUBLIC: 'Assistant already exists in Public List',
	DELETED_SUCCESSFULLY_FROM_PUBLIC: 'Assistant Successfully Removed From Public List',
	ADDED_SUCCESSFULLY: 'Assistant Added Successfully into Public List',
	PUBLIC_ASSISTANT_FETCH_SUCCESSFULLY: 'Public Assistant  fetched successfully',
	PUBLIC_FEATURED_AGENTS_FETCH_SUCCESSFULLY: 'Public Featured agents fetched successfully',
	PUBLIC_ASSISTANT_UPDATED_SUCCESSFULLY: 'Updated Public Assistant',
	PUBLIC_ASSISTANT_SYNCED_SUCCESSFULLY :'Public Assistant Synced'
  
  
  };
  export const FavoriteAssistantMessages = {
	DOCUMENT_ALREADY_EXIST_IN_FAVORITE: 'Assistant already exists in Favorite List',
	DELETED_SUCCESSFULLY_FROM_OWN_FAVORITE: 'Assistant Removed from Favorite List',
	ADDED_IN_FAVORITE_SUCCESSFULLY: 'Assistant Added Successfully into Favorite List',
	FAVORITE_ASSISTANT_FETCH_SUCCESSFULLY: 'Favorite Assistant  fetched successfully',
	FAVORITE_ASSISTANT_UPDATED_SUCCESSFULLY: 'Updated Favorite Assistant',
  
  };
  export const PinnedAssistantMessages = {
	ALREADY_EXIST_IN_PINNED_ASSISTANT_LIST_OF_USER: 'Assistant already exists in Pinned List',
	DELETED_SUCCESSFULLY_FROM_PINNED_ASSISTANT_LIST : 'Assistant Removed from Pinned List',
	ADDED_IN_PINNED_ASSISTANT_LIST_SUCCESSFULLY: 'Assistant added into Pinned List',
	PINNED_ASSISTANT_FETCHED_SUCCESSFULLY: 'Pinned Assistant fetched successfully',
	PINNED_ASSISTANT_UPDATED_SUCCESSFULLY: 'Updated Pinned Assistant',
	ASSISTANT_WAS_NOT_PINNED : 'Assistant Pin Status Updated'
  };
  export const KnowledgeBaseMessages = {
	ALREADY_EXIST_IN_FILE_LIST_OF_USER: 'KnowledgeBase already exists',
	FILE_ADDED_SUCCESSFULLY : "The file has been added successfully",
	FOLDER_ADDED_SUCCESSFULLY : "The folder has been created successfully",
	DELETED_SUCCESSFULLY_FROM_FILE_LIST : 'The file has been successfully deleted',
	ADDED_IN_FILE_LIST_SUCCESSFULLY: 'Added into KnowledgeBase List',
	FILE_FETCHED_SUCCESSFULLY: 'KnowledgeBase fetched successfully',
	FILE_FETCHING_FAILED: 'KnowledgeBase fetching failed',
	FILE_UPDATED_SUCCESSFULLY: 'Updated KnowledgeBase Details',
	ACTION_FAILED : "Action Failed",
	MESSAGE_SUCCESS : "Query Result Got Successfully",
	FILE_TYPE_SHOULD_BE_PDF : "File Type Should Be .pdf , .docx, .txt, .csv , .xlsx or .pptx",
	FILE_MADE_PUBLIC : "The file has been made publicly accessible to all users",
	FILE_MADE_PRIVATE : "The file has been made private",
	FOLDER_MADE_PUBLIC : "The folder has been made publicly accessible to all users",
	FOLDER_MADE_PRIVATE : "The folder has been made private",
	FOLDER_NAME_UPDATED : "Folder Name Updated",
	FILE_MOVED_SUCCESSFULLY : "The file has been moved successfully",
	SELECT_ANY_FILE_FROM_KNOWLEDGE_BASE : "Select Any File From The RAG Tree",
	FILE_TYPE_SHOULD_BE_PDF : "File Type Should Be .pdf , .docx, .txt, .csv , .xlsx or .pptx",
	FOLDER_ACCESS_GRANTED_DENIED: "Access denied: You are not the owner of this folder",
	FOLDER_ACCESS_GRANTED_FAILED: "An error occurred while checking folder ownership",
	GRANT_ACCESS_TO_USER: "Grant Access Successfully",
	GRANT_ACCESS_TO_USER_FAILED: "Grant Access Failed",
	REMOVE_ACCESS_FROM_USER: 'Remove Access Successfully',
	REMOVE_ACCESS_FROM_USER_FAILED: 'Remove Access Failed',
  };
  
  
  export const PostGreSqlDbMessages = {
	COMPANY_CREATED_SUCCESS: 'Data created successfully',
	COMPANY_UPDATED_SUCCESS: 'Data updated successfully',
	COMPANY_DELETED_SUCCESS: 'Data deleted successfully',
	INVALID_SQL_MESSAGE: 'Invalid SQL query format',
  };
  export const TrackUsageMessage = {
	TRACK_USAGE_DATA_NOT_FOUND: 'No usage data found.',
	TRACK_USAGE_FETCHED_SUCCESSFULLY:
	  'All track usage data fetched successfully.',
  };
  export const RAGMessages ={
	VECTOR_CREATED_SUCCESSFULLY : 'Vector from File Created Succesfully',
  }
  /*
   [TODO]: these values should be made dynamic by adding them into config collection to be applied as default configs
   [** concern : default max token was set to 200, which is too low, caused users to face issues with the response]
  */
  export const openAiConfig = {
	DEFAULT_MAX_TOKEN: 4096,
	DEFAULT_TEMPERATURE: 0,
	DEFAULT_TOP_P: 0,
	DEFAULT_FREQUENCY_PENALTY: 0,
	  DEFAULT_PRESENCE_PENALTY: 0
  };
  
  export const GeminiConfig = {
	DEFAULT_MAX_TOKEN: 2048,
	DEFAULT_TEMPERATURE: 0,
	DEFAULT_TOP_P: 0,
	DEFAULT_TOP_K: 0,
  };
  
  
  export const ClaudeConfig = {
	DEFAULT_MAX_TOKEN: 4096,
	DEFAULT_TEMPERATURE: 0,
	DEFAULT_TOP_P: 0,
	DEFAULT_TOP_K: 0,
};

export const DeepseekConfig = {
	DEFAULT_MODEL: 'deepseek-ai/DeepSeek-V3',
	DEFAULT_TEMPERATURE: 0.7,
	DEFAULT_MAX_TOKENS: 2048,
	DEFAULT_TOP_P: 0.7,
	DEFAULT_TOP_K: 50,
	DEFAULT_REPETITION_PENALTY: 1.29,
	DEFAULT_STOP: ["<｜end▁of▁sentence｜>"],
  };

export const AssistantTrackUsage = {
	ASSISTANT_USAGE_CREATED_SUCCESSFULLY: "Assistant usage successfully added",
	ASSISTANT_TRACK_USAGE_FETCHED_SUCCESSFULLY: "Assistant track usage data fetched successfully.",
	ALL_USERS_FETCHED_FOR_ASSISTANT: "All user fetched for an assistant"
  }
  
  export const GoogleDriveMessages ={
	AUTH_CODE_IS_REQUIRED :"Authorization code is required",
	AUTHENTICATION_FAILED :"Failed to authenticate with Google",
	GOOGLE_DRIVE_SYNCED_SUCCESSFULLY : "Google Drive Synced Successfully",
	GOOGLE_DRIVE_SYNC_FAILED :"Google Drive Sync Failed",
	GOOGLE_DRIVE_CREDENTIALS_FETCHED_SUCCESSFULLY : "Google Auth Credentials Fetch Successfully",
	GOOGLE_DRIVE_CREDENTIALS_DELETED_SUCCESSFULLY : "Google Auth Credentials Deleted Successfully ",
	NO_FILE_IS_SENT :"No file is sent",
	CONNECT_GOOGLE_DRIVE :"Please,Connect your Google Drive from 'Connect Apps'",
	FILE_COULD_NOT_DOWNLOAD:"File could not imported from Google Drive,Please download and upload in Knowledge Base",
  
  }
  
  export const WorkBoardMessages = {
	WORKBOARD_ACCESS_TOKEN_FETCHED_SUCCESSFULLY: 'WorkBoard access token fetched successfully',
	WORKBOARD_ACCESS_TOKEN_FETCH_FAILED: 'Failed to fetch WorkBoard access token',
	WORKBOARD_ACTION_ITEM_FETCHED_SUCCESSFULLY : 'WorkBoard Action Item fetched successfully',
	FAILED_TO_FETCH_WORKBOARD_ACCESS_TOKEN: 'Failed to get workboard access token',
	USER_INFO_FETCHED_SUCCESSFULLY: 'Workboard user information fetched successfully',
	FETCH_USER_INFO_FAILED: 'Failed to retrieve workboard user information',
	FETCH_USER_INFO_ERROR: 'Error fetching workboard user information',
	FETCH_GOAL_INFO_FAILED: 'Failed to retrieve workboard goal information',
	FETCH_GOAL_INFO_ERROR: 'Error fetching workboard goal information',
	FETCH_ACTIVITY_INFO_FAILED: 'Failed to retrieve workboard activity information',
	FETCH_ACTIVITY_INFO_ERROR: 'Error fetching workboard activity information',
	FETCH_TEAM_INFO_FAILED: 'Failed to retrieve workboard team information',
	FETCH_TEAM_INFO_ERROR: 'Error fetching workboard team information',
	FETCH_USER_GOALS_FAILED: 'Failed to retrieve workboard user goal information',
	FETCH_USER_GOALS_ERROR: 'Error fetching workboard user goal information',
	WORKBOARD_CREDENTIALS_DELETED_SUCCESSFULLY : 'WorkBoard Disconnected Successfully',
	WORKBOARD_IS_NOT_CONNECTED : 'Workboard Is Not Connected',
	WORKBOARD_CREATE_KNOWLEDGE_BASE_SUCCESSFUL :'Work Board Action Item Added into the KnowledgeBase',
	WORKBOARD_CREATE_KNOWLEDGE_BASE_FAILED :'Work Board Action Item Failed to Add into the KnowledgeBase',
	WORKSTREAM_FETCHED_SUCCESSFULLY : 'Work Streams List Fetched Successfully',
	WORKSTREAM_FETCHING_FAILED : 'Work Streams List Fetching Failed',
	WORKSTREAM_AI_FETCHED_SUCCESSFULLY : 'Work Stream Action Items Synced Successfully',
	WORKSTREAM_AI_FETCHING_FAILED : 'Work Stream Action Items List Syncing Failed'
  
	};
  
  export const VectorStoreMessages ={
	VECTOR_STORE_NOT_FOUND :"No vector store found with provided id"
  }
  export const WebCrawlKnowledgeBaseMessages = {
	FILE_ADDED_SUCCESSFULLY : "Web Crawled Data Added Successfully",
	DELETED_SUCCESSFULLY : 'Web Crawled Data deleted Successfully',
	ADDED_IN_FILE_LIST_SUCCESSFULLY: 'Added into Web Crawled KnowledgeBase List',
	FILE_FETCHED_SUCCESSFULLY: 'Web Crawled Data fetched successfully',
	FILE_FETCHING_FAILED: 'Web Crawled Data fetching failed',
	FILE_UPDATED_SUCCESSFULLY: 'Updated KnowledgeBase Details',
	ACTION_FAILED : "Action Failed",
	RESOURCE_MADE_PUBLIC : "Resource Made Public",
	RESOURCE_MADE_PRIVATE : "Resource Made Private",
  
  }

	export const EmailDomainMessages = {
	EMAIL_AUTHORIZED_SUCCESSFULLY: 'Email domain authorized successfully',
	EMAIL_AUTHORIZED_FAILED: 'Error authorizing email domain',
	ERROR_FETCHING_EMAIL_DOMAIN: 'Error fetching email domains',
	EMAIL_DOMAIN_NOT_FOUND: 'Email domain not found',
	EMAIL_DOMAIN_UPDATED_SUCCESSFULLY: 'Email domain updated successfully',
	EMAIL_DOMAIN_UPDATE_FAILED: 'Error updating email domain',
	EMAIL_DOMAIN_DELETED_SUCCESSFULLY: 'Email domain deleted successfully',
	EMAIL_DOMAIN_DELETE_FAILED: 'Error deleting email domain',
	};
  
	export const FunctionCallingMessages = {
	  FUNCTION_IS_INCORRECT: "Function is incorrect. It returned undefined or null. Make sure to give a proper returning return statement." ,
	  FUNCTION_IS_CORRECT: "Function is correct.",
	  FUNCTION_NAME_ALREADY_EXISTS: "Name already exists.",
	  FUNCTION_TITLE_ALREADY_EXISTS: "Title already exists.",
	  PROVIDE_MENDATORY_FIELDS: "Please provide all the mendatory fields.",
	  FUNCTION_DEFINITION_IS_REQUIRED: "Function definition is required.",
	  FUNCTION_NAME_AND_ASSISTANT_NAMEIS_REQUIRED: "Both Function name and Assistant name are required",
	  FUNCTION_DEFINITION_NOT_FOUND: "Function definition not found",
	  FUNCTION_DEFINITION_DELETED_SUCCESSFULLY: "Function definition deleted successfully",
	  ERROR_DELETING_FUNCTION_DEFINITION: "Error deleting function definition",
	  UPDATED_FUNCTION_DEFINITION_SUCCESSFULLY: "Function definition updated successfully",
  
	  };
  
	  export const IntegrationMessages = {
		TECHNICAL_ERROR : 'Technical Error',
		NO_SERVICE : 'No Service found for given user',
		SERVICE_EXISTS : 'Service with slug already exists',
		SERVICE_ADDED : 'Service Added Succesfully',
		SERVICE_NOT_FOUND : 'Service Not Found',
		SERVICE_CREDS_ADDED : 'Service credentials added successfully',
		GET_SERVICE_CREDS : 'Service credentials fetched successfully',
		SERVICE_CREDS_NOT_FOUND : 'Service creds not found for user',
		SERVICE_CREDS_DELETED : 'Service creds deleted',
		INVALID_PARAMS : 'Parameters must be array of objects',
		API_ENDPOINT_ADDED : 'Api endpoint added successfully',
		API_DELETED : 'Api endpoint deleted successfully',
		API_NOT_FOUND : 'Api endpoint not found',
		SERVICE_DELETED : 'Service deleted successfully',
		VALIDATE_REFRESH_TOKEN : 'Refresh token is required for OAuth authentication.',
	  }

export const CustomizeChatInfo = {
	userPreferences: "I learn best through step-by-step guides and visual aids.",
	desiredAiResponse: `
	- You are an expert on all subject matters
	- Provide accurate and factual answers
	- Offer both pros and cons when discussing solutions or opinions
	- Provide detailed explanations
	- Be highly organized and provide mark-up visually
	- No need to disclose you are an AI, e.g., do not answer with "As a large language model..." or "As an artificial intelligence..."
	- Don't mention your knowledge cutoff
	- Be excellent at reasoning
	- When reasoning, perform step-by-step thinking before you answer the question
	- If you speculate or predict something, inform me
	- If you cite sources, ensure they exist and include URLs at the end
	- Maintain neutrality in sensitive topics
	- Focus strongly on out-of-the-box, unique, and creative ideas
	- Only discuss safety when it's vital and not clear
	- Summarize key takeaways at the end of detailed explanations
	- If the quality of your response has decreased significantly due to my custom instructions, please explain the issue
	- Write short sentences.
	- Avoid multiple thoughts in one sentence.
	- Use 1–2 breakpoints to space out paragraphs.
	- Avoid 3+ sentence paragraphs.
	- Provide analogies/metaphors to simplify ideas, concepts, and complex topics
	- do not reply with a summary if I don’t ask for it
	- responses need to be humanized`,

};

export const AssistantRatingMessages = {
	AGENT_RATING_UPDATED_SUCCESSFULLY: "Agent rating updated successfully",
	AGENT_RATING_CREATED_SUCCESSFULLY: "Agent rating created successfully",
	AGENT_RATING_FETCHED_SUCCESSFULLY: "Agent rating fetched successfully",
	ALL_AGENT_RATING_FETCHED_SUCCESSFULLY: "All agent rating fetched successfully",
	AGENT_RATING_FETCH_FAILED: "Agent rating fetch failed",
	AGENT_RATING_NOT_FOUND: "Agent rating not found",
}
export const LinkedinMessages = {
	ERROR_FETCHING_LINKEDIN_CREDENTIALS: "Error fetching LinkedIn credentials.",
	LINKEDIN_AUTHORIZATION_CODE_EXPIRED_OR_INVALID: "'LinkedIn authorization code expired or invalid'",
	ERROR_FETCHING_LINKEDIN_ACCESS_TOKEN: "Error fetching LinkedIn access token.",
	LINKEDIN_AUTHORIZATION_EXPIRED: "LinkedIn authorization expired. Please login again.",
  }

export const DvdsAutomationMessages = {
	INVALID_DATA_FORMAT: "No data provided or data format is incorrect",
	DVDS_DOC_UPDATED: "DVDS document updated successfully.",
	ERROR_FETCHING_DVDS_DATA: "An error occurred while fetching the dvds data."
};

export const GoogleSheetsMessages = {
	INVALID_DATA_FORMAT: "No data provided or data format is incorrect",
	SHEET_UPDATED_SUCCESSFULLY: "Sheet updated successfully",
};

export const YouTubeMessages = {
	YOUTUBE_TRANSCRIPT_IMPORTED_SUCCESSFULLY : "Transcript has been added from Youtube",
	YOUTUBE_TRANSCRIPT_IMPORT_FAILED : "Sorry this video doesn't have transcript in english."
}

export const ServiceMessages = {
	MISSING_REQUIRED_PARAMETERS: "Missing required parameters",
	INVALID_OBJECT_ID: "Invalid ObjectId format",
	API_DETAILS_NOT_FOUND: "API details not found",
	UNEXPECTED_ERROR: "Unexpected error fetching API details",
  };

export const MultiAgentFunctionCallingInstructions = {
	PREDEFINED_TECHNICAL_INSTRUCTIONS: `You are a master agent which communicates with agents smartly to achieve what the user wants. To communicate with an agent any time you will need to use function calling. To use function calling you will need to pass three parameters: the assistant id, the prompt, and the threadId (which will be "null" the first time as string). After chatting with them you will receive the thread id later, so you should use that thread id for subsequent chats. If you are not satisfied with the agent's response, you can do function calling again with a better prompt to the same agent. Please note once you get the response from the agent, you will also receive the thread Id which you will need to pass again so you can chat with that respective agent. Any response you get from an agent should be shown to the user and then proceed with further communication either with the same or different agent.When ever you are  returning the reply from each agent can you at first add <assistant_id> in the response.Please note every response from different agent needs to be shown to the user as well. Currently you have these agents connected with you:\n\nAssistant data:\n`,
  };
export const SharePointMessages = {
    SERVICE_CONFIG_NOT_FOUND: 'OneDrive service configuration not found',
    USER_NOT_CONNECTED: 'User has not connected OneDrive',
    ACCESS_TOKEN_MISSING: 'No access token in user credentials',
    ACCESS_TOKEN_EXPIRED: 'Access token expired',
    AUTH_FAILED: 'Authentication failed - token may be invalid or expired',
    FILE_NOT_FOUND: 'File not found - check if the file exists and user has access',
    ACCESS_DENIED: 'Access denied - user may not have permission to access this file',
	ONE_DRIVE_SERVICE_MISSING: 'OneDrive service not found in database',
    USER_NOT_CONNECTED_ONE_DRIVE: 'User has not connected OneDrive',
    DOWNLOAD_FAILED: 'Failed to download from SharePoint'
};

export const N8nWorkflowMessages = {
	SECRET_KEY_REQUIRED: 'Secret key is required',
	ASSISTANT_ID_REQUIRED: 'Assistant ID is required',
	WORKFLOWS_FETCHED_SUCCESSFULLY: 'Workflows fetched successfully',
	WORKFLOWS_FETCHED_AND_CONFIG_SAVED: 'Workflows fetched successfully and configuration saved',
	NO_WORKFLOWS_FOUND: 'No workflows found',
	INVALID_SECRET_KEY: 'Invalid secret key',
	FAILED_TO_FETCH_WORKFLOWS: 'Failed to fetch workflows from n8n',
	ASSISTANT_NOT_FOUND: 'Assistant not found',
	WORKFLOW_IDS_MUST_BE_ARRAY: 'Workflow IDs must be an array',
	SELECTED_WORKFLOWS_SAVED_SUCCESSFULLY: 'Selected workflows saved successfully',
	FAILED_TO_SAVE_SELECTED_WORKFLOWS: 'Failed to save selected workflows',
	N8N_CONNECTION_STATUS_RETRIEVED: 'N8n connection status retrieved successfully',
	N8N_NOT_CONNECTED: 'N8n not connected for this assistant',
	FAILED_TO_GET_N8N_WORKFLOWS: 'Failed to get n8n workflows',
}
