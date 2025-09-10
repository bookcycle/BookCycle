import { generateBookReply } from "../services/ai.service.js";

export async function chatWithGemini(req, res, next) {
  try {
    const { history = [], message } = req.body;
    const text = await generateBookReply(history, message);
    //frontend back through res
    res.json({ text });
  } catch (err) {
    next(err);
  }
}
