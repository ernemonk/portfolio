/**
 * trading-api.ts
 * ─────────────────────────────────────────────────────
 * Typed fetch wrappers for every backend trading service.
 *
 * Service layout (all on localhost by default):
 *   portfolio    :3001
 *   strategy     :3002
 *   risk         :3003
 *   execution    :3004
 *   orchestrator :3005
 *   analytics    :3006
 *
 * Override host via NEXT_PUBLIC_BOT_BASE (e.g. "http://192.168.1.10")
 */

const HOST = process.env.NEXT_PUBLIC_BOT_BASE ?? "http://localhost";

export const SERVICES = {
  portfolio:    `${HOST}:3001`,
  strategy:     `${HOST}:3002`,
  risk:         `${HOST}:3003`,
  execution:    `${HOST}:3004`,
  orchestrator: `${HOST}:3005`,
  analytics:    `${HOST}:3006`,
} as const;

export type ServiceName = keyof typeof SERVICES;

export const SERVICE_PORTS: Record<ServiceName, number> = {
  portfolio: 3001, strategy: 3002, risk: 3003,
  execution: 3004, orchestrator: 3005, analytics: 3006,
};

async function call<T>(
  service: ServiceName,
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${SERVICES[service]}${path}`, {
    cache: "no-store",
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[${service}] ${path} → HTTP ${res.status}${text ? ": " + text.slice(0, 200) : ""}`);
  }
  return res.json() as Promise<T>;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HealthStatus {
  service: string;
  status: "ok" | "degraded" | "down";
  version: string;
  uptime: number;
  checks: Record<string, string>;
  timestamp: number;
}

export interface HealthResult {
  service: ServiceName;
  result: HealthStatus | null;
  error: string | null;
}

export interface Position {
  asset: string;
  quantity: number;
  value_usd: number;
  allocation_pct: number;
  unrealized_pnl?: number;
}

export interface PortfolioSnapshot {
  total_value_usd: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  weekly_pnl: number;
  positions: Position[];
  portfolio_heat_pct: number;
  last_updated: number;
}

export interface Strategy {
  name: string;
  enabled: boolean;
  description?: string;
  params?: Record<string, unknown>;
}

export interface RiskConfig {
  max_position_size_pct: number;
  max_strategy_allocation_pct: number;
  max_portfolio_heat_pct: number;
  daily_loss_limit_usd: number;
  weekly_drawdown_pct: number;
  max_leverage: number;
  close_positions_on_kill_switch: boolean;
}

export interface AgentVote {
  agent_name: string;
  action: "EXECUTE" | "SKIP";
  confidence: number;
  reasoning: string;
}

export interface VoteResult {
  action: "EXECUTE" | "SKIP";
  confidence: number;
  votes: AgentVote[];
  threshold: number;
}

export interface Trade {
  id: string;
  strategy_name: string;
  pair: string;
  side: "buy" | "sell";
  quantity: number;
  price?: number;
  executed_price?: number;
  filled_quantity?: number;
  fee?: number;
  pnl_usd?: number;
  status: string;
  is_paper?: boolean;
  order_type?: string;
  created_at: string | null;   // ISO-8601 from DB
}

export interface StrategyMetrics {
  strategy_name: string;
  total_trades: number;
  win_rate: number;
  avg_pnl_usd: number;
  total_pnl_usd: number;
}

export interface DailyPnlEntry {
  date: string;
  pnl_usd: number;
}

export interface QueueDepth {
  depth: number;
}

export interface AuditEntry {
  id: string;
  trade_intent_id?: string;
  event_type: string;
  agent_name?: string;
  model_used?: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  duration_ms?: number;
  created_at: number;
}

export interface BacktestResult {
  strategy_name: string;
  pair: string;
  total_trades: number;
  win_rate: number;
  total_pnl_usd: number;
  max_drawdown_pct: number;
  sharpe_ratio: number;
}

// ─── Health ───────────────────────────────────────────────────────────────────

export const getHealth = (service: ServiceName) =>
  call<HealthStatus>(service, "/health");

