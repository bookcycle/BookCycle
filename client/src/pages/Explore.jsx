import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { Search, Star, ImageOff } from "lucide-react";

/** Default categories shown as chips; real genres are merged in dynamically */
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

  // seed search from ?q= if present
  const initialQ = (sp.get("q") || "").trim();

  const [q, setQ] = useState(initialQ);
  const qDebounced = useDebounced(q, 350);

  const [genre, setGenre] = useState(""); // empty → all
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const limit = 16;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [err, setErr] = useState("");

  async function fetchBooks({ reset } = { reset: false }) {
    const params = {
      page: reset ? 1 : page + 1,
      limit,
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

  // initial + refetch when search/genre changes
  useEffect(() => {
    fetchBooks({ reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, genre]);

  const hasMore = items.length < total;

  // Merge dynamic genres from results so chips feel relevant
  const dynamicGenres = useMemo(() => {
    const set = new Set(items.map((b) => b?.genre).filter(Boolean));
    const extra = Array.from(set).filter((g) => !CATEGORIES.includes(g));
    return [...CATEGORIES, ...extra];
  }, [items]);

  return (
    <div className="p-6" style={{ background: "linear-gradient(180deg, #F7F5F2 0%, #F3F1EC 100%)" }}>
      <div className="mx-auto max-w-6xl">
        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(31,36,33,0.50)" }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchBooks({ reset: true });
              }}
              placeholder="eg, Harry Potter"
              className="w-full pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:ring-2"
              style={{ background: "#FFFFFF", border: "1px solid #E8E4DC", color: "#1F2421" }}
            />
          </div>
        </div>

        {/* Categories */}
        <section className="rounded-2xl border mb-8" style={{ background: "#FCFBF9", borderColor: "#E8E4DC" }}>
          <div className="p-5">
            <h2 className="tracking-[0.3em] text-xs font-semibold mb-4" style={{ color: "rgba(31,36,33,0.75)" }}>
              CATEGORIES
            </h2>
            <div className="flex flex-wrap gap-2">
              <CategoryChip label="All" active={!genre} onClick={() => setGenre("")} />
              {dynamicGenres.map((g) => (
                <CategoryChip key={g} label={g} active={genre === g} onClick={() => setGenre(g)} />
              ))}
            </div>
          </div>
        </section>

        {/* Latest grid */}
        <section className="rounded-2xl border" style={{ background: "#FCFBF9", borderColor: "#E8E4DC" }}>
          <div className="p-5">
            <h2 className="tracking-[0.3em] text-xs font-semibold mb-6" style={{ color: "rgba(31,36,33,0.75)" }}>
              LATEST
            </h2>

            {err && (
              <div
                className="mb-4 rounded-xl px-4 py-3"
                style={{ background: "#FFF8E6", border: "1px solid #F5E0A3", color: "#7A5E1A" }}
              >
                {err}
              </div>
            )}

            {loading && items.length === 0 ? (
              <CardSkeletonGrid />
            ) : items.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((b) => (
                    <BookCard key={b._id} book={b} onOpen={() => navigate(`/book/${b._id}`)} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => fetchBooks({ reset: false })}
                      disabled={loadingMore}
                      className="px-4 py-2.5 rounded-xl font-medium"
                      style={{ background: "#1F2421", color: "#F7F5F2", opacity: loadingMore ? 0.7 : 1 }}
                    >
                      {loadingMore ? "Loading…" : "Load more"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ----------------------------- Pieces ----------------------------- */

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl text-sm transition-colors"
      style={{
        background: active ? "#E7E1CF" : "#EFEBDD",
        color: "#1F2421",
        border: "1px solid #E8E4DC",
      }}
    >
      {label}
    </button>
  );
}

function BookCard({ book, onOpen }) {
  const rating = Number(book?.rating || book?.ratingAvg || 0);
  const ratingText = rating > 0 ? rating.toFixed(2) : "No rating";

  return (
    <article
      onClick={onOpen}
      className="rounded-2xl overflow-hidden h-full flex flex-col cursor-pointer"
      style={{ background: "#FCFBF9", border: "1px solid #E8E4DC", boxShadow: "0 2px 8px rgba(31,36,33,0.05)" }}
      title={`${book?.title || "Untitled"} — ${book?.author || "Unknown author"}`}
    >
      {/* cover */}
      <div className="aspect-[3/4] bg-white flex items-center justify-center overflow-hidden">
        {book?.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(31,36,33,0.45)" }}>
            <ImageOff className="w-4 h-4" /> No cover
          </div>
        )}
      </div>

      {/* body */}
      <div className="p-3">
        <div className="truncate font-medium" style={{ color: "#1F2421" }}>
          {book?.title || "Untitled"}
        </div>
        <div className="truncate text-sm" style={{ color: "rgba(31,36,33,0.70)" }}>
          {book?.author || "Unknown author"}
        </div>

        <div className="mt-1 flex items-center gap-1 text-xs" style={{ color: "rgba(31,36,33,0.55)" }}>
          <Star className="w-3.5 h-3.5 fill-current opacity-80" />
          {rating > 0 ? ratingText : <span className="italic">No rating</span>}
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl p-8 text-center" style={{ background: "#FFFFFF", border: "1px solid #E8E4DC", color: "#1F2421" }}>
      Nothing here yet. Try another search or category.
    </div>
  );
}

function CardSkeletonGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#FCFBF9", border: "1px solid #E8E4DC" }}>
          <div className="aspect-[3/4] animate-pulse" style={{ background: "#F2EFE9" }} />
          <div className="p-3 space-y-2">
            <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "#F2EFE9" }} />
            <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: "#F2EFE9" }} />
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
