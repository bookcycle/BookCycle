// server/src/index.js
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

/** ---------- Security / Core Middlewares ---------- */
app.set("trust proxy", 1); // needed if you ever set secure cookies behind Render/Proxies
app.use(helmet());
app.use(express.json());

/** ---------- CORS ---------- */
/** Allow your GH Pages app, GH root, localhost (dev), and optionally your own API origin */
const allowedOrigins = [
  process.env.CLIENT_URL,                 // e.g. https://jnkarim.github.io/BookCycle
  "https://jnkarim.github.io",
  "https://jnkarim.github.io/BookCycle",
  "http://localhost:5173",
  process.env.SERVER_URL                  // e.g. https://your-app.onrender.com (optional)
].filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // allow server-to-server, curl, health checks with no Origin
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Fast path for preflight
app.options("*", cors());

/** ---------- Health ---------- */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/** ---------- Routes ---------- */
app.get("/", (_req, res) => res.send("API is working"));
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api/transactions", transactionRoutes);

/** ---------- Errors ---------- */
app.use(notFound);
app.use(errorHandler);

/** ---------- HTTP + Socket.IO ---------- */
const server = http.createServer(app);

// Pass the same CORS list into your socket setup
setupSocket(server, { allowedOrigins });

/** ---------- Start ---------- */
await connectDB();

server.listen(config.port, () => {
  const host = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || `http://localhost:${config.port}`;
  console.log(`🚀 Server running at ${host}`);
});
