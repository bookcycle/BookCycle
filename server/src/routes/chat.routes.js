import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { startChat, listMyChats, listMessages, postMessage, putRead } from "../controllers/chat.controller.js";

const router = Router();
router.use(requireAuth);

router.post("/chats/start", startChat);
router.get("/chats", listMyChats);
router.get("/chats/:id/messages", listMessages);
router.post("/chats/:id/messages", postMessage);
router.put("/chats/:id/read", putRead);

export default router;
