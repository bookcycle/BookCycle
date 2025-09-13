import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

export default function CTASection() {
  const nav = useNavigate();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-emerald-700 text-white">
      {/* subtle blobs for depth */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-emerald-900/30 blur-3xl" />

      <div className="relative px-6 py-12 md:px-12 md:py-16 text-center">
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
          Join the community library
        </h3>
        <p className="mt-3 max-w-2xl mx-auto text-sm md:text-base opacity-90">
          Upload books you no longer need, and borrow or exchange titles you’ve
          been wanting to read.  
          <br />
          Start by logging in and be part of the sharing loop.
        </p>

        {/* action button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => nav("/login")}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-emerald-700 shadow hover:bg-slate-50 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Login to Continue
          </button>
        </div>
      </div>
    </section>
  );
}
