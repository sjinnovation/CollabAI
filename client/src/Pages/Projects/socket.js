import io from 'socket.io-client';

// Create a separate socket instance for Projects
const projectSocket = io(process.env.REACT_APP_SOCKET_URL, {
  path: '/projects-socket', // Different path from chat socket
  transports: ['websocket'],
  autoConnect: false // Don't connect automatically
});

// Add event listeners and handlers specific to Projects
projectSocket.on('connect', () => {
  console.log('Projects socket connected');
});

projectSocket.on('disconnect', () => {
  console.log('Projects socket disconnected');
});

projectSocket.on('connect_error', (error) => {
  console.error('Projects socket connection error:', error);
});

export default projectSocket;