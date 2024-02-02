export const  FETCH_ALL_ASSISTANTS = (page) => `api/assistants/users?page=${page}&pageSize=5`;
export const  FETCH_ASSISTANT_THREADS = (assistant_id) => `api/assistants/threads?assistant_id=${assistant_id}`;
export const  UPDATE_ASSISTANT_THREADS = (thread_mongo_id) => `/api/assistants/threads/${thread_mongo_id}`;
export const  DELETE_ASSISTANT_THREADS = (thread_mongo_id) => `/api/assistants/threads/${thread_mongo_id}`;

