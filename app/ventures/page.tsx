"use client";
import { useEffect, useState } from "react";
import { getVentures } from "@/lib/firestore/ventures";
import VentureCard from "@/components/VentureCard";
import type { Venture } from "@/types";

const categories = ["all", "owned", "client", "investment"] as const;
type Category = typeof categories[number];

export default function VenturesPage() {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [filter, setFilter] = useState<Category>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVentures()
      .then(setVentures)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? ventures : ventures.filter((v) => v.category === filter);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Ventures</h1>
      <p className="text-xl text-white/40 mb-12">
        Companies, websites, and assets — 100% Martin and beyond.
      </p>

      <div className="flex gap-2 mb-12 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === c
                ? "bg-emerald-400 text-black"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/20 text-center py-24 font-mono">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="text-white/20 text-center py-24">No ventures found. Add some in Firestore.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => <VentureCard key={v.id} venture={v} />)}
        </div>
      )}
    </div>
  );
}
