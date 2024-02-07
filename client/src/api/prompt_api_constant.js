export const FETCH_PROMPT_TITLE = "api/prompt/getprompttitle";
export const FETCH_ALL_CHAT_THREADS = (userId) => `api/prompt/fetchchatthreads/${userId}`;
export const DELETE_A_CHAT_THREAD = () => "/api/prompt/clearsingleconversation/";
export const UPDATE_A_CHAT_THREAD = () => "/api/prompt/updateprompttitle";