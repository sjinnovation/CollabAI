export const  FETCH_MONTHLY_USAGE_REPORT = (userid, selectedMonth) => `/api/usage/get-all-track-usage-monthly?userid=${userid ? userid: ''}&dateString=${selectedMonth ? selectedMonth : ""}`;

export const  FETCH_DAILY_USAGE_REPORT = (userid, dateString) => `/api/usage/get-all-track-usage-daily?userid=${userid ? userid : ''}&dateString=${dateString ? dateString : ''}`;
