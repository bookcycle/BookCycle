import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const MODEL = "gemini-2.0-flash-001";

export async function generateBookReply(history = [], message = "") {
  if (!message || typeof message !== "string") {
    const e = new Error("message required");
    e.status = 400;
    throw e;
  }

  // Build prompt safely (no backtick character inside the template)
  const systemPrompt = [
    'You are "Chatbot" for BookCycle (exchange • giveaway).',
    "Rules:",
    '- Keep answers concise. Return PLAIN TEXT only — no Markdown characters (*, **, _, #, backticks).',
    '- Always format lists as bullet points starting with "- ".',,
    '- If user asks "short", prefer under-300 pages.',
    "- For each title: title – author – (pages) – 1-line why fit.",
    "- Consider exchange/giveaway angles when relevant.",
  ].join("\n");

  const contents = [
    {
      role: "user",
      parts: [{ text: systemPrompt }],
    },
    ...history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: message }] },
  ];

  const resp = await ai.models.generateContent({
    model: MODEL,
    contents,
  });

  const text = typeof resp.text === "function" ? await resp.text() : resp.text;
  return text || "Sorry, I have no reply.";
}
