import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { sendMessage, markConversationRead } from "../services/chat.service.js";

export function setupSocket(server) {
  // Reuse the same allow-list used by Express CORS
  const allowed = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const io = new Server(server, {
    cors: {
      origin(origin, cb) {
        // same-origin / server-side clients
        if (!origin) return cb(null, true);
        if (allowed.includes(origin)) return cb(null, true);
        return cb(new Error(`Not allowed by CORS (socket): ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    // path: "/socket.io",
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id };
      next();
    } catch (e) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🔌 socket connected", socket.id, "user:", socket.user?.id);

    socket.on("conversation:join", (conversationId) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on("conversation:leave", (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on(
      "message:send",
      async ({ conversationId, text, attachments = [] }, cb) => {
        try {
          const msg = await sendMessage(conversationId, socket.user.id, {
            text,
            attachments,
          });
          io.to(`conversation:${conversationId}`).emit("message:new", {
            message: msg,
          });
          cb?.({ ok: true, message: msg });
        } catch (e) {
          cb?.({ ok: false, error: e.message || "Send failed" });
        }
      }
    );

    socket.on("conversation:read", async ({ conversationId }, cb) => {
      try {
        await markConversationRead(conversationId, socket.user.id);
        io.to(`conversation:${conversationId}`).emit("conversation:read", {
          userId: socket.user.id,
        });
        cb?.({ ok: true });
      } catch (e) {
        cb?.({ ok: false, error: e.message || "Read failed" });
      }
    });

    socket.on("disconnect", (r) => {
      console.log("❌ socket disconnected", r);
    });
  });
}
