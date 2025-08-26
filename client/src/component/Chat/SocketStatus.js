import React, { useState, useEffect } from 'react';
import './MinimalSocketStatus.css';
import { CHAT_EVENTS } from '../../constants/sockets/chat';

const SocketStatus = ({ socketRef }) => {
  const [isActive, setIsActive] = useState(false);
  const [lastActivity, setLastActivity] = useState(null);
  const [activityType, setActivityType] = useState('');

  useEffect(() => {
    if (!socketRef.current) {
      setIsActive(false);
      return;
    }

    const socket = socketRef.current;
    
    // Check initial connection
    setIsActive(socket.connected);

    const updateActivity = (type) => {
      setIsActive(true);
      setLastActivity(new Date().toLocaleTimeString());
      setActivityType(type);
      console.log(`Chat activity detected: ${type}`);
    };

    // Socket.IO connection events
    const handleConnect = () => {
      setIsActive(true);
      updateActivity('connected');
    };

    const handleDisconnect = () => {
      setIsActive(false);
      setActivityType('disconnected');
    };

    // Your chat events
    const handleChatCreated = () => updateActivity('chat response');
    const handleChatEdited = () => updateActivity('chat edited');
    const handleChatDone = () => updateActivity('chat completed');

    // Add listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(CHAT_EVENTS.CREATED_CHAT, handleChatCreated);
    socket.on(CHAT_EVENTS.EDITED_PROMPT, handleChatEdited);
    socket.on(CHAT_EVENTS.CHAT_DONE, handleChatDone);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(CHAT_EVENTS.CREATED_CHAT, handleChatCreated);
      socket.off(CHAT_EVENTS.EDITED_PROMPT, handleChatEdited);
      socket.off(CHAT_EVENTS.CHAT_DONE, handleChatDone);
    };
  }, [socketRef]);

  return (
    <div className={`simple-chat-status ${isActive ? 'active' : 'inactive'}`}>
      <div className="status-indicator">
        <span className={`status-dot ${isActive ? 'online' : 'offline'}`}></span>
        <span className="status-text">
          {isActive ? 'Online' : 'Offline'}
        </span>
        {lastActivity && (
          <span className="last-activity">
            {activityType} at {lastActivity}
          </span>
        )}
      </div>
    </div>
  );
};

export default SocketStatus;