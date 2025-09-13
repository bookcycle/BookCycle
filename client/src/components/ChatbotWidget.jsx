import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ChatbotCard from "./ChatbotCard";

export default function ChatWidget({ btnLabel = "Book Genie" }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // close on outside click
  useEffect(() => {
    function onClick(e) {
      if (!open) return;
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  // close on ESC
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Portal ensures it’s always pinned to viewport
  return createPortal(
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Toggle button */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-neutral-900 text-white px-4 py-2 shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-neutral-900/30"
      >
        <GenieLogo className="h-5 w-5" />
        <span className="text-sm font-medium">{btnLabel}</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          className="mt-2 w-[92vw] max-w-[380px] rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-fade-in"
        >
          <ChatbotCard />
        </div>
      )}
    </div>,
    document.body
  );
}

function GenieLogo({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15.5a2.5 2.5 0 0 1-2.5 2.5H6.5A2.5 2.5 0 0 0 4 23V5.5Z"
        fill="currentColor"
        opacity="0.15"
      />
      <path
        d="M6.5 3H20v14H7a3 3 0 0 0-3 3V5.5A2.5 2.5 0 0 1 6.5 3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M9 7h8M9 10h8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 2.5c0-.28.22-.5.5-.5H20"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity=".5"
      />
      <circle cx="16.5" cy="5" r="1" fill="currentColor" />
    </svg>
  );
}
