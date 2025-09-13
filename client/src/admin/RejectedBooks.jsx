// client/src/admin/RejectedBooks.jsx
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import {
  Search,
  CheckCircle2,
  XCircle,
  User,
  CalendarDays,
  ImageOff,
  Clock,
  Info,
  Loader2,
} from "lucide-react";

export default function RejectedBooks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [acting, setActing] = useState(""); // "<id>:approved"

  async function load() {
    try {
      setLoading(true);
      const data = await api.get("/books/admin/rejected");
      setRows(Array.isArray(data?.docs) ? data.docs : []);
      setErr("");
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    try {
      setActing(`${id}:approved`);
      await api.patch(`/books/admin/${id}/status`, { status: "accepted" });
      // Optimistic: remove updated item
      setRows((prev) => prev.filter((b) => b._id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (e) {
      alert(e?.response?.data?.error || e.message || "Action failed");
      load();
    } finally {
      setActing("");
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((b) => {
      return (
        b?.title?.toLowerCase().includes(needle) ||
        b?.author?.toLowerCase().includes(needle) ||
        b?.type?.toLowerCase().includes(needle) ||
        b?.owner?.firstName?.toLowerCase().includes(needle) ||
        b?.owner?.lastName?.toLowerCase().includes(needle) ||
        b?.owner?.email?.toLowerCase().includes(needle)
      );
    });
  }, [rows, q]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading rejected books…
      </div>
    );
  }
  if (err)
    return (
      <div className="text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
        {err}
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Rejected Books</h1>
          <p className="text-sm text-slate-500">
            Items previously rejected. You can approve any to re-publish.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title, author, owner…"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((b) => {
          const busyApprove = acting === `${b._id}:approved`;
          const isOpen = expandedId === b._id;

          return (
            <div
              key={b._id}
              className="group relative rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
            >
              {/* subtle accent rail (reddish for rejected) */}
              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-rose-400 to-orange-400" />

              {/* Row summary */}
              <div className="flex gap-4 p-4 pl-5">
                <Cover src={b?.coverUrl} title={b?.title} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate">
                        {b?.title || "Untitled"}
                      </div>
                      <div className="text-sm text-slate-600 truncate">
                        {b?.author || "Unknown author"}
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-rose-100 text-rose-700 text-xs font-medium px-2.5 py-1">
                      Rejected
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {b?.type && <Pill>{b.type}</Pill>}
                    <IconText icon={<User className="w-3.5 h-3.5" />}>
                      {ownerName(b)}
                    </IconText>
                    {b?.createdAt && (
                      <IconText icon={<CalendarDays className="w-3.5 h-3.5" />}>
                        {formatDate(b.createdAt)}
                      </IconText>
                    )}
                    {b?.updatedAt && (
                      <IconText icon={<Clock className="w-3.5 h-3.5" />}>
                        Updated {timeAgo(b.updatedAt)}
                      </IconText>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() =>
                        setExpandedId((id) => (id === b._id ? null : b._id))
                      }
                      className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      {isOpen ? "Hide details" : "View details"}
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => approve(b._id)}
                        disabled={busyApprove}
                        className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {busyApprove ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="border-t border-slate-200">
                  <div className="p-4 grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">
                        Description
                      </h3>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">
                        {b?.description || "—"}
                      </p>

                      {b?.rejectionReason && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold text-slate-700 mb-1">
                            Rejection reason
                          </h4>
                          <p className="text-sm text-slate-700 whitespace-pre-wrap">
                            {b.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Field label="Owner">
                        {ownerName(b)}
                        {b?.owner?.email && (
                          <>
                            {" "}
                            ·{" "}
                            <a
                              href={`mailto:${b.owner.email}`}
                              className="text-violet-600 underline"
                            >
                              {b.owner.email}
                            </a>
                          </>
                        )}
                      </Field>
                      {b?.availability && (
                        <Field label="Availability">{b.availability}</Field>
                      )}
                      {b?.createdAt && (
                        <Field label="Submitted">
                          {formatDate(b.createdAt)} · {timeAgo(b.createdAt)} ago
                        </Field>
                      )}
                      {b?.updatedAt && (
                        <Field label="Last update">{timeAgo(b.updatedAt)} ago</Field>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-4">
                    <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <Info className="w-4 h-4 mt-0.5" />
                      <p>
                        Approving will move this book to the public catalogue. You
                        can change its status later from the book details page.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && <EmptyState query={q} emptyLabel="No rejected books right now." />}
      </div>
    </div>
  );
}

/* -------------------------- small UI bits -------------------------- */

function Cover({ src, title }) {
  return (
    <div className="w-24 h-28 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 ring-1 ring-slate-200">
      {src ? (
        <img src={src} alt={title} className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="flex items-center gap-2 text-slate-400">
          <ImageOff className="w-4 h-4" />
          <span className="text-xs">No cover</span>
        </div>
      )}
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100">
      {children}
    </span>
  );
}

function IconText({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
      {icon}
      {children}
    </span>
  );
}

function Field({ label, children }) {
  return (
    <div className="text-sm">
      <span className="text-slate-500 mr-2">{label}:</span>
      <span className="text-slate-800">{children}</span>
    </div>
  );
}

function EmptyState({ query, emptyLabel = "Nothing here." }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
        <Search className="w-5 h-5 text-slate-500" />
      </div>
      <div className="text-slate-900 font-medium">No results</div>
      <div className="text-slate-500 text-sm mt-1">
        {query ? <>We couldn’t find anything matching “{query}”.</> : <>{emptyLabel} 🎉</>}
      </div>
    </div>
  );
}

/* ------------------------------ utils ------------------------------ */

function ownerName(b) {
  if (!b?.owner) return "Unknown owner";
  const full = `${b.owner.firstName || ""} ${b.owner.lastName || ""}`.trim();
  return full || b.owner.email || "Unknown owner";
}

function formatDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function timeAgo(iso) {
  try {
    const now = Date.now();
    const t = new Date(iso).getTime();
    const diff = Math.max(0, now - t);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w`;
  } catch {
    return "";
  }
}
