import { useEffect, useState } from 'react';

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/drive.file'; 

export const useGoogleDriveAuth = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const handleCallbackResponse = (response) => {
      if (response && response.credential) {
        setToken(response.credential); 
      } else {
        console.error('No credentials received from Google Sign-In.');
      }
    };

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCallbackResponse,
      scope: SCOPES,
    });

    // Clear previous sessions
    window.google.accounts.id.disableAutoSelect();
  }, []);

  const signInWithGoogle = () => {
    window.google.accounts.id.prompt((notification) => {
    if (notification.isDismissedMoment()) {
        console.error('User dismissed the sign-in:', notification.getDismissedReason());
      }
    });
  };

  return { signInWithGoogle, token };
};
