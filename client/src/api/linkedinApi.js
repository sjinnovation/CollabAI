import { axiosSecureInstance } from "./axios";
import { LINKEDIN_AUTH, LINKEDIN_CALLBACK, LINKEDIN_SHARE_POST } from "../constants/Api_constants.js";

export const shareToLinkedIn = async (chatPrompt, textToShare) => {
  try {
    // Always get a fresh authorization URL
    const authResponse = await axiosSecureInstance.get(LINKEDIN_AUTH);
    
    // Open LinkedIn login window
    const authWindow = window.open(
      authResponse.data.authUrl,
      'LinkedIn Login',
      'width=600,height=600'
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        authWindow.close();
        reject(new Error('LinkedIn authentication timed out'));
      }, 120000);

      const handleMessage = async (event) => {
        if (event.data.type === 'LINKEDIN_CALLBACK') {
          clearTimeout(timeout);
          const { code, timestamp } = event.data;
          
          if (Date.now() - timestamp > 60000) {
            authWindow.close();
            reject(new Error('LinkedIn authorization code expired'));
            return;
          }

          authWindow.close();
          window.removeEventListener('message', handleMessage);

          try {
            // Get fresh access token
            const tokenResponse = await axiosSecureInstance.get(
              `${LINKEDIN_CALLBACK}?code=${code}`
            );
            const { accessToken } = tokenResponse.data;

            // Create post with new access token
            const postResponse = await axiosSecureInstance.post(
              LINKEDIN_SHARE_POST,
              {
                accessToken,
                chatPrompt,
                textToShare
              }
            );

            resolve(postResponse.data);
          } catch (error) {
            reject(error);
          }
        }
      };

      window.addEventListener('message', handleMessage);
    });
  } catch (error) {
    throw error;
  }
};