// services/ai.service.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const MODEL = "gemini-2.0-flash-001";

/**
 * কেন: সার্ভিস লেয়ারের কাজ হচ্ছে কেবল বিজনেস লজিক:
 * - UI history → Gemini format
 * - Prompt steering (domain rules)
 * - Gemini call
 * - Text normalize করে রিটার্ন
 */
export async function generateBookReply(history = [], message = "") {
  if (!message || typeof message !== "string") {
    const e = new Error("message required");
    e.status = 400;
    throw e;
  }

  // UI থেকে পাওয়া history → Gemini "contents"
  const contents = [
    {
      role: "user",
      parts: [{
        text:
`You are "Book Genie" for PassTheBook (borrow • exchange • giveaway).
Rules:
- Keep answers concise, bullet-style.
- If user asks "short", prefer under-300 pages.
- For each title: title – author – (~pages) – 1-line why fit.
- Consider borrow/exchange/giveaway angles when relevant.`
      }]
    },
    ...history.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  // Gemini কল
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents
  });

  // SDK ভেরিয়েশন কভার; নতুন SDK তে resp.text থাকতে পারে/বা method হতে পারে
  const text = typeof resp.text === "function" ? await resp.text() : resp.text;
  return text || "Sorry, I have no reply.";
}

/**
 * (ঐচ্ছিক) স্ট্রিমিং ভ্যারিয়েন্ট – ModernChatbot এর async iterator এর জন্য
 */
export async function* streamBookReply(history = [], message = "") {
  if (!message || typeof message !== "string") {
    const e = new Error("message required");
    e.status = 400;
    throw e;
  }

  const contents = [
    {
      role: "user",
      parts: [{
        text:
`You are "Book Genie" for PassTheBook.
Return concise, incremental chunks suitable for live streaming.`
      }]
    },
    ...history.map(m => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const stream = await ai.models.generateContentStream({
    model: MODEL,
    contents
  });

  for await (const chunk of stream) {
    const piece = typeof chunk.text === "function" ? await chunk.text() : chunk.text || "";
    if (piece) yield piece;
  }
}
