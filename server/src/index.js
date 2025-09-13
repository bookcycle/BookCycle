import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { config } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import { notFound, errorHandler } from "./middlewares/error.js";
import aiRoutes from "./routes/ai.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { setupSocket } from "./realtime/socket.js";
import bookRoutes from "./routes/book.routes.js";

import uploadRoutes from "./routes/upload.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

const app = express();

// ---------- Middlewares ----------
app.use(helmet());
app.use(express.json());

// CORS (client 5173)
app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------- Health (debug) ----------
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- Routes ----------
app.get("/", (req, res) => res.send("API is working"));
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", chatRoutes);
app.use("/api/books", bookRoutes);
app.use("/api", uploadRoutes);
app.use("/api/transactions", transactionRoutes);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Create HTTP server & attach Socket.IO ----------
const server = http.createServer(app);
setupSocket(server); // <<<<<<<<<<<<<<<<<<<<<< attach socket.io to *server*, not app

// ---------- Start ----------
await connectDB();
server.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port}`);
});
