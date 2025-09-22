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
  Star,
  BookOpen,
  Calendar,
  Share2,
  Copy,
  Info,
} from "lucide-react";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("overview");

  // transactions related UI
  const [txs, setTxs] = useState([]);
  const [sending, setSending] = useState(false);
  const [acceptingId, setAcceptingId] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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

        if (b) {
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
        setErr("");
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
      const tr = await api.get(`/transactions?book_id=${id}`);
      setTxs(tr?.transactions || tr || []);
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

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  // -------- Helper UI --------
  const StatusPill = ({ label }) => (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
      <span className={`h-2 w-2 rounded-full ${label === "available" ? "bg-emerald-500" : "bg-amber-500"}`} />
      {label}
    </span>
  );

  const Field = ({ title, value }) => (
    <div className="rounded-xl bg-white border border-gray-200 p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
      <div className="mt-1 font-semibold text-gray-900 break-words">{value || "—"}</div>
    </div>
  );

  const RequestCTA = () => {
    const reviewStatus = (book?.status || "").toLowerCase();
    const availability = (book?.availability || "").toLowerCase();

    if (!meId) {
      return (
        <button
          onClick={() => navigate(`/login?redirect=/books/${id}`)}
          className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-semibold shadow hover:shadow-md"
        >
          <span>Login to Request</span>
          <ArrowRight className="ml-2" size={18} />
        </button>
      );
    }

    if (meId && !isViewerOwner && reviewStatus === "accepted") {
      if (!myTx && availability === "available") {
        return (
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={sending}
            className="w-full inline-flex items-center justify-center px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow hover:shadow-md disabled:opacity-60"
          >
            <span>{sending ? "Sending Request…" : "Request to Borrow"}</span>
            <Send className="ml-2" size={18} />
          </button>
        );
      }
      if (myTx?.status === "pending") {
        return (
          <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 font-medium">
            <Clock size={18} /> Request Pending
          </div>
        );
      }
      if (myTx?.status === "accepted") {
        return (
          <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            <CheckCircle2 size={18} /> Request Accepted
          </div>
        );
      }
    }

    return null;
  };

  // -------- Render States --------
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EE]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
          <div className="h-10 w-40 rounded-full bg-gray-200 animate-pulse" />
          <div className="grid lg:grid-cols-5 gap-8 mt-8">
            <div className="lg:col-span-2">
              <div className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse" />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <div className="h-10 w-2/3 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-6 w-1/3 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-48 w-full bg-gray-200 rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] grid place-items-center px-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-red-100 shadow-md p-8 max-w-md text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 text-red-500 grid place-items-center mb-4">⚠</div>
          <p className="text-red-600 font-medium">{err}</p>
          <button onClick={back} className="mt-6 inline-flex items-center gap-2 text-indigo-700 hover:underline">
            <ArrowLeft size={16} /> Go back
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#F7F5EE] grid place-items-center px-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 shadow p-8 text-center max-w-md">
          <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700">Book not found.</p>
          <button onClick={back} className="mt-6 inline-flex items-center gap-2 text-indigo-700 hover:underline">
            <ArrowLeft size={16} /> Go home
          </button>
        </div>
      </div>
    );
  }

  // derived display values
  const title = book.title || "Untitled";
  const author = book.author || "Unknown";
  const genre =
    typeof book.genre === "string"
      ? book.genre
      : Array.isArray(book.genre)
      ? book.genre.join(", ")
      : "—";
  const description = book.description || "No description provided.";
  const reviewStatus = (book.status || "").toLowerCase();
  const availability = (book.availability || "").toLowerCase();
  const type = (book.type || "").toLowerCase();
  const condition = (book.condition || "").replace("_", " ");

  const ownerName =
    book?.owner?.firstName || book?.owner?.lastName
      ? `${book.owner.firstName || ""} ${book.owner.lastName || ""}`.trim()
      : "Unknown Owner";
  const ownerEmail = book?.owner?.email || "";

  return (
    <div className="min-h-screen bg-[#F7F5EE]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={back}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-white shadow-sm hover:shadow"
            >
              <ArrowLeft size={18} />
              <span className="font-medium">Back</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyLink}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white shadow-sm"
              title="Copy link"
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              <span className="text-sm">{copied ? "Copied" : "Copy link"}</span>
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator
                    .share({ title, text: `${title} — ${author}`, url: window.location.href })
                    .catch(() => {});
                } else {
                  copyLink();
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white shadow-sm"
              title="Share"
            >
              <Share2 size={16} />
              <span className="text-sm hidden sm:inline">Share</span>
            </button>
            <div className="hidden md:flex items-center gap-2">
              <StatusPill label={availability || "available"} />
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-sm">
                {txs.length} requests
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Cover + summary */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl overflow-hidden shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100 bg-white">
              <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white border-r border-gray-100">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                    {cover ? (
                      <img src={cover} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <ImageOff className="mb-3" size={48} />
                        <span className="font-medium">No Cover</span>
                      </div>
                    )}
                  </div>
                  {/* badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {genre && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium">
                        <Star size={14} /> {genre}
                      </span>
                    )}
                    {type && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
                        <Info size={14} /> {type}
                      </span>
                    )}
                    {condition && (
                      <span className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium capitalize">
                        <Info size={14} /> {condition.replace("_", " ")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 md:p-10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">{title}</h1>
                      <p className="text-lg text-gray-600 mb-4">by {author}</p>
                    </div>
                  </div>

                  <p className="mt-2 text-gray-700 leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky actions */}
          <div className="lg:col-span-2 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Borrow this book</h3>
                <StatusPill label={availability || "available"} />
              </div>
              <RequestCTA />
              {meId && ownerId && !isViewerOwner && (
                <button
                  onClick={() => navigate(`/chat?to=${ownerId}`)}
                  className="w-full mt-3 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-50 font-medium"
                >
                  <MessageCircle size={18} /> Chat with owner
                </button>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-3">
                  <div className="text-gray-500">Requests</div>
                  <div className="text-gray-900 font-semibold">{txs.length}</div>
                </div>
              </div>
            </div>

            {/* Owner card */}
            <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white grid place-items-center">
                  <User2 size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{ownerName}</div>
                  {ownerEmail && <div className="text-sm text-gray-600">{ownerEmail}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100">
            <div className="border-b border-gray-200 px-4 md:px-6">
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "overview", label: "Overview", icon: BookOpen },
                  { id: "owner", label: "Owner", icon: User2 },
                  { id: "activity", label: "Activity", icon: MessageCircle },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`relative -mb-px px-4 py-3 text-sm md:text-base font-medium border-b-2 transition-colors ${
                      tab === t.id
                        ? "text-indigo-700 border-indigo-600"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      {React.createElement(t.icon, { size: 18 })}
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 md:p-8">
              {tab === "overview" && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Field title="Title" value={title} />
                  <Field title="Author" value={author} />
                  <Field title="Genre" value={genre} />
                  <Field title="Type" value={type} />
                  <Field title="Condition" value={condition} />
                  <Field title="Availability" value={availability} />
                </div>
              )}

              {tab === "owner" && (
                <div className="max-w-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white grid place-items-center">
                      <User2 size={22} />
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{ownerName}</div>
                      {ownerEmail && <div className="text-gray-600">{ownerEmail}</div>}
                    </div>
                  </div>
                  <p className="mt-4 text-gray-700">
                    This is the uploader/owner of the book. Use the chat to coordinate a pickup
                    or ask questions about the condition.
                  </p>
                </div>
              )}

              {tab === "activity" && (
                <div>
                  {!txs.length ? (
                    <div className="text-center py-10">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">No activity yet</p>
                      <p className="text-gray-400 text-sm">Requests will appear here as a timeline</p>
                    </div>
                  ) : (
                    <ol className="relative border-s border-gray-200">
                      {txs.map((t) => (
                        <li key={t._id} className="ms-6 py-4">
                          <span
                            className={`absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white ${
                              t.status === "pending"
                                ? "bg-amber-400"
                                : t.status === "accepted"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            }`}
                          />
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="font-semibold text-gray-900">
                                {t.sender?.firstName} {t.sender?.lastName}
                              </div>
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  t.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : t.status === "accepted"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {t.status}
                              </div>
                            </div>
                            {t.sender?.email && (
                              <div className="mt-1 text-sm text-gray-600">{t.sender.email}</div>
                            )}
                            {isViewerOwner && t.status === "pending" && availability === "available" && (
                              <div className="mt-3">
                                <button
                                  onClick={() => onAcceptRequest(t._id)}
                                  disabled={!!acceptingId}
                                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-60"
                                >
                                  {acceptingId === t._id ? "Accepting…" : "Accept"}
                                </button>
                                <Link
                                  to={`/chat?to=${t.sender?._id}`}
                                  className="ml-3 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-white hover:shadow-sm inline-flex items-center gap-2 font-medium"
                                >
                                  <MessageCircle size={16} /> Chat
                                </Link>
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom dock for mobile actions */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/90 backdrop-blur border-t border-gray-200 p-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          {meId && ownerId && !isViewerOwner && (
            <button
              onClick={() => navigate(`/chat?to=${ownerId}`)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-300 text-gray-800 bg-white"
            >
              <MessageCircle size={18} /> Chat
            </button>
          )}
          <div className="flex-[2]">
            <RequestCTA />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />

          {/* Panel */}
          <div className="relative w-full sm:w-[520px] mx-auto bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-6 sm:p-7 m-3">
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white grid place-items-center">
                <Send size={18} />
              </div>
              <div className="grow">
                <h2 className="text-lg font-semibold text-gray-900">Send borrow request?</h2>
                <p className="mt-1 text-sm text-gray-600">
                  You're about to request <span className="font-medium">{title}</span> from {ownerName}.
                  We'll notify the owner and show the request in Activity.
                </p>
                <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
                  <div className="flex flex-wrap gap-4">
                    <div><span className="text-gray-500">Book:</span> <span className="font-medium">{title}</span></div>
                    <div><span className="text-gray-500">Author:</span> <span className="font-medium">{author}</span></div>
                    <div className="capitalize"><span className="text-gray-500">Condition:</span> <span className="font-medium">{condition || "—"}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
              <button
                onClick={() => setConfirmOpen(false)}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-gray-300 text-gray-800 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await onSendRequest();
                  setConfirmOpen(false);
                }}
                disabled={sending}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium shadow hover:shadow-md disabled:opacity-60"
              >
                {sending ? "Sending…" : "Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="h-20" />
    </div>
  );
}
