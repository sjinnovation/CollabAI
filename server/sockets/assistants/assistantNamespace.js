import { createAssistantChatAndStream } from './assistantHandler.js';

const usersMap = new Map();

export const setupAssistantNamespace = (assistantNamespace) => {
	assistantNamespace.on('connection', async (socket) => {
		console.log(
			`[ASSISTANT SOCKET] user ${socket.user.userId} connected....`
		);
		usersMap.set(socket.user.userId, socket.id);
		// Handle assistant-specific events here
		console.log('[ASSISTANT SOCKET] current users', usersMap);
		socket.on('chat:create', createAssistantChatAndStream);
		// Add more assistant socket events as needed

		socket.on('disconnect', () => {
			console.log(
				`[ASSISTANT SOCKET] user ${socket.id} disconnected.....`
			);
			usersMap.delete(socket.user.userId);
		});
	});
};
