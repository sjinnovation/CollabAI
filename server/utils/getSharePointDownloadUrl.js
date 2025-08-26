import axios from 'axios';
import mime from 'mime';

function getSharePointDownloadUrl(sharePointUrl) {
  const encodedUrl = Buffer.from(sharePointUrl)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `https://graph.microsoft.com/v1.0/shares/u!${encodedUrl}/driveItem/content`;
}

export const downloadSharePointFile = async (sharePointUrl, accessToken)  => {
  const sharesUrl = getSharePointDownloadUrl(sharePointUrl);

  const response = await axios({
    method: 'GET',
    url: sharesUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/octet-stream'
    },
    responseType: 'stream',
    maxRedirects: 5,
    validateStatus: status => status < 500
  });

  return response;
}

export function encodeGraphShareUrl(url) {
  return Buffer.from(url)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export const getOneDriveFileMetadata = async (fileUrl, accessToken)  => {
  try {
    const encodedUrl = encodeGraphShareUrl(fileUrl);

    const sharesUrl = `https://graph.microsoft.com/v1.0/shares/u!${encodedUrl}/driveItem`;

    const response = await axios.get(sharesUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

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
}