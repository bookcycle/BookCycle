// src/components/ChatWidget.jsx
import React, { useEffect, useRef, useState } from "react";
import ChatbotCard from "./ChatbotCard";

export default function ChatWidget({
  position = "bottom-right", // bottom-right | bottom-left
  btnLabel = "Book Genie",
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function onClick(e) {
      if (!open) return;
      const panel = panelRef.current;
      const btn = btnRef.current;
      if (panel && !panel.contains(e.target) && btn && !btn.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const posCls =
    position === "bottom-left"
      ? "left-4 md:left-6"
      : "right-4 md:right-6";

  return (
    <div className={`fixed ${posCls} bottom-4 md:bottom-6 z-50`}>
      {/* Toggle Button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
        aria-expanded={open}
        aria-controls="book-genie-panel"
      >
        <GenieLogo className="h-5 w-5" />
        <span className="text-sm font-medium">{btnLabel}</span>
      </button>

      {/* Panel (dropdown-like) */}
      <div
        id="book-genie-panel"
        ref={panelRef}
        className={`mt-2 w-[92vw] max-w-[380px] transform transition-all duration-200 origin-bottom-right
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none"}`}
        aria-hidden={!open}
      >
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-2xl">
          <ChatbotCard />
        </div>
      </div>
    </div>
  );
}

function GenieLogo({ className = "" }) {
  // simple book + sparkle style logo (SVG)
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 0 4 23V5.5Z" fill="currentColor" opacity="0.15"/>
      <path d="M6.5 3H20v14H7a3 3 0 0 0-3 3V5.5A2.5 2.5 0 0 1 6.5 3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <path d="M9 7h8M9 10h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 2.5c0-.28.22-.5.5-.5H20" stroke="currentColor" strokeWidth="1.5" opacity=".5"/>
      <circle cx="16.5" cy="5" r="1" fill="currentColor"/>
    </svg>
  );
}
