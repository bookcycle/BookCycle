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

// ---------- Security & body parsing ----------
app.use(helmet());
app.use(express.json());

// ---------- CORS (safe allow-list via env) ----------
/**
 * Set ALLOWED_ORIGINS env like:
 *   https://bookcycle.github.io,http://localhost:5173
 * No spaces, no quotes, no trailing slashes.
 */
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow same-origin & non-browser clients
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Optional: transform CORS errors into 403 instead of crashing
app.use((err, req, res, next) => {
  if (err?.message?.startsWith("Not allowed by CORS")) {
    return res.status(403).json({ ok: false, error: err.message });
  }
  return next(err);
});

// ---------- Health (debug) ----------
app.get("/api/health", (req, res) => res.json({ ok: true }));

// ---------- Routes ----------
app.get("/", (req, res) => res.send("API is working"));
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api/transactions", transactionRoutes);

// ---------- Errors ----------
app.use(notFound);
app.use(errorHandler);

// ---------- HTTP server + Socket.IO ----------
const server = http.createServer(app);
setupSocket(server);

// ---------- Start ----------
await connectDB();
server.listen(config.port, () => {
  console.log(`🚀 Server running at http://localhost:${config.port}`);
});
