// /sockets/index.js
import configureSocketIO from "../config/socket.js";
import { authenticateSocket } from "../middlewares/login.js";
import { setupChatNamespace } from "./chat/chatNamespace.js";

const setupSocketServer = (server) => {
  const io = configureSocketIO(server);

  // middleware that will authenticate upcoming connection handshake
  io.use(authenticateSocket);
  
  // initialize namespaces
  const chatNamespace = io.of('/chat'); 
  chatNamespace.use(authenticateSocket);

   // Setup namespaces
   setupChatNamespace(chatNamespace); 
};

export default setupSocketServer;
