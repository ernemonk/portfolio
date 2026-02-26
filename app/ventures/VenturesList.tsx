"use client";
import { useState } from "react";
import VentureCard from "@/components/VentureCard";
import type { Venture } from "@/types";

const categories = ["all", "owned", "client", "investment"] as const;
type Category = (typeof categories)[number];

export function VenturesList({ ventures }: { ventures: Venture[] }) {
  const [filter, setFilter] = useState<Category>("all");

  const filtered =
    filter === "all" ? ventures : ventures.filter((v) => v.category === filter);

  return (
    <>
      <div className="flex gap-2 mb-12 flex-wrap">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === c
                ? "bg-sky-500 text-white"
                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-white/20 text-center py-24">
          No ventures found. Add some in the portal.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <VentureCard key={v.id} venture={v} />
          ))}
        </div>
      )}
    </>
  );
}
