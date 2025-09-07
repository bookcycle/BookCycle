// src/controllers/ai.controller.js
import { generateBookReply } from "../services/ai.service.js";

export async function chatWithGemini(req, res, next) {
  try {
    const { history = [], message } = req.body;
    const text = await generateBookReply(history, message);
    res.json({ text });
  } catch (err) {
    next(err);
  }
}
