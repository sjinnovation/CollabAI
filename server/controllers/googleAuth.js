import { OAuth2Client } from 'google-auth-library';
import { StatusCodes } from 'http-status-codes';
import { google } from 'googleapis';
import fs from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createOrUpdateAppAuthService, deleteAppAuthCredentialService, getGoogleAuthCredentialService, isTokenValid, setAccessToken, setClientCredentials } from '../service/googleAuthService.js';
import { CommonMessages,GoogleDriveMessages, KnowledgeBaseMessages, WorkBoardMessages } from '../constants/enums.js';
import { extractAllGoogleDriveLinks, extractFileOrFolderId } from '../utils/googleDriveHelperFunctions.js';
import { extractText } from './preprocessOfRAG.js';
import mime from 'mime';
import mimeTypes from 'mime-types';
import { createSingleKnowledgeBaseService, deleteFileIdsFromKnowledgeBaseAssistant, replaceCharacters, updateFileIdsInKnowledgeBaseAssistant, updateKnowledgeBaseFile } from '../service/knowledgeBase.js';
import { ensureDirectoryExistence, uploadToS3Bucket } from '../lib/s3.js';
import { request } from 'express';
import { getOpenAIInstance } from '../config/openAI.js';
import { deleteUseCaseData, getSignleWorkboardSyncInfo, getUserBasedWorkBoardActivityService, upsertWorkBoardSyncData } from '../service/workBoardService.js';
import { deleteFilesVectorStore, getAssistantByIdOrAssistantIdService, updateAssistantFileIds } from '../service/assistantService.js';
import { deleteAssistantFileByID, doesAssistantExist, retrieveAssistantFromOpenAI } from '../lib/openai.js';
import { deleteLocalFile, uploadFiles } from '../utils/assistant.js';
import { uploadFilesToVectorStore } from '../lib/vectorStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const client = new OAuth2Client(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

let drive;
drive = google.drive({
  version: 'v3',
  auth: client,
});
export const getAccessToken = async (code) => {
  try {
    const { tokens } = await client.getToken(code);
    return { accessToken: tokens.access_token, refreshToken: tokens.refresh_token };
  } catch (error) {
    console.error("Error getting access token:", error);
    throw new Error("Failed to exchange code for access token");
  }
};

/**
 * @async
 * @function googleAuth
 * @description Authenticates user with Google using OAuth code, obtains access and refresh tokens,
 *              saves or updates the authentication info for the user.
 * @param {Object} req - Request object with body containing:
 *   - userId {string} - MongoDB ObjectId of the user.
 *   - code {string} - OAuth authorization code from Google.
 * @param {Object} res - Response object, returns status and JSON message.
 * @returns {Response}
 *  - 200: Returns access token on successful authentication.
 *  - 400: Missing userId or code in the request body.
 *  - 500: Internal server error during authentication process.
 */

export const googleAuth = async (req, res) => {
  const { userId, code } = req.body;
  if (!code || !userId) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: GoogleDriveMessages.AUTH_CODE_IS_REQUIRED });
  }

  try {
    const { accessToken, refreshToken } = await getAccessToken(code);
    setClientCredentials(client, "access_token", accessToken);
    const appName="google-drive";
    const createGoogleAuth = await createOrUpdateAppAuthService(userId, code, accessToken, refreshToken,appName);
    drive = google.drive({
      version: 'v3',
      auth: client,
    });

    return res.status(StatusCodes.OK).json({ accessToken });
  } catch (error) {
    console.error("Error in Google auth:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: GoogleDriveMessages.AUTHENTICATION_FAILED });
  }
};

const baseDir = join(__dirname, './../docs/googleDrive');

if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir, { recursive: true });
}

