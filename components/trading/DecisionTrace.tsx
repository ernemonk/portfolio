"use client";

import { useState, useEffect } from "react";
import * as api from "@/lib/trading-api";

// ─── Stage style map ──────────────────────────────────────────────────────────

interface StageStyle { bg: string; text: string; border: string; dot: string }

const STAGE_STYLES: Record<string, StageStyle> = {
  CLASSIFY: { bg: "bg-indigo-950/50",  text: "text-indigo-300",  border: "border-indigo-500/25",  dot: "bg-indigo-400" },
  SIGNAL:   { bg: "bg-violet-950/50",  text: "text-violet-300",  border: "border-violet-500/25",  dot: "bg-violet-400" },
  VOTE:     { bg: "bg-blue-950/50",    text: "text-blue-300",    border: "border-blue-500/25",    dot: "bg-blue-400" },
  RISK:     { bg: "bg-amber-950/50",   text: "text-amber-300",   border: "border-amber-500/25",   dot: "bg-amber-400" },
  ENQUEUE:  { bg: "bg-emerald-950/50", text: "text-emerald-300", border: "border-emerald-500/25", dot: "bg-emerald-400" },
  EXECUTE:  { bg: "bg-cyan-950/50",    text: "text-cyan-300",    border: "border-cyan-500/25",    dot: "bg-cyan-400" },
  RECORD:   { bg: "bg-green-950/50",   text: "text-green-300",   border: "border-green-500/25",   dot: "bg-green-400" },
  ANALYZE:  { bg: "bg-teal-950/50",    text: "text-teal-300",    border: "border-teal-500/25",    dot: "bg-teal-400" },
  INFO:     { bg: "bg-white/5",        text: "text-white/50",    border: "border-white/10",       dot: "bg-white/30" },
};

// ─── Pipeline mini-map ────────────────────────────────────────────────────────

const ORDERED_STAGES = ["CLASSIFY","SIGNAL","VOTE","RISK","ENQUEUE","EXECUTE","RECORD"];

function PipelineMiniMap({ events }: { events: api.TraceEvent[] }) {
  const covered = new Set(events.map(e => e.stage));
  return (
    <div className="flex items-center gap-1 overflow-x-auto">
      {ORDERED_STAGES.map((s, i) => {
        const has   = covered.has(s);
        const style = STAGE_STYLES[s] ?? STAGE_STYLES.INFO;
        return (
          <div key={s} className="flex items-center gap-1">
            <span
              className={[
                "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border",
                has
                  ? `${style.bg} ${style.text} ${style.border}`
                  : "bg-transparent text-white/15 border-white/5",
              ].join(" ")}
            >
              {s}
            </span>
            {i < ORDERED_STAGES.length - 1 && (
              <span className="text-white/10 text-[10px]">›</span>
            )}
          </div>
        );
      })}
      <span className="ml-2 text-[9px] font-mono text-white/25 shrink-0">
        {events.length} events
      </span>
    </div>
  );
}

// ─── Single trace event row ───────────────────────────────────────────────────

