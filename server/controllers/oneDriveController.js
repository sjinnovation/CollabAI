import { createSingleKnowledgeBaseService, replaceCharacters } from '../service/knowledgeBase.js';
import { allMimeTypeToExtension } from './googleAuth.js';
import fs from 'fs';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import { getServiceIdBySlug, getUserServiceCredentials } from '../service/integration/serviceIntegration.js';
import { SharePointMessages } from '../constants/enums.js';
import { downloadSharePointFile } from '../utils/getSharePointDownloadUrl.js';
import { downloadSharePointFileApi, getOneDriveFileMetadataApi, getOneDriveFileApi, getGraphApiEndpoints } from '../utils/onedriveApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const downloadFileFromSharePoint = async (sharePointUrl, fileName, owner, accessToken = null, mimeType = null) => {
  try {
    if (!accessToken) {
      const serviceConfig = await getServiceIdBySlug('onedrive');
      if (!serviceConfig) {
        throw new Error(SharePointMessages.SERVICE_CONFIG_NOT_FOUND);
      }
      const serviceCredentials = await getUserServiceCredentials(owner.toString(), serviceConfig._id);
      if (!serviceCredentials) {
        throw new Error(SharePointMessages.USER_NOT_CONNECTED);
      }
      if (!serviceCredentials.credentials?.authFields?.access_token) {
        throw new Error(SharePointMessages.ACCESS_TOKEN_MISSING);
      }

      const expirationTime = serviceCredentials.credentials.authFields.expiration_time;
      const currentTime = Math.floor(Date.now() / 1000);
      if (expirationTime && currentTime >= expirationTime) {
        throw new Error(SharePointMessages.ACCESS_TOKEN_EXPIRED);
      }
      accessToken = serviceCredentials.credentials.authFields.access_token;
    }

    try {
      const response = await downloadSharePointFile(sharePointUrl, accessToken);

      if (response.status === 200) {
        return await saveStreamToFile(response, fileName);
      } else {
        throw new Error(`Failed with status ${response.status}`);
      }
    } catch (sharesError) {
      console.error('SharePoint Shares API failed, trying direct path method:', sharesError.message);
    }

    const urlParts = new URL(sharePointUrl);
    const pathParts = urlParts.pathname.split('/');
    const siteIndex = pathParts.indexOf('personal');
    const userPart = pathParts[siteIndex + 1];

    const parts = userPart.split('_');
    let userEmail;

    if (parts.length >= 4 && parts[parts.length - 2] === 'onmicrosoft' && parts[parts.length - 1] === 'com') {
      const domain = parts.slice(2, -2).join('.');
      const username = parts.slice(0, 2).join('.');
      userEmail = `${username}@${domain}.onmicrosoft.com`;
    } else {
      userEmail = userPart.replace(/_/g, '.').replace('.onmicrosoft.com', '@infosjinnovation.onmicrosoft.com');
    }
    const documentsIndex = pathParts.indexOf('Documents');
    if (documentsIndex === -1) {
      throw new Error('Invalid SharePoint URL format - Documents folder not found');
    }

    const relativePath = pathParts.slice(documentsIndex).join('/');

    const apiEndpoints = getGraphApiEndpoints(userEmail, relativePath);

    let lastError;
    for (const graphUrl of apiEndpoints) {
      try {
        const response = await downloadSharePointFileApi(graphUrl, accessToken);

        if (response.status === 200) {
          return await saveStreamToFile(response, fileName);
        }
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('All download methods failed');

  } catch (error) {
    if (error.response) {
      if (error.response.status === 401) {
        console.error(SharePointMessages.AUTH_FAILED);
      } else if (error.response.status === 404) {
        console.error(SharePointMessages.FILE_NOT_FOUND);
      } else if (error.response.status === 403) {
        console.error(SharePointMessages.ACCESS_DENIED);
      }
      console.error('[SharePoint] API Error:', error.response.data);
    }
    throw error;
  }
};

async function saveStreamToFile(response, fileName) {
  const directoryPath = path.join(__dirname, '../docs', 'sharepoint');
  const filePath = path.join(directoryPath, fileName);

  fs.mkdirSync(directoryPath, { recursive: true });
  const writer = fs.createWriteStream(filePath);

  let downloadedBytes = 0;
  const startTime = Date.now();

  response.data.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    const totalSize = response.headers['content-length'];
    if (totalSize) {
      const progress = ((downloadedBytes / totalSize) * 100).toFixed(2);
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      const duration = Date.now() - startTime;
      resolve(filePath);
    });
    writer.on('error', (error) => {
      reject(error);
    });
    response.data.on('error', (error) => {
      writer.destroy();
      reject(error);
    });
  });
}

export const getOneDriveAccessToken = async (userId) => {
  try {
    const serviceConfig = await getServiceIdBySlug('onedrive');
    if (!serviceConfig) {
      return null;
    }
    const serviceCredentials = await getUserServiceCredentials(userId, serviceConfig._id);
    if (!serviceCredentials) {
      return null;
    }

    const accessToken = serviceCredentials.credentials?.authFields?.access_token;
    const expirationTime = serviceCredentials.credentials?.authFields?.expiration_time;

    if (!accessToken) {
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (expirationTime && currentTime >= expirationTime) {
      return null;
    }

    return accessToken;
  } catch (error) {
    return null;
  }
};


export const getOneDriveFileMetadata = async (fileUrl, accessToken) => {
  try {
    const response = await getOneDriveFileMetadataApi(fileUrl, accessToken);

    return {
      id: response.data.id,
      name: response.data.name,
      size: response.data.size,
      mimeType: response.data.file?.mimeType || mime.getType(response.data.name),
      downloadUrl: response.data['@microsoft.graph.downloadUrl']
    };
  } catch (error) {
    console.error('[OneDrive] Metadata fetch error:', error.response?.data || error.message);
    throw new Error(`Failed to fetch file metadata from OneDrive: ${error.message}`);
  }
};

export const oneDriveInfoToKnowledgeBase = async (req, res) => {
  const { userId, fileDetails, token } = req.body;

  if (!fileDetails || fileDetails.length === 0) {
    console.warn(`[WARN] No files received in request body.`);
    return res.status(400).json({ message: "No file is sent" });
  }

  try {
    const createFileInfoToKnowledgeBase = await Promise.all(fileDetails.map(async (file, index) => {
      const { name: fileName, mimeType, size: fileSize } = await getOneDriveFileMetadata(file.url, token);

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

      const s3_link = `knowledgeBase/${userId}/${fileBaseName}`;

      const data = await createSingleKnowledgeBaseService(
        fileBaseName, 
        fileSize, 
        s3_link, 
        userId, 
        replacedIndices, 
        file?.url,
        file?.parentId
      );

      return { fileId: file.fileId, data };
    }));
    return res.status(200).json({
      data: createFileInfoToKnowledgeBase, 
      message: "Files added successfully" 
    });

  } catch (error) {
    console.error(`[ERROR] Error in OneDrive file processing:`, error);
    return res.status(500).json({ message: "Could not process OneDrive files" });
  }
};