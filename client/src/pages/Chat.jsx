import React, { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

export default function ChatPage() {
    const [convos, setConvos] = useState([]);
    const [activeId, setActiveId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [newUserId, setNewUserId] = useState("");
    const listRef = useRef(null);
    const socketRef = useRef(null);

    // connect socket + listeners
    useEffect(() => {
        socketRef.current = getSocket();

        socketRef.current.on("message:new", ({ message }) => {
            if (String(message.conversation) === String(activeId)) {
                setMessages((prev) => [...prev, message]);
                scrollBottomSoon();
            }
            setConvos((prev) =>
                prev.map((c) =>
                    String(c._id) === String(message.conversation)
                        ? { ...c, lastMessage: message.text, updatedAt: new Date().toISOString() }
                        : c
                )
            );
        });

        return () => {
            socketRef.current?.off("message:new");
        };
    }, [activeId]);

    // load inbox
    useEffect(() => {
        (async () => {
            try {
                const res = await api.get("/chats");
                const list = res?.data?.conversations || [];
                setConvos(list);
                if (list.length && !activeId) setActiveId(list[0]._id);
            } catch (err) {
                console.error("[/chats] load failed:", err?.response?.data || err?.message);
                setConvos([]);
            }
        })();
    }, []);


    // when active changes → load msgs + join room
    useEffect(() => {
        if (!activeId) return;
        (async () => {
            const { data } = await api.get(`/chats/${activeId}/messages`);
            setMessages(data.messages || []);
            scrollBottomSoon();
            socketRef.current?.emit("conversation:join", activeId);
            socketRef.current?.emit("conversation:read", { conversationId: activeId });
        })();
        return () => {
            socketRef.current?.emit("conversation:leave", activeId);
        };
    }, [activeId]);

    function scrollBottomSoon() {
        setTimeout(() => {
            listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
        }, 0);
    }

    function isMe(id) {
        const me = localStorage.getItem("ptb_user_id");
        return String(me) === String(id);
    }

    function send() {
        const t = text.trim();
        if (!t) return;
        setText("");

        socketRef.current?.emit("message:send", { conversationId: activeId, text: t }, (res) => {
            if (!res?.ok) {
                // fallback REST
                api.post(`/chats/${activeId}/messages`, { text: t })
                    .then(({ data }) => setMessages((prev) => [...prev, data.message]));
            }
        });
    }

    async function startNewChat() {
        const id = newUserId.trim();
        if (!id) return;
        const { data } = await api.post("/chats/start", { participantId: id });
        const convo = data.conversation;
        // ইনবক্সে না থাকলে যোগ করো
        setConvos((prev) => {
            const exists = prev.find((c) => String(c._id) === String(convo._id));
            return exists ? prev : [convo, ...prev];
        });
        setActiveId(convo._id);
        setNewUserId("");
    }

    return (
        <div className="h-[calc(100vh-80px)] grid grid-cols-12 gap-4 p-4">
            {/* Left: Inbox */}
            <div className="col-span-4 border rounded-2xl overflow-hidden bg-white">
                <div className="p-3 border-b flex items-center justify-between">
                    <div className="font-semibold">Chats</div>
                </div>

                <div className="p-3 border-b flex gap-2">
                    <input
                        className="flex-1 border rounded-xl px-3 py-2"
                        placeholder="Other user ID…"
                        value={newUserId}
                        onChange={(e) => setNewUserId(e.target.value)}
                    />
                    <button className="px-3 py-2 rounded-xl bg-green-600 text-white" onClick={startNewChat}>
                        Start
                    </button>
                </div>

                <div className="divide-y max-h-full overflow-y-auto">
                    {convos.map((c) => (
                        <button
                            key={c._id}
                            className={`w-full text-left p-3 hover:bg-gray-50 ${activeId === c._id ? "bg-gray-100" : ""}`}
                            onClick={() => setActiveId(c._id)}
                        >
                            <div className="text-sm font-medium">
                                {(c.participants || []).map((p) => p.firstName).join(", ")}
                            </div>
                            <div className="text-xs text-gray-500 truncate">{c.lastMessage || "…"}</div>
                        </button>
                    ))}
                    {!convos.length && <div className="p-4 text-sm text-gray-500">No conversations yet</div>}
                </div>
            </div>

            {/* Right: Messages */}
            <div className="col-span-8 border rounded-2xl flex flex-col bg-white">
                <div className="p-3 border-b font-semibold">Conversation</div>

                <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2">
                    {messages.map((m) => (
                        <div key={m._id} className="flex">
                            <div
                                className={`max-w-[70%] p-2 rounded-xl text-sm ${isMe(m.sender?._id) ? "ml-auto bg-green-100" : "bg-gray-100"
                                    }`}
                            >
                                {m.text}
                                <div className="text-[10px] text-gray-500 mt-1">
                                    {new Date(m.createdAt).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                    {!messages.length && <div className="text-sm text-gray-500">Say hello 👋</div>}
                </div>

                <div className="p-3 border-t flex gap-2">
                    <input
                        className="flex-1 border rounded-xl px-3 py-2 outline-none"
                        placeholder="Type a message…"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && send()}
                    />
                    <button className="px-4 py-2 rounded-xl bg-green-600 text-white" onClick={send}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
