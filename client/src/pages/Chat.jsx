import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

export default function ChatPage() {
  const navigate = useNavigate();

  const [convos, setConvos] = useState([]);     
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

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
    // Keep the newest conversation per other user
    const map = new Map(); 
    for (const c of arr) {
      const otherId = getOtherId(c);
      if (!otherId) continue;
      const prev = map.get(otherId);
      if (!prev) {
        map.set(otherId, c);
      } else {
        const prevTime = toTime(prev.updatedAt || prev.createdAt);
        const curTime = toTime(c.updatedAt || c.createdAt);
        if (curTime >= prevTime) map.set(otherId, c);
      }
    }
    // stable-ish order: newest first
    const list = Array.from(map.values()).sort(
      (a, b) => toTime(b.updatedAt || b.createdAt) - toTime(a.updatedAt || a.createdAt)
    );
    return list;
  }

  // when we dedupe, ensure activeId still points to the winning convo for that user
  function reconcileActiveId(prevActiveId, nextConvos) {
    if (!prevActiveId) return null;
    // find otherId of previous active
    const prevConvo = convos.find((c) => String(c._id) === String(prevActiveId));
    const prevOther = getOtherId(prevConvo);
    if (!prevOther) return prevActiveId;

    // find the deduped convo for that other user
    const target = nextConvos.find((c) => getOtherId(c) === prevOther);
    return target ? target._id : (nextConvos[0]?._id || null);
  }

  /* ---------------- socket setup ---------------- */
  useEffect(() => {
    const s = getSocket();
    socketRef.current = s;

    const onNew = ({ message }) => {
      // append to open convo thread
      if (String(message.conversation) === String(activeId)) {
        setMessages((prev) => [...prev, message]);
        scrollBottomSoon();
      }

      // refresh list (update preview + dedupe)
      setConvos((prev) => {
        // update or insert this convo in the array
        let next = [...prev];
        const idx = next.findIndex((c) => String(c._id) === String(message.conversation));
        if (idx >= 0) {
          next[idx] = {
            ...next[idx],
            lastMessage:
              message.text?.trim() ||
              (message.attachments?.length ? "[attachment]" : ""),
            updatedAt: message.createdAt,
          };
        } else {
          next.unshift({
            _id: message.conversation,
            participants: [
            ],
            lastMessage:
              message.text?.trim() ||
              (message.attachments?.length ? "[attachment]" : ""),
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


  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const to = params.get("to");

        let working = [];

        if (to) {
          const { conversation } = await api.post("/chats/start", {
            participantId: to,
          });
          working = [conversation];
          setActiveId(conversation._id);
        }

        const res = await api.get("/chats");
        const list = res?.conversations || [];
        const merged = [...working, ...list];

        const deduped = dedupeByOther(merged);
        // if nothing selected, pick first
        const nextActive = activeId || deduped[0]?._id || null;
        setConvos(deduped);
        setActiveId(nextActive);
      } catch (e) {
        console.error("Load chats failed:", e?.message || e);
        setConvos([]);
      }
    })();

  }, []);

  /* ---------------- load messages when active changes ---------------- */
  useEffect(() => {
    if (!activeId) return;
    (async () => {
      try {
        const res = await api.get(`/chats/${activeId}/messages`);
        setMessages(res?.messages || []);
        scrollBottomSoon();
        socketRef.current?.emit("conversation:join", activeId);
        socketRef.current?.emit("conversation:read", { conversationId: activeId });
      } catch (e) {
        console.error("Load messages failed:", e?.message || e);
        setMessages([]);
      }
    })();
    return () => socketRef.current?.emit("conversation:leave", activeId);
  }, [activeId]);

  /* ---------------- small utils ---------------- */
  function scrollBottomSoon() {
    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }, 0);
  }

  const activeConvo = convos.find((c) => String(c._id) === String(activeId));

  const otherParticipants = (c) =>
    (c?.participants || []).filter((p) => String(p._id) !== String(meId));

  const headerName =
    otherParticipants(activeConvo)
      .map((p) => `${p.firstName || ""} ${p.lastName || ""}`.trim())
      .filter(Boolean)
      .join(", ") || "Conversation";

  function initialsOf(p) {
    const a = (p?.firstName?.[0] || "").toUpperCase();
    const b = (p?.lastName?.[0] || "").toUpperCase();
    return (a + b) || "•";
  }

  function isMe(id) {
    return String(meId) === String(id);
  }

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

    // bump preview + updatedAt locally so the list re-sorts nicely
    setConvos((prev) => {
      const next = prev.map((c) =>
        String(c._id) === String(activeId)
          ? { ...c, lastMessage: t, updatedAt: new Date().toISOString() }
          : c
      );
      // already deduped; just re-sort by updatedAt
      return next
        .slice()
        .sort(
          (a, b) => toTime(b.updatedAt || b.createdAt) - toTime(a.updatedAt || a.createdAt)
        );
    });
  }

  /* ---------------- UI (BookLink theme) ---------------- */
  return (
    <div
      className="min-h-[calc(100vh-80px)] p-4"
      style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}
    >
      {/* Moved Back button up here (outside the cards), same style as Book Details */}
      <div className="max-w-7xl mx-auto mb-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#1F2421]/20 text-sm font-medium text-[#1F2421] hover:bg-[#E0F2F1] transition"
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Inbox (deduped by user) */}
        <aside className="col-span-12 md:col-span-4 rounded-2xl border border-[#1F2421]/10 bg-[#FCFBF9] shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-gradient-to-r from-[#00897B] to-[#004D40] text-white font-semibold">
            Chats
          </div>
          <div className="max-h-[calc(100vh-170px)] overflow-y-auto divide-y">
            {convos.length === 0 && (
              <div className="p-5 text-sm text-gray-500">No conversations</div>
            )}
            {convos.map((c) => {
              const others = otherParticipants(c);
              const title =
                others
                  .map((p) => `${p.firstName || ""} ${p.lastName || ""}`.trim())
                  .join(", ") || "Direct chat";
              const firstOther = others[0];

              return (
                <button
                  key={c._id}
                  onClick={() => setActiveId(c._id)}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-[#E0F2F1] transition ${
                    activeId === c._id ? "bg-[#E0F2F1]" : ""
                  }`}
                  title={title}
                >
                  <div className="w-10 h-10 rounded-full grid place-items-center font-bold text-white bg-gradient-to-br from-[#00897B] to-[#004D40]">
                    {initialsOf(firstOther)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate text-[#1F2421]">{title}</div>
                    <div className="text-xs text-[#1F2421]/60 truncate">
                      {c.lastMessage || "No messages yet"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conversation */}
        <section className="col-span-12 md:col-span-8 rounded-2xl border border-[#1F2421]/10 bg-[#FCFBF9] shadow-sm flex flex-col overflow-hidden">
          {/* Header now ONLY shows the name (back button moved above) */}
          <div className="px-4 py-3 border-b bg-gradient-to-r from-[#00897B] to-[#004D40] text-white">
            <span className="font-semibold truncate">{headerName}</span>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-sm text-[#1F2421]/60">Say hello 👋</div>
            ) : (
              messages.map((m) => (
                <div key={m._id} className={`flex ${isMe(m.sender?._id) ? "justify-end" : ""}`}>
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow ${
                      isMe(m.sender?._id)
                        ? "bg-gradient-to-r from-[#00897B] to-[#004D40] text-white"
                        : "bg-white border border-[#1F2421]/10 text-[#1F2421]"
                    }`}
                  >
                    <div>{m.text}</div>
                    <div className="text-[10px] opacity-70 mt-1">
                      {new Date(m.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-3 py-3 border-t bg-white/70">
            <div className="flex gap-2">
              <input
                className="flex-1 border border-[#1F2421]/20 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#00897B]"
                placeholder="Type a message…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                className="px-4 py-2 rounded-xl text-white bg-gradient-to-r from-[#00897B] to-[#004D40] hover:brightness-110"
                onClick={send}
              >
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
