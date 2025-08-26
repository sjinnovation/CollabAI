// hooks/useSocketMonitor.js
import { useEffect, useRef, useCallback } from 'react';
import { logClientEvent } from '../api/logger';
import { CHAT_EVENTS } from '../constants/sockets/chat';

const useSocketMonitor = (chatSocketRef) => {
  const lastChunkTimeRef = useRef(Date.now());
  const chunkCountRef = useRef(0);
  const connectionStartTimeRef = useRef(Date.now());
  const streamStartTimeRef = useRef(Date.now());
  const currentChatDataRef = useRef({});
  const activeMessagesRef = useRef(new Set());

  // Log to server function
  const logToServer = useCallback(async (level, message, data = {}) => {
    if (!chatSocketRef.current) return;
    
    await logClientEvent({
      level,
      message,
      data: {
        ...data,
        currentThreadId: currentChatDataRef.current.threadId,
        selectedChatModel: currentChatDataRef.current.selectedChatModel,
        activeMessages: Array.from(activeMessagesRef.current),
      },
      socketId: chatSocketRef.current.id,
      connectionState: chatSocketRef.current.connected ? 'connected' : 'disconnected',
      namespace: 'chat'
    });
  }, [chatSocketRef]);

  // Reset stream counters
  const resetStreamCounters = useCallback(() => {
    chunkCountRef.current = 0;
    lastChunkTimeRef.current = Date.now();
    streamStartTimeRef.current = Date.now();
    activeMessagesRef.current.clear();
  }, []);

  // Update current chat context
  const updateChatContext = useCallback((threadId, selectedChatModel, msgId = null) => {
    currentChatDataRef.current = {
      threadId,
      selectedChatModel,
      lastMsgId: msgId
    };
    
    if (msgId) {
      activeMessagesRef.current.add(msgId);
    }
  }, []);

  // Setup connection monitoring
  useEffect(() => {
    if (!chatSocketRef.current) return;

    const socket = chatSocketRef.current;

    const handleConnect = () => {
      connectionStartTimeRef.current = Date.now();
      logToServer('info', 'Chat socket connected');
    };

    const handleDisconnect = (reason) => {
      const duration = Date.now() - connectionStartTimeRef.current;
      logToServer('error', 'Chat socket disconnected', {
        reason,
        duration,
        activeMessagesCount: activeMessagesRef.current.size,
        wasUnexpected: reason !== 'io client disconnect'
      });
    };

    const handleConnectError = (error) => {
      logToServer('error', 'Chat socket connection error', {
        error: error.message || error.toString(),
        type: error.type
      });
    };

    const handleReconnect = (attemptNumber) => {
      logToServer('info', 'Chat socket reconnected', {
        attemptNumber,
        activeMessagesCount: activeMessagesRef.current.size
      });
    };

    const handleReconnectError = (error) => {
      logToServer('error', 'Chat socket reconnection failed', {
        error: error.message || error.toString()
      });
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_error', handleReconnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect', handleReconnect);
      socket.off('reconnect_error', handleReconnectError);
    };
  }, [chatSocketRef, logToServer]);

  // Setup chat event monitoring
  useEffect(() => {
    if (!chatSocketRef.current) return;

    const socket = chatSocketRef.current;

    // Monitor chat creation responses
    const handleChatCreated = (response) => {
      const { success, msg_id, promptResponse, isCompleted, threadId, botProvider } = response;
      
      if (success) {
        const now = Date.now();
        const responseTime = now - streamStartTimeRef.current;
        
        logToServer('info', 'Chat response received', {
          msgId: msg_id,
          threadId,
          botProvider,
          responseLength: promptResponse?.length || 0,
          responseTime,
          isCompleted,
          chunkNumber: chunkCountRef.current
        });

        // Track response timing
        if (chunkCountRef.current > 0) {
          const gap = now - lastChunkTimeRef.current;
          if (gap > 3000) { // 3 seconds
            logToServer('warning', 'Slow chat response chunk', {
              msgId: msg_id,
              gap,
              chunkNumber: chunkCountRef.current
            });
          }
        }

        lastChunkTimeRef.current = now;
        chunkCountRef.current++;

        // Remove from active messages when completed
        if (isCompleted) {
          activeMessagesRef.current.delete(msg_id);
          
          logToServer('info', 'Chat message completed', {
            msgId: msg_id,
            totalChunks: chunkCountRef.current,
            totalTime: responseTime,
            avgChunkTime: chunkCountRef.current > 0 ? responseTime / chunkCountRef.current : 0
          });
        }
      } else {
        logToServer('error', 'Chat creation failed', {
          msgId: msg_id,
          error: response.message,
          threadId: response.threadId
        });
        activeMessagesRef.current.delete(msg_id);
      }
    };

    // Monitor chat edits
    const handleChatEdited = (response) => {
      const { success, promptId, userPrompt } = response;
      
      logToServer('info', 'Chat prompt edited', {
        success,
        promptId,
        promptLength: userPrompt?.length || 0
      });
    };

    // Monitor chat completion
    const handleChatDone = () => {
      logToServer('info', 'Chat generation completed', {
        totalActiveMessages: activeMessagesRef.current.size,
        totalDuration: Date.now() - streamStartTimeRef.current
      });
      
      // Clear active messages
      activeMessagesRef.current.clear();
    };

    // Monitor errors
    const handleError = (error) => {
      logToServer('error', 'Chat socket error', {
        error: error.message || error.toString(),
        errorType: typeof error,
        activeMessagesCount: activeMessagesRef.current.size
      });
    };

    socket.on(CHAT_EVENTS.CREATED_CHAT, handleChatCreated);
    socket.on(CHAT_EVENTS.EDITED_PROMPT, handleChatEdited);
    socket.on(CHAT_EVENTS.CHAT_DONE, handleChatDone);
    socket.on('error', handleError);

    return () => {
      socket.off(CHAT_EVENTS.CREATED_CHAT, handleChatCreated);
      socket.off(CHAT_EVENTS.EDITED_PROMPT, handleChatEdited);
      socket.off(CHAT_EVENTS.CHAT_DONE, handleChatDone);
      socket.off('error', handleError);
    };
  }, [chatSocketRef, logToServer]);

  // Monitor emit events
  const monitorEmit = useCallback((eventName, data) => {
    const startTime = Date.now();
    
    if (eventName === CHAT_EVENTS.CREATE_CHAT) {
      streamStartTimeRef.current = startTime;
      chunkCountRef.current = 0;
      
      logToServer('info', 'Chat creation initiated', {
        msgId: data.msg_id,
        threadId: data.threadId,
        botProvider: data.botProvider,
        promptLength: data.userPrompt?.length || 0,
        isFistThreadMessage: data.isFistThreadMessage
      });
      
      activeMessagesRef.current.add(data.msg_id);
    } else if (eventName === CHAT_EVENTS.EDIT_LAST_CHAT) {
      logToServer('info', 'Chat edit initiated', {
        threadId: data.threadId,
        promptLength: data.userPrompt?.length || 0
      });
    } else if (eventName === CHAT_EVENTS.STOP_CHAT) {
      logToServer('info', 'Chat generation stopped by user', {
        activeMessagesCount: activeMessagesRef.current.size,
        duration: Date.now() - streamStartTimeRef.current
      });
      
      // Clear active messages
      activeMessagesRef.current.clear();
    }
  }, [logToServer]);

  return {
    resetStreamCounters,
    updateChatContext,
    monitorEmit,
    logToServer
  };
};

export default useSocketMonitor;