export const allMimeTypeToExtension = {
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.oasis.opendocument.text': '.odt',
  'application/rtf': '.rtf',
  'application/pdf': '.pdf',
  'application/vnd.google-apps.document': '.docx',
  'text/plain': '.txt',
  'application/zip': '.zip',
  'application/epub+zip': '.epub',
  'text/markdown': '.md',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'application/vnd.google-apps.spreadsheet': '.xlsx',
  'application/x-vnd.oasis.opendocument.spreadsheet': '.ods',
  'application/zip': '.zip',
  'text/csv': '.csv',
  'text/tab-separated-values': '.tsv',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
  'application/vnd.google-apps.presentation': '.pptx',
  'application/vnd.oasis.opendocument.presentation': '.odp',
  'text/plain': '.txt',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'application/vnd.google-apps.script+json': '.json',
  'application/vnd.google-apps.vid': '.mp4'
};
let fileNameList = [];

const GOOGLE_MIME_TO_EXTENSION = {
  'application/vnd.google-apps.document': {
    primary: { mime: 'application/pdf', ext: '.pdf' },
    fallback: { mime: 'text/plain', ext: '.txt' }
  },
  'application/vnd.google-apps.spreadsheet': {
    primary: { mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' },
    fallback: { mime: 'text/csv', ext: '.csv' }
  },
  'application/vnd.google-apps.presentation': {
    primary: { mime: 'application/pdf', ext: '.pdf' }
  }
};

export const downloadFile = async (fileId, fileName, mimeType, directory = null) => {
  try {
    const downloadedDirectory = directory || baseDir;

    // Handle file extension for the output file
    let outputFileName = fileName;
    let exportMimeType;
    let fallbackMimeType;

    if (mimeType.startsWith('application/vnd.google-apps')) {
      // For Google Workspace files, use the appropriate extension based on export format
      const formats = GOOGLE_MIME_TO_EXTENSION[mimeType];
      if (formats) {
        const baseName = fileName.replace(/\.[^/.]+$/, ''); // Remove any existing extension
        exportMimeType = formats.primary.mime;
        outputFileName = `${baseName}${formats.primary.ext}`;
        
        if (formats.fallback) {
          fallbackMimeType = formats.fallback.mime;
        }
      }
    } else {
      // For regular files, keep original extension or determine from mime type
      const ext = mime.getExtension(mimeType);
      if (ext && !fileName.endsWith(`.${ext}`)) {
        outputFileName = `${fileName}.${ext}`;
      }
    }

    const filePath = join(downloadedDirectory, outputFileName);

    // Ensure directory exists
    if (!fs.existsSync(downloadedDirectory)) {
      fs.mkdirSync(downloadedDirectory, { recursive: true });
    }

    // Handle Google Workspace files
    if (mimeType.startsWith('application/vnd.google-apps')) {
      try {
        // Try primary export format
        const res = await drive.files.export(
          { fileId, mimeType: exportMimeType },
          { responseType: 'stream' }
        );

        await new Promise((resolve, reject) => {
          const dest = fs.createWriteStream(filePath);
          res.data
            .on('end', resolve)
            .on('error', reject)
            .pipe(dest);
        });
      } catch (exportError) {
        // If primary export fails and we have a fallback format, try that
        if (fallbackMimeType && exportError.response?.status === 403) {
          console.log(`Falling back to ${fallbackMimeType} for file: ${fileName}`);
          const baseName = outputFileName.replace(/\.[^/.]+$/, '');
          const fallbackExt = GOOGLE_MIME_TO_EXTENSION[mimeType].fallback.ext;
          outputFileName = `${baseName}${fallbackExt}`;
          const fallbackPath = join(downloadedDirectory, outputFileName);

          const fallbackRes = await drive.files.export(
            { fileId, mimeType: fallbackMimeType },
            { responseType: 'stream' }
          );

          await new Promise((resolve, reject) => {
            const dest = fs.createWriteStream(fallbackPath);
            fallbackRes.data
              .on('end', resolve)
              .on('error', reject)
              .pipe(dest);
          });
          return fallbackPath;
        } else {
          throw exportError;
        }
      }
    } else {
      // For regular files, use chunked download
      const fileMetadata = await drive.files.get({
        fileId,
        fields: 'size'
      });
      const fileSize = parseInt(fileMetadata.data.size, 10);
      const chunkSize = 5 * 1024 * 1024; // 5MB chunks
      const dest = fs.createWriteStream(filePath);

      for (let start = 0; start < fileSize; start += chunkSize) {
        const end = Math.min(start + chunkSize - 1, fileSize - 1);
        const range = `bytes=${start}-${end}`;

        const res = await drive.files.get(
          { fileId, alt: 'media' },
          { 
            headers: { Range: range },
            responseType: 'stream'
          }
        );

        await new Promise((resolve, reject) => {
          res.data
            .on('end', resolve)
            .on('error', reject)
            .pipe(dest, { end: false });
        });
      }
      dest.end();
    }

    return filePath;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};
export const listFilesInFolder = async (folderId, directory) => {

  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name, mimeType)',
    });

    const files = res.data.files;
    if (files.length) {
      files.forEach(async (file) => {
        await downloadFile(file.id, file.name, file.mimeType, directory);
      });
    }
    return
  } catch (err) {
    console.error('Error listing files in folder:', err.message);
  }
}


