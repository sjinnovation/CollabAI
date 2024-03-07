export const  FETCH_ALL_ASSISTANTS = (page, searchQuery=false) => `api/assistants/users?page=${searchQuery ? '1' : page}&pageSize=${searchQuery ? '20' : '5' }${searchQuery ? `&searchQuery=${searchQuery}` : ""}`;
export const  FETCH_ASSISTANT_THREADS = (assistant_id) => `api/assistants/threads?assistant_id=${assistant_id}`;
export const  UPDATE_ASSISTANT_THREADS = (thread_mongo_id) => `/api/assistants/threads/${thread_mongo_id}`;
export const  DELETE_ASSISTANT_THREADS = (thread_mongo_id) => `/api/assistants/threads/${thread_mongo_id}`;
export const  SEARCH_ASSISTANTS = (searchQuery) => `api/assistants/users?searchQuery=${searchQuery}`;

