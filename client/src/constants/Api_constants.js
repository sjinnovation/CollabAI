//---------- taskCommandCategoryApiSlug -----------
export const getAllTaskCommandsCategorySlug = () => `api/commandsCategory`;
export const createATaskCommandCategorySlug = () => `/api/commandsCategory`;

//------------ taskCommandApiSlug ------------------
export const createATaskCommandSlug = () => `/api/taskCommands`;
export const getAllTaskCommandsSlug = (currentPage, limit) => `api/taskCommands?page=${currentPage}&limit=${limit}`;
export const deleteATaskCommandSlug = (id) => `api/taskCommands/${id}`;
export const fetchATaskCommandSlug = (id) => `/api/taskCommands/${id}`;
export const editATaskCommandSlug = (id) => `/api/taskCommands/${id}`;
export const getTaskCommandsGroupedByCategorySlug = () => `/api/taskCommands/groupBy/category`;

//------------------ TEAMS_API_SLUG -------------------
export const SUPER_ADMIN_GET_ALL_TEAMS_SLUG = (page, limit) => `/api/teams?page=${page}&limit=${limit}`;
export const SUPER_ADMIN_CREATE_NEW_TEAM_SLUG = () => `/api/teams`;
export const SUPER_ADMIN_DELETE_A_TEAM_SLUG = (id) => `/api/teams/${id}`;
export const SUPER_ADMIN_FETCH_A_TEAM_SLUG = (id) => `/api/teams/${id}`;
export const SUPER_ADMIN_EDIT_A_TEAM_SLUG = (id) => `/api/teams/${id}`;

//------------------ASSISTANT_API_SLUG----------------------
export const SUPER_ADMIN_GET_ALL_ASSISTANTS_SLUG = (page=1, limit=10, orgAssistantSearchQuery) =>
  `/api/assistants?page=${page}&limit=${limit}&searchQuery=${orgAssistantSearchQuery ? orgAssistantSearchQuery : ''}`;
export const USER_GET_ALL_USER_CREATED_ASSISTANTS_SLUG = (id, page=1, limit=10, personalAssistantSearchQuery) =>
  `/api/assistants/users/created/${id}?page=${page}&pageSize=${limit}&searchQuery=${personalAssistantSearchQuery ? personalAssistantSearchQuery : ''}`;
export const SUPER_ADMIN_CREATE_NEW_ASSISTANT_SLUG = () => `/api/assistants`;
export const SUPER_ADMIN_DELETE_ASSISTANT_SLUG = (id) =>
  `/api/assistants/${id}`;
export const SUPER_ADMIN_FETCH_USER_STATS_ASSISTANT_SLUG = () =>
  `/api/assistants/users/stats`;
export const SUPER_ADMIN_EDIT_A_ASSISTANT_SLUG = (id) =>
  `/api/assistants/${id}`;
export const SEARCH_ALL_USER_CREATED_ASSISTANTS_SLUG = (id, searchQuery) =>
  `/api/assistants/users/created/${id}?searchQuery=${searchQuery}`;
export const SEARCH_ALL_ORGANIZATIONAL_ASSISTANTS_SLUG = (searchQuery) =>
  `/api/assistants?searchQuery=${searchQuery}`;
export const UPDATE_ASSISTANT_TEAM_LIST_API = (assistantId) =>
  `/api/assistants/${assistantId}/teams`;
export const UPDATE_SINGLE_ASSISTANT_API = (assistantId) =>
  `/api/assistants/${assistantId}`;
  
export const UPDATE_ASSISTANT_WITH_FILES_API = (assistantId) =>
  `/api/assistants/updatedatawithfile/${assistantId}`;
export const CREATE_SINGLE_ASSISTANT_API = "/api/assistants";
export const UPDATE_ASSISTANT_ACCESS_FOR_TEAM_API =(teamId) => `/api/teams/${teamId}`;

