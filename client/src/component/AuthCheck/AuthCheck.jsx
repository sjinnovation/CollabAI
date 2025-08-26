import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCheck = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('userToken');
    if (authToken) {
      navigate('/chat');
    }
  }, [navigate]);

  return children;
};

export default AuthCheck;