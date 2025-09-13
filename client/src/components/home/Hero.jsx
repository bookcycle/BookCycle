import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";

export default function Hero() {
    const nav = useNavigate();
    const [q, setQ] = useState("");

    const onSubmit = (e) => {
        e.preventDefault();
        if (q.trim()) nav(`/explore?q=${encodeURIComponent(q.trim())}`);
    };

    return (
        <section className="relative">
            <div className="mx-auto max-w-6xl px-4 pt-12 pb-10">
                <div className="rounded-3xl border border-[#E8E4DC] bg-white shadow-md">
                    <div className="grid items-center gap-10 p-8 md:grid-cols-[1.1fr_0.9fr]">
                        {/* Left */}
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight text-[#1F2421] sm:text-5xl">
                                Read, Share, Repeat

                            </h1>

                            <p className="mt-4 max-w-lg text-lg text-[rgba(31,36,33,0.7)]">
                                   Join the cycle of exchanging, and giving away books sustainably.
                            </p>

                            {/* Search */}
                            <form
                                onSubmit={onSubmit}
                                className="mt-6 flex max-w-md items-center rounded-full border border-[#E8E4DC] bg-[#FDFCF9] shadow-sm"
                            >
                                <Search className="ml-3 h-5 w-5 text-[#888]" />
                                <input
                                    type="text"
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Search titles, authors, genres…"
                                    className="ml-2 flex-1 bg-transparent px-2 py-3 text-sm text-[#1F2421] placeholder:text-[#777] focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    className="mr-2 rounded-full bg-emerald-700 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                                >
                                    Search
                                </button>
                            </form>

                            {/* CTA */}
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => nav("/explore")}
                                    className="rounded-full bg-[#1F2421] px-6 py-3 font-medium text-white shadow-sm hover:bg-[#1F2421]/90"
                                >
                                    Explore Library
                                </button>

                            </div>
                        </div>

                        {/* Right */}
                        <div className="hidden md:flex justify-center">
                            <div className="relative w-72 h-60 rounded-2xl border border-[#E8E4DC] bg-[#FAF9F7] shadow-inner flex flex-col items-center justify-center">
                                <BookOpen className="h-12 w-12 text-emerald-700" />
                                <p className="mt-3 text-center text-sm text-[rgba(31,36,33,0.65)] max-w-[220px]">
                                    Browse by genre, see what’s trending, or list a book from your
                                    shelf.
                                </p>

                                {/* Decorative accents */}
                                <div className="absolute -left-4 top-6 h-14 w-2 rounded bg-emerald-600/80" />
                                <div className="absolute -right-4 bottom-8 h-20 w-2 rounded bg-amber-400/80" />
                                <div className="absolute right-8 -top-4 h-10 w-2 rounded bg-rose-400/80" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
