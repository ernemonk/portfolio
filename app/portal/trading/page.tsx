"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PortalShell from "@/components/portal/PortalShell";
import * as api from "@/lib/trading-api";
import { PipelineFlow, StageInfo } from "@/components/trading/PipelineFlow";
import { DecisionTrace } from "@/components/trading/DecisionTrace";

// ─── Shared micro-components ──────────────────────────────────────────────────

function Spin({ sm }: { sm?: boolean }) {
  const s = sm ? "h-3 w-3" : "h-3.5 w-3.5";
  return (
    <span
      className={`inline-block ${s} animate-spin rounded-full border-2 border-emerald-400 border-t-transparent`}
    />
  );
}

function Mono({
  children,
  dim,
  className = "",
}: {
  children: React.ReactNode;
  dim?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-widest ${
        dim ? "text-white/25" : "text-white/50"
      } ${className}`}
    >
      {children}
    </span>
  );
}

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.07] bg-white/[0.015] ${className}`}>
      {children}
    </div>
  );
}

function PanelHeader({
  label,
  accent,
  right,
}: {
  label: string;
  accent?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
      <div className="flex items-center gap-2">
        <Mono className={accent ?? "text-white/40"}>{label}</Mono>
        <Mono dim>DRILL PANEL</Mono>
      </div>
      {right}
    </div>
  );
}

// ─── Capital Overview Bar ─────────────────────────────────────────────────────

