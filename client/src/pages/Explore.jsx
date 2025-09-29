import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import {
  Search,
  Star,
  ImageOff,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid,
  List,
} from "lucide-react";

const CATEGORIES = [
  "Mythology",
  "Fantasy",
  "Romance",
  "Science Fiction",
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Thriller",
];

export default function Explore() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const initialQ = (sp.get("q") || "").trim();
  const [q, setQ] = useState(initialQ);
  const qDebounced = useDebounced(q, 300);

  const [genre, setGenre] = useState("");
  const [sort, setSort] = useState("latest");
  const [view, setView] = useState("grid");

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 20;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");

  const loadMoreRef = useRef(null);

  async function fetchBooks({ reset } = { reset: false }) {
    const params = {
      page: reset ? 1 : page + 1,
      limit,
      sort,
    };
    if (qDebounced) params.q = qDebounced;
    if (genre) params.genre = genre;

    try {
      if (reset) {
        setLoading(true);
        setErr("");
      } else {
        setLoadingMore(true);
      }

      const data = await api.get("/books", { params });
      const docs = Array.isArray(data?.docs) ? data.docs : [];

      if (reset) {
        setItems(docs);
        setTotal(Number(data?.total || docs.length));
        setPage(1);
      } else {
        setItems((prev) => [...prev, ...docs]);
        setTotal(Number(data?.total || total));
        setPage((p) => p + 1);
      }
    } catch (e) {
      setErr(e?.message || "Failed to load books");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    fetchBooks({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, genre, sort]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !loading && !loadingMore && items.length < total) {
            fetchBooks({ reset: false });
          }
        });
      },
      { rootMargin: "500px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, total, loading, loadingMore]);

  const inputRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/") {
        const tag = e.target?.tagName?.toLowerCase();
        if (tag !== "input" && tag !== "textarea") {
          e.preventDefault();
          inputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hasMore = items.length < total;

  const dynamicGenres = useMemo(() => {
    const set = new Set(items.map((b) => b?.genre).filter(Boolean));
    const extra = Array.from(set).filter((g) => !CATEGORIES.includes(g));
    return ["All", ...CATEGORIES, ...extra];
  }, [items]);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}>
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(20rem 20rem at 10% 10%, #EAE4D2 0%, transparent 60%), radial-gradient(24rem 24rem at 90% 0%, #E2D9C3 0%, transparent 60%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-12 pb-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl sm:text-5xl font-serif tracking-tight text-[#1F2421]">Share, Discover & Trade Books</h1>
            <p className="mt-3 max-w-2xl text-sm sm:text-base text-[#3c423d]/80">
              A cozy marketplace for readers. Find your next read or pass along a favorite.
            </p>

            {/* Search bar */}
            <div className="mt-6 w-full max-w-3xl">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#1F2421]/50" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchBooks({ reset: true });
                  }}
                  placeholder="Search by title"
                  className="w-full rounded-2xl border border-[#E8E4DC] bg-white/80 px-12 py-4 text-[#1F2421] shadow-sm outline-none transition-all focus:ring-4 focus:ring-[#B8B09C]/30 backdrop-blur-sm"
                />
                <button
                  onClick={() => fetchBooks({ reset: true })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4 py-2 text-sm font-medium text-[#F7F5F2] bg-[#1F2421] hover:opacity-90 active:opacity-80"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 pb-14">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left rail */}
          <aside className="lg:col-span-3">
            <div className="space-y-6 lg:sticky lg:top-6">
              <Panel title="Filters" icon={<SlidersHorizontal className="h-4 w-4" />}>
                <div className="flex flex-wrap gap-2">
                  {dynamicGenres.map((g) => (
                    <Chip
                      key={g}
                      label={g}
                      active={genre === (g === "All" ? "" : g)}
                      onClick={() => setGenre(g === "All" ? "" : g)}
                    />
                  ))}
                </div>
              </Panel>

              <Panel title="Sort & View" icon={<ChevronDown className="h-4 w-4" />}>
                <div className="flex items-center justify-between gap-3">
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="appearance-none rounded-xl border border-[#E8E4DC] bg-white/80 px-3 py-2 pr-8 text-sm text-[#1F2421]"
                    >
                      <option value="latest">Latest</option>
                      <option value="rating">Top Rated</option>
                      <option value="title">Title (A–Z)</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#1F2421]/50" />
                  </div>

                  <div className="flex items-center gap-1 rounded-xl border border-[#E8E4DC] bg-white/80 p-1">
                    <button
                      onClick={() => setView("grid")}
                      className={`rounded-lg p-2 ${view === "grid" ? "bg-[#1F2421] text-[#F7F5F2]" : "text-[#1F2421]/70"}`}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`rounded-lg p-2 ${view === "list" ? "bg-[#1F2421] text-[#F7F5F2]" : "text-[#1F2421]/70"}`}
                      aria-label="List view"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Panel>

              <Panel title="Stats">
                <div className="grid grid-cols-3 gap-3 text-center text-sm text-[#1F2421]">
                  <div className="rounded-xl border border-[#E8E4DC] bg-white/70 p-3">
                    <div className="text-lg font-semibold">{total}</div>
                    <div className="text-xs text-[#1F2421]/60">Results</div>
                  </div>
                  <div className="rounded-xl border border-[#E8E4DC] bg-white/70 p-3">
                    <div className="text-lg font-semibold">{genre ? 1 : dynamicGenres.length - 1}</div>
                    <div className="text-xs text-[#1F2421]/60">Categories</div>
                  </div>
                  <div className="rounded-xl border border-[#E8E4DC] bg-white/70 p-3">
                    <div className="text-lg font-semibold">{view === "grid" ? 20 : 10}</div>
                    <div className="text-xs text-[#1F2421]/60">Per page</div>
                  </div>
                </div>
              </Panel>
            </div>
          </aside>

          {/* Results */}
          <main className="lg:col-span-9">
            <header className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-widest text-[#1F2421]/70">LATEST</h2>
                {qDebounced && (
                  <p className="mt-1 text-sm text-[#1F2421]/60">
                    Showing results for <span className="font-medium text-[#1F2421]">“{qDebounced}”</span>
                  </p>
                )}
              </div>
              {loading && (
                <div className="flex items-center gap-2 text-sm text-[#1F2421]/60">
                  <Loader2 className="h-4 w-4 animate-spin" /> Updating…
                </div>
              )}
            </header>

            {err && (
              <div className="mb-4 rounded-xl border border-[#F5E0A3] bg-[#FFF8E6] px-4 py-3 text-[#7A5E1A]">{err}</div>
            )}

            {loading && items.length === 0 ? (
              <CardSkeletonGrid view={view} />
            ) : items.length === 0 ? (
              <EmptyState
                onReset={() => {
                  setQ("");
                  setGenre("");
                  setSort("latest");
                  fetchBooks({ reset: true });
                }}
              />
            ) : (
              <>
                {view === "grid" ? (
                  <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {items.map((b) => (
                      <BookCard key={b._id} book={b} onOpen={() => navigate(`/book/${b._id}`)} />
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-[#E8E4DC] rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9]">
                    {items.map((b) => (
                      <BookRow key={b._id} book={b} onOpen={() => navigate(`/book/${b._id}`)} />
                    ))}
                  </div>
                )}

                {/* Load-more sentinel */}
                <div ref={loadMoreRef} className="h-12" />

                {hasMore && (
                  <div className="mt-6 flex items-center justify-center">
                    <button
                      onClick={() => fetchBooks({ reset: false })}
                      disabled={loadingMore}
                      className="rounded-xl bg-[#1F2421] px-5 py-3 font-medium text-[#F7F5F2] disabled:opacity-70"
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Pieces ----------------------------- */

function Panel({ title, icon, children }) {
  return (
    <section className="rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9]/90 p-4 shadow-[0_2px_8px_rgba(31,36,33,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-xs font-semibold tracking-[0.25em] text-[#1F2421]/75">{title.toUpperCase()}</h3>
      </div>
      {children}
    </section>
  );
}

function Chip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm rounded-xl border transition-all ${
        active
          ? "border-[#D9D1BC] bg-[#E7E1CF] text-[#1F2421] shadow"
          : "border-[#E8E4DC] bg-[#EFEBDD] text-[#1F2421]/90 hover:bg.white"
      }`}
    >
      {label}
    </button>
  );
}

function BookCard({ book, onOpen }) {
  const rating = Number(book?.rating || book?.ratingAvg || 0);
  const ratingText = rating > 0 ? rating.toFixed(1) : "—";

  return (
    <article
      onClick={onOpen}
      className="group relative flex h.full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9] shadow-[0_2px_10px_rgba(31,36,33,0.05)] transition-transform hover:-translate-y-0.5"
      title={`${book?.title || "Untitled"} — ${book?.author || "Unknown"}`}
    >
      {/* cover */}
      <div className="relative">
        <div className="aspect-[3/4] bg-white">
          {book?.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#1F2421]/45">
              <ImageOff className="h-4 w-4" />
              <span className="ml-2">No cover</span>
            </div>
          )}
        </div>
        {/* rating badge */}
        <div className="absolute left-3 top-3 rounded-xl bg-white/90 px-2 py-1 text-xs text-[#1F2421] shadow">
          <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-current opacity-90" /> {ratingText}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-3">
        <div className="truncate font-medium text-[#1F2421]">{book?.title || "Untitled"}</div>
        <div className="truncate text-sm text-[#1F2421]/70">{book?.author || "Unknown author"}</div>
        {/* Removed location display */}
      </div>

      {/* gradient hover edge */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, rgba(31,36,33,0.0), rgba(31,36,33,0.06), rgba(31,36,33,0.0))",
        }}
      />
    </article>
  );
}

function BookRow({ book, onOpen }) {
  const rating = Number(book?.rating || book?.ratingAvg || 0);
  const ratingText = rating > 0 ? rating.toFixed(1) : "—";
  return (
    <div className="grid grid-cols-[96px_1fr_auto] items-center gap-4 p-3 hover:bg-white/50">
      <div className="h-24 w-16 overflow-hidden rounded-lg border border-[#E8E4DC] bg-white">
        {book?.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[#1F2421]/45">
            <ImageOff className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium text-[#1F2421]">{book?.title || "Untitled"}</div>
        <div className="truncate text-sm text-[#1F2421]/70">{book?.author || "Unknown author"}</div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#1F2421]/60">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" /> {ratingText}
          </span>
          {book?.genre && <span className="rounded bg-[#EFEBDD] px-2 py-0.5">{book.genre}</span>}
          {/* Removed location pill */}
        </div>
      </div>
      <div>
        <button onClick={onOpen} className="rounded-lg bg-[#1F2421] px-3 py-2 text-sm font-medium text-[#F7F5F2]">
          Open
        </button>
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="rounded-2xl border border-[#E8E4DC] bg-white p-10 text-center text-[#1F2421]">
      <div className="mx-auto mb-4 h-14 w-14 rounded-full border border-dashed border-[#E8E4DC] p-4">
        <Search className="mx-auto h-full w-full opacity-60" />
      </div>
      <p className="text-lg font-medium">No books match your filters</p>
      <p className="mt-1 text-sm text-[#1F2421]/70">Try clearing the search or choosing a different category.</p>
      <div className="mt-4">
        <button onClick={onReset} className="rounded-xl bg-[#1F2421] px-4 py-2 text-sm font-medium text-[#F7F5F2]">
          Reset filters
        </button>
      </div>
    </div>
  );
}

function CardSkeletonGrid({ view }) {
  if (view === "list") {
    return (
      <div className="rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="grid grid-cols-[96px_1fr_auto] items-center gap-4 p-3">
            <div className="h-24 w-16 animate-pulse rounded-lg" style={{ background: "#F2EFE9" }} />
            <div className="space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded" style={{ background: "#F2EFE9" }} />
              <div className="h-3 w-1/3 animate-pulse rounded" style={{ background: "#F2EFE9" }} />
            </div>
            <div className="h-8 w-20 animate-pulse rounded" style={{ background: "#F2EFE9" }} />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-[#E8E4DC] bg-[#FCFBF9]">
          <div className="aspect-[3/4] animate-pulse" style={{ background: "#F2EFE9" }} />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 animate-pulse rounded" style={{ background: "#F2EFE9" }} />
            <div className="h-3 w-1/2 animate-pulse rounded" style={{ background: "#F2EFE9" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Utils ------------------------------ */

function useDebounced(value, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}
