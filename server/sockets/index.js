// /sockets/index.js
import configureSocketIO from '../config/socket.js';
import { authenticateSocket } from '../middlewares/login.js';
import { setupChatNamespace } from './chat/chatNamespace.js';
import { setupAssistantNamespace } from './assistants/assistantNamespace.js';

const setupSocketServer = (server) => {
	const io = configureSocketIO(server);

	// middleware that will authenticate upcoming connection handshake
	io.use(authenticateSocket);

	// initialize namespaces
	const chatNamespace = io.of('/chat');
	chatNamespace.use(authenticateSocket);

	//initialize namespace for assistant
	const assistantNamespace = io.of('/assistants');
	assistantNamespace.use(authenticateSocket);

	// Setup namespaces
	setupChatNamespace(chatNamespace);
	setupAssistantNamespace(assistantNamespace);
};

export default setupSocketServer;
