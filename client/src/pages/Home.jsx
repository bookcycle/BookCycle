import React from "react";
import Hero from "../components/home/Hero";
import BookCarousel from "../components/home/BookCarousel";
import HowItWorks from "../components/home/HowItWorks";
import CTASection from "../components/home/CTASection";
import ChatWidget from "../components/ChatbotWidget";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}>
      <Hero />

      <main className="mx-auto max-w-6xl px-4 pb-20">

        <section className="mt-10">
          <BookCarousel title="New this week" />
        </section>

        <section className="mt-14">
          <HowItWorks />
        </section>

        <section className="mt-14">
          <CTASection />
        </section>
      </main>

      {/* Floating Chat Widget */}
      <ChatWidget position="bottom-right" btnLabel="Book Genie" />
    </div>
  );
}
