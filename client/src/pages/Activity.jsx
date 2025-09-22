import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  XCircle,
  Calendar,
  Filter,
  Search,
} from "lucide-react";


export default function Activity() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState(null);
  const [items, setItems] = useState([]);

  const [tab, setTab] = useState("all"); // all | outgoing | incoming
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | pending | accepted | rejected | completed
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        // Who am I
        const meRes = await api.get("/auth/me");
        const meVal = meRes?.user || meRes || null;
        if (!mounted) return;
        setMe(meVal);

        const myId = String(meVal?._id || meVal?.id || "");
        if (!myId) {
          setItems([]);
          setError("");
          return;
        }

        // 1) Try the global endpoint first
        let results = [];
        try {
          const rMine = await api.get("/transactions/mine");
          results = rMine?.transactions || rMine || [];
        } catch {
          // 2) Fallback to sender/owner filters if /mine not available
          const partial = [];

          try {
            const r1 = await api.get(`/transactions?sender=${myId}`);
            partial.push(...(r1?.transactions || r1 || []));
          } catch {}

          try {
            const r2 = await api.get(`/transactions?owner=${myId}`);
            partial.push(...(r2?.transactions || r2 || []));
          } catch {}

          // 3) Last resort: fetch all and filter client-side (if API allows)
          if (partial.length === 0) {
            try {
              const rAll = await api.get(`/transactions`);
              const list = rAll?.transactions || rAll || [];
              const arr = Array.isArray(list) ? list : [];
              results = arr.filter((t) => {
                const sId = String(t?.sender?._id || t?.sender || "");
                const oId = String(t?.receiver?._id || t?.receiver || t?.book?.owner?._id || t?.book?.owner || "");
                return sId === myId || oId === myId;
              });
            } catch (e) {
              throw new Error(
                "The server rejected list queries. Implement /transactions/mine or support ?sender and ?owner filters."
              );
            }
          } else {
            results = partial;
          }
        }

        // normalize + dedupe
        const normalized = (Array.isArray(results) ? results : [])
          .filter(Boolean)
          .map((t) => ({
            ...t,
            _id: t._id || t.id,
            _senderId: t?.sender?._id || t?.sender,
            // prefer explicit receiver; fallback to book.owner
            _ownerId: t?.receiver?._id || t?.receiver || t?.book?.owner?._id || t?.book?.owner,
            _bookId: t?.book?._id || t?.book,
            _bookTitle: t?.book?.title || t?.book_title || "Untitled",
            _when: t?.updatedAt || t?.createdAt || null,
            status: String(t?.status || "").toLowerCase(),
          }))
          .filter((t) => t._id);

        const unique = Array.from(new Map(normalized.map((t) => [t._id, t])).values());
        setItems(unique);
        setError("");
      } catch (e) {
        setItems([]);
        setError(e?.message || "Failed to load activity");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const meId = me?._id || me?.id || null;

  const filtered = useMemo(() => {
    let arr = items;

    if (tab === "outgoing") arr = arr.filter((t) => String(t._senderId) === String(meId));
    if (tab === "incoming") arr = arr.filter((t) => String(t._ownerId) === String(meId));

    if (status !== "all") arr = arr.filter((t) => (t.status || "").toLowerCase() === status);

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      arr = arr.filter((t) => {
        const who = `${t?.sender?.firstName || ""} ${t?.sender?.lastName || ""}`.toLowerCase();
        const book = (t._bookTitle || "").toLowerCase();
        return who.includes(needle) || book.includes(needle);
      });
    }

    // sort by latest activity
    arr = [...arr].sort((a, b) => new Date(b._when || 0) - new Date(a._when || 0));
    return arr;
  }, [items, tab, status, q, meId]);

  function fmtDate(s) {
    if (!s) return "";
    try {
      const d = new Date(s);
      return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return String(s);
    }
  }

  async function refreshAfterChange(myId) {
    try {
      const rMine = await api.get("/transactions/mine").catch(() => null);
      if (rMine) {
        const list = rMine?.transactions || rMine || [];
        const normalized = (Array.isArray(list) ? list : []).map((t) => ({
          ...t,
          _id: t._id || t.id,
          _senderId: t?.sender?._id || t?.sender,
          _ownerId: t?.receiver?._id || t?.receiver || t?.book?.owner?._id || t?.book?.owner,
          _bookId: t?.book?._id || t?.book,
          _bookTitle: t?.book?.title || t?.book_title || "Untitled",
          _when: t?.updatedAt || t?.createdAt || null,
          status: String(t?.status || "").toLowerCase(),
        }));
        setItems(Array.from(new Map(normalized.map((t) => [t._id, t])).values()));
        return;
      }

      // fallback refresh using sender/owner
      const [incoming, outgoing] = await Promise.allSettled([
        api.get(`/transactions?owner=${myId}`),
        api.get(`/transactions?sender=${myId}`),
      ]);

      const merged = [
        ...(incoming.status === "fulfilled" ? incoming.value?.transactions || incoming.value || [] : []),
        ...(outgoing.status === "fulfilled" ? outgoing.value?.transactions || outgoing.value || [] : []),
      ];

      const normalized = merged.map((t) => ({
        ...t,
        _id: t._id || t.id,
        _senderId: t?.sender?._id || t?.sender,
        _ownerId: t?.receiver?._id || t?.receiver || t?.book?.owner?._id || t?.book?.owner,
        _bookId: t?.book?._id || t?.book,
        _bookTitle: t?.book?.title || t?.book_title || "Untitled",
        _when: t?.updatedAt || t?.createdAt || null,
        status: String(t?.status || "").toLowerCase(),
      }));

      setItems(Array.from(new Map(normalized.map((t) => [t._id, t])).values()));
    } catch {
      // swallow; UI already updated by optimistic state
    }
  }

  async function accept(txId) {
    setBusyId(txId);
    try {
      await api.patch(`/transactions/${txId}/accept`);
      await refreshAfterChange(meId);
    } catch (e) {
      alert(e?.message || "Failed to accept request");
    } finally {
      setBusyId("");
    }
  }

  async function reject(txId) {
    setBusyId(txId);
    try {
      // prefer dedicated endpoint; fallback to generic patch
      try {
        await api.patch(`/transactions/${txId}/reject`);
      } catch {
        await api.patch(`/transactions/${txId}`, { status: "rejected" });
      }
      await refreshAfterChange(meId);
    } catch (e) {
      alert(e?.message || "Failed to decline request");
    } finally {
      setBusyId("");
    }
  }

  const Empty = ({ title, subtitle }) => (
    <div className="text-center py-16">
      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <p className="text-gray-700 font-medium">{title}</p>
      {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5EE]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b border-indigo-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-white shadow-sm hover:shadow"
          >
            <ArrowLeft size={18} />
            <span className="font-medium">Back</span>
          </button>
          <div className="text-sm text-gray-600">{filtered.length} activities</div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg shadow-indigo-100/50 ring-1 ring-indigo-100 p-4 md:p-5">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="inline-flex rounded-xl border border-gray-200 overflow-hidden">
              {[
                { id: "all", label: "All" },
                { id: "outgoing", label: "Outgoing" },
                { id: "incoming", label: "Incoming" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-3 md:px-4 py-2 text-sm font-medium transition ${
                    tab === t.id ? "bg-indigo-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-0 md:ml-auto w-full md:w-auto">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by book or user…"
                  className="w-full md:w-72 pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-gray-200 bg-white text-gray-700"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
                <Filter className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <div className="grid gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 rounded-2xl bg-white border border-gray-200 animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-red-100 p-6 text-red-600">{error}</div>
          ) : filtered.length === 0 ? (
            <Empty title="No activity yet" subtitle="Requests you send or receive will appear here." />
          ) : (
            <ul className="space-y-4">
              {filtered.map((t) => {
                const isOutgoing = String(t._senderId) === String(meId);
                const isIncoming = String(t._ownerId) === String(meId);
                const canRespond = isIncoming && (t.status || "pending") === "pending";

                return (
                  <li key={t._id} className="bg-white rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm">
                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                      {/* status dot */}
                      <span
                        className={`h-3 w-3 rounded-full ${
                          t.status === "accepted"
                            ? "bg-emerald-500"
                            : t.status === "rejected"
                            ? "bg-rose-500"
                            : t.status === "completed"
                            ? "bg-sky-500"
                            : "bg-amber-400"
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 truncate">
                          {isOutgoing ? "You requested" : "Request for"}{" "}
                          <span className="truncate">{t._bookTitle}</span>
                        </div>
                        <div className="text-sm text-gray-600 truncate">
                          {isOutgoing ? (
                            <>to {t?.receiver?.firstName || t?.book?.owner?.firstName} {t?.receiver?.lastName || t?.book?.owner?.lastName}</>
                          ) : (
                            <>from {t?.sender?.firstName} {t?.sender?.lastName}</>
                          )}
                          {t._when && <span className="ml-2 text-gray-400">• {fmtDate(t._when)}</span>}
                        </div>
                      </div>

                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                          (t.status || "pending") === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : (t.status || "pending") === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : (t.status || "pending") === "completed"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {t.status || "pending"}
                      </div>

                      <div className="flex items-center gap-2 ml-auto">
                        <Link
                          to={`/book/${t._bookId}`}
                          className="inline-flex items-center px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          View book
                        </Link>
                        <Link
                          to={`/chat?to=${isOutgoing ? t._ownerId : t._senderId}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          <MessageCircle className="w-4 h-4" /> Chat
                        </Link>
                        {canRespond && (
                          <>
                            <button
                              onClick={() => accept(t._id)}
                              disabled={!!busyId}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Accept
                            </button>
                            <button
                              onClick={() => reject(t._id)}
                              disabled={!!busyId}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-60"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
