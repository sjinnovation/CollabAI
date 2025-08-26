import { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import { message } from 'antd';
import { getUserID } from '../Utility/service';

const useProjectSocket = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [participants, setParticipants] = useState([]);
  const userId = getUserID();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      path: '/projects-socket',
      transports: ['websocket'],
      query: { userId }
    });

    newSocket.on('connect', () => {
      console.log('Projects socket connected');
    });

    newSocket.on('disconnect', () => {
      console.log('Projects socket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle incoming messages
    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    // Handle typing indicators
    socket.on('typing_indicator', ({ userId, isTyping }) => {
      setIsTyping(isTyping);
    });

    // Handle participant updates
    socket.on('participant_update', (data) => {
      setParticipants(data);
    });

    return () => {
      socket.off('receive_message');
      socket.off('typing_indicator');
      socket.off('participant_update');
    };
  }, [socket]);

  // Message sending function
  const sendMessage = useCallback((messageData) => {
    if (!socket) return;
    
    socket.emit('send_message', messageData, (response) => {
      if (response.status === 'success') {
        setMessages(prev => [...prev, messageData]);
      } else {
        message.error('Failed to send message');
      }
    });
  }, [socket]);

  // Join project room
  const joinProject = useCallback((projectId) => {
    if (!socket) return;
    
    socket.emit('join_project', { projectId, userId }, (response) => {
      if (response.status === 'success') {
        console.log(`Joined project: ${projectId}`);
      } else {
        message.error('Failed to join project');
      }
    });
  }, [socket, userId]);

  // Typing indicator
  const emitTyping = useCallback((isTyping) => {
    if (!socket) return;
    socket.emit('typing', { isTyping, userId });
  }, [socket, userId]);

  return {
    socket,
    messages,
    isTyping,
    participants,
    sendMessage,
    joinProject,
    emitTyping
  };
};

export default useProjectSocket;