export const UPDATE_ASSISTANT_PUBLIC_STATE_CHECK = (id) => `/api/assistants/${id}`
export const GET_SINGLE_ASSISTANT_INFO_SLUG = (assistantId) => `api/assistants/${assistantId}/info`;
export const CHECK_SINGLE_ASSISTANTS_INFO = (assistantId)=>`/api/assistants/getAssistantInfo/${assistantId}`
export const STOP_GENERATING_RESPONSE_FOR_ASSISTANT = ()=>`api/assistants/stop-generating-response`

//----------------USERS_PROMPTS_DETAILS_API 
export const USER_PROMPTS_API_SLUG = (page, limit, searchInputValue) =>
  `/api/user/get-user-prompts?page=${page}&limit=${limit}${searchInputValue ? `&search=${searchInputValue}` : ""}`;
export const SINGLE_USER_PROMPTS_API_SLUG = (id,page, limit) =>
  `/api/user/get-all-user-prompts/${id}?page=${page}&limit=${limit}`;

export const USER_API_KEY_GENERATE_SLUG = (userId) => `/api/user/generate-api-key/${userId}`;
//------------------USER_API_SLUG---------------------
export const USER_LOGIN_API_SLUG = `/api/auth/login`;
export const USER_COMPANY_DATA_API_SLUG = (id) => `/api/company/getdata/${id}`;
export const USER_FORGOT_PASSWORD_API_SLUG = `/api/user/forgotpassword`;
export const USER_RESET_PASSWORD_API_SLUG = `/api/user/resetPassword`;

//------------------USER_PROFILE_API_SLUG---------------------
export const GET_USER_PROFILE_API_SLUG = `/api/user/get-single-user`;
export const GET_USER_DELETED_THREADS_API_SLUG = `/api/prompt/fetchdeletedthreads`;
export const USER_RECOVER_MULTI_THREADS_FROM_TRASH_API_SLUG = `/api/prompt/multithreadrecover`;
export const USER_PERMANENT_DELETE_THREADS_API_SLUG = `/api/prompt/thread`;
export const GET_SINGLE_USER_PROFILE_API_SLUG = (userId) => `/api/user/get-single-user/${userId}`;
export const UPLOAD_USER_PROFILE_PHOTO = (userId) => `/api/user/user-profile-avatar-upload/${userId}`;
export const DELETE_USER_PROFILE_PHOTO = (userId) => `/api/user/user-photo-delete/${userId}`;
export const USER_PASSWORD_CHECKING_SLUG = `/api/user/user-password-checking`;
export const USER_PASSWORD_UPDATE_SLUG = `/api/user/user-password-update`;
export const SSO_USER_PASSWORD_UPDATE_SLUG = `/api/user/sso-user-password-update`;
export const USER_AC_TOKEN_UPDATE_SLUG = `/api/user/user-ac-token-update`;

//------------ PROMPT_TEMPLATE_API_SLUG ------------------
export const SUPER_ADMIN_GET_ALL_PROMPT_TEMPLATES_SLUG = (page, limit) => `api/template/get-templates-admin?page=${page}&limit=${limit}`;
export const SUPER_ADMIN_CREATE_A_PROMPT_TEMPLATE_SLUG = () => `/api/template/create-template`;
export const SUPER_ADMIN_DELETE_A_PROMPT_TEMPLATE_SLUG = (id) => `api/template/delete-template/${id}`;
export const SUPER_ADMIN_FETCH_A_PROMPT_TEMPLATE_SLUG = (id) => `/api/template/get-template/${id}`;
export const SUPER_ADMIN_EDIT_A_PROMPT_TEMPLATE_SLUG = (id) => `/api/template/update-template/${id}`;
export const ALL_USER_GET_PROMPT_TEMPLATES_SLUG = ()=> `api/template/get-templates`;

//---------- PROMPT_TEMPLATE_CATEGORY_API_SLUG -----------
export const GET_ALL_PROMPT_TEMPLATES_CATEGORY_SLUG = () => `api/category/getAll`;
export const GET_SINGLE_PROMPT_TEMPLATES_CATEGORY_SLUG = (categoryId) => `api/category/get/${categoryId}`;
export const CREATE_A_PROMPT_TEMPLATE_CATEGORY_SLUG = (userId)=> `/api/category/create/${userId}`;

