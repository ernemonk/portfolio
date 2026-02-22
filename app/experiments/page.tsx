"use client";
import { useEffect, useState } from "react";
import { getExperiments } from "@/lib/firestore/experiments";
import type { Experiment } from "@/types";

const statusColors: Record<string, string> = {
  building: "text-emerald-400 bg-emerald-400/10",
  scaling: "text-blue-400 bg-blue-400/10",
  research: "text-yellow-400 bg-yellow-400/10",
  archived: "text-white/20 bg-white/5",
};

export default function ExperimentsPage() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExperiments()
      .then(setExperiments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
      <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Experiments</h1>
      <p className="text-xl text-white/40 mb-16">
        Current research, R&amp;D builds, and live projects in progress.
      </p>

      {loading ? (
        <p className="text-white/20 text-center py-24 font-mono">Loading…</p>
      ) : experiments.length === 0 ? (
        <p className="text-white/20 text-center py-24">No experiments yet. Add some in Firestore.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiments.map((e) => (
            <div key={e.id} className="p-6 border border-white/10 rounded-2xl hover:border-white/30 transition-all">
              <div className="flex items-center gap-3 mb-4">
                {e.status === "building" && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColors[e.status] ?? "text-white/20 bg-white/5"}`}>
                  {e.status}
                </span>
                <span className="text-xs text-white/20 font-mono">{e.type}</span>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{e.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{e.summary}</p>
              {e.link && (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  View →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
