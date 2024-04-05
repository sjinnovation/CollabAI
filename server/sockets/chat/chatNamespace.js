// /sockets/chat/chatNamespace.js

import { createChat } from "./chatHandler.js";

const usersMap = new Map();

export const setupChatNamespace = (chatNamespace) => {

  chatNamespace.on("connection", async (socket) => {
    console.log(`[SOCKET] user ${socket.user.userId} connected....`);
    usersMap.set(socket.user.userId, socket.id);

    console.log("[SOCKET] current users", usersMap);

    // Register event names and associate them with handlers
    socket.on('chat:create', createChat);

    // ---------- disconnect ----------
    socket.on("disconnect", () => {
      usersMap.delete(socket.user.userId);
      console.log(`[SOCKET] user ${socket.id} disconnected.....`);
    });
  });
};