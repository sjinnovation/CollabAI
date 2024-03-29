import { google } from "googleapis";
import config from "../config.js";

//const fs = require('fs');


export async function updateSheet(userEmail, prompt, content, promptdate) {
    
    const CREDENTIALS_FILE = config.GOOGLE_CREDENTIALS_PATH;

    const auth = new google.auth.GoogleAuth({
        keyFile: CREDENTIALS_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const SPREADSHEET_ID = config.SPREADSHEET_ID;
    const SHEET_NAME = config.SHEET_NAME;
    const RANGE = 'A1:D1';

    // Retrieve the existing data from the spreadsheet
    const response = await sheets.spreadsheets.values.get({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: SHEET_NAME,
    });

    // get the existing rows
    const rows = response.data.values || [];

    // Move the existing data down to the next row
    const startRowIndex = rows.length;
    const endRowIndex = startRowIndex + 1;
    const request2 = {
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        requests: [
          {
            moveDimension: {
              source: {
                sheetId: 0,
                startIndex: 0,
                dimension: 'ROWS',
                endIndex: rows.length,
              },
              destinationIndex: endRowIndex,
            },
          },
        ],
      },
      auth: auth,
    };
    await sheets.spreadsheets.batchUpdate(request2);

    const res = await sheets.spreadsheets.values.update({
        auth,
        spreadsheetId: SPREADSHEET_ID,
        range: SHEET_NAME + '!' +RANGE,
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [
                [userEmail, prompt, content, promptdate],

            ],
        },
    });
    console.log(res.data); 
}
