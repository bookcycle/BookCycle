// src/components/ChatbotCard.jsx
import React, { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "../lib/api"; // তোমার axios wrapper

export default function ChatbotCard() {
  const [messages, setMessages] = useState([
    {
      id: nanoid(),
      role: "assistant",
      content:
        "Hey! I can help you find books to borrow, exchange or give away.\n\nWhat kind of book are you looking for? (Genre, length, topic, etc.)",
    },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const listRef = useRef(null);
  const textareaRef = useRef(null);

  useAutoGrow(textareaRef, draft);
  useScrollToBottom(listRef, [messages, busy]);

  async function handleSend(e) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || busy) return;

    // UI-তে ইউজারের মেসেজ আগে দেখাই
    const userMsg = { id: nanoid(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setBusy(true);

    try {
      // backend expects: { history, message }
      const data = await api.post("/ai/chat", {
        history: messages.map(({ role, content }) => ({ role, content })),
        message: text,
      });

      const reply =
        data?.text || "Sorry, I couldn't come up with a reply right now.";

      setMessages((m) => [
        ...m,
        { id: nanoid(), role: "assistant", content: reply },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: nanoid(),
          role: "assistant",
          content:
            err?.message || "Something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="rounded-2xl border border-neutral-200 bg-white shadow-lg overflow-hidden"
      role="region"
      aria-label="Book Genie chat"
    >
      {/* messages */}
      <div ref={listRef} className="h-[420px] overflow-y-auto p-3 space-y-3">
        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} content={m.content} />
        ))}
        {busy && <Typing />}
      </div>

      {/* composer */}
      <form onSubmit={handleSend} className="border-t border-neutral-200 p-2">
        <div className="flex items-end gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-neutral-900/10">
          <textarea
            ref={textareaRef}
            rows={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder='Try: "Find cozy mysteries under 300 pages"'
            className="flex-1 resize-none bg-transparent outline-none px-2 py-2 text-[15px] leading-relaxed"
            aria-label="Message Book Genie"
          />
          <button
            type="submit"
            disabled={!draft.trim() || busy}
            className="shrink-0 rounded-lg bg-neutral-900 px-3 py-2 text-white disabled:opacity-50"
          >
            {busy ? "…" : "Send"}
          </button>
        </div>
        <p className="mt-1 text-[11px] text-neutral-500">
          Connected to: <code>/api/ai/chat</code>
        </p>
      </form>
    </div>
  );
}

/* ========== tiny UI parts & utils ========== */
function Bubble({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm ${
          isUser
            ? "bg-neutral-900 text-white rounded-br-sm"
            : "bg-white text-neutral-900 border border-neutral-200 rounded-bl-sm"
        }`}
      >
        {isUser ? (
          content
        ) : (
          // Assistant messages render with Markdown → bullets, bold, tables (GFM) nicely
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1 prose-ol:my-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

function Typing() {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-500">
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-neutral-400"></span>
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:.15s]"></span>
      <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-neutral-400 [animation-delay:.3s]"></span>
      <span className="ml-1">typing…</span>
    </div>
  );
}

function nanoid(len = 12) {
  const chars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[(Math.random() * chars.length) | 0];
  return out;
}

function useAutoGrow(ref, value) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const next = el.scrollHeight;
    el.style.height = Math.min(next, 200) + "px";
  }, [ref, value]);
}

function useScrollToBottom(ref, deps) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