function CapitalBar({ snapshot }: { snapshot: api.PortfolioSnapshot | null }) {
  if (!snapshot) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.015] animate-pulse">
        <div className="h-3 w-32 rounded bg-white/10" />
        <div className="h-3 w-24 rounded bg-white/10 ml-auto" />
      </div>
    );
  }
  const heatPct  = snapshot.portfolio_heat_pct ?? 0;
  const heatColor = heatPct >= 80 ? "text-red-400" : heatPct >= 60 ? "text-yellow-400" : "text-emerald-400";
  const heatBar   = heatPct >= 80 ? "bg-red-500"   : heatPct >= 60 ? "bg-yellow-500"   : "bg-emerald-500";
  const dailyUp   = (snapshot.daily_pnl ?? 0) >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-px rounded-xl overflow-hidden border border-white/[0.07] bg-white/[0.04]">
      {/* Equity */}
      <div className="flex flex-col gap-0.5 px-4 py-3 bg-black/40">
        <Mono dim>Equity</Mono>
        <p className="text-lg font-mono font-bold text-white/90 leading-none mt-1">
          ${(snapshot.total_value_usd ?? 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
      {/* Daily PnL */}
      <div className="flex flex-col gap-0.5 px-4 py-3 bg-black/40">
        <Mono dim>Daily PnL</Mono>
        <p className={`text-lg font-mono font-bold leading-none mt-1 ${dailyUp ? "text-emerald-400" : "text-red-400"}`}>
          {dailyUp ? "+" : ""}${(snapshot.daily_pnl ?? 0).toFixed(2)}
          <span className="text-[11px] ml-1 opacity-70">
            ({dailyUp ? "+" : ""}{(snapshot.daily_pnl_pct ?? 0).toFixed(2)}%)
          </span>
        </p>
      </div>
      {/* Weekly PnL */}
      <div className="flex flex-col gap-0.5 px-4 py-3 bg-black/40">
        <Mono dim>Weekly PnL</Mono>
        <p className={`text-lg font-mono font-bold leading-none mt-1 ${(snapshot.weekly_pnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
          {(snapshot.weekly_pnl ?? 0) >= 0 ? "+" : ""}${(snapshot.weekly_pnl ?? 0).toFixed(2)}
        </p>
      </div>
      {/* Positions */}
      <div className="flex flex-col gap-0.5 px-4 py-3 bg-black/40">
        <Mono dim>Positions</Mono>
        <p className="text-lg font-mono font-bold text-white/80 leading-none mt-1">
          {(snapshot.positions ?? []).length}
          <span className="text-[11px] text-white/35 ml-1.5 font-normal">open</span>
        </p>
      </div>
      {/* Portfolio Heat */}
      <div className="flex flex-col gap-0.5 px-4 py-3 bg-black/40">
        <Mono dim>Portfolio Heat</Mono>
        <div className="flex items-center gap-2 mt-1">
          <p className={`text-lg font-mono font-bold leading-none ${heatColor}`}>
            {heatPct.toFixed(1)}%
          </p>
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${heatBar}`}
              style={{ width: `${Math.min(heatPct, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Risk Telemetry Panel ─────────────────────────────────────────────────────

function RiskTelemetry({
  riskConfig,
  snapshot,
  killActive,
}: {
  riskConfig: api.RiskConfig | null;
  snapshot: api.PortfolioSnapshot | null;
  killActive: boolean;
}) {
  if (!riskConfig) return null;

  const heat = snapshot?.portfolio_heat_pct ?? 0;
  // These are live values vs configured limits
  const bars: { label: string; value: number; max: number; suffix?: string }[] = [
    { label: "Portfolio Heat",      value: heat,                                         max: riskConfig.max_portfolio_heat_pct, suffix: "%" },
    { label: "Max Position",        value: 0,                                            max: riskConfig.max_position_size_pct, suffix: "%" },
    { label: "Strategy Alloc Cap",  value: 0,                                            max: riskConfig.max_strategy_allocation_pct, suffix: "%" },
    { label: "Daily Loss",          value: 0,                                            max: riskConfig.daily_loss_limit_usd, suffix: "$" },
    { label: "Weekly Drawdown",     value: 0,                                            max: riskConfig.weekly_drawdown_pct, suffix: "%" },
  ];

  return (
    <div className="px-4 py-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <Mono>Risk Envelope</Mono>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${killActive ? "border-red-500/50 bg-red-950/40 text-red-400" : "border-emerald-500/25 bg-emerald-950/20 text-emerald-400"}`}>
          {killActive ? "KILL ACTIVE" : "NOMINAL"}
        </span>
      </div>
      <div className="space-y-2">
        {bars.map(b => {
          const pct     = b.max > 0 ? Math.min((b.value / b.max) * 100, 100) : 0;
          const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-emerald-500";
          const txtColor = pct >= 90 ? "text-red-400" : pct >= 70 ? "text-yellow-400" : "text-white/50";
          const suffix   = b.suffix === "$" ? `$${b.value.toFixed(0)} / $${b.max}` : `${b.value.toFixed(1)} / ${b.max}${b.suffix}`;
          return (
            <div key={b.label} className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-white/35 w-36 shrink-0">{b.label}</span>
              <div className="flex-1 h-1 rounded-full bg-white/8 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
              <span className={`text-[10px] font-mono w-32 text-right ${txtColor}`}>{suffix}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Event Timeline ───────────────────────────────────────────────────────────

const EVENT_STAGE: Record<string, { label: string; color: string }> = {
  REGIME_CLASSIFIED:     { label: "CLASSIFY",  color: "text-indigo-400" },
  SIGNAL_GENERATED:      { label: "SIGNAL",    color: "text-violet-400" },
  STRATEGY_SELECTED:     { label: "SIGNAL",    color: "text-violet-400" },
  AGENT_VOTE:            { label: "VOTE",      color: "text-blue-400"   },
  META_AGENT_EVALUATION: { label: "VOTE",      color: "text-blue-400"   },
  RISK_CHECK:            { label: "RISK",      color: "text-amber-400"  },
  RISK_REJECTED:         { label: "RISK",      color: "text-red-400"    },
  ORDER_PLACED:          { label: "ENQUEUE",   color: "text-emerald-400"},
  ORDER_FILLED:          { label: "EXECUTE",   color: "text-cyan-400"   },
  TRADE_RECORDED:        { label: "RECORD",    color: "text-green-400"  },
};

function EventTimeline({ auditLog, maxItems = 12 }: { auditLog: api.AuditEntry[]; maxItems?: number }) {
  const sorted = [...auditLog].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return tb - ta;
  }).slice(0, maxItems);

  if (sorted.length === 0) {
    return <p className="text-white/20 text-[10px] font-mono px-4 pb-4">No events yet. Run pipeline to generate activity.</p>;
  }

  return (
    <div className="px-4 pb-3 space-y-1.5 max-h-48 overflow-y-auto">
      {sorted.map((e, i) => {
        const meta    = EVENT_STAGE[e.event_type];
        const ts      = e.created_at ? new Date(typeof e.created_at === "string" ? e.created_at : (e.created_at as number) * 1000).toLocaleTimeString("en", { hour12: false }) : "—";
        const regime  = (e.output as Record<string, unknown>)?.regime as string | undefined;
        const action  = (e.output as Record<string, unknown>)?.action as string | undefined;
        const reason  = (e.output as Record<string, unknown>)?.reason as string | undefined;
        const detail  = regime ?? action ?? reason ?? e.agent_name ?? "";
        return (
          <div key={i} className="flex items-center gap-2.5 text-[10px] font-mono py-1 border-b border-white/[0.04] last:border-0">
            <span className="text-white/20 w-16 shrink-0 tabular-nums">{ts}</span>
            <span className={`w-14 shrink-0 font-semibold ${meta?.color ?? "text-white/30"}`}>{meta?.label ?? "INFO"}</span>
            <span className="text-white/50 truncate">{e.event_type}</span>
            {detail && <span className="text-white/30 ml-auto shrink-0 truncate max-w-24">{String(detail)}</span>}
          </div>
        );
      })}
    </div>
  );
}

// ─── Queue Depth Meter ────────────────────────────────────────────────────────

function QueueMeter({ depth }: { depth: number }) {
  const color = depth >= 6 ? "bg-red-500" : depth >= 3 ? "bg-yellow-500" : "bg-emerald-500";
  const txtColor = depth >= 6 ? "text-red-400" : depth >= 3 ? "text-yellow-400" : depth > 0 ? "text-emerald-400" : "text-white/35";
  const pct = Math.min((depth / 10) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[11px] font-mono font-bold tabular-nums ${txtColor}`}>{depth}</span>
      <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─── Pipeline Result Card ─────────────────────────────────────────────────────

function PipelineResultCard({ result, onClose }: { result: unknown; onClose: () => void }) {
  if (!result) return null;
  const r = result as Record<string, unknown>;
  const intents  = Number(r.intents_generated  ?? r.intents  ?? "—");
  const approved = Number(r.approved           ?? "—");
  const rejected = Number(r.rejected           ?? "—");
  const enqueued = Number(r.enqueued           ?? "—");
  const reason   = r.rejection_reason ?? r.error ?? null;
  const isError  = !!r.error;

  const stat = (label: string, val: unknown, hiColor: string) => (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-base font-mono font-bold ${hiColor}`}>{String(val)}</span>
      <Mono dim>{label}</Mono>
    </div>
  );

  if (isError) {
    return (
      <div className="rounded-lg border border-red-500/25 bg-red-950/15 p-3 flex items-center justify-between gap-4">
        <div>
          <Mono className="text-red-400/70">Pipeline Error</Mono>
          <p className="text-[11px] font-mono text-red-300/60 mt-1">{String(reason)}</p>
        </div>
        <button onClick={onClose} className="text-white/25 hover:text-white/55 text-sm shrink-0">×</button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <Mono className="text-emerald-400/70">Pipeline Complete</Mono>
        <button onClick={onClose} className="text-white/25 hover:text-white/55 text-sm">×</button>
      </div>
      <div className="flex items-center justify-around gap-4">
        {stat("Intents",  isNaN(intents)  ? "—" : intents,  "text-white/70")}
        {stat("Approved", isNaN(approved) ? "—" : approved, "text-emerald-400")}
        {stat("Rejected", isNaN(rejected) ? "—" : rejected, rejected > 0 ? "text-red-400" : "text-white/35")}
        {stat("Enqueued", isNaN(enqueued) ? "—" : enqueued, enqueued > 0 ? "text-cyan-400" : "text-white/35")}
      </div>
      {reason && !isError && (
        <p className="text-[10px] font-mono text-white/30 mt-3 pt-3 border-t border-white/5">
          Rejection reason: <span className="text-amber-400/60">{String(reason)}</span>
        </p>
      )}
    </div>
  );
}



const STAGE_ACCENT: Record<string, string> = {
  classify: "text-indigo-400",
  signal:   "text-violet-400",
  vote:     "text-blue-400",
  risk:     "text-amber-400",
  queue:    "text-emerald-400",
  execute:  "text-cyan-400",
  record:   "text-green-400",
  analyze:  "text-teal-400",
};

// ─── Trade Ledger ─────────────────────────────────────────────────────────────

function TradeLedger({
  trades,
  onTrace,
  maxRows = 20,
}: {
  trades: api.Trade[];
  onTrace: (id: string) => void;
  maxRows?: number;
}) {
  if (trades.length === 0) {
    return <p className="text-white/30 text-xs mt-3 px-1">No trades recorded yet.</p>;
  }
  return (
    <div className="overflow-x-auto mt-3">
      <table className="w-full text-xs font-mono border-collapse">
        <thead>
          <tr className="text-white/25 border-b border-white/8">
            {["Pair","Side","Qty","Price","PnL","Status",""].map(h => (
              <th key={h} className="pb-2 text-left pr-4 font-normal whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.slice(0, maxRows).map(t => (
            <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] group transition-colors">
              <td className="py-2 pr-4 text-white/75">{t.pair}</td>
              <td className={`py-2 pr-4 font-semibold ${t.side === "buy" ? "text-emerald-400" : "text-red-400"}`}>
                {t.side?.toUpperCase()}
              </td>
              <td className="py-2 pr-4 text-white/55">{t.quantity}</td>
              <td className="py-2 pr-4 text-white/55">
                {t.executed_price ? `$${t.executed_price.toLocaleString()}` : "—"}
              </td>
              <td className={`py-2 pr-4 font-semibold ${(t.pnl_usd ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {t.pnl_usd != null ? `${t.pnl_usd >= 0 ? "+" : ""}$${t.pnl_usd.toFixed(2)}` : "—"}
              </td>
              <td className="py-2 pr-4 text-white/35">{t.status}</td>
              <td className="py-2">
                <button
                  onClick={() => onTrace(t.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] px-2 py-0.5 rounded border border-white/15 text-white/45 hover:text-white/75 hover:border-white/25"
                >
                  TRACE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── CLASSIFY drill ───────────────────────────────────────────────────────────

function ClassifyDrill() {
  const [pair, setPair]     = useState("BTC/USD");
  const [result, setResult] = useState<unknown>(null);
  const [running, setRunning] = useState(false);

  const classify = async () => {
    setRunning(true);
    try   { setResult(await api.classifyRegime(pair)); }
    catch (e) { setResult({ error: (e as Error).message }); }
    finally { setRunning(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      <div className="space-y-3">
        <Mono>Trigger Regime Classification</Mono>
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white/80 font-mono focus:outline-none focus:border-indigo-500/50"
            value={pair}
            onChange={e => setPair(e.target.value)}
            placeholder="BTC/USD"
          />
          <button
            onClick={classify} disabled={running}
            className="px-4 py-1.5 rounded bg-indigo-600/70 hover:bg-indigo-600 text-white text-sm font-mono disabled:opacity-50 transition-colors"
          >
            {running ? <Spin /> : "Classify"}
          </button>
        </div>
        {result != null && (
          <pre className="text-[10px] font-mono text-white/55 bg-black/30 rounded p-3 overflow-x-auto max-h-32 border border-white/5">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
      <div className="text-[11px] text-white/35 leading-relaxed space-y-2">
        <Mono>How it works</Mono>
        <p className="mt-2">
          The orchestrator computes RSI, ATR, and SMA crossovers for the given pair,
          then labels the regime: <span className="text-white/55">BULL / BEAR / SIDEWAYS / VOLATILE</span>.
        </p>
        <p>Each classification is the first filter before any signal is generated.</p>
      </div>
    </div>
  );
}

// ─── SIGNAL drill ─────────────────────────────────────────────────────────────

function SignalDrill({
  strategies, toggling, onToggle,
}: {
  strategies: api.Strategy[];
  toggling: string | null;
  onToggle: (name: string, enable: boolean) => void;
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Mono>Strategies — {strategies.length} total</Mono>
        <Mono dim>{strategies.filter(s => s.enabled).length} enabled</Mono>
      </div>
      <div className="space-y-2">
        {strategies.map(s => (
          <div key={s.name} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors">
            <div className="min-w-0">
              <p className="text-sm text-white/80 font-mono truncate">{s.name}</p>
              {s.description && <p className="text-[10px] text-white/35 mt-0.5 truncate">{s.description}</p>}
            </div>
            <button
              onClick={() => onToggle(s.name, !s.enabled)}
              disabled={toggling === s.name}
              className={[
                "shrink-0 ml-3 px-3 py-1 rounded text-[10px] font-mono font-semibold border transition-colors disabled:opacity-50",
                s.enabled
                  ? "bg-emerald-600/20 text-emerald-400 border-emerald-600/30 hover:bg-emerald-600/30"
                  : "bg-white/5 text-white/25 border-white/10 hover:border-white/20 hover:text-white/40",
              ].join(" ")}
            >
              {toggling === s.name ? <Spin sm /> : s.enabled ? "ENABLED" : "DISABLED"}
            </button>
          </div>
        ))}
        {strategies.length === 0 && <p className="text-white/30 text-xs">No strategies found.</p>}
      </div>
    </div>
  );
}

// ─── VOTE drill ───────────────────────────────────────────────────────────────

function VoteDrill({ auditLog }: { auditLog: api.AuditEntry[] }) {
  const [pair, setPair]     = useState("BTC/USD");
  const [regime, setRegime] = useState("BULL");
  const [result, setResult] = useState<api.VoteResult | null>(null);
  const [running, setRunning] = useState(false);
  const [err, setErr]       = useState<string | null>(null);

  const voteEvents = auditLog.filter(e =>
    ["AGENT_VOTE","META_AGENT_EVALUATION","AGENT_REASONING"].includes(e.event_type)
  );

  const castVote = async () => {
    setRunning(true); setErr(null);
    try   { setResult(await api.castVote({ pair, regime, strategy_name: "auto", side: "buy", quantity: 0.001 })); }
    catch (e) { setErr((e as Error).message); }
    finally { setRunning(false); }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      <div className="space-y-3">
        <Mono>Manual Vote</Mono>
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-sm text-white/80 font-mono focus:outline-none focus:border-blue-500/50"
            value={pair} onChange={e => setPair(e.target.value)} placeholder="BTC/USD"
          />
          <select
            className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-sm text-white/80 font-mono focus:outline-none"
            value={regime} onChange={e => setRegime(e.target.value)}
          >
            {["BULL","BEAR","SIDEWAYS","VOLATILE"].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button
            onClick={castVote} disabled={running}
            className="px-4 py-1.5 rounded bg-blue-600/70 hover:bg-blue-600 text-white text-sm font-mono disabled:opacity-50 transition-colors"
          >
            {running ? <Spin /> : "Vote"}
          </button>
        </div>
        {err && <p className="text-red-400 text-xs font-mono">{err}</p>}
        {result && (
          <div className={`rounded-lg p-3 border ${result.action === "EXECUTE" ? "border-emerald-500/30 bg-emerald-950/30" : "border-red-500/30 bg-red-950/30"}`}>
            <p className={`text-sm font-mono font-semibold ${result.action === "EXECUTE" ? "text-emerald-400" : "text-red-400"}`}>
              {result.action} · {((result.confidence ?? 0) * 100).toFixed(0)}% confidence
            </p>
            <p className="text-[10px] text-white/40 mt-1">
              {result.votes?.length ?? 0} agents · threshold {((result.threshold ?? 0) * 100).toFixed(0)}%
            </p>
            {result.votes?.map((v, i) => (
              <div key={i} className="flex items-center gap-3 text-[10px] font-mono mt-1">
                <span className="text-white/50 w-28 truncate">{v.agent_name}</span>
                <span className={v.action === "EXECUTE" ? "text-emerald-400" : "text-red-400"}>{v.action}</span>
                <span className="text-white/35">{((v.confidence ?? 0) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <Mono>Recent Vote Events ({voteEvents.length})</Mono>
        <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto">
          {voteEvents.map((e, i) => (
            <div key={i} className="flex items-center justify-between text-[10px] p-2 bg-white/[0.02] rounded border border-white/5 font-mono">
              <span className="text-white/55">{e.agent_name ?? "—"}</span>
              <span className="text-white/35">{e.event_type}</span>
            </div>
          ))}
          {voteEvents.length === 0 && <p className="text-white/25 text-[10px]">No vote events in audit log yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── RISK drill ───────────────────────────────────────────────────────────────

function RiskDrill({
  riskConfig, killActive, snapshot, onSave, onKillToggle,
}: {
  riskConfig: api.RiskConfig | null;
  killActive: boolean;
  snapshot: api.PortfolioSnapshot | null;
  onSave: (cfg: api.RiskConfig) => Promise<void>;
  onKillToggle: () => void;
}) {
  type Key = keyof api.RiskConfig;
  const [draft, setDraft] = useState<api.RiskConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const cfg = draft ?? riskConfig;

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try   { await onSave(draft); setDraft(null); }
    finally { setSaving(false); }
  };

  const numField = (key: Key, label: string, step = 0.1) => (
    <div key={String(key)} className="flex items-center justify-between gap-4">
      <label className="text-[11px] text-white/45 min-w-[160px]">{label}</label>
      <input
        type="number" step={step}
        value={cfg ? String(cfg[key]) : ""}
        onChange={e => setDraft({ ...(draft ?? riskConfig!), [key]: parseFloat(e.target.value) || 0 })}
        className="w-24 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs font-mono text-white/80 text-right focus:outline-none focus:border-amber-500/50"
      />
    </div>
  );

  return (
    <div>
      {/* ── Live Risk Telemetry ── */}
      <div className="border-b border-white/5 p-4">
        <RiskTelemetry riskConfig={cfg} snapshot={snapshot} killActive={killActive} />
      </div>
      <div className="grid md:grid-cols-2 gap-4 p-4">
      <div className="space-y-2.5">
        <Mono>Risk Config</Mono>
        <div className="mt-2 space-y-2.5">
          {cfg ? (
            <>
              {numField("max_position_size_pct",       "Max Position Size %")}
              {numField("max_strategy_allocation_pct", "Max Strategy Alloc %")}
              {numField("max_portfolio_heat_pct",      "Max Portfolio Heat %")}
              {numField("daily_loss_limit_usd",        "Daily Loss Limit $", 100)}
              {numField("weekly_drawdown_pct",         "Weekly Drawdown %")}
              {numField("max_leverage",                "Max Leverage", 0.5)}
              <div className="flex items-center justify-between gap-4">
                <label className="text-[11px] text-white/45">Close on Kill Switch</label>
                <button
                  onClick={() => setDraft({ ...(draft ?? cfg!), close_positions_on_kill_switch: !cfg.close_positions_on_kill_switch })}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${cfg.close_positions_on_kill_switch ? "border-emerald-500/30 bg-emerald-950/30 text-emerald-400" : "border-white/10 bg-white/5 text-white/30"}`}
                >
                  {cfg.close_positions_on_kill_switch ? "YES" : "NO"}
                </button>
              </div>
              {draft && (
                <div className="flex gap-2 pt-1">
                  <button onClick={save} disabled={saving} className="px-4 py-1.5 rounded bg-amber-600/70 hover:bg-amber-600 text-white text-xs font-mono disabled:opacity-50 transition-colors">
                    {saving ? <Spin sm /> : "Save Config"}
                  </button>
                  <button onClick={() => setDraft(null)} className="px-4 py-1.5 rounded bg-white/8 text-white/40 text-xs font-mono hover:bg-white/12 transition-colors">
                    Cancel
                  </button>
                </div>
              )}
            </>
          ) : <p className="text-white/30 text-xs">Loading risk config…</p>}
        </div>
      </div>
      <div className="space-y-3">
        <Mono>Kill Switch</Mono>
        <button
          onClick={onKillToggle}
          className={["w-full py-4 rounded-lg border-2 font-mono text-sm font-semibold transition-all mt-2",
            killActive ? "border-red-500 bg-red-950/50 text-red-400 hover:bg-red-950/70" : "border-white/15 bg-white/[0.03] text-white/40 hover:border-white/25 hover:text-white/60",
          ].join(" ")}
        >
          {killActive ? "◉  KILL SWITCH ACTIVE" : "○  KILL SWITCH INACTIVE"}
        </button>
        <p className="text-[10px] text-white/30 leading-relaxed">
          Activating immediately halts all new orders.{" "}
          <span className="text-amber-400/60">Close on Kill</span> will liquidate open positions.
        </p>
      </div>
    </div>
    </div>
  );
}

// ─── QUEUE drill ──────────────────────────────────────────────────────────────

function QueueDrill({ queueDepth, auditLog }: { queueDepth: number; auditLog: api.AuditEntry[] }) {
  const entries = auditLog.filter(e => e.event_type === "ORDER_PLACED");
  return (
    <div className="p-4 grid md:grid-cols-3 gap-4">
      <div className="flex flex-col items-center justify-center py-2">
        <Mono dim>Queue Depth</Mono>
        <p className={`text-5xl font-mono font-bold mt-2 ${queueDepth > 0 ? "text-yellow-400" : "text-emerald-400"}`}>
          {queueDepth}
        </p>
        <p className="text-[10px] text-white/25 mt-1">pending orders</p>
      </div>
      <div className="md:col-span-2">
        <Mono>Recent Enqueues</Mono>
        <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
          {entries.map((e, i) => (
            <div key={i} className="flex items-center gap-3 text-[10px] font-mono p-2 bg-white/[0.02] rounded border border-white/5">
              <span className="text-white/25">{i + 1}</span>
              <span className="text-white/50">{e.event_type}</span>
              <span className="text-white/30 ml-auto">{e.agent_name ?? "—"}</span>
            </div>
          ))}
          {entries.length === 0 && <p className="text-white/25 text-[10px]">No ORDER_PLACED events in audit log.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── EXECUTE drill ────────────────────────────────────────────────────────────

function ExecuteDrill({ trades }: { trades: api.Trade[] }) {
  const t = trades[0];
  const cells: [string, string][] = t ? [
    ["Pair",           t.pair],
    ["Side",           t.side?.toUpperCase() ?? "—"],
    ["Quantity",       String(t.quantity)],
    ["Executed Price", t.executed_price ? `$${t.executed_price.toLocaleString()}` : "—"],
    ["Strategy",       t.strategy_name ?? "—"],
    ["Status",         t.status],
    ["PnL",            t.pnl_usd != null ? `${t.pnl_usd >= 0 ? "+" : ""}$${t.pnl_usd.toFixed(2)}` : "—"],
    ["Trade ID",       t.id ? t.id.slice(0, 14) + "…" : "—"],
  ] : [];
  return (
    <div className="p-4">
      <Mono>Last Execution</Mono>
      {t ? (
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {cells.map(([label, val]) => (
            <div key={label} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <p className="text-[9px] font-mono uppercase text-white/25 mb-1">{label}</p>
              <p className="text-sm font-mono text-white/80 truncate">{val}</p>
            </div>
          ))}
        </div>
      ) : <p className="text-white/30 text-xs mt-3">No trades recorded yet.</p>}
    </div>
  );
}

// ─── RECORD drill ─────────────────────────────────────────────────────────────

function RecordDrill({ trades, onTrace }: { trades: api.Trade[]; onTrace: (id: string) => void }) {
  return (
    <div className="p-4">
      <Mono>Trade Ledger — {trades.length} records</Mono>
      <TradeLedger trades={trades} onTrace={onTrace} />
    </div>
  );
}

// ─── ANALYZE drill ────────────────────────────────────────────────────────────

function AnalyzeDrill({ metrics, onRefresh }: { metrics: api.StrategyMetrics[]; onRefresh: () => void }) {
  const [refreshing, setRefreshing] = useState(false);
  const doRefresh = async () => {
    setRefreshing(true);
    try   { await api.refreshMetrics(); onRefresh(); }
    catch { /* silent */ }
    finally { setRefreshing(false); }
  };
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <Mono>Strategy Metrics — {metrics.length} strategies</Mono>
        <button onClick={doRefresh} disabled={refreshing} className="text-[10px] font-mono text-white/30 hover:text-teal-400 transition-colors disabled:opacity-50">
          {refreshing ? <Spin sm /> : "↻ refresh"}
        </button>
      </div>
      {metrics.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="text-white/25 border-b border-white/8">
                {["Strategy","Trades","Win %","Avg PnL","Total PnL"].map(h => (
                  <th key={h} className="pb-2 text-left pr-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.strategy_name} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 pr-4 text-white/75">{m.strategy_name}</td>
                  <td className="py-2 pr-4 text-white/50">{m.total_trades}</td>
                  <td className="py-2 pr-4 text-emerald-400">{((m.win_rate ?? 0) * 100).toFixed(1)}%</td>
                  <td className={`py-2 pr-4 ${(m.avg_pnl_usd ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {(m.avg_pnl_usd ?? 0) >= 0 ? "+" : ""}${(m.avg_pnl_usd ?? 0).toFixed(2)}
                  </td>
                  <td className={`py-2 ${(m.total_pnl_usd ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {(m.total_pnl_usd ?? 0) >= 0 ? "+" : ""}${(m.total_pnl_usd ?? 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-white/30 text-xs">
          No metrics yet. Run{" "}
          <button onClick={doRefresh} className="underline text-teal-400/70 hover:text-teal-400">refresh</button>{" "}
          to compute from recorded trades.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main TradingOS page
// ─────────────────────────────────────────────────────────────────────────────

const SERVICE_NAMES: api.ServiceName[] = [
  "portfolio","strategy","risk","execution","orchestrator","analytics",
];

export default function TradingPage() {
  // ── Data ───────────────────────────────────────────────────────────────────
  const [health,     setHealth]    = useState<api.HealthResult[]>([]);
  const [strategies, setStrategies]= useState<api.Strategy[]>([]);
  const [trades,     setTrades]    = useState<api.Trade[]>([]);
  const [riskConfig, setRiskConfig]= useState<api.RiskConfig | null>(null);
  const [metrics,    setMetrics]   = useState<api.StrategyMetrics[]>([]);
  const [queueDepth, setQueueDepth]= useState(0);
  const [auditLog,   setAuditLog]  = useState<api.AuditEntry[]>([]);
  const [snapshot,   setSnapshot]  = useState<api.PortfolioSnapshot | null>(null);
  const [dailyPnl,   setDailyPnl]  = useState<api.DailyPnlEntry[]>([]);

  // ── UI ─────────────────────────────────────────────────────────────────────
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [activeStage,     setActiveStage]     = useState<string | null>(null);
  const [traceId,         setTraceId]         = useState<string | null>(null);
  const [toggling,        setToggling]        = useState<string | null>(null);
  const [killActive,      setKillActive]      = useState(false);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [pipelineResult,  setPipelineResult]  = useState<unknown>(null);
  const [lastRefresh,     setLastRefresh]     = useState<Date | null>(null);
  const [killHistory,     setKillHistory]     = useState<Date | null>(null);
  const [showTimeline,    setShowTimeline]    = useState(false);
  const killRef = useRef(killActive);

  // ── Fetch all data ─────────────────────────────────────────────────────────
  const refresh = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const [h, st, tr, rc, m, qd, al, snap, dp] = await Promise.allSettled([
      api.getAllHealth(),
      api.getStrategies(),
      api.getTrades(30),
      api.getRiskConfig(),
      api.getStrategyMetrics(),
      api.getQueueDepth(),
      api.getAuditLog(50),
      api.getSnapshot(),
      api.getDailyPnl(),
    ]);
    if (h.status    === "fulfilled") setHealth(h.value);
    if (st.status   === "fulfilled") setStrategies(st.value);
    if (tr.status   === "fulfilled") setTrades(tr.value);
    if (rc.status   === "fulfilled") setRiskConfig(rc.value);
    if (m.status    === "fulfilled") setMetrics(m.value);
    if (qd.status   === "fulfilled") setQueueDepth((qd.value as api.QueueDepth).depth ?? 0);
    if (al.status   === "fulfilled") setAuditLog(al.value);
    if (snap.status === "fulfilled") setSnapshot(snap.value);
    if (dp.status   === "fulfilled") setDailyPnl(dp.value);
    setLastRefresh(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(() => refresh(true), 30_000);
    return () => clearInterval(t);
  }, [refresh]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleStrategy = useCallback(async (name: string, enable: boolean) => {
    setToggling(name);
    try {
      const fn = enable ? api.enableStrategy : api.disableStrategy;
      const updated = await fn(name);
      setStrategies(prev => prev.map(s => s.name === updated.name ? updated : s));
    } finally { setToggling(null); }
  }, []);

  const saveRiskConfig = useCallback(async (cfg: api.RiskConfig) => {
    const updated = await api.updateRiskConfig(cfg);
    setRiskConfig(updated);
  }, []);

  const toggleKillSwitch = useCallback(async () => {
    try {
      if (killActive) {
        await api.deactivateKillSwitch();
        setKillActive(false);
        killRef.current = false;
      } else {
        await api.activateKillSwitch();
        setKillActive(true);
        killRef.current = true;
        setKillHistory(new Date());
      }
    } catch { /* silent */ }
  }, [killActive]);

  const runPipeline = useCallback(async () => {
    setPipelineRunning(true); setPipelineResult(null);
    try {
      const res = await api.runPipeline("BTC/USD");
      setPipelineResult(res);
      await refresh(true);
    } catch (e) { setPipelineResult({ error: (e as Error).message }); }
    finally { setPipelineRunning(false); }
  }, [refresh]);

  // ── Compute stage data ────────────────────────────────────────────────────
  const healthMap     = Object.fromEntries(health.map(h => [h.service, h]));
  const svcStatus     = (svc: api.ServiceName): "ok" | "idle" | "warn" | "error" => {
    const h = healthMap[svc];
    if (!h) return "idle";
    if (h.error) return "error";
    return h.result?.status === "ok" ? "ok" : "warn";
  };

  const enabledSt  = strategies.filter(s => s.enabled);
  const lastTrade  = trades[0] ?? null;
  const totalPnl   = metrics.reduce((s, m) => s + (m.total_pnl_usd ?? 0), 0);
  const bestWR     = metrics.length ? Math.max(...metrics.map(m => m.win_rate ?? 0)) : null;
  const lastVote   = auditLog.find(e => e.event_type === "META_AGENT_EVALUATION");
  const lastRegime = auditLog.find(e => e.event_type === "REGIME_CLASSIFIED");

  // Extract last regime output for display
  const lastRegimeOut   = lastRegime?.output as Record<string, unknown> | undefined;
  const lastRegimeName  = lastRegimeOut?.regime  as string | undefined;
  const lastRegimeConf  = lastRegimeOut?.confidence as number | undefined;
  const lastRegimeAdx   = lastRegimeOut?.adx       as number | undefined;
  const lastRegimeAtr   = lastRegimeOut?.atr_pct   as number | undefined;

  const toTs = (v: string | number | null | undefined): string | null => {
    if (!v) return null;
    if (typeof v === "string") return v;
    return new Date(v > 1e10 ? v : v * 1000).toISOString();
  };

  const stages: StageInfo[] = [
    {
      id: "classify", label: "Classify", color: "indigo", service: "orchestrator",
      status: svcStatus("orchestrator"),
      headline: lastRegimeName ?? (lastRegime ? "CLASSIFIED" : "AWAITING"),
      sub: lastRegimeConf != null
        ? `conf ${(lastRegimeConf * 100).toFixed(0)}%${lastRegimeAdx != null ? ` · ADX ${lastRegimeAdx.toFixed(1)}` : ""}${lastRegimeAtr != null ? ` · ATR ${lastRegimeAtr.toFixed(2)}%` : ""}`
        : "market regime detection",
      ts: null,
    },
    {
      id: "signal", label: "Signal", color: "violet", service: "strategy",
      status: svcStatus("strategy"),
      headline: `${enabledSt.length} active`,
      sub: `${strategies.length} total strategies`,
      ts: null,
    },
    {
      id: "vote", label: "Vote", color: "blue", service: "orchestrator",
      status: lastVote ? "ok" : svcStatus("orchestrator"),
      headline: lastVote ? String((lastVote.output as Record<string,unknown>)?.action ?? "—") : "—",
      sub: "multi-agent consensus",
      ts: null,
    },
    {
      id: "risk", label: "Risk", color: "amber", service: "risk",
      status: killActive ? "warn" : svcStatus("risk"),
      headline: killActive ? "KILL ACTIVE" : "OK",
      sub: riskConfig ? `heat ≤ ${riskConfig.max_portfolio_heat_pct}%` : "—",
      ts: null,
    },
    {
      id: "queue", label: "Queue", color: "emerald", service: "execution",
      status: svcStatus("execution"),
      headline: `${queueDepth} pending`,
      sub: "order queue depth",
      ts: null,
    },
    {
      id: "execute", label: "Execute", color: "cyan", service: "execution",
      status: svcStatus("execution"),
      headline: lastTrade?.pair ?? "—",
      sub: lastTrade ? `${lastTrade.side?.toUpperCase()} ${lastTrade.quantity}` : "no fills",
      ts: lastTrade ? toTs(lastTrade.created_at) : null,
    },
    {
      id: "record", label: "Record", color: "green", service: "analytics",
      status: svcStatus("analytics"),
      headline: `${trades.length} trades`,
      sub: totalPnl !== 0 ? `${totalPnl >= 0 ? "+" : ""}$${totalPnl.toFixed(2)} PnL` : "no PnL data",
      ts: lastTrade ? toTs(lastTrade.created_at) : null,
    },
    {
      id: "analyze", label: "Analyze", color: "teal", service: "analytics",
      status: svcStatus("analytics"),
      headline: bestWR != null ? `WR ${(bestWR * 100).toFixed(0)}%` : "—",
      sub: `${metrics.length} strategy metrics`,
      ts: null,
    },
  ];

  // ── Stage drill dispatcher ─────────────────────────────────────────────────
  const renderDrill = (stage: string) => {
    switch (stage) {
      case "classify": return <ClassifyDrill />;
      case "signal":   return <SignalDrill strategies={strategies} toggling={toggling} onToggle={toggleStrategy} />;
      case "vote":     return <VoteDrill auditLog={auditLog} />;
      case "risk":     return <RiskDrill riskConfig={riskConfig} killActive={killActive} snapshot={snapshot} onSave={saveRiskConfig} onKillToggle={toggleKillSwitch} />;
      case "queue":    return <QueueDrill queueDepth={queueDepth} auditLog={auditLog} />;
      case "execute":  return <ExecuteDrill trades={trades} />;
      case "record":   return <RecordDrill trades={trades} onTrace={setTraceId} />;
      case "analyze":  return <AnalyzeDrill metrics={metrics} onRefresh={() => refresh(true)} />;
      default:         return null;
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <PortalShell title="Trading OS">
      <div className={`space-y-4 pb-8 transition-colors duration-500 ${killActive ? "relative" : ""}`}>

        {/* ── Kill active overlay ring ── */}
        {killActive && (
          <div className="pointer-events-none fixed inset-0 z-10 border-2 border-red-500/20 rounded-lg" />
        )}

        {/* ── Header ── */}
        <div className={`flex items-center justify-between gap-3 pb-2 border-b transition-colors duration-500 ${killActive ? "border-red-500/30" : "border-white/5"}`}>
          <div>
            <h1 className="text-base font-semibold text-white/90 tracking-tight">Trading OS</h1>
            <p className="text-[10px] font-mono text-white/25 mt-0.5">
              classify → signal → vote → risk → queue → execute → record → analyze
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[9px] font-mono px-2 py-1 rounded bg-yellow-400/8 text-yellow-400/70 border border-yellow-400/15">PAPER</span>
            {killHistory && (
              <span className="text-[9px] font-mono text-red-400/50">
                kill: {killHistory.toLocaleTimeString("en", { hour12: false })}
              </span>
            )}
            {lastRefresh && (
              <span className="text-[9px] font-mono text-white/20">
                {lastRefresh.toLocaleTimeString("en", { hour12: false })}
              </span>
            )}
            <button
              onClick={() => refresh()} disabled={refreshing} title="Refresh all data"
              className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-white/35 hover:text-white/65 transition-colors"
            >
              <svg className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 0 0 10.9 3.4M14 8A6 6 0 0 0 3.1 4.6M14 3v4h-4M2 13V9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={runPipeline} disabled={pipelineRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700/70 hover:bg-emerald-700 text-white text-[11px] font-mono font-semibold transition-colors disabled:opacity-50"
            >
              {pipelineRunning ? <Spin sm /> : (
                <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="currentColor"><path d="M2 1.5l6 3.5-6 3.5z" /></svg>
              )}
              {pipelineRunning ? "Running…" : "Run Pipeline"}
            </button>
          </div>
        </div>

        {/* ── Capital Overview ── */}
        <CapitalBar snapshot={snapshot} />

        {/* ── System State Banner ── */}
        <div className={`flex items-center gap-4 px-3 py-2 rounded-lg border overflow-x-auto transition-colors duration-500 ${killActive ? "bg-red-950/10 border-red-500/15" : "bg-white/[0.02] border-white/[0.05]"}`}>
          <Mono dim>Services</Mono>
          <div className="flex items-center gap-4">
            {SERVICE_NAMES.map(svc => {
              const h  = healthMap[svc];
              const ok = h && !h.error && h.result?.status === "ok";
              const dn = !h || !!h.error;
              return (
                <div key={svc} className="flex items-center gap-1.5 shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-400" : dn ? "bg-red-400" : "bg-yellow-400"}`} />
                  <span className="text-[10px] font-mono text-white/45">{svc}</span>
                </div>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-5 shrink-0">
            <div className="flex items-center gap-2">
              <Mono dim>Queue</Mono>
              <QueueMeter depth={queueDepth} />
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${killActive ? "bg-red-400 animate-pulse" : "bg-white/15"}`} />
              <span className={`text-[10px] font-mono ${killActive ? "text-red-400 font-semibold" : "text-white/25"}`}>
                {killActive ? "KILL ACTIVE" : "KILL INACTIVE"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Pipeline Flow ── */}
        {loading ? (
          <div className="flex items-center gap-2.5 text-white/30 text-sm py-6 pl-1">
            <Spin /> initializing trading pipeline…
          </div>
        ) : (
          <PipelineFlow
            stages={stages}
            activeStage={activeStage}
            onStageClick={(id) => setActiveStage(prev => prev === id ? null : id)}
          />
        )}

        {/* ── Pipeline run result ── */}
        {pipelineResult != null && (
          <PipelineResultCard result={pipelineResult} onClose={() => setPipelineResult(null)} />
        )}

        {/* ── Event Timeline ── */}
        <Panel>
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 cursor-pointer select-none"
            onClick={() => setShowTimeline(prev => !prev)}
          >
            <div className="flex items-center gap-2">
              <Mono>System Events</Mono>
              <Mono dim>{auditLog.length} entries</Mono>
            </div>
            <span className="text-white/25 text-xs font-mono">{showTimeline ? "▲" : "▼"}</span>
          </div>
          {showTimeline && <EventTimeline auditLog={auditLog} />}
        </Panel>

        {/* ── Stage Drill Panel ── */}
        {activeStage && (
          <Panel>
            <PanelHeader
              label={activeStage}
              accent={STAGE_ACCENT[activeStage]}
              right={
                <button onClick={() => setActiveStage(null)} className="text-white/25 hover:text-white/60 transition-colors text-lg leading-none">×</button>
              }
            />
            {renderDrill(activeStage)}
          </Panel>
        )}

        {/* ── Recent Trades ── */}
        <Panel>
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5">
            <Mono>Recent Trades</Mono>
            <div className="flex items-center gap-3">
              <Mono dim>{trades.length} records</Mono>
              <button onClick={() => refresh(true)} className="text-[10px] font-mono text-white/25 hover:text-white/55 transition-colors">↻</button>
            </div>
          </div>
          <div className="px-4 pb-4">
            <TradeLedger trades={trades} onTrace={setTraceId} />
          </div>
        </Panel>

      </div>

      {/* ── Decision Trace Modal ── */}
      {traceId && <DecisionTrace tradeId={traceId} onClose={() => setTraceId(null)} />}
    </PortalShell>
  );
}