function TraceRow({ event, isLast }: { event: api.TraceEvent; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const style = STAGE_STYLES[event.stage] ?? STAGE_STYLES.INFO;

  const ts = event.ts
    ? new Date(event.ts).toLocaleTimeString("en", {
        hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
      })
    : "--:--:--";

  const hasPayload =
    event.payload && Object.keys(event.payload).length > 0;

  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center pt-1">
        <span className={`w-2 h-2 rounded-full shrink-0 ${style.dot}`} />
        {!isLast && <span className="w-px flex-1 my-1 bg-white/8" />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-3 rounded-lg border ${style.border} ${style.bg} overflow-hidden`}>
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={[
                "shrink-0 text-[9px] font-mono uppercase font-semibold",
                "px-1.5 py-0.5 rounded border",
                style.bg, style.text, style.border,
              ].join(" ")}
            >
              {event.stage}
            </span>
            <span className="text-xs font-mono text-white/65 truncate">
              {event.event_type}
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {event.duration_ms != null && (
              <span className="text-[9px] font-mono text-white/25">
                {event.duration_ms}ms
              </span>
            )}
            <span className="text-[9px] font-mono text-white/35">{ts}</span>
          </div>
        </div>

        {/* Agent / model */}
        {(event.agent_name || event.model_used) && (
          <div className="flex gap-3 px-3 pb-1.5 text-[10px] font-mono">
            {event.agent_name && (
              <span className="text-white/40">
                agent <span className="text-white/60">{event.agent_name}</span>
              </span>
            )}
            {event.model_used && (
              <span className="text-white/40">
                model <span className="text-white/60">{event.model_used}</span>
              </span>
            )}
          </div>
        )}

        {/* Payload expand/collapse */}
        {hasPayload && (
          <div className="px-3 pb-2.5">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-[10px] font-mono text-white/30 hover:text-white/55 transition-colors"
            >
              <span>{expanded ? "▾" : "▸"}</span>
              <span>payload</span>
            </button>
            {expanded && (
              <pre className="mt-1.5 text-[10px] font-mono text-white/55 bg-black/30 rounded p-2.5 overflow-x-auto whitespace-pre-wrap max-h-44 overflow-y-auto border border-white/5">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Decision Trace Modal ─────────────────────────────────────────────────────

interface DecisionTraceProps {
  tradeId: string;
  onClose: () => void;
}

export function DecisionTrace({ tradeId, onClose }: DecisionTraceProps) {
  const [trace, setTrace]   = useState<api.TradeTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api.getTrace(tradeId)
      .then(data => { if (alive) { setTrace(data); setLoading(false); } })
      .catch(e  => { if (alive) { setError((e as Error).message); setLoading(false); } });
    return () => { alive = false; };
  }, [tradeId]);

  // Dismiss on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const pnl = trace?.trade?.pnl_usd;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-[#090909] border border-white/10 rounded-xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-white/8 shrink-0">
          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-widest text-white/25 mb-1">
              Decision Trace
            </p>
            <p className="font-mono text-xs text-white/70 truncate">
              {tradeId}
            </p>
          </div>

          {trace?.trade && (
            <div className="text-right shrink-0">
              <p className="text-xs text-white/55">
                {trace.trade.pair} · {trace.trade.side?.toUpperCase()} · {trace.trade.quantity}
              </p>
              <p className={`text-xs font-mono font-semibold ${pnl != null && pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {pnl != null
                  ? `${pnl >= 0 ? "+" : ""}$${pnl.toFixed(2)}`
                  : trace.trade.status}
              </p>
              {trace.trade.is_paper && (
                <p className="text-[9px] text-yellow-400/60 font-mono mt-0.5">PAPER</p>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className="shrink-0 text-white/30 hover:text-white/70 transition-colors text-xl leading-none ml-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* ── Pipeline mini-map ── */}
        {trace && trace.events.length > 0 && (
          <div className="px-5 py-2.5 border-b border-white/5 shrink-0">
            <PipelineMiniMap events={trace.events} />
          </div>
        )}

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-white/35 text-sm">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
              loading trace…
            </div>
          )}

          {error && (
            <p className="text-red-400 text-sm font-mono">{error}</p>
          )}

          {trace && trace.events.length === 0 && (
            <div className="rounded-lg border border-white/8 bg-white/[0.02] p-4 text-sm text-white/35">
              <p className="font-semibold text-white/50 mb-1">No events recorded</p>
              <p className="text-[11px] leading-relaxed">
                Audit log writes are not yet wired. The trace will populate once the
                orchestrator emits events per pipeline stage. Trade metadata is shown above.
              </p>
            </div>
          )}

          {trace && trace.events.map((ev, i) => (
            <TraceRow
              key={i}
              event={ev}
              isLast={i === trace.events.length - 1}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-white/8 shrink-0 text-[9px] font-mono text-white/25">
          <span>intent {trace?.intent_id?.slice(0, 16) ?? "—"}</span>
          {trace && (
            <span>{trace.stage_count} stages · {trace.events.length} events</span>
          )}
        </div>
      </div>
    </div>
  );
}
