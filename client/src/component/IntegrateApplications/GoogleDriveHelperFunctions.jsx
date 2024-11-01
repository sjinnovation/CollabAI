import { useEffect } from 'react';
import { gapi } from 'gapi-script';
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

const loadGapi = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        resolve(gapi);
      }).catch(err => {
        reject(err);
      });
    });
  });
};


export const connectGoogleDrive = async () => {
    try {
      await loadGapi();
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance) {
        if (!authInstance.isSignedIn.get()) {
          await authInstance.signIn();
        }
      } else {
        console.error('Auth instance is undefined');
      }
    } catch (error) {
      console.error('Error connecting to Google Drive', error);
    }
  };

export const disconnectGoogleDrive = async () => {
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (authInstance.isSignedIn.get()) {
        await authInstance.signOut();
      }
    } catch (error) {
      console.error('Error disconnecting from Google Drive', error);
    }
  };

  

  // Fetch files from Google Drive
const listFiles = async (query) => {
    try {
      const response = await gapi.client.drive.files.list({
        q: query,
        fields: 'files(id, name, mimeType)',
      });
      return response.result.files;
    } catch (error) {
      console.error('Error fetching files from Google Drive', error);
    }
  };
  
  // Show files from "My Drive"
  export const showMyDriveFiles = async () => {
    try {
      const files = await listFiles("trashed = false");
      return files;
    } catch (error) {
      console.error('Error showing files from My Drive', error);
    }
  };
  
  // Show files from "Shared with Me"
  export const showSharedFiles = async () => {
    try {
      const files = await listFiles("sharedWithMe = true and trashed = false");
      return files;
    } catch (error) {
      console.error('Error showing shared files', error);
    }
  };
// Download file from Google Drive
export const downloadFile = async (fileId) => {
    try {
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media',
      }, { responseType: 'blob' });
      
      // Create a URL for the file
      const url = window.URL.createObjectURL(new Blob([response.body]));
      
      // Create a link element and simulate a click to download
      const link = document.createElement('a');
      link.href = url;
      link.download = response.headers['content-disposition'].split('filename=')[1].replace(/"/g, '');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error('Error downloading file from Google Drive', error);
    }
  };
    