//---------- SETTINGS_API_SLUG -----------
export const API_SETTINGS_SLUG = `/api/config/settings`;
export const API_SETTINGS_BRAND_LOGO = (companyId) => `/api/company/upload-brand-logo/${companyId}`;
export const FETCH_COMPANY_INFO = (companyId) => `/api/company/get/${companyId}`;
export const DELETE_BRAND_LOGO = (companyId) => `/api/company/delete-brand-logo/${companyId}`;

//---------- USER_PREFERENCE_API_SLUG -----------
export const API_USER_PREFERENCE_SLUG = `/api/usersPreference/settings`;

//---------- PUBLIC_ASSISTANT_API_SLUG -----------
export const GET_ALL_PUBLIC_ASSISTANT = () => `api/assistants/public`;
export const ADD_PUBLIC_ASSISTANT = () => `api/assistants/public`;
export const FETCH_SINGLE_USERS_ALL_PUBLIC_ASSISTANTS = (page = 1,pageSize = 10 ,searchQuery ) => `api/assistants/public/details_info?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery ? searchQuery : ''}`;



export const FETCH_SINGLE_USERS_ALL_PUBLIC_ASSISTANTS_DETAILS = (searchQuery, selectAssistantType) => `api/assistants/public/categorized?search=${searchQuery ?encodeURIComponent( searchQuery):''}&type=${selectAssistantType ? encodeURIComponent(selectAssistantType): ''}`;
export const GET_PUBLIC_FEATURED_AGENTS = (page = 1, pageSize = 5) => `api/assistants/public/featured-agents?page=${page}&pageSize=${pageSize}`;
export const GET_SINGLE_PUBLIC_ASSISTANT = (assistantId) => `api/assistants/public/${assistantId}`;
export const UPDATE_SINGLE_PUBLIC_ASSISTANT = (assistantId) => `api/assistants/public/${assistantId}`;
export const DELETE_SINGLE_PUBLIC_ASSISTANT = (assistantId) => `api/assistants/public/${assistantId}`;

//---------- FAVORITE_ASSISTANT_API_SLUG -----------

export const GET_ALL_FAVORITE_ASSISTANT = () => `api/assistants/favourite`;
export const ADD_FAVORITE_ASSISTANT = () => `api/assistants/favourite`;
export const SINGLE_FAVORITE_ASSISTANT_DETAILS = (assistantId,page = 1, pageSize = 10 ,searchQuery) => `api/assistants/favourite/${assistantId}/details_info?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery ? searchQuery : ''}`;
export const GET_ALL_FAVORITE_ASSISTANT_BY_USER = (userId, page = 1, pageSize = 10 ) => `api/assistants/favourite/${userId}/all-favorite-assistant?page=${page}&pageSize=${pageSize}`;

export const GET_SINGLE_FAVORITE_ASSISTANT = (assistantId) => `api/assistants/favourite/${assistantId}`;
export const PUT_SINGLE_FAVORITE_ASSISTANT = (assistantId) => `api/assistants/favourite/${assistantId}`;
export const DELETE_SINGLE_FAVORITE_ASSISTANT = (assistantId) => `api/assistants/favourite/${assistantId}`;

//-----------ASSISTANT_TYPE_API_SLUG----------------

export const GET_ALL_ASSISTANT_TYPE = () => `api/assistants/types`;
export const GET_SINGLE_ASSISTANT_TYPE = (id) => `api/assistants/types/${id}`;
export const CREATE_ASSISTANT_TYPE = () => `api/assistants/types`;
export const UPDATE_SINGLE_ASSISTANT_TYPE = (id) => `api/assistants/types/${id}`;
export const DELETE_SINGLE_ASSISTANT_TYPE = (id) => `api/assistants/types/${id}`;
export const GET_ALL_ASSISTANT_TYPE_PAGINATED = (page, limit) => `api/assistants/types?page=${page}&limit=${limit}`;



