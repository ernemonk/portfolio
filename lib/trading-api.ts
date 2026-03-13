/**
 * trading-api.ts
 * ─────────────────────────────────────────────────────
 * Typed fetch wrappers for every backend trading service.
 *
 * Automatically discovers service endpoints from backend registry.
 */

const HOST = process.env.NEXT_PUBLIC_BOT_BASE ?? "http://localhost:3001";

// Timeout and retry configuration
const REQUEST_TIMEOUT = 15000; // 15 seconds for regular requests
const AI_REQUEST_TIMEOUT = 120000; // 120 seconds for AI requests (model loading takes time)
const INITIAL_RETRY_DELAY = 500;
const MAX_RETRY_DELAY = 5000;
const MAX_RETRIES = 3;

// Fallback hardcoded services (used if registry call fails)
const SERVICES_FALLBACK = {
  portfolio:         "http://localhost:3001",
  strategy:          "http://localhost:3002",
  risk:              "http://localhost:3003",
  execution:         "http://localhost:3004",
  orchestrator:      "http://localhost:3005",
  analytics:         "http://localhost:3006",
  config:            "http://localhost:3007",
  local_ai:          "http://localhost:3008",
  data_ingestion:    "http://localhost:3009",
  feature_store:     "http://localhost:3010",
  stream_processor:  "http://localhost:3011",
  backtesting:       "http://localhost:3012",
} as const;

export type ServiceName = keyof typeof SERVICES_FALLBACK;

// Will be populated from registry
export let SERVICES: Record<ServiceName, string> = { ...SERVICES_FALLBACK };

/**
 * Create an AbortController with timeout
 */
function createTimeoutController(timeoutMs: number = REQUEST_TIMEOUT): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Clear timeout if request completes normally
  const originalAbort = controller.abort.bind(controller);
  controller.abort = () => {
    clearTimeout(timeoutId);
    originalAbort();
  };
  
  return controller;
}

/**
 * Load service registry from backend (one-time on app start)
 */
export async function loadServiceRegistry() {
  try {
    const res = await fetch(`${HOST}/registry/services`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      SERVICES = data.services;
      return data;
    }
  } catch {
    // Silently fall back to hardcoded
  }
}

// Load registry on module import
if (typeof window !== "undefined") {
  loadServiceRegistry().catch(() => {});
}

// ─── Retry Logic ──────────────────────────────────────────────────────────

function isRetryableError(error: unknown, status?: number): boolean {
  // Retry on network errors, timeouts, and 5xx errors
  if (error instanceof TypeError) return true; // Network error
  if (status && status >= 500) return true; // Server error
  if (status === 408 || status === 429) return true; // Timeout or rate limit
  return false;
}

function exponentialBackoff(attempt: number): number {
  const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * delay; // 10% jitter
  return Math.min(delay + jitter, MAX_RETRY_DELAY);
}

