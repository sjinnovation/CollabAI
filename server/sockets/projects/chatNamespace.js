// /sockets/chat/chatNamespace.js

import { createProjectsChat, lastEditPromptOfProjects, stopProjectsChat } from "./chatHandler.js";

const usersMap = new Map();

export const setupProjectNamespace = (projectsNamespace) => {

  projectsNamespace.on("connection", async (socket) => {
    console.log(`[SOCKET] user ${socket.user.userId} connected....`);
    usersMap.set(socket.user.userId, socket.id);

    console.log("[SOCKET] current users", usersMap);

    // Register event names and associate them with handlers
    socket.on('chat:create', createProjectsChat);

    // Register event names and associate them with handlers
    socket.on('chat:last-edit-prompt', lastEditPromptOfProjects);

    // Register event names and associate them with handlers
    socket.on('chat:stop', stopProjectsChat);

    // ---------- disconnect ----------
    socket.on("disconnect", () => {
      usersMap.delete(socket.user.userId);
      console.log(`[SOCKET] user ${socket.id} disconnected.....`);
    });
  });
};