// GoogleDrive.js
import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';

const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // Replace with your client ID
const API_KEY = 'YOUR_API_KEY'; // Optional, not always needed
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

const GoogleDrive = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    const start=()=>{
      gapi.load('client:auth2', initClient);
    }

    const initClient = ()=>{
      gapi.client.init({
        apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
        clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        setIsAuthenticated(authInstance.isSignedIn.get());
        authInstance.isSignedIn.listen(setIsAuthenticated);
      }).catch((error) => {
        console.error('Error initializing Google API client:', error);
      });
    }

    start();
  }, []);

  const handleAuthClick = async () => {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            await authInstance.signIn().then(
                () => {
                    console.log('Sign-in successful');
                },
                (error) => {
                    if (error.error === 'popup_closed_by_user') {
                        console.log('Popup closed by user. Please try again.');
                    } else {
                        console.error('Error during sign-in:', error);
                    }
                }
            );
        } else {
            console.error('Google API client not initialized');
        }
    } catch (error) {
        console.error('Error during sign-in:', error);
    }
};


const handleSignoutClick = async () => {
    try {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
            await authInstance.signOut();
        } else {
            console.error('Google API client not initialized');
        }
    } catch (error) {
        console.error('Error during sign-out:', error);
    }
};


  const listFiles = async () => {
    try {
      const response = await gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': 'nextPageToken, files(id, name)',
      });
      setFiles(response.result.files);
    } catch (error) {
      console.error('Error listing files:', error);
    }
  };

  const openFile = (fileId) => {
    const url = `https://drive.google.com/file/d/${fileId}/view`;
    window.open(url, '_blank');
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleAuthClick}>Authorize</button>
      ) : (
        <button onClick={handleSignoutClick}>Sign Out</button>
      )}
      {isAuthenticated && (
        <>
          <button onClick={listFiles}>List Files</button>
          <ul>
            {files.map(file => (
              <li key={file.id}>
                {file.name}
                <button onClick={() => openFile(file.id)}>Open</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default GoogleDrive;
