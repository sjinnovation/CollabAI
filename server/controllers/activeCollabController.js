import StatusCodes from 'http-status-codes';
import { CommonMessages, DvdsAutomationMessages } from '../constants/enums.js';
import axios from "axios";
import config from '../config.js';
import https from 'https';
import { duplicateSheet, removeFormulasAndKeepValues } from "../utils/googleSpreadsheet.js";

/**
 * @async
 * @function fetchAndSyncDvDsSheet
 * @description Fetches DVDS data for the past week, removes formulas from the existing sheet, writes new data to a Google Sheet,
 * and duplicates the stats sheet for the upcoming week. Supports both manual and cron job execution.
 * @param {Object} req - Express request object containing userId and optional cronJob flag in the body, and authorization token in headers.
 * @param {Object} res - Express response object returning success or error message.
 * @param {Function} next - Express next middleware function.
 * @returns {Response} 200 with success message on successful sync, or appropriate error status with message on failure.
 */

export const fetchAndSyncDvDsSheet = async (req, res, next) => {
    const fetchDvDsDataApiUrl = config.BACKEND_API_URL + "/api/ac/fetch-dvds-data";
    const googleSheetApiUrl = config.BACKEND_API_URL + "/api/google-sheet/write-to-sheet";
    const dvdsSpreadsheetId = config.DVDS_SPREADSHEET_ID;
    const dvdsRecordSheetName = config.DVDS_RECORD_SHEET_NAME;
    const dvdsStatsSheetName = config.DVDS_STATS_SHEET_NAME;
    const { userId, cronJob = false } = req.body;

    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                errorMessage: CommonMessages.UNAUTHORIZED,
            });
        }
        
        const userAcToken = authHeader.split(' ')[1];

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userAcToken}`,
        }
        const { start, end, nextDate, lastWeekDate } = getLastWeekRange();
        const params = {
            start: start,
            end: end
        };

        const rmFormulaValueResp = await removeFormulasAndKeepValues(dvdsSpreadsheetId, lastWeekDate);

        const apiResponse = await axios.get(fetchDvDsDataApiUrl, { headers, params });

        if (!apiResponse.data || !apiResponse.data.status || apiResponse.data.status !== "success") {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: apiResponse.data.status,
                errorMessage: apiResponse.data.message ? apiResponse.data.message : "",
            });
        }

        const data = Array.isArray(apiResponse.data.details) ? apiResponse.data.details : [];
        
        if (!Array.isArray(data)) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: apiResponse.data.status,
                errorMessage: DvdsAutomationMessages.INVALID_DATA_FORMAT,
            });
        }

        const response = await axios.post(googleSheetApiUrl, {
            userId: userId,
            spreadsheetId: dvdsSpreadsheetId,
            sheetName: dvdsRecordSheetName,
            data: data,
            cronJob: cronJob
        });

        const dupResponse = await duplicateSheet(dvdsSpreadsheetId, dvdsStatsSheetName, nextDate);

        return res.status(StatusCodes.OK).json({
            message: DvdsAutomationMessages.DVDS_DOC_UPDATED,
        });

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errorMessage: CommonMessages.INTERNAL_SERVER_ERROR,
            message: error.message,
        });
    }
};


/**
 * @async
 * @function fetchDvDsData
 * @description Executes a raw SQL query against the ActiveCollab API to retrieve time record data within a specified date range.
 * Authenticates using the Bearer token in the request headers. Returns formatted data or an appropriate error.
 * @param {Object} req - Express request object containing `start` and `end` in query params, and authorization token in headers.
 * @param {Object} res - Express response object that returns fetched DVDS data or an error message.
 * @param {Function} next - Express next middleware function (not used here but included for compatibility).
 * @returns {Response} 200 with fetched data on success, 401 on auth failure, or 500 with error details on failure.
 */

export const fetchDvDsData = async (req, res, next) => {

    try {
        const { start, end } = req.query;

        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                errorMessage: CommonMessages.UNAUTHORIZED,
            });
        }
        
        const userAcToken = authHeader.split(' ')[1];
        const acQueryApiUrl = config.ACTIVE_COLLAB_BASE_URL + "/api/v1/ac-query-tasks";

        let query = `SELECT
          'TimeRecord' AS 'Type', 
          tr.id AS 'Record ID',
          tr.job_type_id AS 'Group ID',
          jt.name AS 'Group Name',
          tr.parent_type AS 'Parent Type',
          tr.parent_id AS 'Parent ID',
          t.name AS 'Parent Name', -- Assuming 'tasks' table for parent name
          t.project_id AS 'Project ID', -- Using project_id from tasks
          p.name AS 'Project Name',
          p.company_id AS 'Client ID',
          cu.name AS 'Client Name', -- Assuming 'users' table for client name, linked via 'company_id'
          tr.record_date AS 'Record Date',
          tr.user_id AS 'User ID',
          CONCAT(u.first_name, ' ', u.last_name) AS 'User Name', -- Fetching first name from 'users'
          u.email AS 'User Email',
          tr.summary AS 'Summary',
          tr.value AS 'Value',
          CASE 
              WHEN tr.billable_status = 1 THEN 'Billable' 
              ELSE 'Not billable' 
          END AS 'Status',
          tl.id AS 'Task List Id',
          tl.name AS 'Task List Name'
          FROM 
              time_records tr
          LEFT JOIN 
              tasks t ON tr.parent_type = 'task' AND tr.parent_id = t.id
          LEFT JOIN 
              task_lists tl ON t.task_list_id = tl.id
          LEFT JOIN 
              projects p ON t.project_id = p.id
          LEFT JOIN 
              companies cu ON cu.id = p.company_id -- Assuming client/user relationship based on company_id
          LEFT JOIN 
              job_types jt ON jt.id = tr.job_type_id
          LEFT JOIN 
              users u ON u.id = tr.user_id
          WHERE
            tr.is_trashed = 0 AND
            tr.record_date BETWEEN '${start}' AND '${end}' -- Adjusted to your specific dates
          ORDER BY 
              tr.record_date DESC,
              tl.id ASC, -- or tl.name ASC; based on how you would like to sort
              tr.id ASC;
          `;

        const agent = new https.Agent({ family: 4 });

        const options = {
            method: 'POST',
            url: acQueryApiUrl,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${userAcToken}`,
            },
            data: {
              sql_query: query,
            },
            httpsAgent: agent,
        };

        const response = await axios.request(options);

        const responseData = response.data ? response.data : {};

        if (!responseData.status || responseData.status !== "success") {
            return res.status(StatusCodes.OK).json({
                status: responseData.status,
                errorMessage: responseData.message ? responseData.message : DvdsAutomationMessages.ERROR_FETCHING_DVDS_DATA,
            });
        }

        let formattedData = {
            status: responseData.status,
            message: responseData.message ? responseData.message : DvdsAutomationMessages.DVDS_DATA_FETCHED,
            details: Array.isArray(responseData.details) ? responseData.details : [],
        };

        return res.status(StatusCodes.OK).json(formattedData);

    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errorMessage: CommonMessages.INTERNAL_SERVER_ERROR,
            message: error.message,
        });
    }
};

