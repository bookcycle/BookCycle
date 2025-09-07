import { Router } from "express";
import { chatWithGemini } from "../controllers/ai.controller.js";

const router = Router();

router.post("/chat", chatWithGemini);

export default router;