const listAndDownloadFiles = async () => {
  const res = await drive.files.list({
    pageSize: 100, 
    fields: 'files(id, name, mimeType)',
  });

  const files = res.data.files;
  if (files.length) {
    for (const file of files) {
      await downloadFile(file.id, file.name, file.mimeType);
    }
  } else {
    console.log('No files found.');
  }
};


// Function to list files from 'My Drive'
const listMyDriveFiles = async () => {
  try {
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
      q: "'me' in owners", // Query for 'My Drive' files owned by the user
    });

    const files = res.data.files;
    const directory = './docs/googleDrive/MyDrive';

    if (files.length) {
      files.forEach(async (file) => {
        await downloadFile(file.id, file.name, file.mimeType, directory);
      });
    } else {
      console.log('No files found in My Drive.');
    }
  } catch (err) {
    console.error('Error listing My Drive files:', err.message);
  }
}

// Function to list 'Shared with Me' files
const listSharedWithMeFiles = async () => {
  try {
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
      q: "sharedWithMe and not 'me' in owners", // Query for files shared with the user
    });

    const files = res.data.files;
    const directory = './docs/googleDrive/SharedWithMe';

    if (files.length) {
      files.forEach(async (file) => {
        await downloadFile(file.id, file.name, file.mimeType, directory);

      });
    } else {
      console.log('No files found in Shared with Me.');
    }
  } catch (err) {
    console.error('Error listing Shared with Me files:', err.message);
  }
}



const listOtherFiles = async () => {
  try {
    const res = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType)',
      q: "not 'me' in owners and not sharedWithMe",
    });

    const files = res.data.files;
    const directory = './docs/googleDrive/OtherFiles';

    if (files.length) {
      files.forEach(async (file) => {
        await downloadFile(file.id, file.name, file.mimeType, directory);

      });
    }
  } catch (err) {
    console.error('Error listing other files:', err.message);
  }
}
// Main function to download files from both 'My Drive' and 'Shared with Me'
export const downloadDriveFiles = async () => {
  // Create separate directories for 'My Drive' and 'Shared with Me'
  const myDriveDir = path.join(__dirname, './googleDrive/MyDrive');
  const sharedWithMeDir = path.join(__dirname, './googleDrive/SharedWithMe');
  const otherFilesDir = path.join(__dirname, './googleDrive/OtherFiles');

  if (!fs.existsSync(myDriveDir)) {
    fs.mkdirSync(myDriveDir, { recursive: true });
  }
  if (!fs.existsSync(sharedWithMeDir)) {
    fs.mkdirSync(sharedWithMeDir, { recursive: true });
  }
  if (!fs.existsSync(otherFilesDir)) {
    fs.mkdirSync(otherFilesDir, { recursive: true });
  }
  // Download from 'My Drive'
  await listMyDriveFiles(myDriveDir);
  // Download from 'Shared with Me'
  await listSharedWithMeFiles(sharedWithMeDir);
  // Download Other type of files if there are any
  await listOtherFiles(otherFilesDir);
}

