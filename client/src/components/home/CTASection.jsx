import React from "react";
import { useNavigate } from "react-router-dom";

export default function CTASection() {
  const nav = useNavigate();
  return (
    <div className="rounded-3xl border p-7 md:p-10 text-center overflow-hidden relative" style={{ background: "#1F2421", borderColor: "#E8E4DC", color: "#F7F5F2" }}>
      <div className="absolute -top-20 -left-16 w-72 h-72 rounded-full bg-emerald-400/15 blur-3xl" />
      <div className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-amber-300/10 blur-3xl" />

      <h3 className="relative text-2xl md:text-3xl font-semibold">Give your books a second life</h3>
      <p className="relative mt-2 opacity-90">List a book in minutes and brighten someone’s day.</p>

      <div className="relative mt-6 flex justify-center gap-3">
        <button onClick={() => nav("/profile")} className="px-5 py-3 rounded-xl font-medium bg-white text-gray-900 hover:opacity-90">
          List a Book
        </button>
        <button onClick={() => nav("/explore")} className="px-5 py-3 rounded-xl font-medium border border-white/40 text-white hover:bg-white/10">
          Browse Library
        </button>
      </div>
    </div>
  );
}
