import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
    const nav = useNavigate();

    return (
        <section className="relative overflow-hidden">
            {/* Soft background & blobs for depth */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,#F7F5F2_0%,#F3F1EC_100%)]" />
            <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-16 h-72 w-72 rounded-full bg-amber-300/20 blur-3xl" />

            <div className="relative mx-auto max-w-6xl px-4 pt-12 pb-10">
                <div className="rounded-3xl border border-[#E8E4DC] bg-white/90 shadow-lg backdrop-blur">
                    <div className="grid items-center gap-10 p-8 md:grid-cols-[1.1fr_0.9fr] lg:p-12">
                        {/* Left */}
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-[#1F2421] sm:text-5xl">
                                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Read, Share, Repeat
                                </span>
                            </h1>

                            <p className="mt-4 max-w-xl text-lg text-[rgba(31,36,33,0.78)]">
                                Swap stories, share worlds — your next read awaits.
                            </p>

                            {/* CTAs */}
                            <div className="mt-7 flex flex-wrap gap-3">
                                <button
                                    onClick={() => nav("/explore")}
                                    className="rounded-full bg-[#1F2421] px-6 py-3 text-white shadow-sm transition hover:translate-y-[1px] hover:bg-[#1F2421]/90"
                                >
                                    Explore Library
                                </button>
                            </div>

                            {/* Tiny trust metrics */}
                            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#42514a]">
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    1k+ books shared
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-teal-500" />
                                    Zero-cost borrowing
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    Community-driven
                                </span>
                            </div>
                        </div>

                        {/* Right — framed image with subtle overlay & badges */}
                        <div className="hidden justify-center md:flex">
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1508060793788-7d5f1c40c4ba?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjQ0fHxib29rfGVufDB8fDB8fHww"
                                    alt="Shelves of shared books"
                                    className="h-64 w-96 rounded-3xl object-cover shadow-2xl ring-1 ring-emerald-100"
                                />

                                {/* soft vignette */}
                                <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-t from-black/15 via-transparent to-transparent" />

                                {/* floating badges */}
                                <div className="absolute -left-3 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-800 shadow">
                                    Community-powered
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
