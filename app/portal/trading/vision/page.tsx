"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function VisionPage() {
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVision = useCallback(async () => {
    try {
      const res = await fetch("/docs/VISION.md");
      if (!res.ok) throw new Error(`Failed to load VISION.md: ${res.status}`);
      const text = await res.text();
      setMarkdown(text);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vision doc");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVision();
  }, [loadVision]);

  // ── Parse roadmap phases for visual cards ──────────────────────────────
  const phases = [
    { name: "Foundation", emoji: "✅", status: "done" as const, desc: "Infrastructure built, services running" },
    { name: "Integration", emoji: "🔄", status: "active" as const, desc: "Connect data flow end-to-end" },
    { name: "Hardening", emoji: "🔲", status: "pending" as const, desc: "Production-ready stability" },
    { name: "Live Trading", emoji: "🔲", status: "pending" as const, desc: "Real money, real markets" },
    { name: "Intelligence", emoji: "🔲", status: "pending" as const, desc: "AI-enhanced decisions" },
    { name: "Scale", emoji: "🔲", status: "pending" as const, desc: "Volume, speed, coverage" },
  ];

  if (loading) {
    return (
      <PortalShell title="Vision">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Vision & Roadmap">
      <div className="space-y-6 max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Phase Timeline ─────────────────────────────────────── */}
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Roadmap Phases</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {phases.map((phase, i) => (
              <div
                key={i}
                className={`relative rounded-lg p-3 border text-center transition-all ${
                  phase.status === "done"
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : phase.status === "active"
                    ? "bg-yellow-500/10 border-yellow-500/30 ring-1 ring-yellow-500/20"
                    : "bg-white/[0.02] border-white/10"
                }`}
              >
                <div className="text-2xl mb-1">{phase.emoji}</div>
                <div className="text-xs font-semibold text-white">Phase {i + 1}</div>
                <div className="text-[11px] text-zinc-400 mt-0.5">{phase.name}</div>
                <div className="text-[10px] text-zinc-500 mt-1 leading-tight">{phase.desc}</div>
                {phase.status === "active" && (
                  <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Full Markdown ───────────────────────────────────────── */}
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6 md:p-8">
          <article className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-semibold
            prose-h1:text-2xl prose-h1:border-b prose-h1:border-white/10 prose-h1:pb-3
            prose-h2:text-xl prose-h2:mt-8
            prose-h3:text-lg prose-h3:text-zinc-200
            prose-p:text-zinc-300 prose-p:leading-relaxed
            prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-code:text-emerald-300 prose-code:bg-white/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
            prose-pre:bg-[#1a1b26] prose-pre:border prose-pre:border-white/5
            prose-table:text-sm
            prose-th:text-zinc-300 prose-th:font-medium prose-th:border-white/10
            prose-td:border-white/10 prose-td:text-zinc-400
            prose-li:text-zinc-300 prose-li:marker:text-zinc-500
            prose-hr:border-white/10
            prose-blockquote:border-emerald-500/30 prose-blockquote:text-zinc-400
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {markdown}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </PortalShell>
  );
}