//---------- PINNED_ASSISTANT_API_SLUG -----------

export const GET_ALL_PINNED_ASSISTANT = () => `api/assistants/pinned`;
export const ADD_PINNED_ASSISTANT = () => `api/assistants/pinned`;
export const SINGLE_PINNED_ASSISTANT_DETAILS = (assistantId) => `api/assistants/pinned/${assistantId}/info`;

export const GET_SINGLE_PINNED_ASSISTANT = (assistantId) => `api/assistants/pinned/${assistantId}`;
export const PUT_SINGLE_PINNED_ASSISTANT = (assistantId) => `api/assistants/pinned/${assistantId}`;
export const DELETE_SINGLE_PINNED_ASSISTANT = (assistantId,userId) => `api/assistants/pinned/${assistantId}/${userId}`;
export const DELETE_MANY_PINNED_ASSISTANT = (assistantId) => `api/assistants/pinned/${assistantId}`;

//----------- KNOWLEDGE BASE API SLUG--------------------
export const GET_ALL_OR_CREATE_KNOWLEDGE_BASE = () => `api/knowledge-base`;
export const GET_SINGLE_OR_UPDATE_OR_DELETE_KNOWLEDGE_BASE  = (id,userId,isAdmin) => `api/knowledge-base/${id}?userId=${userId}&isAdmin=${isAdmin}`;
export const DELETE_MULTIPLE_KNOWLEDGE_BASE  = () => 'api/knowledge-base/multidelete';

export const GET_SINGLE_USERS_ALL_KNOWLEDGE_BASE_OR_UPDATE_PUBLIC_STATE  = (userId) => `api/knowledge-base/${userId}`; 
export const UPDATE_KNOWLEDGE_BASE_FOLDER_NAME  = (userId) => `api/knowledge-base/update-folder-name/${userId}`; 
export const MOVE_KNOWLEDGE_BASE_FILE  = (fileId) => `api/knowledge-base/file-move/${fileId}`; 
export const GRANT_ACCESS_TO_USERS  = (knowledgeBaseId) => `api/knowledge-base/${knowledgeBaseId}/grant-access`; 
export const REMOVE_ACCESS_TO_USERS  = (knowledgeBaseId) => `api/knowledge-base/${knowledgeBaseId}/remove-folder-access`; 
export const GET_USERS_FOR_GRANT_ACCESS  = (knowledgeBaseId, page = 1, limit = 10, searchTerm = "") => `api/knowledge-base/${knowledgeBaseId}/get-users?search=${searchTerm}&page=${page+1}&limit=${limit}`; 
export const GET_EXISTING_USERS_FOR_FOLDER_ACCESS  = (knowledgeBaseId, page = 1, limit = 10) => `api/knowledge-base/${knowledgeBaseId}/get-accessed-users?&page=${page+1}&limit=${limit}`; 
// For getting all knowledgebase endpoint will be (userId) => `api/knowledge-base/${userId}` and for update any resource it will be (resourceId) => `api/knowledge-base/${resourceId}`

export const GET_ALL_KNOWLEDGE_BASE_PAGINATED = (page, limit) => `api/knowledge-base?page=${page}&limit=${limit}`;
export const DELETE_ALL_KNOWLEDGE_BASE_OF_A_USER =(userId)=>`api/knowledge-base/all/${userId}`
export const SYNC_FILES_FROM_NAV_BAR =(assistantId)=>`api/knowledge-base/sync-from-navbar/${assistantId}`
export const CHECK_ASSISTANT_SYNC_ENABLE_STATUS = (assistantId)=>`api/knowledge-base/sync-status-check/${assistantId}`
export const GET_SINGLE_USERS_ALL_KNOWLEDGE_BASE  = (page = 1,pageSize = 10 ,searchQuery='',selectedTree=0,userId) => `api/knowledge-base/${userId}?page=${page}&&pageSize=${pageSize}&&searchQuery=${searchQuery}&&selectedTree=${selectedTree}`; 




