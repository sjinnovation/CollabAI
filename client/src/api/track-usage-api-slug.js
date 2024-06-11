export const  FETCH_MONTHLY_USAGE_REPORT = (userid, selectedMonth) => `/api/usage/get-all-track-usage-monthly?userid=${userid ? userid: ''}&dateString=${selectedMonth ? selectedMonth : ""}`;

export const  FETCH_DAILY_USAGE_REPORT = (userid, dateString) => `/api/usage/get-all-track-usage-daily?userid=${userid ? userid : ''}&dateString=${dateString ? dateString : ''}`;

export const  FETCH_MONTHLY_ASSISTANT_USAGE_REPORT = (selectedMonth) => `/api/assistants/usage/get-assistant-usage-monthly?dateString=${selectedMonth ? selectedMonth : ""}`;

export const  FETCH_ALL_USER_LIST_FOR_AN_ASSISTANT = (assistantId) => `/api/assistants/usage/${assistantId}`;

export const  INSERT_DATA_TO_ASSISTANT_USAGE = (assistantId) => `/api/assistants/usage/${assistantId}`;