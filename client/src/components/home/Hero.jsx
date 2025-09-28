import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";

export default function Hero() {
    const nav = useNavigate();

    return (
        <section className="relative overflow-hidden">
            {/* Dark background with subtle grid + vignette */}
            <div
                className="absolute inset-0 -z-20"
                style={{
                    background:
                        "radial-gradient(1100px 600px at 90% -10%, rgba(59,130,246,0.08), transparent 60%)," +
                        "radial-gradient(900px 500px at -10% 110%, rgba(16,185,129,0.08), transparent 60%)," +
                        "linear-gradient(180deg, #0B0F14 0%, #0E1218 100%)",
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18]"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
            />
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(closest-side,rgba(0,0,0,0),rgba(0,0,0,0.55))]" />

            <div className="relative mx-auto max-w-6xl px-4 py-14">
                {/* Neon framed container (slightly narrower) */}
                <div className="mx-auto w-full max-w-6xl rounded-[28px] p-[1px] bg-[linear-gradient(135deg,rgba(16,185,129,0.8),rgba(59,130,246,0.8))]">
                    <div className="rounded-[27px] bg-[#0B0F14]/80 backdrop-blur-xl">
                        <div className="grid items-center gap-10 p-8 md:grid-cols-2 lg:p-12">
                            {/* Left — editorial copy */}
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">
                                    BookCycle
                                </p>

                                <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
                                    Trade{" "}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300">
                                        books
                                    </span>
                                    ,<br className="hidden sm:block" />
                                    grow{" "}
                                    <span className="underline decoration-emerald-400/70 decoration-wavy underline-offset-4">
                                        together
                                    </span>
                                    !
                                </h1>

                                <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-slate-300">
                                    Give finished books a second life. Exchange or donate to keep stories circulating and reduce waste.
                                </p>

                                {/* Search / actions (kept at max-w-xl) */}
                                <div className="mt-7 flex max-w-xl flex-col gap-3 sm:flex-row">
                                    <div className="relative flex-1">
                                        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter")
                                                    nav(`/explore?query=${encodeURIComponent(e.currentTarget.value)}`);
                                            }}
                                            placeholder="Search titles, authors, genres…"
                                            className="w-full rounded-xl border border-white/10 bg-white/5 px-10 py-3 text-slate-100 placeholder:text-slate-400 outline-none ring-emerald-400/0 transition focus:border-white/20 focus:ring-2"
                                        />
                                    </div>
                                    <button
                                        onClick={() => nav("/explore")}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#0B0F14] shadow-md transition hover:translate-y-[1px]"
                                    >
                                        Explore <ArrowRight size={16} />
                                    </button>
                                </div>

                                {/* Trust badges */}
                                <div className="mt-6 grid gap-4 text-sm text-slate-300/90 sm:grid-cols-3">
                                    <Badge kpi="1k+" label="books in circulation" />
                                    <Badge kpi="0 $" label="borrowing cost" />
                                    <Badge kpi="24/7" label="community support" />
                                </div>
                            </div>

                            {/* Right — collage (slightly narrower) */}
                            <div className="relative hidden md:block">
                                <div className="absolute -inset-8 -z-10 rounded-[32px] bg-[radial-gradient(closest-side,rgba(16,185,129,.35),transparent)] blur-2xl" />
                                <div className="mx-auto grid w-[32rem] max-w-full grid-cols-3 gap-4">
                                    <TiltCard
                                        className="col-span-1 row-span-2 rotate-[-2deg]"
                                        img="https://images.unsplash.com/photo-1722977735215-d28f2ac6efba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NTJ8fGJvb2slMjBiYWNrZ3JvdW5kfGVufDB8fDB8fHww"
                                        title="Fictions"
                                    />
                                    <TiltCard
                                        className="col-span-2 rotate-[2deg]"
                                        img="https://images.unsplash.com/photo-1747792607295-ada93d1b320c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NjN8fGJvb2slMjBsaWJyYXJ5fGVufDB8fDB8fHww"
                                        title="Novels"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

/* ---------- helpers ---------- */
function Badge({ kpi, label }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="text-[22px] font-extrabold text-white">{kpi}</div>
            <div className="text-[12px] uppercase tracking-wider text-slate-400">{label}</div>
        </div>
    );
}

function TiltCard({ img, title, className = "" }) {
    return (
        <div
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl ${className}`}
        >
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]" />
            <img
                src={img}
                alt={title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            <div className="absolute left-2 top-2 rounded-md bg-black/50 px-2 py-1 text-[11px] font-medium text-slate-200 ring-1 ring-white/10 backdrop-blur">
                {title}
            </div>
            <div className="pointer-events-none absolute -inset-40 translate-x-[-120%] rotate-[25deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)] transition duration-700 group-hover:translate-x-[120%]" />
        </div>
    );
}
