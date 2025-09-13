import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { ImageOff } from "lucide-react";

// Swiper
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function BookCarousel({ title = "Latest" }) {
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
    <div
      className="rounded-2xl border p-5"
      style={{ background: "#FCFBF9", borderColor: "#E8E4DC" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="tracking-[0.3em] text-xs font-semibold" style={{ color: "rgba(31,36,33,0.75)" }}>
          {title.toUpperCase()}
        </h2>
        <button
          onClick={() => navigate("/explore")}
          className="text-sm underline"
          style={{ color: "#1F2421" }}
        >
          See all
        </button>
      </div>

      {err && (
        <div
          className="mb-3 rounded-xl px-3 py-2 text-sm"
          style={{ background: "#FFF8E6", border: "1px solid #F5E0A3", color: "#7A5E1A" }}
        >
          {err}
        </div>
      )}

      {loading ? (
        <SkeletonRow />
      ) : rows.length === 0 ? (
        <div className="text-sm" style={{ color: "rgba(31,36,33,0.7)" }}>
          No books yet. Be the first to list one!
        </div>
      ) : (
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
        >
          {rows.map((b) => (
            <SwiperSlide key={b._id}>
              <button
                onClick={() => navigate(`/book/${b._id}`)}
                className="w-full text-left"
                title={b.title}
              >
                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: "#E8E4DC", background: "#FFFFFF" }}
                >
                  <div className="aspect-[3/4] bg-white grid place-items-center overflow-hidden">
                    {b.coverUrl ? (
                      <img src={b.coverUrl} alt={b.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center gap-2 text-sm" style={{ color: "rgba(31,36,33,0.45)" }}>
                        <ImageOff className="w-4 h-4" /> No cover
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-2 truncate font-medium" style={{ color: "#1F2421" }}>
                  {b.title}
                </div>
                <div className="truncate text-sm" style={{ color: "rgba(31,36,33,0.7)" }}>
                  {b.author}
                </div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl overflow-hidden border" style={{ borderColor: "#E8E4DC", background: "#FFFFFF" }}>
          <div className="aspect-[3/4] animate-pulse" style={{ background: "#F2EFE9" }} />
          <div className="p-2">
            <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: "#F2EFE9" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
