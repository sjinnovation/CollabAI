import axios from 'axios';
import qs from 'qs';
const WorkBoardBaseURL = process.env.WORKBOARD_BASE_URL; 

//----------------
export const fetchWorkBoardAccessToken = async (code, redirectUri) => {
  const clientId = process.env.WORKBOARD_CLIENT_ID;
  const clientHash = process.env.WORKBOARD_CLIENT_HASH;

  const response = await axios.post(`${WorkBoardBaseURL}/oauth/token`, qs.stringify({
    client_id: clientId,
    client_hash: clientHash,
    code: code,
    redirect_uri: redirectUri,
  }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return response;
};

//----------------
export const fetchWorkBoardUserInfo = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/user/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  return response;
};


//----------------
export const getWorkBoardGoalService = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/goal/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};

//----------------
export const getWorkBoardActivityService = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/activity/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};

//----------------
export const getWorkBoardTeamService = async (accessToken) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/team/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};

//----------------
export const getWorkBoardUserGoalService = async (accessToken, userId) => {
  const response = await axios.get(`${WorkBoardBaseURL}/apis/user/${userId}/goal/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });
  
  return response.data;
};