//--------------- RAG APIs-------------------------------

export const CREATE_VECTORS_FROM_FILE = ()=>`api/rag/create-vector`;
export const GET_FILE_FROM_GOOGLE_DRIVE=(fileId,apiKey)=>`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`

//--------------- Personalize Assistant ------------------
export const CREATE_A_CLONE_OF_AN_ASSISTANT = ()=>`api/assistants/clone-assistant`;
export const API_SETTINGS_ENABLE_PERSONALIZE_ASSISTANT = `/api/config/settings/personalize-assistant`;

//--------------- Google Drive ---------------------
export const SYNC_GOOGLE_DRIVE_FILES = (userId)=>`/api/google-auth/sync-files/${userId}`;
export const SYNC_WORKBOARD_ACTION_ITEM = (userId)=>`/api/workboard/sync/${userId}`;
export const GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS = (userId)=>`/api/google-auth/${userId}`

export const GOOGLE_AUTH_SLUG ='/api/google-auth';
export const GOOGLE_DRIVE_FILES_GETTING_SLUG = `https://www.googleapis.com/drive/v3/files`;
export const GOOGLE_DRIVE_FILES_TO_KNOWLEDGE_BASE = '/api/google-auth/google-drive-to-knowledgebase'
export const GOOGLE_DRIVE_FILE_SYNC =`/api/google-auth/sync-files`

// -----------------------------WorkBoard----------------------------------
export const REACT_APP_WORKBOARD_REDIRECT_URI = `${process.env.REACT_APP_FE_URL}/ConnectionWithWorkboard`;
export const REACT_APP_WORKBOARD_AUTH_URL = `https://www.myworkboard.com/wb/oauth/authorize`
export const WORKBOARD_AUTH_SLUG=(userId)=>`api/workboard/workboard-auth/${userId}`
export const WORKBOARD_ACTION_ITEM_SLUG=(userId)=>`api/workboard/workboard-activity/${userId}`;
export const WORKBOARD_ACTION_ITEM_KNOWLEDGE_BASE_SLUG=()=>`api/workboard/knowledge-base`;
export const WORKBOARD_SINGLE_ACTION_ITEM_KNOWLEDGE_BASE_SLUG=(fileId)=>`api/workboard/knowledge-base/sync/${fileId}`;
export const WORKBOARD_WORK_STREAM_ACTION_ITEM_SYNC_SLUG=(userId)=>`api/workboard/sync-work-stream/${userId}`;
export const WORKBOARD_WORK_STREAM_LIST_SLUG=(userId)=>`api/workboard/work-stream-list/${userId}`;



//---------------------------- Fire Crawl ----------------------------------
export const WEB_CRAWLED_SLUG ='/api/web-crawl/crawl'
export const WEB_CRAWLED_PAGES = (userId)=>`api/web-crawl/crawl/${userId}`;
export const WEB_CRAWLER_KEY_SLUG =`api/web-crawl/key`;
export const WEB_CRAWLER_USER_BASED_KEY_SLUG = (userId)=>`api/web-crawl/key/${userId}`;
//----------------------------- Flux image generator ------------------------
export const FLUX_KEY_SLUG =`api/flux-image/key`;
export const FLUX_USER_BASED_KEY_SLUG = (userId)=>`api/flux-image/key/${userId}`;
export const FLUX_IMAGE_DOWNLOAD_SLUG = (s3key)=>`api/flux-image/download?s3Key=${s3key}`;

//-----------Active Collab----------------
export const USER_AC_TOKEN_UPDATE = (userId)=>`api/user/user-ac-token-update/${userId}`;

