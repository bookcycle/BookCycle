import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Send,
  Clock,
  CheckCircle2,
  MessageCircle,
  ImageOff,
  User2,
} from "lucide-react";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null);

  // transactions related UI
  const [txs, setTxs] = useState([]);
  const [sending, setSending] = useState(false);
  const [acceptingId, setAcceptingId] = useState("");

  const ownerId = useMemo(() => book?.owner?._id || book?.owner || null, [book]);
  const meId = useMemo(() => me?._id || me?.id || null, [me]);

  const isViewerOwner = useMemo(
    () => meId && ownerId && String(meId) === String(ownerId),
    [meId, ownerId]
  );

  const myTx = useMemo(
    () => txs.find((t) => String(t.sender?._id || t.sender) === String(meId)),
    [txs, meId]
  );

  const statusLabel = myTx?.status || null; // "pending" | "accepted" | "rejected"

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [bookRes, meRes] = await Promise.allSettled([
          api.get(`/books/${id}`),
          api.get(`/auth/me`),
        ]);

        if (!mounted) return;

        const b =
          bookRes.status === "fulfilled"
            ? (bookRes.value?.book || bookRes.value)
            : null;

        const meVal =
          meRes.status === "fulfilled"
            ? (meRes.value?.user || meRes.value)
            : null;

        setBook(b || null);
        setMe(meVal || null);
        setErr("");

        if (meVal && b) {
          // Load transactions for this user & book
          try {
            const tr = await api.get(`/transactions?book_id=${id}`);
            const list = tr?.transactions || tr || [];
            setTxs(Array.isArray(list) ? list : []);
          } catch {
            setTxs([]);
          }
        } else {
          setTxs([]);
        }
      } catch (e) {
        setErr(e?.message || "Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const cover =
    book?.coverUrl ||
    (book?.cover_image
      ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")}/storage/${book.cover_image}`
      : "");

  async function onSendRequest() {
    if (!meId) {
      navigate(`/login?redirect=/books/${id}`);
      return;
    }
    setSending(true);
    try {
      await api.post("/transactions", { book_id: id });
      // refresh my tx list
      const tr = await api.get(`/transactions?book_id=${id}`);
      setTxs(tr?.transactions || tr || []);
    } catch (e) {
      alert(e?.message || "Failed to send request");
    } finally {
      setSending(false);
    }
  }

  async function onAcceptRequest(txId) {
    setAcceptingId(txId);
    try {
      await api.patch(`/transactions/${txId}/accept`);
      // refresh list
      const tr = await api.get(`/transactions?book_id=${id}`);
      setTxs(tr?.transactions || tr || []);
      // after acceptance, backend may mark book unavailable.
      // reflect locally to hide request button for others.
      setBook((prev) => (prev ? { ...prev, availability: "unavailable" } : prev));
    } catch (e) {
      alert(e?.message || "Failed to accept request");
    } finally {
      setAcceptingId("");
    }
  }

  const back = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  if (loading) return <p className="p-6">Loading book details...</p>;
  if (err) return <p className="p-6 text-red-500">{err}</p>;
  if (!book) return <p className="p-6 text-red-500">Book not found.</p>;

  const title = book.title || "Untitled";
  const author = book.author || "Unknown";
  const genre =
    typeof book.genre === "string"
      ? book.genre
      : Array.isArray(book.genre)
      ? book.genre.join(", ")
      : "—";
  const description = book.description || "No description provided.";

  // keep internal fields for logic, but don't show them in UI
  const reviewStatus = (book.status || "").toLowerCase();      // pending | accepted | rejected
  const availability = (book.availability || "").toLowerCase(); // available | unavailable

  const ownerName =
    book?.owner?.firstName || book?.owner?.lastName
      ? `${book.owner.firstName || ""} ${book.owner.lastName || ""}`.trim()
      : "Unknown Owner";
  const ownerEmail = book?.owner?.email || "";

  return (
    <div className="min-h-screen mt-8 relative">
      <div className="max-w-[1050px] mx-auto w-full px-4 mb-4">
        <button
          onClick={back}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-10 px-4 md:px-0 max-w-[1050px] mx-auto">
        <div className="w-full md:w-72 shrink-0">
          <div className="w-full aspect-[3/4] bg-[#f0eee2] rounded-xl flex items-center justify-center shadow-sm">
            {cover ? (
              <img src={cover} alt={title} className="object-cover rounded-lg w-full h-full" />
            ) : (
              <div className="flex flex-col items-center text-gray-500">
                <ImageOff className="mb-2" />
                <span>No image</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <h1 className="font-bold text-gray-900 text-3xl md:text-4xl">{title}</h1>
          <p className="text-xl text-gray-600 mt-1">By {author}</p>

          {/* genre only (review & availability removed from UI) */}
          {genre && (
            <div className="mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full border text-sm">
                Genre: {genre}
              </span>
            </div>
          )}

          {/* Uploader */}
          <div className="mt-6 p-4 rounded-lg border bg-white/70">
            <div className="flex items-center gap-3">
              <User2 className="text-gray-600" />
              <div>
                <div className="font-semibold text-gray-900">Uploaded by: {ownerName}</div>
                {ownerEmail && <div className="text-sm text-gray-600">{ownerEmail}</div>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{description}</p>
          </div>

          {/* Actions */}
          <div className="mt-8">
            {!meId && (
              <button
                onClick={() => navigate(`/login?redirect=/books/${id}`)}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-sky-600 transition-colors"
              >
                <span>Login to request</span>
                <ArrowRight className="ml-2" size={18} />
              </button>
            )}

            {meId && !isViewerOwner && reviewStatus === "accepted" && (
              <div className="flex flex-col gap-3 max-w-sm">
                {!myTx && availability === "available" && (
                  <button
                    onClick={onSendRequest}
                    disabled={sending}
                    className="inline-flex items-center justify-center px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                  >
                    <span>{sending ? "Sending..." : "Request to Borrow"}</span>
                    <Send className="ml-2" size={18} />
                  </button>
                )}

                {myTx && myTx.status === "pending" && (
                  <button
                    disabled
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
                  >
                    <span>Request Pending</span>
                    <Clock className="ml-2" size={18} />
                  </button>
                )}

                {myTx && myTx.status === "accepted" && (
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                    <CheckCircle2 size={18} />
                    Accepted
                  </div>
                )}
              </div>
            )}

            {/* Owner view: see and accept pending requests */}
            {meId && isViewerOwner && (
              <div className="mt-8">
                <h3 className="font-semibold mb-3">Requests</h3>
                {txs.length === 0 && (
                  <div className="text-sm text-gray-600">No requests yet.</div>
                )}
                <div className="space-y-3">
                  {txs.map((t) => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white/70"
                    >
                      <div className="text-sm">
                        <div className="font-medium">
                          {t.sender?.firstName} {t.sender?.lastName}
                        </div>
                        <div className="text-gray-600">{t.sender?.email}</div>
                        <div className="text-xs mt-1">Status: {t.status}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {t.status === "pending" && availability === "available" && (
                          <button
                            onClick={() => onAcceptRequest(t._id)}
                            disabled={!!acceptingId}
                            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
                          >
                            {acceptingId === t._id ? "Accepting..." : "Accept"}
                          </button>
                        )}
                        <Link
                          to={`/chat?to=${t.sender?._id}`}
                          className="px-4 py-2 rounded-md border hover:bg-gray-50 inline-flex items-center gap-2"
                        >
                          <MessageCircle size={16} />
                          Chat
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                {availability === "unavailable" && (
                  <div className="mt-3 text-sm text-emerald-700">
                    This book is now unavailable (an accepted request exists).
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating chat shortcut for non-owners */}
      {meId && ownerId && !isViewerOwner && (
        <button
          onClick={() => navigate(`/chat?to=${ownerId}`)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-gray-900 text-white hover:bg-sky-600 transition group"
          aria-label="Chat with owner"
          title="Open chat with the owner"
        >
          <MessageCircle size={22} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded">
            Chat with owner
          </span>
        </button>
      )}
    </div>
  );
}
