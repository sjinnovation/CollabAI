import { google } from 'googleapis';
import config from "../config.js";
import StatusCodes from 'http-status-codes';
import { CommonMessages, GoogleSheetsMessages } from '../constants/enums.js';
import { getGoogleAuthCredentialService, getGoogleAuthClient } from '../service/googleAuthService.js';
import { csvToArray } from "./preprocessOfRAG.js";



/**
 * @async
 * @function writeToGoogleSheet
 * @description Writes provided data to a specified Google Sheet tab, handling both cron job and user OAuth flows.
 * - Authenticates using either global OAuth client or user-specific tokens.
 * - Converts CSV string data to array if needed.
 * - Validates data format before writing.
 * - Clears existing data in the sheet tab before updating.
 * - Returns success or error responses accordingly.
 * 
 * @param {Object} req - Express request object containing userId, spreadsheetId, sheetName, data, and optional cronJob flag in body.
 * @param {Object} res - Express response object returning status and messages.
 * @param {Function} next - Express next middleware function (not used here).
 * 
 * @returns {Response} 200 on successful update; 400 on invalid data format; 401 on auth failure; 500 on other errors.
 */

export const writeToGoogleSheet = async (req, res, next) => {
    const { userId, spreadsheetId, sheetName, data, cronJob = false } = req.body;
  
    try {
        let auth = await getGoogleAuthClient();
        if(!auth){
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: CommonMessages.UNAUTHORIZED_ERROR,
            });
        }

        if (!cronJob) {
            const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);
            const accessToken = credentialsOfGoogleAuth.accessToken;
            const refreshToken = credentialsOfGoogleAuth.refreshToken;

            auth = new google.auth.OAuth2();
            auth.setCredentials({
                access_token: accessToken,
                refresh_token: refreshToken
            });
        }
      
        let csvData = data;
        const sheets = google.sheets({ version: 'v4', auth: auth });
        if (typeof csvData !== 'object' && csvData !== null) {
            csvData = await csvToArray(data);
        }

        if (!Array.isArray(csvData) || csvData.length === 0) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: GoogleSheetsMessages.INVALID_DATA_FORMAT,
            });
        }
  
        const headers = Object.keys(csvData[0]);
        const values = csvData.map(row => headers.map(header => row[header]));
        const sheetData = [headers, ...values];
        const rangeToClear = `${sheetName}!A1:Z`;
  
        await sheets.spreadsheets.values.clear({
            spreadsheetId,
            range: rangeToClear,
        });
  
        const range = `${sheetName}!A1`;
        const resource = { values: sheetData };
  
        const response = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range,
            valueInputOption: "USER_ENTERED",
            resource,
        });

        return res.status(StatusCodes.OK).json({
            message: GoogleSheetsMessages.SHEET_UPDATED_SUCCESSFULLY,
        });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            errorMessage: CommonMessages.INTERNAL_SERVER_ERROR,
            message: error.message,
        });
    }
  };
