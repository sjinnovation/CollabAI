import axios from 'axios';
import config from '../config.js';
import Configuration from '../models/configurationModel.js';
import { LinkedinMessages } from '../constants/enums.js';

const { LINKEDIN_REDIRECT_URI, LINKEDIN_SCOPE } = config;

export default class LinkedinService {
  static async getCredentials() {
    try {
      const clientIdConfig = await Configuration.findOne({ key: 'linkedinClientId' });
      const clientSecretConfig = await Configuration.findOne({ key: 'linkedinClientSecret' });
      return {
        clientId: clientIdConfig?.value || '',
        clientSecret: clientSecretConfig?.value || ''
      };
    } catch (error) {
      console.error(LinkedinMessages.ERROR_FETCHING_LINKEDIN_CREDENTIALS, error);
      throw error;
    }
  }

  static async getLinkedInUrl() {
    const { clientId } = await this.getCredentials();
    
    const state = Math.random().toString(36).substring(7);
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${LINKEDIN_REDIRECT_URI}&` +
      `scope=${LINKEDIN_SCOPE}&` +
      `state=${state}&` +
      `prompt=consent`;
    
    return authUrl;
  }

  static async getAccessToken(code) {
    const { clientId, clientSecret } = await this.getCredentials();
    
    try {
      const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', null, {
        params: {
          grant_type: 'authorization_code',
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: LINKEDIN_REDIRECT_URI
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      if (!tokenResponse.data.access_token) {
        throw new Error(LinkedinMessages.ERROR_FETCHING_LINKEDIN_ACCESS_TOKEN);
      }

      return tokenResponse.data.access_token;
    } catch (error) {      
      if (error.response?.data?.error === 'invalid_request') {
        throw new Error(LinkedinMessages.LINKEDIN_AUTHORIZATION_CODE_EXPIRED_OR_INVALID);
      }     
      throw new Error(LinkedinMessages.ERROR_FETCHING_LINKEDIN_ACCESS_TOKEN);
    }
  }

static async createPost(accessToken, chatPrompt, textToShare) {
  try {
    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const userUrn = profileResponse.data.sub;
    const finalText = `${textToShare}`;

    const postData = {
      author: `urn:li:person:${userUrn}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: finalText
          },
          shareMediaCategory: 'NONE'
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const response = await axios.post(
      'https://api.linkedin.com/v2/ugcPosts',
      postData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error(LinkedinMessages.LINKEDIN_AUTHORIZATION_EXPIRED);
    }
    throw error;
  }
}
}