export const downloadAllGoogleDriveFiles = async (req, res) => {
  const { userId } = req.params;
  try {
    const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);
    if (credentialsOfGoogleAuth) {
      await setAccessToken(client, credentialsOfGoogleAuth?.refreshToken);
      await downloadDriveFiles();
    }
    const allDownloadedFileList = fileNameList;
    fileNameList = [];

    return res.status(StatusCodes.OK).json({ success: true, message:GoogleDriveMessages.GOOGLE_DRIVE_SYNCED_SUCCESSFULLY, data: credentialsOfGoogleAuth, allDownloadedFileList });
  } catch (err) {
    console.error('Error listing other files:', err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ Error: err, message: GoogleDriveMessages.GOOGLE_DRIVE_SYNC_FAILED, success: false, });

  }
}

/**
 * @async
 * @function getGoogleAuthCredentials
 * @description Retrieves Google OAuth credentials for a user and refreshes the access token.
 * @param {Object} req - Request object with params containing:
 *   - userId {string} - User's MongoDB ObjectId.
 * @param {Object} res - Response object returning credentials and new access token.
 * @returns {Response} 200 with credentials and token on success, 500 on error.
 */

export const getGoogleAuthCredentials = async (req, res) => {
  const { userId } = req.params;
  try {
    const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);
    let newAccessToken = credentialsOfGoogleAuth?.accessToken;
    if (credentialsOfGoogleAuth) {
      newAccessToken = await setAccessToken(client, credentialsOfGoogleAuth?.refreshToken);
    }
    fileNameList = [];
    return res.status(StatusCodes.OK).json({ success: true, message: GoogleDriveMessages.GOOGLE_DRIVE_CREDENTIALS_FETCHED_SUCCESSFULLY, data: credentialsOfGoogleAuth ,newAccessToken:newAccessToken?.access_token});
  } catch (err) {
    console.error('Error listing other files:', err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ Error: err, message: CommonMessages.INTERNAL_SERVER_ERROR, success: false, });

  }
}

/**
 * @async
 * @function deleteGoogleAuthCredentials
 * @description Deletes Google OAuth credentials for a given user.
 * @param {Object} req - Request object with params containing:
 *   - userId {string} - User's MongoDB ObjectId.
 * @param {Object} res - Response object returning deletion status.
 * @returns {Response} 200 on successful deletion, 500 on error.
 */

export const deleteGoogleAuthCredentials = async (req, res) => {
  const { userId } = req.params;
  try {
    const credentialsOfGoogleAuth = await deleteAppAuthCredentialService(userId);
    fileNameList = [];
    return res.status(StatusCodes.OK).json({ success: true, message: GoogleDriveMessages.GOOGLE_DRIVE_CREDENTIALS_DELETED_SUCCESSFULLY, data: credentialsOfGoogleAuth });
  } catch (err) {
    console.error('Error listing other files:', err.message);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ Error: err, message: CommonMessages.INTERNAL_SERVER_ERROR, success: false, });

  }
}

export const getFileMetadata = async (fileId, userId) => {
  try {
    let fileName = '';
    let mimeType = '';
    let fileSize = 0;
    const appName="google-drive";
    const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId,appName);
    if (credentialsOfGoogleAuth) {
      await setAccessToken(client, credentialsOfGoogleAuth?.refreshToken);
      const res = await drive.files.get({
        fileId: fileId,
        fields: 'id, name, mimeType, size, permissions, owners',
      });

      fileName = res.data.name;
      mimeType = res.data.mimeType;
      fileSize = parseInt(res.data.size, 10);
    }


    return { fileName, mimeType, fileSize };
  } catch (error) {
    console.error('Error retrieving file metadata:', error);
    throw error;
  }
}

