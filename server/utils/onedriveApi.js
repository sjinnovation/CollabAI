import axios from 'axios';

const API_ENDPOINTS = {
  ONEDRIVE_METADATA: 'https://graph.microsoft.com/v1.0/me/drive/items',
  SHARES_BASE: 'https://graph.microsoft.com/v1.0/shares/u!',
  DRIVE_ROOT: 'https://graph.microsoft.com/v1.0/users',
  ME_DRIVE_ROOT: 'https://graph.microsoft.com/v1.0/me/drive/root'
};

export const downloadSharePointFileApi = async (url, accessToken) => {
  return axios({
    method: 'GET',
    url,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/octet-stream'
    },
    responseType: 'stream',
    maxRedirects: 5,
    validateStatus: (status) => status < 500
  });
};

export const getOneDriveFileMetadataApi = async (fileUrl, accessToken) => {
  const encodedUrl = Buffer.from(fileUrl).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  const sharesUrl = `${API_ENDPOINTS.SHARES_BASE}${encodedUrl}/driveItem`;

  return axios.get(sharesUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
};

export const getOneDriveFileApi = async (fileId, accessToken) => {
  const metadataUrl = `${API_ENDPOINTS.ONEDRIVE_METADATA}/${fileId}`;
  
  return axios.get(metadataUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
};

export const getGraphApiEndpoints = (userEmail, relativePath) => {
  return [
    `${API_ENDPOINTS.DRIVE_ROOT}/${userEmail}/drive/root:/${relativePath}:/content`,
    `${API_ENDPOINTS.ME_DRIVE_ROOT}:/${relativePath}:/content`
  ];
};

export const downloadSharePointFile = async (siteId, driveId, fileId, accessToken) => {
  try {
    const metadataResponse = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const downloadUrl = metadataResponse.data['@microsoft.graph.downloadUrl'];
    const fileResponse = await axios.get(downloadUrl, {
      responseType: 'arraybuffer'
    });

    return {
      data: fileResponse.data,
      mimeType: metadataResponse.data.file?.mimeType,
      fileName: metadataResponse.data.name
    };
  } catch (error) {
    console.error('Error downloading SharePoint file:', error);
    throw new Error('Failed to download file from SharePoint');
  }
};

export const getSharePointFileMetadata = async (siteId, driveId, fileId, accessToken) => {
  try {
    const response = await axios.get(
      `https://graph.microsoft.com/v1.0/sites/${siteId}/drives/${driveId}/items/${fileId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const fileData = response.data;
    return {
      fileName: fileData.name,
      mimeType: fileData.file?.mimeType || 'application/octet-stream',
      fileSize: fileData.size,
      downloadUrl: fileData['@microsoft.graph.downloadUrl'],
      webUrl: fileData.webUrl
    };
  } catch (error) {
    console.error('Error fetching SharePoint file metadata:', error);
    throw new Error('Failed to fetch file metadata from SharePoint');
  }
};