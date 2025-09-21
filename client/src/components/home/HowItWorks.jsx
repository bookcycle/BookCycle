import React from "react";
import { Repeat, Gift, Recycle, MessageCircle } from "lucide-react";

const STEPS = [
  { title: "Exchange", text: "Swap finished reads for something new—keep stories flowing.", Icon: Repeat,  accent: "bg-emerald-100 text-emerald-700" },
  { title: "Give Away", text: "Donate books you no longer need and light up someone else’s shelf.", Icon: Gift, accent: "bg-amber-100 text-amber-700" },
  { title: "Recycle Reads", text: "Cut clutter and waste by putting books back into circulation.", Icon: Recycle, accent: "bg-sky-100 text-sky-700" },
  { title: "Book Genie", text: "Built-in chatbot for quick recs and help—tap the bubble anytime.", Icon: MessageCircle, accent: "bg-violet-100 text-violet-700" },
];

export default function HowItWorks() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-4 flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            How it works
          </h2>
        </div>

        {/* Frame + BLACK panel */}
        <div className="relative rounded-[24px] p-[1px] bg-black">
          <div className="relative rounded-[23px] border border-white/10 bg-[#0C1217] p-6 shadow-sm">
            {/* (optional) faint connector on dark */}
            <div className="pointer-events-none absolute left-6 right-6 top-[118px] hidden h-px bg-white/10 md:block" />

            {/* Cards */}
            <div className="grid gap-6 md:grid-cols-4">
              {STEPS.map(({ title, text, Icon, accent }) => (
                <div
                  key={title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>

                  <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                  <div className="mt-3 text-[12px] font-medium text-emerald-700 opacity-0 transition group-hover:opacity-100">
                    Learn more →
                  </div>
                </div>
              ))}
            </div>

            {/* Divider + note (tuned for dark) */}
            <div className="mt-10 h-px bg-white/10" />
            <p className="mt-6 text-center text-sm text-slate-300">
              This is a circular library: what you pass on today becomes someone else’s
              next adventure tomorrow.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