// Asynchronous recursive deletion of a directory
const deleteDirectoryRecursive = async (directoryPath) => {
  if (fs.existsSync(directoryPath)) {
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
      const currentPath = path.join(directoryPath, file);
      const stats = await fs.promises.lstat(currentPath);
      
      if (stats.isDirectory()) {
        // Recursively delete subdirectory
        await deleteDirectoryRecursive(currentPath);
      } else {
        // Delete file
        await fs.promises.unlink(currentPath);
      }
    }
    // Remove the directory itself after all files are deleted
    await fs.promises.rmdir(directoryPath);
  }
};
export const downloadFilesFromGoogleDriveLink = async (googleDriveFileLink, userId) => {
  const fileIds = googleDriveFileLink.map(link => extractFileOrFolderId(link));
  const fileDataContext = [];
  const baseDir = join(__dirname, 'googleDrive');
  try {
    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseDir)) {
      fs.mkdirSync(baseDir, { recursive: true });
    }
    const downloadPromises = fileIds.map(async id => {
      const { fileName, mimeType, fileSize } = await getFileMetadata(id, userId);

      let downloadDirectory = '';
      // Download file and extract text
      if (fileSize > 5000000) {
        downloadDirectory = await downloadLargeFile(id, fileName, mimeType, baseDir);
      } else {
        downloadDirectory = await downloadFile(id, fileName, mimeType, baseDir);
      }
      const fileData = await extractText(downloadDirectory);
      return fileData;
    });
    const fileDataResults = await Promise.all(downloadPromises);

    fileDataResults.forEach(fileData => fileDataContext.push(fileData));
    return fileDataContext;

  } catch (error) {
    console.error("Error in downloading files:", error);
    throw error; // Re-throw the error for handling
  } finally {
    // Delete all files and the googleDrive directory asynchronously
    if (fs.existsSync(baseDir)) {
      try {
        await deleteDirectoryRecursive(baseDir);
      } catch (err) {
        console.error(`Error deleting directory ${baseDir}:`, err.message);
      }
    }
  }
};

export const getGoogleDocContent = async (fileId, userId) => {

  const { fileName, mimeType, fileSize } = await getFileMetadata(fileId, userId);
  const res = await drive.files.export({
    fileId: fileId,
    mimeType: mimeType
  }, { responseType: 'arraybuffer' });

  return res.data;
}

