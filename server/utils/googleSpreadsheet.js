import { google } from 'googleapis';
import StatusCodes from 'http-status-codes';
import { CommonMessages } from '../constants/enums.js';
import { getGoogleAuthClient } from '../service/googleAuthService.js';

let auth = await getGoogleAuthClient();

/**
 * Duplicates a sheet within a Google Sheets document using sheet name, overwriting if the new sheet name already exists
 * @param {string} spreadsheetId - The ID of the Google Sheets document
 * @param {string} sourceSheetName - The name of the sheet to duplicate
 * @param {string} newSheetName - The name of the duplicated sheet
 * @param {string} auth - The authentication object (OAuth2 client)
 * @returns {Promise<object>} - The response from the Sheets API
 */
export const duplicateSheet = async (spreadsheetId, sourceSheetName, newSheetName) => {
  try {
    if(!auth)
      return { error: CommonMessages.UNAUTHORIZED_ERROR };

    const sheets = google.sheets({ version: "v4", auth });
    
    // Get the list of sheets
    const { data } = await sheets.spreadsheets.get({ spreadsheetId });
    const sourceSheet = data.sheets.find(sheet => sheet.properties.title === sourceSheetName);
    const existingSheet = data.sheets.find(sheet => sheet.properties.title === newSheetName);
    
    if (!sourceSheet) {
      throw new Error(`Source sheet '${sourceSheetName}' not found.`);
    }
    
    // Delete existing sheet if it exists
    if (existingSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteSheet: {
                sheetId: existingSheet.properties.sheetId,
              },
            },
          ],
        },
      });
    }

    const statsSheetIndex = data.sheets.findIndex(sheet => sheet.properties.title === sourceSheetName);
    const insertSheetIndex = statsSheetIndex + 1;
    
    // Duplicate the sheet
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            duplicateSheet: {
              sourceSheetId: sourceSheet.properties.sheetId,
              newSheetName,
              insertSheetIndex
            },
          },
        ],
      },
    });

    return response.data;
  } catch (error) {
    return { error: error.message };
  }
}

export const removeFormulasAndKeepValues = async (spreadsheetId, sheetName) => {
  try {
      const sheets = google.sheets({ version: "v4", auth });

      const range = `${sheetName}!A1:Z`;

      const response = await sheets.spreadsheets.values.get({
          auth,
          spreadsheetId,
          range,
          valueRenderOption: 'UNFORMATTED_VALUE', // Fetches actual values, ignoring formulas
      });

      const data = response.data.values || [];

      await sheets.spreadsheets.values.update({
          auth,
          spreadsheetId,
          range,
          valueInputOption: 'RAW', // Writes values only, removing formulas
          requestBody: { values: data },
      });

      return { success: true };
  } catch (error) {
      return { success: false, error: error.message };
  }
};
