import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const serverHttp = http.createServer(app);

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
const io = new Server(serverHttp, {
  cors: {
    origin: [allowedOrigin],
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Typing indicator events
  socket.on("typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { from: userId });
    }
  });

  socket.on("stop_typing", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stop_typing", { from: userId });
    }
  });
});

export { io, app, serverHttp };
