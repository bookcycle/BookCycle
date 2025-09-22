// CTASection.jsx — Solid dark split CTA (supports modal or route)
import React from "react";
import { useNavigate } from "react-router-dom";
import { BookPlus, Recycle } from "lucide-react";

export default function CTASection({
  onUpload,                    // optional: () => void  (e.g., () => setOpenUpload(true))
  uploadRoute = "/add-book",   // default upload page
  learnRoute = "/how-it-works" // default learn page (or "#how-it-works" for same-page section)
}) {
  const nav = useNavigate();

  const handleUpload = () => {
    if (typeof onUpload === "function") return onUpload();
    nav(uploadRoute);
  };

  const handleLearn = () => {
    // Support in-page hash scroll (e.g., "#how-it-works")
    if (learnRoute.startsWith("#")) {
      const el = document.querySelector(learnRoute);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    nav(learnRoute);
  };

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-[#0C1217] text-white ring-1 ring-white/10 shadow-xl">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 md:py-16">
        <div className="grid items-stretch gap-10 md:grid-cols-2">
          {/* Left — Book recycling copy */}
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold">
              <Recycle className="h-3.5 w-3.5 text-emerald-300" />
              Book Recycling
            </div>

            <h3 className="mt-3 text-3xl font-black leading-[1.05] tracking-tight sm:text-[40px]">
              Recycle your reads
            </h3>

            <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base">
              Keep stories circulating and shelves clutter-free. Share what you’ve finished
              so someone else can discover their next favorite book.
            </p>

            <ul className="mt-5 space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Give finished books a second life in the community.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Reduce cost and waste—borrow, swap, and share.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-violet-300" />
                Help other readers discover new authors and genres.
              </li>
            </ul>
          </div>

          {/* Right — Upload action */}
          <div className="md:border-l md:border-white/10 md:pl-10">
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
              <h4 className="text-xl font-semibold">Ready to pass it on?</h4>
              <p className="mt-2 max-w-md text-sm text-slate-300">
                Upload a book in minutes. Add a title, cover, and how you’d like to share.
              </p>

              <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleUpload}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-[#0B0F14] shadow hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <BookPlus className="h-4 w-4" />
                  Upload a Book
                </button>

              </div>

              <p className="mt-3 text-xs text-slate-400">
                No fees • Community-moderated • ~2 min to list
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
