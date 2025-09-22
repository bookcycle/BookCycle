import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { Search, Plus, Paperclip, SendHorizontal, Loader2 } from "lucide-react";

export default function ChatPage() {
  const navigate = useNavigate();

  const [convos, setConvos] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [q, setQ] = useState("");
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const listRef = useRef(null);
  const socketRef = useRef(null);
  const meId = useMemo(() => localStorage.getItem("ptb_user_id") || "", []);

  /* ---------------- helpers: dedupe by other participant ---------------- */
  const getOtherId = (c) => {
    const other = (c?.participants || []).find((p) => String(p._id) !== String(meId));
    return other?._id ? String(other._id) : null;
  };
  const toTime = (d) => (d ? new Date(d).getTime() : 0);

  function dedupeByOther(arr) {
    const map = new Map();
    for (const c of arr) {
      const otherId = getOtherId(c);
      if (!otherId) continue;
      const prev = map.get(otherId);
      if (!prev) map.set(otherId, c);
      else {
        const prevTime = toTime(prev.updatedAt || prev.createdAt);
        const curTime = toTime(c.updatedAt || c.createdAt);
        if (curTime >= prevTime) map.set(otherId, c);
      }
    }
    return Array.from(map.values()).sort(
      (a, b) => toTime(b.updatedAt || b.createdAt) - toTime(a.updatedAt || a.createdAt)
    );
  }

  function reconcileActiveId(prevActiveId, nextConvos) {
    if (!prevActiveId) return null;
    const prevConvo = convos.find((c) => String(c._id) === String(prevActiveId));
    const prevOther = getOtherId(prevConvo);
    if (!prevOther) return prevActiveId;
    const target = nextConvos.find((c) => getOtherId(c) === prevOther);
    return target ? target._id : nextConvos[0]?._id || null;
  }

  /* ---------------- socket setup ---------------- */
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    const onNew = ({ message }) => {
      if (String(message.conversation) === String(activeId)) {
        setMessages((prev) => [...prev, message]);
        scrollBottomSoon();
      }
      setConvos((prev) => {
        let next = [...prev];
        const idx = next.findIndex((c) => String(c._id) === String(message.conversation));
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastMessage:
              message.text?.trim() || (message.attachments?.length ? "[attachment]" : ""),
            updatedAt: message.createdAt,
          };
        } else {
          next.unshift({
            _id: message.conversation,
            participants: [],
            lastMessage:
              message.text?.trim() || (message.attachments?.length ? "[attachment]" : ""),
            updatedAt: message.createdAt,
          });
        }
        const deduped = dedupeByOther(next);
        const fixedActive = reconcileActiveId(activeId, deduped);
        if (fixedActive !== activeId) setActiveId(fixedActive);
        return deduped;
      });
    };

    s.on("message:new", onNew);
    return () => s.off("message:new", onNew);
  }, [activeId]);

  /* ---------------- load conversation list ---------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoadingConvos(true);
        const params = new URLSearchParams(window.location.search);
        const to = params.get("to");

        let working = [];
        if (to) {
          const { conversation } = await api.post("/chats/start", { participantId: to });
          working = [conversation];
          setActiveId(conversation._id);
        }

        const res = await api.get("/chats");
        const list = res?.conversations || [];
        const deduped = dedupeByOther([...working, ...list]);
        setConvos(deduped);
        setActiveId((p) => p || deduped[0]?._id || null);
      } catch (e) {
        console.error("Load chats failed:", e?.message || e);
        setConvos([]);
      } finally {
        setLoadingConvos(false);
      }
    })();
  }, []);

  /* ---------------- load messages when active changes ---------------- */
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      try {
        setLoadingMsgs(true);
        const res = await api.get(`/chats/${activeId}/messages`);
        setMessages(res?.messages || []);
        scrollBottomSoon();
        socketRef.current?.emit("conversation:join", activeId);
        socketRef.current?.emit("conversation:read", { conversationId: activeId });
      } catch (e) {
        console.error("Load messages failed:", e?.message || e);
        setMessages([]);
      } finally {
        setLoadingMsgs(false);
      }
    })();
    return () => socketRef.current?.emit("conversation:leave", activeId);
  }, [activeId]);

  /* ---------------- utils ---------------- */
  function scrollBottomSoon() {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 0);
  }
  const otherParticipants = (c) =>
    (c?.participants || []).filter((p) => String(p._id) !== String(meId));
  const initialsOf = (p) => {
    const a = (p?.firstName?.[0] || "").toUpperCase();
    const b = (p?.lastName?.[0] || "").toUpperCase();
    return a + b || "•";
  };
  const titleOf = (c) => {
    const others = otherParticipants(c);
    return (
      others
        .map((p) => `${p.firstName || ""} ${p.lastName || ""}`.trim())
        .filter(Boolean)
        .join(", ") || "Direct chat"
    );
  };
  const isMe = (id) => String(meId) === String(id);

  function send() {
    const t = text.trim();
    if (!t || !activeId) return;
    setText("");

    socketRef.current?.emit("message:send", { conversationId: activeId, text: t }, (res) => {
      if (!res?.ok) {
        api
          .post(`/chats/${activeId}/messages`, { text: t })
          .then((r) => {
            const m = r?.message || r?.data?.message;
            if (m) setMessages((prev) => [...prev, m]);
          })
          .catch((e) => console.error("fallback send failed", e));
      }
    });

    setConvos((prev) => {
      const next = prev.map((c) =>
        String(c._id) === String(activeId)
          ? { ...c, lastMessage: t, updatedAt: new Date().toISOString() }
          : c
      );
      return next
        .slice()
        .sort((a, b) => toTime(b.updatedAt || b.createdAt) - toTime(a.updatedAt || a.createdAt));
    });
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[#1F2421]/10 bg-[#FCFBF9]/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="rounded-full border border-[#1F2421]/20 px-3 py-1.5 text-sm text-[#1F2421] hover:bg-[#E0F2F1]"
          >
            ← Back
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-[#1F2421]/70">
            {loadingConvos || loadingMsgs ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            <span>Chat</span>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-4">
        {/* Left: conversations */}
        <aside className="col-span-12 md:col-span-4 rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9] shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 border-b border-[#E8E4DC] bg-white/60 px-3 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1F2421]/50" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search conversations…"
                className="w-full rounded-xl border border-[#E8E4DC] bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#B8B09C]/40"
              />
            </div>
            <button
              className="rounded-xl border border-[#E8E4DC] bg-white px-3 py-2 text-sm hover:bg-[#EFEBDD]"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-4 text-sm text-[#1F2421]/60">Loading conversations…</div>
            ) : convos.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#1F2421]/60">No conversations</div>
            ) : (
              <ul className="divide-y divide-[#E8E4DC]">
                {convos
                  .filter((c) => titleOf(c).toLowerCase().includes(q.toLowerCase()))
                  .map((c) => {
                    const others = otherParticipants(c);
                    const firstOther = others[0];
                    const title = titleOf(c);
                    return (
                      <li key={c._id}>
                        <button
                          onClick={() => setActiveId(c._id)}
                          className={`flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#E0F2F1]/60 ${
                            activeId === c._id ? "bg-[#E0F2F1]" : ""
                          }`}
                        >
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#00897B] to-[#004D40] font-semibold text-white">
                            {initialsOf(firstOther)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium text-[#1F2421]">{title}</div>
                            <div className="truncate text-xs text-[#1F2421]/60">{c.lastMessage || "No messages yet"}</div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </aside>

        {/* Right: thread */}
        <section className="col-span-12 md:col-span-8 rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9] shadow-sm overflow-hidden flex flex-col">
          {/* header */}
          <ThreadHeader convo={convos.find((c) => String(c._id) === String(activeId))} otherParticipants={otherParticipants} titleOf={titleOf} />

          {/* messages */}
          <div ref={listRef} className="flex-1 overflow-y-auto p-4">
            {loadingMsgs ? (
              <div className="text-sm text-[#1F2421]/60">Loading…</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-[#1F2421]/60">Say hello 👋</div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <MessageBubble key={m._id} me={isMe(m.sender?._id)} text={m.text} timestamp={m.createdAt} />
                ))}
              </div>
            )}
          </div>

          {/* composer */}
          <div className="border-t border-[#E8E4DC] bg-white/70 px-3 py-3">
            <div className="flex items-end gap-2">
              <button className="h-10 w-10 rounded-xl border border-[#E8E4DC] bg-white grid place-items-center hover:bg-[#EFEBDD]" title="Attach">
                <Paperclip className="h-4 w-4" />
              </button>
              <textarea
                rows={1}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type a message…"
                className="min-h-10 max-h-40 flex-1 resize-none rounded-xl border border-[#E8E4DC] bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-[#00897B]"
              />
              <button
                onClick={send}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00897B] to-[#004D40] px-4 py-2 font-medium text-white hover:brightness-110"
              >
                <SendHorizontal className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------------------- Pieces ----------------------------- */
function ThreadHeader({ convo, otherParticipants, titleOf }) {
  if (!convo) {
    return (
      <div className="border-b border-[#E8E4DC] bg-white/70 px-4 py-3">
        <div className="h-5 w-40 animate-pulse rounded" style={{ background: "#F2EFE9" }} />
      </div>
    );
  }
  const others = otherParticipants(convo);
  const first = others[0];
  const name = titleOf(convo);
  return (
    <div className="flex items-center gap-3 border-b border-[#E8E4DC] bg-white/70 px-4 py-3">
      <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#00897B] to-[#004D40] font-semibold text-white">
        {initials(first)}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium text-[#1F2421]">{name}</div>
        <div className="text-xs text-[#1F2421]/60">Direct chat</div>
      </div>
    </div>
  );
}
function initials(p) {
  const a = (p?.firstName?.[0] || "").toUpperCase();
  const b = (p?.lastName?.[0] || "").toUpperCase();
  return a + b || "•";
}

function MessageBubble({ me, text, timestamp }) {
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow ${
          me
            ? "bg-gradient-to-r from-[#00897B] to-[#004D40] text-white"
            : "bg-white border border-[#1F2421]/10 text-[#1F2421]"
        }`}
      >
        <div>{text}</div>
        <div className={`mt-1 text-[10px] opacity-70 ${me ? "text-white/80" : "text-[#1F2421]/60"}`}>
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
