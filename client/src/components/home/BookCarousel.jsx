import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";

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

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.get("/books", { params: { page: 1, limit: 20 } });
        setRows(Array.isArray(data?.docs) ? data.docs : []);
        setErr("");
      } catch (e) {
        setErr(e?.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="relative">
      {/* Title with a small emerald accent */}
      <div className="mb-3 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-600" />
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>

      {/* THEMED BACKGROUND BOX */}
      <div
        className="
          relative rounded-2xl border border-[#E8E4DC]
          bg-gradient-to-br from-emerald-50/70 via-white to-amber-50/70
          p-3 sm:p-4 lg:p-5 shadow-sm
        "
      >
        {err && (
          <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {err}
          </div>
        )}

        {loading ? (
          <SkeletonRow />
        ) : rows.length === 0 ? (
          <div className="text-sm text-slate-600">No books yet.</div>
        ) : (
          <Swiper
            modules={[Navigation, FreeMode, A11y, Keyboard]}
            navigation
            freeMode={{ enabled: true, momentum: true }}
            keyboard={{ enabled: true }}
            a11y={{ enabled: true }}
            spaceBetween={16}
            slidesPerView={2.15}
            breakpoints={{
              480: { slidesPerView: 3, spaceBetween: 16 },
              640: { slidesPerView: 4, spaceBetween: 18 },
              1024: { slidesPerView: 5, spaceBetween: 18 },
              1280: { slidesPerView: 6, spaceBetween: 20 },
            }}
            className="!px-1"
          >
            {rows.map((b) => {
              const typeMeta = getTypeMeta(b.type, b.availability);

              return (
                <SwiperSlide key={b._id}>
                  <button
                    onClick={() => navigate(`/book/${b._id}`)}
                    className="group w-full text-center"
                    title={b.title}
                  >
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow group-hover:shadow-md cursor-pointer">
                      <div className="aspect-[3/4] grid place-items-center overflow-hidden">
                        {b.coverUrl ? (
                          <img
                            src={b.coverUrl}
                            alt={b.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <ImageOff className="h-4 w-4" /> No cover
                          </div>
                        )}
                      </div>

                      {/* TYPE badge */}
                      {typeMeta.label && (
                        <span
                          className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-medium text-white ${typeMeta.className}`}
                        >
                          {typeMeta.label}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="mt-2 line-clamp-1 text-[15px] font-extrabold text-slate-900">
                      {b.title || "Untitled"}
                    </div>
                  </button>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */

// Show "Giveaway" / "Exchange" if available, "Exchanged" if already taken
function getTypeMeta(type, availability) {
  const t = String(type || "").toLowerCase();
  const av = String(availability || "").toLowerCase();

  if (av === "unavailable") {
    return { label: "Exchanged", className: "bg-slate-500" };
  }
  if (t === "giveaway") {
    return { label: "Giveaway", className: "bg-emerald-600" };
  }
  if (t === "exchange") {
    return { label: "Exchange", className: "bg-indigo-600" };
  }
  return { label: "", className: "" };
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="aspect-[3/4] animate-pulse bg-slate-100 relative">
            <div className="absolute left-2 top-2 h-4 w-16 animate-pulse rounded bg-slate-200" />
          </div>
          <div className="p-2">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
