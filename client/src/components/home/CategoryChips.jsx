import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BookOpen, Heart, Wand2, Telescope, BadgeAlert, Skull, UserRound, Sparkles } from "lucide-react";

/**
 * CategoryChips (title-less ribbon)
 * - Mobile-first horizontal ribbon with snap scrolling
 * - Glassy/cream pills, subtle lift on hover, emerald active state
 * - Reads active genre from ?genre=
 * - Optional "All" chip to reset filter
 */
const DEFAULT = [
  "Fantasy",
  "Romance",
  "Science Fiction",
  "Fiction",
  "Non-Fiction",
  "Mystery",
  "Thriller",
  "Biography",
];

const ICONS = {
  Fantasy: Wand2,
  Romance: Heart,
  "Science Fiction": Telescope,
  Fiction: Sparkles,
  "Non-Fiction": BookOpen,
  Mystery: BadgeAlert,
  Thriller: Skull,
  Biography: UserRound,
};

export default function CategoryChips({
  categories = DEFAULT,
  includeAll = true,          // show an "All" chip to clear filters
  compact = false,            // tighter paddings if needed
  withIcons = true,           // toggle icons
  className = "",             // extra classes from parent
}) {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const params = new URLSearchParams(search);
  const active = params.get("genre");

  const go = (genre) => {
    const next = new URLSearchParams(params.toString());
    if (!genre) {
      next.delete("genre");
    } else {
      next.set("genre", genre);
    }
    navigate(`${pathname}?${next.toString()}`);
  };

  const basePad = compact ? "px-3 py-1.5" : "px-4 py-2";
  const sizeTxt = compact ? "text-[13px]" : "text-sm";

  return (
    <div
      className={[
        "rounded-2xl border shadow-sm p-3 sm:p-4",
        "backdrop-blur-sm",
        className,
      ].join(" ")}
      style={{ background: "#FCFBF9", borderColor: "#E8E4DC" }}
      aria-label="Genre chips"
    >
      <div className="flex gap-2 overflow-x-auto sm:flex-wrap sm:overflow-visible snap-x snap-mandatory pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {includeAll && (
          <button
            onClick={() => go(null)}
            aria-pressed={!active}
            className={[
              "snap-start shrink-0 inline-flex items-center gap-2 rounded-full border transition-all",
              basePad,
              sizeTxt,
              !active
                ? "border-transparent bg-emerald-700 text-white shadow-sm hover:brightness-105"
                : "border-[#E8E4DC] text-[#1F2421] bg-gradient-to-b from-[#F3F0E7] to-[#EFEBDD] hover:-translate-y-0.5 hover:shadow-sm",
            ].join(" ")}
            title="All"
          >
            {withIcons && <BookOpen className="h-4 w-4" />}
            <span>All</span>
          </button>
        )}

        {categories.map((g) => {
          const Icon = ICONS[g] || BookOpen;
          const isActive = g === active;
          return (
            <button
              key={g}
              onClick={() => go(g)}
              aria-pressed={isActive}
              className={[
                "group snap-start shrink-0 inline-flex items-center gap-2 rounded-full border transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(31,36,33,0.25)]",
                basePad,
                sizeTxt,
                isActive
                  ? "border-transparent bg-emerald-700 text-white shadow-sm hover:brightness-105"
                  : "border-[#E8E4DC] text-[#1F2421] bg-gradient-to-b from-[#F3F0E7] to-[#EFEBDD] hover:-translate-y-0.5 hover:shadow-sm",
              ].join(" ")}
              title={g}
            >
              {withIcons && (
                <Icon className={isActive ? "h-4 w-4 text-white" : "h-4 w-4 text-[rgba(31,36,33,0.7)]"} />
              )}
              <span>{g}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