//------------------------------- Function calling ------------------------------
export const SAVE_FUNCTION_DB = () => "/api/assistants/function-definition";
export const GET_SINGLE_FUNCTION_DB = (userId, searchQuery) => `/api/assistants/function-definitions/singleUser/${userId}?searchQuery=${searchQuery}`;
export const GET_ALL_FUNCTION_DB = (searchQuery) => `/api/assistants/function-definitions${searchQuery ? `?searchQuery=${searchQuery}` : ""}`;
export const DELETE_FUNCTION_DB = (functionIdToDelete) => `/api/assistants/function-definitions/delete/${functionIdToDelete}`;
export const UPDATE_FUNCTION_DB = (functionId) => `/api/assistants/function-definitions/update/${functionId}`;
export const VALIDATE_FUNCTION = () => "/api/assistants/validateFunctionDefinition";

//------------------------------- YouTube --------------------------------------
export const GET_YOUTUBE_TRANSCRIPT=`/api/youtube/knowledge-base/`

// -----------------------------Assistants Ratings----------------------------------
export const CREATE_ASSISTANTS_RATINGS_SLUG = (assistantId) => `/api/assistants/rating/${assistantId}`;
export const GET_ASSISTANTS_RATINGS_SLUG = (assistantId) => `/api/assistants/rating/${assistantId}`;
export const GET_USER_RATINGS_SLUG = (assistantId) => `/api/assistants/rating/user/${assistantId}`;

// --------------------------------IntegrateApps ------------------------------
export const INTEGRATED_APPS_API_STORE_CREDS = `api/integration/service/integrate`;
export const INTEGRATED_APPS_API_DELETE_CREDS = `api/integration/service/disconnect`;
export const INTEGRATED_APPS_API_GET_CREDS = `api/integration/service/verify`;
export const INTEGRATED_APPS_API_GET_ID = `api/integration/service/id/verify`;


//--------------------------------Service Apis --------------------------------
export const SERVICE_GET_ALL = `api/integration/service/list`;
export const GET_SERVICE = `api/integration/service`;
export const SERVICE_ADD_ENDPOINTS = `api/integration/service/add/endpoint`;
export const SERVICE_GET_ALL_EXISTING_ENDPOINTS = `api/integration/service/api/list`;
export const SERVICE_DELETE_API_BY_ID = `api/integration/service/api/delete`;
export const SERVICE_UPDATE_API_BY_ID = `api/integration/service/api/update`;
export const SERVICE_GET_ALL_USER_BASED_APIS = `/api/integration/service/users/api/list`;
export const CHECKING_IF_SERVICEID_AND_USERID_EXISTS = `/api/integration/service/check`;
export const SERVICE_ADD_ENDPOINT = `api/integration/service/add`;
export const SERVICE_UPDATE_BY_ID = `api/integration/service/update`; 
export const SERVICE_IS_ACTIVE_BY_ID = `api/integration/update-service-status`;
export const GET_SERVICE_API_DETAILS = `/api/integration/get-service-api-details`;




// -------------------------- LinkedIn --------------------------

export const LINKEDIN_SHARE_POST = `/api/linkedin/post`;
export const LINKEDIN_CALLBACK = `/api/linkedin/callback`;
export const LINKEDIN_AUTH = `/api/linkedin/auth`;
export const LINKEDIN_GET_POST = (postId) => `https://www.linkedin.com/feed/update/${postId}`;


//--------------------------Projects ----------------------------
export const ADD_FILE_TO_PROJECTS = `/api/folder-chats/files`
export const ADD_WAITING_FILE_TO_PROJECTS = `/api/folder-chats/waiting-files`

export const SINGLE_PROJECT_SLUG = (projectId)=>`/api/folder-chats/${projectId}`
export const SINGLE_PROJECT_DELETE_SLUG = (projectId,uid)=>`/api/folder-chats/delete-file/${projectId}?uid=${uid}`
export const DELETE_THREAD_FILES = '/api/folder-chats/delete-thread-files';
export const DELETE_THREAD_FILES_DURING_UPLOAD = '/api/folder-chats/delete-uid-files';
export const DELETE_SINGLE_PROJECT_FILE = '/api/folder-chats/delete-single-file';
export const DELETE_PROJECT_FILE =`/api/folder-chats/delete-system-files`;


