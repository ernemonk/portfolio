"use client";

import type { ServiceName } from "@/lib/trading-api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StageStatus = "ok" | "idle" | "warn" | "error" | "processing";
export type StageColor  = "indigo" | "violet" | "blue" | "amber" | "emerald" | "cyan" | "green" | "teal";

export interface StageInfo {
  id:       string;
  label:    string;
  service:  ServiceName;
  color:    StageColor;
  status:   StageStatus;
  headline: string;   // primary metric shown in block
  sub:      string;   // secondary info line
  ts:       string | null;
}

// ─── Tailwind color maps (must be complete string literals for JIT) ───────────

const BORDER_IDLE: Record<StageColor, string> = {
  indigo:  "border-indigo-500/30  hover:border-indigo-400/50",
  violet:  "border-violet-500/30  hover:border-violet-400/50",
  blue:    "border-blue-500/30    hover:border-blue-400/50",
  amber:   "border-amber-500/30   hover:border-amber-400/50",
  emerald: "border-emerald-500/30 hover:border-emerald-400/50",
  cyan:    "border-cyan-500/30    hover:border-cyan-400/50",
  green:   "border-green-500/30   hover:border-green-400/50",
  teal:    "border-teal-500/30    hover:border-teal-400/50",
};

const BORDER_ACTIVE: Record<StageColor, string> = {
  indigo:  "border-indigo-400  bg-indigo-950/40",
  violet:  "border-violet-400  bg-violet-950/40",
  blue:    "border-blue-400    bg-blue-950/40",
  amber:   "border-amber-400   bg-amber-950/40",
  emerald: "border-emerald-400 bg-emerald-950/40",
  cyan:    "border-cyan-400    bg-cyan-950/40",
  green:   "border-green-400   bg-green-950/40",
  teal:    "border-teal-400    bg-teal-950/40",
};

const TEXT_COLOR: Record<StageColor, string> = {
  indigo:  "text-indigo-400",
  violet:  "text-violet-400",
  blue:    "text-blue-400",
  amber:   "text-amber-400",
  emerald: "text-emerald-400",
  cyan:    "text-cyan-400",
  green:   "text-green-400",
  teal:    "text-teal-400",
};

const DOT_COLOR: Record<StageStatus, string> = {
  ok:         "bg-emerald-400",
  idle:       "bg-white/20",
  warn:       "bg-yellow-400",
  error:      "bg-red-400",
  processing: "bg-blue-400 animate-pulse",
};

// ─── Arrow connector ──────────────────────────────────────────────────────────

function Arrow() {
  return (
    <div className="flex items-center shrink-0 px-0.5 text-white/15">
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <path
          d="M4 10h12M12 6l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ─── Stage Block ──────────────────────────────────────────────────────────────

interface StageBlockProps {
  stage:      StageInfo;
  active:     boolean;
  processing: boolean;
  onClick:    () => void;
  index:      number;
}

function StageBlock({ stage, active, processing, onClick, index }: StageBlockProps) {
  const status: StageStatus = processing ? "processing" : stage.status;
  const borderCls = active ? BORDER_ACTIVE[stage.color] : BORDER_IDLE[stage.color];
  const labelCls  = TEXT_COLOR[stage.color];

  const ts = stage.ts
    ? new Date(stage.ts).toLocaleTimeString("en", {
        hour12:  false,
        hour:    "2-digit",
        minute:  "2-digit",
        second:  "2-digit",
      })
    : null;

  return (
    <button
      onClick={onClick}
      className={[
        "group relative flex flex-col gap-1.5 p-3 rounded-lg border",
        "bg-white/[0.02] transition-all duration-150 text-left cursor-pointer",
        "min-w-[118px] flex-1",
        borderCls,
        active ? "shadow-lg shadow-black/30" : "",
      ].join(" ")}
    >
      {/* Step number + status dot */}
      <div className="flex items-center justify-between">
        <span className={`text-[9px] font-mono font-semibold opacity-50 ${labelCls}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLOR[status]}`} />
      </div>

      {/* Stage label */}
      <div className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${labelCls}`}>
        {stage.label}
      </div>

      {/* Primary metric */}
      <div className="text-sm font-semibold text-white/90 leading-tight truncate">
        {stage.headline || <span className="text-white/25">—</span>}
      </div>

      {/* Secondary metric */}
      <div className="text-[10px] text-white/35 leading-tight truncate">
        {stage.sub || "\u00A0"}
      </div>

      {/* Timestamp */}
      <div className="text-[9px] font-mono text-white/20 mt-auto pt-0.5 min-h-[12px]">
        {ts ?? ""}
      </div>

      {/* Active underline */}
      {active && (
        <span
          className={`absolute bottom-0 left-3 right-3 h-[2px] rounded-full ${labelCls.replace("text-", "bg-")}`}
        />
      )}
    </button>
  );
}

// ─── Pipeline Flow ────────────────────────────────────────────────────────────

interface PipelineFlowProps {
  stages:          StageInfo[];
  activeStage:     string | null;
  onStageClick:    (id: string) => void;
  processingStage?: string | null;
}

export function PipelineFlow({
  stages,
  activeStage,
  onStageClick,
  processingStage,
}: PipelineFlowProps) {
  return (
    <div className="flex items-stretch overflow-x-auto gap-0 py-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
      {stages.map((stage, i) => (
        <div key={stage.id} className="flex items-stretch shrink-0">
          <StageBlock
            stage={stage}
            active={activeStage === stage.id}
            processing={processingStage === stage.id}
            onClick={() => onStageClick(stage.id)}
            index={i}
          />
          {i < stages.length - 1 && <Arrow />}
        </div>
      ))}
    </div>
  );
}
