// server/src/realtime/socket.js
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { sendMessage, markConversationRead } from "../services/chat.service.js";

/**
 * Call as: setupSocket(server, { allowedOrigins })
 * where allowedOrigins is an array of strings (origins)
 */
export function setupSocket(server, { allowedOrigins = [] } = {}) {
  const io = new Server(server, {
    cors: {
      origin(origin, cb) {
        // Allow server-to-server / curl (no Origin)
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`Socket.IO CORS blocked: ${origin}`));
      },
      credentials: true,
    },
    transports: ["websocket", "polling"],      // fallback if WS is blocked briefly
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Optional: useful to debug handshake failures on Render free tier cold starts
  io.engine.on("connection_error", (err) => {
    console.warn("Socket engine connection_error:", err?.code, err?.message);
  });

  // --- Auth guard (expects token in handshake.auth.token OR query ?token=) ---
  io.use((socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.query?.token ||
        "";

      // Allow "Bearer xxx" or raw token
      if (token.startsWith("Bearer ")) token = token.slice(7);

      if (!token) return next(new Error("No token"));
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: payload.id };
      return next();
    } catch (e) {
      return next(new Error("Unauthorized"));
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
          io.to(`conversation:${conversationId}`).emit("message:new", { message: msg });
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

    socket.on("disconnect", (reason) => {
      console.log("❌ socket disconnected:", reason);
    });
  });
}