// ================ Ai Persona =======================
export const CREATE_NEW_AI_PERSONA_SLUG = () => `/api/ai-persona`;
export const GET_ALL_AI_PERSONAS_SLUG = (page, limit) => `/api/ai-persona?page=${page}&limit=${limit}`;
export const GET_ALL_AI_PERSONAS_WITH_PERSONAL_PERSONAS_SLUG = () => `/api/ai-persona/all`;
export const FETCH_A_AI_PERSONA_SLUG = (id) => `/api/ai-persona/${id}`;
export const EDIT_A_AI_PERSONA_SLUG = (id) => `/api/ai-persona/${id}`;
export const DELETE_A_AI_PERSONA_SLUG = (id) => `/api/ai-persona/${id}`;

// ================ Sharepoint and Onedrive =======================
export const ONEDRIVE_FILES_TO_KNOWLEDGE_BASE = '/api/onedrive/files-to-knowledge-base';
export const SHAREPOINT_FILES_TO_KNOWLEDGE_BASE = "/api/sharepoint/files-to-knowledge-base";

//-----------MULTI_AGENT_SYSTEM_API_SLUG----------------
export const GET_ALL_ASSISTANT_IDS = (userId) => `api/assistants/all-assistant-ids/${userId}`;

//-----------N8N_INTEGRATION_API_SLUG----------------
export const N8N_CONNECT_SLUG = (userId) => `/api/user/${userId}/n8n-connection`;
export const N8N_DISCONNECT_SLUG = (userId) => `/api/user/${userId}/n8n-connection`;
export const N8N_CONNECTION_STATUS_SLUG = (userId) => `/api/user/${userId}/n8n-connection`;
export const N8N_WORKFLOWS_SLUG = (userId) => `/api/user/${userId}/n8n-workflows`;

//-----------AI_SUGGESTION_SETTINGS_API_SLUG----------------
export const GET_AI_SUGGESTION_SETTINGS = () => `/api/ai-suggestion-settings/get-ai-suggestion-settings`;
export const UPDATE_AI_SUGGESTION_SETTINGS = () => `/api/ai-suggestion-settings/update-ai-suggestion-settings`;
export const GET_AI_SUGGESTION_BATCH_PROCESSING = () => `/api/ai-suggestion-settings/get-ai-suggestion-batch-processing`;
export const UPDATE_AI_SUGGESTION_BATCH_PROCESSING = () => `/api/ai-suggestion-settings/update-ai-suggestion-batch-processing`;
export const RUN_AI_SUGGESTION_BATCH_PROCESSING = () => `/api/ai-suggestion-settings/run-batch-processing`;

//-----------AI_SUGGESTIONS_API_SLUG----------------
export const GET_USERS_WITH_AI_SUGGESTIONS = (page = 1, limit = 10, search = "", role = "all", status = "all", sortBy = "name", sortOrder = "asc") => 
  `/api/ai-suggestions/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&role=${role}&status=${status}&sortBy=${sortBy}&sortOrder=${sortOrder}`;
export const TOGGLE_USER_AI_SUGGESTIONS = (userId) => `/api/ai-suggestions/toggle/${userId}`;
export const BULK_TOGGLE_AI_SUGGESTIONS = () => `/api/ai-suggestions/bulk-toggle`;
export const EXPORT_AI_SUGGESTIONS_REPORT = (format = 'json', search = "", role = "all", status = "all") => 
  `/api/ai-suggestions/export?format=${format}&search=${encodeURIComponent(search)}&role=${role}&status=${status}`;

export const GET_AI_SUGGESTIONS_FOR_USER = (userId) => 
  `/api/ai-suggestion-settings/user-suggestion/${userId}`;

export const GENERATE_ASSISTANT_SUGGESTIONS_BY_DESIGNATION = () => 
  `/api/ai-suggestion-settings/generate-assistant-suggestions-by-designation`;
export const GET_ASSISTANT_SUGGESTIONS_FOR_USER = (userId) => 
  `/api/ai-suggestion-settings/assistant-suggestions/${userId}`;