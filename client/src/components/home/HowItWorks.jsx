import React from "react";
import { Hand, Repeat, Gift } from "lucide-react";

const STEPS = [
  { icon: <Hand className="w-5 h-5" />, title: "Borrow", text: "Request an available book and pick it up locally." },
  { icon: <Repeat className="w-5 h-5" />, title: "Exchange", text: "Swap finished reads for something fresh." },
  { icon: <Gift className="w-5 h-5" />, title: "Give Away", text: "Donate books to spread the joy of reading." },
];

export default function HowItWorks() {
  return (
    <div className="rounded-2xl border p-6" style={{ background: "#FCFBF9", borderColor: "#E8E4DC" }}>
      <h2 className="text-lg font-semibold mb-6" style={{ color: "#1F2421" }}>
        How it works
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((s) => (
          <div key={s.title} className="rounded-xl p-5 border" style={{ background: "#FFFFFF", borderColor: "#E8E4DC" }}>
            <div className="w-10 h-10 rounded-lg grid place-items-center mb-2" style={{ background: "#EFF5F1", color: "#1F2421" }}>
              {s.icon}
            </div>
            <div className="font-semibold" style={{ color: "#1F2421" }}>
              {s.title}
            </div>
            <div className="text-sm mt-1" style={{ color: "rgba(31,36,33,0.75)" }}>
              {s.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