export async function getAllHealth(): Promise<HealthResult[]> {
  const names = Object.keys(SERVICES) as ServiceName[];
  const settled = await Promise.allSettled(names.map((s) => getHealth(s)));
  return names.map((name, i) => {
    const r = settled[i];
    if (r.status === "fulfilled") return { service: name, result: r.value, error: null };
    return { service: name, result: null, error: (r.reason as Error)?.message ?? "unreachable" };
  });
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export const getSnapshot     = () => call<PortfolioSnapshot>("portfolio", "/snapshot");
export const getPositions    = () => call<Position[]>("portfolio", "/positions");
export const getPortfolioPnl = () => call<{ daily: number; weekly: number; total: number }>("portfolio", "/pnl");
export const syncPortfolio   = () => call<{ synced: boolean }>("portfolio", "/sync", { method: "POST" });

// ─── Strategy ─────────────────────────────────────────────────────────────────

export const getStrategies    = () => call<Strategy[]>("strategy", "/strategies");
export const enableStrategy   = (name: string) =>
  call<Strategy>("strategy", `/strategies/${encodeURIComponent(name)}/enable`, { method: "POST" });
export const disableStrategy  = (name: string) =>
  call<Strategy>("strategy", `/strategies/${encodeURIComponent(name)}/disable`, { method: "POST" });
export const runStrategy      = (payload: Record<string, unknown>) =>
  call<unknown>("strategy", "/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
export const runBacktest      = (payload: Record<string, unknown>) =>
  call<BacktestResult>("strategy", "/backtest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

// ─── Risk ─────────────────────────────────────────────────────────────────────

export const getRiskConfig       = () => call<RiskConfig>("risk", "/config");
export const updateRiskConfig    = (cfg: RiskConfig) =>
  call<RiskConfig>("risk", "/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cfg),
  });
export const activateKillSwitch   = () => call<{ killed: boolean }>("risk", "/kill-switch", { method: "POST" });
export const deactivateKillSwitch = () => call<{ killed: boolean }>("risk", "/kill-switch", { method: "DELETE" });

// ─── Execution ────────────────────────────────────────────────────────────────

export const getQueueDepth = () => call<QueueDepth>("execution", "/queue/depth");

// ─── Orchestrator ─────────────────────────────────────────────────────────────

/** Trigger a full pipeline run. Only requires the trading pair. */
export const runPipeline = (pair = "BTC/USD") =>
  call<unknown>("orchestrator", "/pipeline/trigger", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pair }),
  });

/** Quick regime classification — builds StrategyContext from Redis cache internally. */
export const classifyRegime = (pair: string) =>
  call<unknown>("orchestrator", `/classify/quick?pair=${encodeURIComponent(pair)}`, {
    method: "POST",
  });

export interface VoteSimpleRequest {
  pair: string;
  strategy_name?: string;
  side?: string;
  quantity?: number;
  price?: number;
  regime?: string;
}

/** Cast a vote using the simplified /vote/simple endpoint. */
export const castVote = (req: VoteSimpleRequest) =>
  call<VoteResult>("orchestrator", "/vote/simple", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getTrades          = (limit = 50) => call<Trade[]>("analytics", `/trades?limit=${limit}`);
export const getStrategyMetrics = ()            => call<StrategyMetrics[]>("analytics", "/strategies/metrics");
export const getDailyPnl        = ()            => call<DailyPnlEntry[]>("analytics", "/pnl/daily");
export const getAuditLog        = (limit = 30)  => call<AuditEntry[]>("analytics", `/audit?limit=${limit}`);
export const refreshMetrics     = ()            =>
  call<unknown>("analytics", "/strategies/metrics/refresh", { method: "POST" });

export interface RegimeEntry {
  id: number;
  pair: string;
  regime: string;
  confidence: number;
  indicators: Record<string, unknown>;
  classified_at: string | null;
}

export const getRegimeHistory = (pair: string, limit = 20) =>
  call<RegimeEntry[]>("analytics", `/regimes/${encodeURIComponent(pair)}?limit=${limit}`);

// ─── Decision Trace ───────────────────────────────────────────────────────────

export interface TraceEvent {
  stage: string;           // CLASSIFY | SIGNAL | VOTE | RISK | ENQUEUE | EXECUTE | RECORD | INFO
  event_type: string;      // e.g. "REGIME_CLASSIFIED", "AGENT_VOTE", "ORDER_FILLED"
  agent_name: string | null;
  model_used: string | null;
  payload: Record<string, unknown>;
  duration_ms: number | null;
  ts: string | null;       // ISO timestamp
}

export interface TradeTrace {
  trade_id: string;
  intent_id: string | null;
  trade: {
    strategy_name: string | null;
    pair: string | null;
    side: string | null;
    quantity: number | null;
    executed_price: number | null;
    pnl_usd: number | null;
    status: string | null;
    is_paper: boolean | null;
  } | null;
  events: TraceEvent[];
  stage_count: number;
}

export const getTrace = (tradeId: string) =>
  call<TradeTrace>("analytics", `/trades/${encodeURIComponent(tradeId)}/trace`);
