import express from "express";
import cors from "cors";
import helmet from "helmet";

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import aiRoutes from "./src/routes/ai.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";
import bookRoutes from "./src/routes/book.routes.js";
import uploadRoutes from "./src/routes/upload.routes.js";
import transactionRoutes from "./src/routes/transaction.routes.js";

// Middlewares
import { notFound, errorHandler } from "./src/middlewares/error.js";

const app = express();

/* ---------- Security & parsing ---------- */
app.use(helmet());
app.use(express.json());

/* ---------- CORS (allow exact origins only) ---------- */
const ALLOW = new Set([
  "https://book-cycle-cxry.vercel.app", // production client
  "http://localhost:5173",              // local dev client
]);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow server-to-server/SSR/tools (no Origin header)
      if (!origin) return cb(null, true);

      const clean = origin.replace(/\/+$/, "");

      return ALLOW.has(clean) ? cb(null, clean) : cb(new Error("CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ---------- Health ---------- */
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("API is working"));

/* ---------- Routes ---------- */
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api", chatRoutes);
app.use("/api", uploadRoutes);
app.use("/api/transactions", transactionRoutes);

/* ---------- Errors ---------- */
app.use(notFound);
app.use(errorHandler);

export default app;