export const downloadGoogleFile = async (fileId, userId) => {
  try {
    const { fileName, mimeType, fileSize } = await getFileMetadata(fileId, userId);

    let url;
    if (mimeType.startsWith('application/vnd.google-apps')) {
      // Handle Google Docs, Sheets, and Slides files by exporting them to supported formats
      const exportMimeType = allMimeTypeToExtension[mimeType]; // Define this based on file type
      url = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportMimeType}`;
    } else {
      // For binary files (non-Google files), use 'files.get' with 'alt=media'
      url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    }
    const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);


    const res = await client.request({
      url,
      method: 'GET',
      responseType: 'arraybuffer', // This works for binary data
      headers: {
        Authorization: `Bearer ${credentialsOfGoogleAuth.accessToken}`,
      },
    });

    // Handle the downloaded data, like saving it as a file
    return res.data;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
}

export const downloadLargeFile = async (fileId, fileName, mimeType, directory = null) => {
  const sanitizedFileName = fileName.replace(/[/\\?%*:|"<>]/g, '_'); // Replace invalid characters
  const fileExtension = allMimeTypeToExtension[mimeType] || ''; // Default to an appropriate extension based on MIME type
  const fileBaseName = sanitizedFileName + fileExtension;

  // Define the full path for the file to be saved
  const dirPath = join(directory || '', sanitizedFileName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = join(dirPath, fileBaseName);
  const dest = fs.createWriteStream(filePath);
  const chunkSize = 1024 * 1024; // 2 MB chunk size
  let start = 0;

  try {
    // Get file metadata to check size and MIME type
    const fileMetadata = await drive.files.get({ fileId, fields: 'size, mimeType' });
    const fileSize = parseInt(fileMetadata.data.size, 10);

    // If the file is a Google Docs Editors file (Google Docs, Sheets, Slides)
    if (fileMetadata.data.mimeType.startsWith('application/vnd.google-apps')) {
      const exportMimeType = allMimeTypeToExtension[fileMetadata.data.mimeType];

      try {
        // Export the file as a specific format (e.g., PDF, XLSX)
        while (start < fileSize) {
          const res = await drive.files.export(
            { fileId, mimeType: exportMimeType },
            { responseType: 'stream' }
          );

          res.data.pipe(dest, { end: false });

          await new Promise((resolve, reject) => {
            res.data.on('end', () => {
              start += chunkSize;
              resolve();
            });
            res.data.on('error', (err) => {
              console.error('Error during export download:', err);
              reject(err);
            });
          });
        }
      } catch (err) {
        if (err.code === 403 && err.message.includes("too large to be exported")) {
          console.log("File too large to export, falling back to direct download.");
        } else {
          throw err;
        }
      }
    }

    let end;
    while (start < fileSize) {
      end = Math.min(start + chunkSize - 1, fileSize - 1); // Calculate the end byte
      const headers = { Range: `bytes=${start}-${end}` }; // Set the Range header

      const res = await drive.files.get(
        { fileId, alt: 'media' },
        { headers, responseType: 'stream' }
      );

      res.data.pipe(dest, { end: false });

      // Wait for the stream to finish before requesting the next chunk
      await new Promise((resolve) => {
        res.data.on('end', resolve);
      });

      start += chunkSize;
    }

  } catch (err) {
    console.error('Error downloading file:', err.message);
    return;
  }

  dest.end();
  return filePath;
};

/**
 * @async
 * @function googleDriveInfoToKnowledgeBase
 * @description Processes Google Drive files info, fetches metadata, replaces characters in filenames,
 *              constructs S3 links, saves file info to knowledge base for a user.
 * @param {Object} req - Request object with body containing:
 *   - userId {string} - MongoDB ObjectId of the user.
 *   - fileDetails {Array} - Array of file objects with fileId, name, url, parentId.
 * @param {Object} res - Response object, returns status and JSON message.
 * @returns {Response}
 *  - 200: Successfully added files to knowledge base.
 *  - 400: Missing or empty fileDetails array.
 *  - 403: Missing Google Drive auth credentials for the user.
 *  - 500: Internal error during file processing.
 */
export const googleDriveInfoToKnowledgeBase = async (req, res) => {
  const { userId, fileDetails } = req.body;
  if (!fileDetails || fileDetails.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: GoogleDriveMessages.NO_FILE_IS_SENT });
  }

  const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);
  if (credentialsOfGoogleAuth) {
    await setAccessToken(client, credentialsOfGoogleAuth?.refreshToken);
  } else {
    return res.status(StatusCodes.FORBIDDEN).json({ message: GoogleDriveMessages.CONNECT_GOOGLE_DRIVE });
  }

  try {
    const createFileInfoToKnowledgeBase = await Promise.all(fileDetails.map(async (file) => {
      const { fileName, mimeType, fileSize } = await getFileMetadata(file.fileId, userId);
      let { resultFileName, replacedIndices } = replaceCharacters(file.name);
      const fileExtension = allMimeTypeToExtension[mimeType] || '';
      const lastDotIndex = resultFileName.lastIndexOf('.');
      let namePart = resultFileName;
      let extensionPart = '';

      if (lastDotIndex > 0 && lastDotIndex !== resultFileName.length - 1) {
        namePart = resultFileName.substring(0, lastDotIndex);
        extensionPart = resultFileName.substring(lastDotIndex);
      }
      let fileBaseName = resultFileName;

      if (extensionPart === '') {
        fileBaseName = resultFileName + fileExtension;

      }

      const s3_link = "knowledgeBase/" + userId + "/" + fileBaseName;
      const data = await createSingleKnowledgeBaseService(fileBaseName, fileSize, s3_link, userId, replacedIndices, file?.url,file?.parentId);
      return { fileId: file.fileId, data };
    }));

    return res.status(StatusCodes.OK).json({ data: createFileInfoToKnowledgeBase, message: KnowledgeBaseMessages.FILE_ADDED_SUCCESSFULLY });

  } catch (error) {
    console.error("Error in file processing:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: GoogleDriveMessages.FILE_COULD_NOT_DOWNLOAD });
  }
};

export const deleteFilesInDirectory = (directoryPath) => {
  fs.readdir(directoryPath, (err, files) => {
      if (err) {
          console.error('Error reading directory:', err);
          return;
      }

      // Iterate over all files and delete them
      files.forEach((file) => {
          const filePath = path.join(directoryPath, file);
          fs.unlink(filePath, (err) => {
              if (err) {
                  console.error(`Error deleting file ${file}:`, err);
              } else {
                  console.log(`Successfully deleted ${file}`);
              }
          });
      });
  });
};

/**
 * @async
 * @function syncGoogleDriveKnowledgeBase
 * @description Syncs Google Drive files with assistant knowledge base by updating or replacing files
 *              across OpenAI, vector stores, and knowledge base records.
 * @param {Object} req - Request body with userId and fileId.
 * @param {Object} res - Response with status and message.
 * @returns {Response} 200 on success, 403 if Google Drive not connected, 500 on error.
 */

export const syncGoogleDriveKnowledgeBase = async (req, res) => {
  const { userId,fileId } = req.body;
  const openai = await getOpenAIInstance();

  try {
    const isGoogleDriveSyncInfoExist = await getSignleWorkboardSyncInfo(fileId);
    if (isGoogleDriveSyncInfoExist) {
      const useCaseArray = isGoogleDriveSyncInfoExist?.useCaseData;
      for (const useCase of useCaseArray) {
        const assistantSettings = await getAssistantByIdOrAssistantIdService(useCase?.assistantId);
        const isExistingOpenAIAssistant = await doesAssistantExist(openai, assistantSettings?.assistant_id);

        const assistantInfoFromOpenAI = isExistingOpenAIAssistant ? await retrieveAssistantFromOpenAI(openai, assistantSettings?.assistant_id) : null;
        const fileIds = isExistingOpenAIAssistant ? assistantSettings?.file_ids : [];
        if (fileIds.includes(useCase?.opeanaiFileId)) {
          let newFileIds = fileIds.filter(id => id !== useCase?.opeanaiFileId);
          const updateFileIds = await updateAssistantFileIds(assistantSettings?.assistant_id, newFileIds);
          if (isExistingOpenAIAssistant) {
            const responseOfFileIdsDelete = await deleteAssistantFileByID(openai, assistantSettings?.assistant_id, useCase?.opeanaiFileId);
            const deletedVectorStoreFile = await deleteFilesVectorStore(
              openai,
              assistantSettings?.vectorStoreId,
              useCase?.opeanaiFileId
            );
            const deleteFromSyncTable = await deleteUseCaseData(fileId, assistantSettings?._id);
            const fileInfo = {
              file_id: useCase?.opeanaiFileId,
              key: fileId

            };
            const deleteFromKnowledgeBaseAssistant = await deleteFileIdsFromKnowledgeBaseAssistant(assistantSettings?.assistant_id, fileInfo);
          }
          const assistantInformation = [];
          let ids = []
          const links = extractAllGoogleDriveLinks(isGoogleDriveSyncInfoExist?.knowledgeBaseId?.url,ids);

          if (ids?.length > 0) {
            const baseDir = join(__dirname, './../docs/googleDrive');
            if (!fs.existsSync(baseDir)) {
              fs.mkdirSync(baseDir, { recursive: true });
            }
            const credentialsOfGoogleAuth = await getGoogleAuthCredentialService(userId);
            if (credentialsOfGoogleAuth) {
              const newTokens = await setAccessToken(client, credentialsOfGoogleAuth?.refreshToken);
            }else{
              return res.status(StatusCodes.FORBIDDEN).json({ message: GoogleDriveMessages.CONNECT_GOOGLE_DRIVE });
            }
          
            const { fileName, mimeType, fileSize } = await getFileMetadata(ids[0], userId);
            const fileDirectory = await downloadFile(ids[0], fileName, mimeType, baseDir);

            let { resultFileName, replacedIndices } = replaceCharacters(fileName);
            resultFileName =  resultFileName.replace(/[\/\\*|"?]/g, ' ');
            const fileExtension = allMimeTypeToExtension[mimeType] || ''; 
            const lastDotIndex = resultFileName.lastIndexOf('.');
            let namePart = resultFileName;
            let extensionPart = '';
        
            if (lastDotIndex > 0 && lastDotIndex !== resultFileName.length - 1) {
              namePart = resultFileName.substring(0, lastDotIndex);
              extensionPart = resultFileName.substring(lastDotIndex); 
            }
            let fileBaseName = resultFileName;
      
            fileBaseName = resultFileName + fileExtension;
            // Create knowledge base entry
            const updatedKnowledgeBaseBody = {
              name : fileBaseName,
              size : fileSize ,
              spaceIndex : replacedIndices,
            }
            const updateKnowledgeBase = await updateKnowledgeBaseFile(fileId,updatedKnowledgeBaseBody);
            let fileSizeInBytes = 0;
            let encodingInfo = 'N/A';
            let files =[];

            const fileObject = {
              fieldname: 'files',
              originalname: isGoogleDriveSyncInfoExist?.knowledgeBaseId?.name,
              encoding: encodingInfo,
              mimetype: mime.getType(isGoogleDriveSyncInfoExist?.knowledgeBaseId?.name),
              destination: '../docs/googleDrive/',
              filename: isGoogleDriveSyncInfoExist?.knowledgeBaseId?.name,
              path: fileDirectory,
              size: fileSizeInBytes,
              key: isGoogleDriveSyncInfoExist?.knowledgeBaseId?._id
            };
            files.push(fileObject);
            if (files) {
              const assistantInformation = [];
              const newFileIdsFromOpenai = await uploadFiles(openai, files, assistantInformation);
              const uploadedFilesToVectorStore = await uploadFilesToVectorStore(openai, assistantSettings?.vectorStoreId, newFileIdsFromOpenai);

              const fileIds = [...newFileIds, ...newFileIdsFromOpenai];
              Promise.all(files.map(deleteLocalFile)).then(() => console.log('All files deleted')).catch(err => console.error('Failed to delete some files:', err));
              const updateFileIdsOfAssistant = await updateAssistantFileIds(assistantSettings?.assistant_id, fileIds);
              const newUseCaseData = {
                opeanaiFileId: newFileIdsFromOpenai[0],
                assistantId: useCase?.assistantId,
                userId: useCase?.userId
              }
              const updateWorkBoarSyncUseCase = await upsertWorkBoardSyncData(fileId, newUseCaseData);
              const assistantNewFileInfo = {
                file_id: newFileIdsFromOpenai[0],
                key: fileId

              };
              const updateFileIdsInKBAssistant = await updateFileIdsInKnowledgeBaseAssistant(assistantSettings?.assistant_id, assistantNewFileInfo);
            }

          }

        }

      }

    }
    return res.status(StatusCodes.OK).json({ message: GoogleDriveMessages.GOOGLE_DRIVE_SYNCED_SUCCESSFULLY, success: true });

  } catch (error) {
    console.error(error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: GoogleDriveMessages.GOOGLE_DRIVE_SYNC_FAILED,
      success: false 
    });
  }
};