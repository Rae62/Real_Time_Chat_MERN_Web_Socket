import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
const path = require("path");

const __DIRNAME = path.resolve();

import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import friendRoutes from "./routes/friend.route.js";
import { connectDB } from "./lib/db.js";
import { app, serverHttp } from "./lib/socket.js";

dotenv.config();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(express.static(path.join(__DIRNAME, "/Front/dist")));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__DIRNAME, "Front", "dist", "index.html"));
});

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/friend", friendRoutes);

serverHttp.listen(PORT, () => {
  connectDB();
});
