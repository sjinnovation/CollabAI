
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
export const CREATE_A_PROMPT_TEMPLATE_CATEGORY_SLUG = (userid)=> `/api/category/create/${userid}`;

//---------- SETTINGS_API_SLUG -----------
export const API_SETTINGS_SLUG = `/api/config/settings`;
