import React, { useEffect, useRef, useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { ImageOff, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, A11y, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function BookCarousel({ title = "Recommended" }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        // ✅ Public endpoint: always returns accepted books
        const data = await api.get("/books", { params: { page: 1, limit: 20 } });
        if (!mounted) return;
        setRows(Array.isArray(data?.docs) ? data.docs : []);
      } catch (e) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load books");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="relative">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
        </div>

        {/* Nav controls */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            ref={prevRef}
            aria-label="Previous"
            className="rounded-full border border-white/10 bg-white/10 p-2 shadow-sm backdrop-blur transition hover:bg-white/15"
          >
            <ChevronLeft className="h-5 w-5 text-slate-200" />
          </button>
          <button
            ref={nextRef}
            aria-label="Next"
            className="rounded-full border border-white/10 bg-white/10 p-2 shadow-sm backdrop-blur transition hover:bg-white/15"
          >
            <ChevronRight className="h-5 w-5 text-slate-200" />
          </button>
        </div>
      </div>

      {/* Neon frame + dark glass background */}
      <div className="relative rounded-[24px] p-[1px] bg-[linear-gradient(135deg,rgba(16,185,129,0.35),rgba(59,130,246,0.35))]">
        <div className="rounded-[23px] border border-white/10 bg-[#0B0F14]/85 p-3 shadow-xl backdrop-blur sm:p-4 lg:p-5">
          {err && (
            <div className="mb-3 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
              {err}
            </div>
          )}

          {loading ? (
            <SkeletonRow />
          ) : rows.length === 0 ? (
            <EmptyState onExplore={() => navigate("/explore")} />
          ) : (
            <Swiper
              modules={[Navigation, FreeMode, A11y, Keyboard]}
              freeMode={{ enabled: true, momentum: true }}
              keyboard={{ enabled: true }}
              a11y={{ enabled: true }}
              spaceBetween={18}
              slidesPerView={2.15}
              breakpoints={{
                480: { slidesPerView: 3, spaceBetween: 16 },
                640: { slidesPerView: 4, spaceBetween: 18 },
                1024: { slidesPerView: 5, spaceBetween: 18 },
                1280: { slidesPerView: 6, spaceBetween: 20 },
              }}
              onBeforeInit={(swiper) => {
                // Attach custom nav buttons
                // @ts-ignore
                swiper.params.navigation.prevEl = prevRef.current;
                // @ts-ignore
                swiper.params.navigation.nextEl = nextRef.current;
              }}
              navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
              className="!px-1"
            >
              {rows.map((b) => (
                <SwiperSlide key={b._id}>
                  <Card book={b} onClick={() => navigate(`/book/${b._id}`)} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </section>
  );
}

/* ---------- Card ---------- */
function Card({ book, onClick }) {
  const title = book.title || "Untitled";
  const author = book.author || "";
  const img = book.coverUrl || "";
  const typeMeta = getTypeMeta(book.type, book.availability);

  return (
    <button onClick={onClick} title={title} className="group block w-full text-left">
      <div
        className="relative rounded-2xl p-[1px] transition-shadow group-hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15)]"
        style={{ background: "linear-gradient(180deg,#1a212a,#10151b)" }}
      >
        <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-white/5">
          {/* image */}
          <div className="aspect-[3/4] grid place-items-center overflow-hidden">
            {img ? (
              <img
                src={img}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <ImageOff className="h-4 w-4" /> No cover
              </div>
            )}
          </div>

          {/* badge */}
          {typeMeta.label && (
            <span
              className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-medium ${typeMeta.className}`}
            >
              {typeMeta.label}
            </span>
          )}

          {/* bottom overlay info */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-2">
            <div className="rounded-xl bg-black/40 px-2 py-1.5 text-white backdrop-blur-md">
              <div className="line-clamp-1 text-[13px] font-semibold">{title}</div>
              {author && (
                <div className="line-clamp-1 text-[11px] text-white/80">{author}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* footer chip */}
      <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-200 backdrop-blur transition group-hover:bg-white/15">
        View <ArrowRight className="h-3.5 w-3.5" />
      </div>
    </button>
  );
}

/* ---------- helpers ---------- */

// Show "Giveaway" / "Exchange" if available, "Exchanged" if already taken
function getTypeMeta(type, availability) {
  const t = String(type || "").toLowerCase();
  const av = String(availability || "").toLowerCase();

  if (av === "unavailable") {
    return { label: "Exchanged", className: "bg-slate-500 text-white" };
  }
  if (t === "giveaway") {
    return { label: "Giveaway", className: "bg-emerald-500/90 text-white" };
  }
  if (t === "exchange") {
    return { label: "Exchange", className: "bg-indigo-500/90 text-white" };
  }
  return { label: "", className: "" };
}

function EmptyState({ onExplore }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
      <div className="text-sm opacity-90">No books yet. Be the first to list one!</div>
      <button
        onClick={onExplore}
        className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-[#0B0F14] shadow hover:bg-slate-50"
      >
        Explore
      </button>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
          <div className="relative aspect-[3/4] animate-pulse bg-white/10" />
          <div className="p-2">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}
