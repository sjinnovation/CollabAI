import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spin } from 'antd'; 
import { REACT_APP_WORKBOARD_REDIRECT_URI } from '../../constants/Api_constants';
import { axiosSecureInstance } from '../../api/axios';

const ConnectionWithWorkboard = () => {
  const [loading, setLoading] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
      const redirectUri = REACT_APP_WORKBOARD_REDIRECT_URI;

      

      const getAccessTokenFromBackend = async () => {
        try {
          const response = await axiosSecureInstance.post(`api/workboard/workboard-auth`, {
            code: code,
            redirectUri: redirectUri,
          });

          if (response.status === 200) {
            const { accessToken } = response.data;
            localStorage.setItem('workboard_access_token', accessToken);
            

            setLoading(false); 
            navigate('/profile');
          } else {
            console.error('Failed to get access token from backend');
            setLoading(false); 
          }
        } catch (error) {
          console.error('Error fetching access token from backend:', error);
          setLoading(false);
        }
      };

      getAccessTokenFromBackend();
    } else {
      setLoading(false); 
    }
  }, [navigate]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Connecting to Workboard...</h2>
      {loading ? (
        <Spin size="large" /> 
      ) : (
        <p>Connection failed or code is missing.</p>
      )}
    </div>
  );
};

export default ConnectionWithWorkboard;
