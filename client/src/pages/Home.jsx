// src/pages/Home.jsx
import React from "react";
import ChatWidget from "../components/ChatbotWidget"; // খেয়াল করো: ফাইলনেম ChatWidget.jsx

export default function HomePage() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 p-4 md:p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold mb-3">BookCycle</h1>
        <p className="text-sm text-neutral-600 mb-4">
          Borrow • Exchange • Giveaway — Find and share books in your community.
        </p>
      </div>

      {/* Floating Chat Widget (bottom-right) */}
      <ChatWidget position="bottom-right" btnLabel="Book Genie" />
    </div>
  );
}
