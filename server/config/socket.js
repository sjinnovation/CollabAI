// /config/socket.js
import { Server } from "socket.io";
import config from '../config.js';

const configureSocketIO = (server) => {
  const io = new Server(server, {
    cors: {
      origin: config.CLIENT_URL, 
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  return io;
};

export default configureSocketIO;