import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRoutes from "./src/routes/auth.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import bookRoutes from "./src/routes/book.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import transactionRoutes from "./src/routes/transaction.routes.js";

import { notFound, errorHandler } from "./src/middlewares/error.js";

const app = express();

// middleware
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// health + routes
app.get("/api/health", (req, res) => res.json({ ok: true }));
app.get("/", (req, res) => res.send("API is working"));
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api/transactions", transactionRoutes);

// errors
app.use(notFound);
app.use(errorHandler);

export default app;
