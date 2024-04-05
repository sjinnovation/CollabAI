// useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getUserToken } from '../Utility/service';

const useSocket = (namespace='') => {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getUserToken();
    socketRef.current = io(`${process.env.REACT_APP_BASE_URL}${namespace}`, {
      auth: { token },
      reconnection: true, // Enable automatic reconnection
			reconnectionAttempts: 100, // Attempt to reconnect forever
			reconnectionDelay: 1000, // Start with a delay of 1 second
			reconnectionDelayMax: 5000, // Maximum delay between reconnection attempts
			randomizationFactor: 0.5, // Randomize reconnection delay
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [namespace]);

  return socketRef;
};

export default useSocket;