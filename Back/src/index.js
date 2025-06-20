import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __DIRNAME = path.dirname(__filename);
const rootDir = path.resolve(__DIRNAME, "../../");

import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import { connectDB } from "./lib/db.js";
import { app, serverHttp } from "./lib/socket.js";

dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(express.static(path.join(rootDir, "Front", "dist")));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/friend", friendRoutes);

// Catch-all: serve frontend (must be last)
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(rootDir, "Front", "dist", "index.html"));
});

serverHttp.listen(PORT, () => {
  connectDB();
});