async function callWithRetry<T>(
  service: ServiceName,
  path: string,
  options?: RequestInit,
  attempt = 0,
): Promise<T> {
  // Use longer timeout for AI service (model loading can take 60+ seconds)
  const timeout = service === "local_ai" ? AI_REQUEST_TIMEOUT : REQUEST_TIMEOUT;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    // Route all requests through portfolio service proxy to avoid CORS errors
    // Browser makes ONE cross-port call to 3001, then 3001 proxies to other services
    const proxyUrl = `${HOST}/api/${service}${path}`;
    
    const res = await fetch(proxyUrl, {
      cache: "no-store",
      signal: controller.signal,
      ...options,
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const error = `[${service}] ${path} → HTTP ${res.status}${text ? ": " + text.slice(0, 200) : ""}`;
      
      // Retry on retryable errors and within retry limit
      if (isRetryableError(null, res.status) && attempt < MAX_RETRIES) {
        const delay = exponentialBackoff(attempt);
        await new Promise(r => setTimeout(r, delay));
        return callWithRetry<T>(service, path, options, attempt + 1);
      }
      
      throw new Error(error);
    }
    return res.json() as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Don't retry on abort/timeout for AI calls - they need to complete
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request to ${service} timed out after ${timeout/1000}s`);
    }
    
    // Retry on network errors within limit
    if (isRetryableError(error) && attempt < MAX_RETRIES) {
      const delay = exponentialBackoff(attempt);
      await new Promise(r => setTimeout(r, delay));
      return callWithRetry<T>(service, path, options, attempt + 1);
    }
    throw error;
  }
}

export { callWithRetry };

async function call<T>(
  service: ServiceName,
  path: string,
  options?: RequestInit,
): Promise<T> {
  return callWithRetry<T>(service, path, options, 0);
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

// ─── Market Scanner & Intelligence ────────────────────────────────────────────

export interface MarketSignal {
  asset: string;
  exchange: string;
  signal_type: string;
  strength: number;
  price: number;
  change_24h: number;
  volume_24h: number;
  rsi: number;
  macd_signal: string;
  momentum_score: number;
  volatility: number;
  ml_prediction?: string;
  confidence?: number;
}

export interface ScannerFilters {
  signal_types: string[];
  min_strength: number;
  min_volume: number;
  exchanges: string[];
  asset_classes: string[];
}

export const analytics = {
  getTrades,
  getStrategyMetrics,
  getDailyPnl,
  getAuditLog,
  refreshMetrics,
  getMarketSignals: (filters: ScannerFilters) =>
    call<{ signals: MarketSignal[] }>("analytics", "/market/signals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filters),
    }),
};

// ─── Data Ingestion ───────────────────────────────────────────────────────────

export interface DataSource {
  name: string;
  type: "crypto" | "stocks" | "economic" | "alternative";
  status: "healthy" | "degraded" | "failed";
  response_time: number;
  last_update: string;
  data_points: number;
  coverage: string[];
}

export interface PipelineStatus {
  stage: string;
  status: "running" | "completed" | "failed";
  processed_records: number;
  error_rate: number;
  last_run: string;
}

export const dataIngestion = {
  getDataSources: () =>
    call<{ sources: DataSource[] }>("data_ingestion", "/sources"),
  getPipelineStatus: () =>
    call<{ pipelines: PipelineStatus[] }>("data_ingestion", "/pipeline/status"),
  testAllSources: () =>
    call<{ results: Record<string, any> }>("data_ingestion", "/test-all"),
};

// ─── Feature Store ────────────────────────────────────────────────────────────

export interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  indicators: {
    rsi: number;
    macd: number;
    macd_signal: string;
    bollinger_position: number;
    volatility: number;
    trend_strength: number;
    volume_sma_ratio: number;
  };
  data_quality: {
    completeness: number;
    freshness: number;
    accuracy: number;
  };
}

export const featureStore = {
  getAssetData: (params: {
    source: string;
    symbols: string[];
    include_indicators?: boolean;
    include_quality_metrics?: boolean;
  }) =>
    call<{ assets: AssetData[] }>("feature_store", "/assets/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    }),
  computeFeatures: (symbols: string[], features: string[] = ["all"]) =>
    call<{ computed: Record<string, any> }>("feature_store", "/features/compute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols, features }),
    }),
};

// ─── Strategy Management ──────────────────────────────────────────────────────

export interface StrategyConfig {
  name: string;
  template_id: string;
  asset: string;
  indicators: string[];
  parameters: Record<string, any>;
  risk_management: {
    stop_loss: number;
    take_profit: number;
    position_size: number;
  };
}

export interface BuiltStrategy {
  id: string;
  name: string;
  template_id: string;
  asset: string;
  indicators: string[];
  parameters: Record<string, any>;
  entry_conditions: string[];
  exit_conditions: string[];
  risk_management: {
    stop_loss: number;
    take_profit: number;
    position_size: number;
  };
  status: "draft" | "testing" | "validated" | "deployed";
  created_at: string;
}

export const strategy = {
  getStrategies: () =>
    call<{ strategies: BuiltStrategy[] }>("strategy", "/strategies/list"),
  createStrategy: (config: StrategyConfig) =>
    call<{ strategy: BuiltStrategy }>("strategy", "/strategies/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }),
  updateStrategy: (id: string, updates: Partial<StrategyConfig>) =>
    call<{ strategy: BuiltStrategy }>("strategy", `/strategies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  deleteStrategy: (id: string) =>
    call<{ deleted: boolean }>("strategy", `/strategies/${id}`, { method: "DELETE" }),
};

// ─── Backtesting ──────────────────────────────────────────────────────────────

export interface BacktestConfig {
  strategy_id: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  commission?: number;
  slippage?: number;
}

export interface BacktestResult {
  id: string;
  strategy_id: string;
  config: BacktestConfig;
  results: {
    total_trades: number;
    win_rate: number;
    total_pnl: number;
    max_drawdown: number;
    sharpe_ratio: number;
    sortino_ratio: number;
    profit_factor: number;
    avg_trade_duration: number;
  };
  equity_curve: Array<{ date: string; value: number }>;
  trades: Array<{
    date: string;
    side: "buy" | "sell";
    price: number;
    quantity: number;
    pnl: number;
  }>;
  status: "running" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
}

export const backtesting = {
  startBacktest: (config: BacktestConfig) =>
    call<{ backtest: BacktestResult }>("backtesting", "/backtest/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    }),
  getBacktest: (id: string) =>
    call<{ backtest: BacktestResult }>("backtesting", `/backtest/${id}`),
  listBacktests: (strategy_id?: string) =>
    call<{ backtests: BacktestResult[] }>("backtesting", `/backtests${strategy_id ? `?strategy_id=${strategy_id}` : ""}`),
};

// ─── Local AI Service ─────────────────────────────────────────────────────────

export interface LocalModel {
  id: string;
  name: string;
  category: "local";
  status: "loaded" | "available";
  type: string;
  speed: string;
  quality: string;
  size: string;
  use_cases: string[];
  location: string;
}

export interface HostedModel {
  id: string;
  name: string;
  category: "hosted";
  status: "configured" | "not_configured";
  provider: string;
  speed: string;
  quality: string;
  cost_per_1k: number;
  use_cases: string[];
  location: string;
}

export interface ModelDashboardData {
  local_models: LocalModel[];
  hosted_models: HostedModel[];
  quick_stats: {
    total_local: number;
    total_hosted: number;
    local_ready_to_use: number;
    hosted_ready_to_use: number;
  };
}

/** Fetch trading dashboard models (local + hosted) */
export const fetchModelDashboard = () =>
  call<ModelDashboardData>("local_ai", "/models/trading-dashboard");

/** Fetch only local models */
export const fetchLocalModels = () =>
  call<LocalModel[]>("local_ai", "/models/local");

/** Fetch only hosted models */
export const fetchHostedModels = () =>
  call<HostedModel[]>("local_ai", "/models/hosted");

/** Configure hosted model with API key */
export const configureHostedModel = (modelId: string, apiKey: string) =>
  call<{ status: string; model_id: string }>("local_ai", "/models/configure-hosted", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id: modelId, api_key: apiKey }),
  });

/** Get AI service health status */
export const getAIHealth = () => call<HealthStatus>("local_ai", "/health");

// ─── Config Service ───────────────────────────────────────────────────────────

export interface ConfigData {
  database_url: string;
  redis_url: string;
  ai_service_url: string;
  log_level: string;
  [key: string]: unknown;
}

/** Fetch current configuration */
export const getConfig = () =>
  call<ConfigData>("config", "/config");

/** Update configuration */
export const updateConfig = (config: Partial<ConfigData>) =>
  call<ConfigData>("config", "/config", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });

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
