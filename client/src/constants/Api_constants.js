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

//------------------ TAG_API_SLUG ----------------------
export const SUPER_ADMIN_GET_ALL_TAGS_SLUG = (page, limit) => `/api/meetingTypes/get-all?page=${page}&limit=${limit}`;
export const SUPER_ADMIN_CREATE_NEW_TAG_SLUG = () => `/api/meetingTypes/create`;
export const SUPER_ADMIN_DELETE_A_TAG_SLUG = (id) => `/api/meetingTypes/delete/${id}`;
export const SUPER_ADMIN_FETCH_A_TAG_SLUG = (id) => `/api/meetingTypes/get/${id}`;
export const SUPER_ADMIN_EDIT_A_TAG_SLUG = (id) => `/api/meetingTypes/update/${id}`;

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

//----------------USERS_PROMPTS_DETAILS_API 
export const USER_PROMPTS_API_SLUG = (page, limit, searchInputValue) =>
  `/api/user/get-user-prompts?page=${page}&limit=${limit}${searchInputValue ? `&search=${searchInputValue}` : ""}`;
export const SINGLE_USER_PROMPTS_API_SLUG = (id,page, limit) =>
  `/api/user/get-all-user-prompts/${id}?page=${page}&limit=${limit}`;
  
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

//---------- USER_PREFERENCE_API_SLUG -----------
export const API_USER_PREFERENCE_SLUG = `/api/usersPreference/settings`;

//---------- PUBLIC_ASSISTANT_API_SLUG -----------
export const GET_ALL_PUBLIC_ASSISTANT = () => `api/assistants/public`;
export const ADD_PUBLIC_ASSISTANT = () => `api/assistants/public`;
export const FETCH_SINGLE_USERS_ALL_PUBLIC_ASSISTANTS = (page = 1,pageSize = 10 ,searchQuery ) => `api/assistants/public/details_info?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery ? searchQuery : ''}`;



export const FETCH_SINGLE_USERS_ALL_PUBLIC_ASSISTANTS_DETAILS = (searchQuery, selectAssistantType) => `api/assistants/public/categorized?search=${searchQuery ?encodeURIComponent( searchQuery):''}&type=${selectAssistantType ? encodeURIComponent(selectAssistantType): ''}`;
export const GET_SINGLE_PUBLIC_ASSISTANT = (assistantId) => `api/assistants/public/${assistantId}`;
export const UPDATE_SINGLE_PUBLIC_ASSISTANT = (assistantId) => `api/assistants/public/${assistantId}`;
export const DELETE_SINGLE_PUBLIC_ASSISTANT = (assistantId) => `api/assistants/public/${assistantId}`;

//---------- FAVORITE_ASSISTANT_API_SLUG -----------

export const GET_ALL_FAVORITE_ASSISTANT = () => `api/assistants/favourite`;
export const ADD_FAVORITE_ASSISTANT = () => `api/assistants/favourite`;
export const SINGLE_FAVORITE_ASSISTANT_DETAILS = (assistantId,page = 1, pageSize = 10 ,searchQuery) => `api/assistants/favourite/${assistantId}/details_info?page=${page}&pageSize=${pageSize}&searchQuery=${searchQuery ? searchQuery : ''}`;

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
// For getting all knowledgebase endpoint will be (userId) => `api/knowledge-base/${userId}` and for update any resource it will be (resourceId) => `api/knowledge-base/${resourceId}`

export const GET_ALL_KNOWLEDGE_BASE_PAGINATED = (page, limit) => `api/knowledge-base?page=${page}&limit=${limit}`;
export const DELETE_ALL_KNOWLEDGE_BASE_OF_A_USER =(userId)=>`api/knowledge-base/all/${userId}`

//--------------- RAG APIs-------------------------------

export const CREATE_VECTORS_FROM_FILE = ()=>`api/rag/create-vector`;
export const GET_FILE_FROM_GOOGLE_DRIVE=(fileId,apiKey)=>`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`

//--------------- Personalize Assistant ------------------
export const CREATE_A_CLONE_OF_AN_ASSISTANT = ()=>`api/assistants/clone-assistant`;
export const API_SETTINGS_ENABLE_PERSONALIZE_ASSISTANT = `/api/config/settings/personalize-assistant`;

//--------------- Google Drive ---------------------
export const SYNC_GOOGLE_DRIVE_FILES = (userId)=>`/api/google-auth/sync-files/${userId}`;
export const GET_OR_DELETE_GOOGLE_DRIVE_AUTH_CREDENTIALS = (userId)=>`/api/google-auth/${userId}`
export const GOOGLE_AUTH_SLUG ='/api/google-auth';
export const GOOGLE_DRIVE_FILES_GETTING_SLUG = `https://www.googleapis.com/drive/v3/files`;
export const GOOGLE_DRIVE_FILES_TO_KNOWLEDGE_BASE = '/api/google-auth/google-drive-to-knowledgebase'

// -----------------------------WorkBoard----------------------------------
export const REACT_APP_WORKBOARD_REDIRECT_URI = `${process.env.REACT_APP_BASE_URL_FE}/ConnectionWithWorkboard`;
export const REACT_APP_WORKBOARD_AUTH_URL = `https://www.myworkboard.com/wb/oauth/authorize`

