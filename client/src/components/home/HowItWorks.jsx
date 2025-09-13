import React from "react";
import { Repeat, Gift, Recycle, MessageCircle } from "lucide-react";

const STEPS = [
  {
    title: "Exchange",
    text: "Swap finished reads for something new — keep stories flowing through the community.",
    Icon: Repeat,
    bg: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Give Away",
    text: "Donate books you no longer need and light up someone else’s shelf.",
    Icon: Gift,
    bg: "bg-amber-100 text-amber-700",
  },
  {
    title: "Recycle Your Reads",
    text: "Reduce cost, clutter, and waste by putting books back into circulation.",
    Icon: Recycle,
    bg: "bg-sky-100 text-sky-700",
  },
  {
    title: "Book Genie",
    text: "Built-in chatbot for quick recs and help — just tap the bubble anytime.",
    Icon: MessageCircle,
    bg: "bg-violet-100 text-violet-700",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="relative py-14"
      style={{ background: "linear-gradient(180deg,#F7F5F2 0%,#F3F1EC 100%)" }}
    >
      <div className="mx-auto max-w-6xl px-4">
        {/* Eyebrow */}
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500/90">
          BookLink — our flow
        </p>

        {/* Headline */}
        <div className="mt-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Everything Your{" "}
            <span className="text-emerald-700">Shelf</span> Needs
          </h2>
          <div className="mt-2 h-[3px] w-20 rounded-full bg-emerald-600" />
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
            Exchange, give away, and recycle books you’re done with — discover
            new favorites and get guidance from Book Genie along the way.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ title, text, Icon, bg }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 shadow-sm"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${bg}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-10 h-px bg-slate-200/70" />

        {/* Footer note */}
        <p className="mt-6 text-center text-sm text-slate-600">
          This is a circular library: what you pass on today becomes someone
          else’s next adventure tomorrow.
        </p>
      </div>
    </section>
  );
}