function getLastWeekRange() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    let startMonday, endSunday;

    if (dayOfWeek === 0) { 
        // Today is Sunday → Get this week's Monday to today (Sunday)
        startMonday = new Date(today);
        startMonday.setDate(today.getDate() - 6);
        endSunday = new Date(today);
    } else if (dayOfWeek === 1) { 
        // Today is Monday → Get last week's Monday to yesterday (Sunday)
        startMonday = new Date(today);
        startMonday.setDate(today.getDate() - 7);
        endSunday = new Date(today);
        endSunday.setDate(today.getDate() - 1);
    } else { 
        // Any other day → Get last week's Monday to last week's Sunday
        startMonday = new Date(today);
        startMonday.setDate(today.getDate() - dayOfWeek - 6);
        endSunday = new Date(startMonday);
        endSunday.setDate(startMonday.getDate() + 6);
    }

    const nextDate = new Date(endSunday);
    nextDate.setDate(endSunday.getDate() + 1);

    return {
        start: startMonday.toISOString().split('T')[0], // Format YYYY-MM-DD
        end: endSunday.toISOString().split('T')[0],
        nextDate: formatDate(nextDate),
        lastWeekDate: formatDate(startMonday),
    };
}

function formatDate(date) {
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' }); // e.g., Feb
    return `${month} ${day}`;
}

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}
