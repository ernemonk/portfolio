/**
 * Trading OS Trading API Client
 * 
 * Interfaces with execution, strategy, risk, and portfolio services
 */

// Service ports
const ORCHESTRATOR_API = "http://localhost:3001";
const STRATEGY_API = "http://localhost:3002";
const RISK_API = "http://localhost:3003";
const EXECUTION_API = "http://localhost:3004";

// ─── Types ────────────────────────────────────────────────────────────────

export interface HealthStatus {
  status: string;
  service: string;
  version?: string;
  uptime?: number;
  timestamp: number;
  checks?: Record<string, string>;
}

export interface Strategy {
  name: string;
  enabled: boolean;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface TradeIntent {
  id?: string;
  strategy_name: string;
  pair: string;
  side: "buy" | "sell";
  quantity: number;
  order_type: "market" | "limit";
  price?: number;
}

export interface OrderResult {
  order_id: string;
  status: string;
  executed_price?: number;
  filled_quantity?: number;
  fee?: number;
  is_paper: boolean;
}

export interface RiskDecision {
  approved: boolean;
  reason?: string;
  adjustments?: {
    quantity?: number;
    price?: number;
  };
}

export interface QueueStatus {
  depth: number;
}

export interface RegimeClassification {
  regime: string;
  confidence: number;
  indicators: Record<string, number>;
}

export interface ServiceRegistry {
  services: Record<string, string>;
}

// ─── Helper Functions ─────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// ─── Orchestrator API ─────────────────────────────────────────────────────

export async function getOrchestratorHealth(): Promise<HealthStatus> {
  const response = await fetchWithTimeout(`${ORCHESTRATOR_API}/health`);
  if (!response.ok) throw new Error(`Orchestrator health check failed: ${response.status}`);
  return response.json();
}

export async function getServiceRegistry(): Promise<ServiceRegistry> {
  const response = await fetchWithTimeout(`${ORCHESTRATOR_API}/registry/services`);
  if (!response.ok) throw new Error(`Failed to fetch service registry: ${response.status}`);
  return response.json();
}

export async function classifyRegime(data: { candles: unknown[] }): Promise<RegimeClassification> {
  const response = await fetchWithTimeout(`${ORCHESTRATOR_API}/classify-regime`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Regime classification failed: ${response.status}`);
  return response.json();
}

export async function triggerPipeline(): Promise<{ status: string; message: string }> {
  const response = await fetchWithTimeout(`${ORCHESTRATOR_API}/pipeline/trigger`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(`Pipeline trigger failed: ${response.status}`);
  return response.json();
}

// ─── Strategy API ─────────────────────────────────────────────────────────

export async function getStrategyHealth(): Promise<HealthStatus> {
  const response = await fetchWithTimeout(`${STRATEGY_API}/health`);
  if (!response.ok) throw new Error(`Strategy health check failed: ${response.status}`);
  return response.json();
}

export async function getStrategies(): Promise<Strategy[]> {
  const response = await fetchWithTimeout(`${STRATEGY_API}/strategies`);
  if (!response.ok) throw new Error(`Failed to fetch strategies: ${response.status}`);
  return response.json();
}

export async function enableStrategy(name: string): Promise<{ success: boolean }> {
  const response = await fetchWithTimeout(`${STRATEGY_API}/strategies/${name}/enable`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(`Failed to enable strategy: ${response.status}`);
  return response.json();
}

export async function disableStrategy(name: string): Promise<{ success: boolean }> {
  const response = await fetchWithTimeout(`${STRATEGY_API}/strategies/${name}/disable`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(`Failed to disable strategy: ${response.status}`);
  return response.json();
}

export async function evaluateStrategy(name: string, data: unknown): Promise<TradeIntent | null> {
  const response = await fetchWithTimeout(`${STRATEGY_API}/strategies/${name}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Strategy evaluation failed: ${response.status}`);
  return response.json();
}

// ─── Risk API ─────────────────────────────────────────────────────────────

export async function getRiskHealth(): Promise<HealthStatus> {
  const response = await fetchWithTimeout(`${RISK_API}/health`);
  if (!response.ok) throw new Error(`Risk health check failed: ${response.status}`);
  return response.json();
}

// ─── Execution API ────────────────────────────────────────────────────────

export async function getExecutionHealth(): Promise<HealthStatus> {
  const response = await fetchWithTimeout(`${EXECUTION_API}/health`);
  if (!response.ok) throw new Error(`Execution health check failed: ${response.status}`);
  return response.json();
}

export async function getQueueDepth(): Promise<QueueStatus> {
  const response = await fetchWithTimeout(`${EXECUTION_API}/queue/depth`);
  if (!response.ok) throw new Error(`Failed to fetch queue depth: ${response.status}`);
  return response.json();
}

export async function enqueueOrder(intent: TradeIntent): Promise<OrderResult> {
  const response = await fetchWithTimeout(`${EXECUTION_API}/enqueue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(intent),
  });
  if (!response.ok) throw new Error(`Order enqueue failed: ${response.status}`);
  return response.json();
}

// ─── Aggregated Health Check ──────────────────────────────────────────────

export interface SystemHealth {
  orchestrator: HealthStatus | null;
  strategy: HealthStatus | null;
  risk: HealthStatus | null;
  execution: HealthStatus | null;
  overall: "healthy" | "degraded" | "unhealthy";
}

export async function getSystemHealth(): Promise<SystemHealth> {
  const results = await Promise.allSettled([
    getOrchestratorHealth(),
    getStrategyHealth(),
    getRiskHealth(),
    getExecutionHealth(),
  ]);

  const [orchestrator, strategy, risk, execution] = results.map(r => 
    r.status === "fulfilled" ? r.value : null
  );

  const healthyCount = results.filter(r => 
    r.status === "fulfilled" && (r.value as HealthStatus).status === "ok"
  ).length;

  let overall: "healthy" | "degraded" | "unhealthy";
  if (healthyCount === 4) overall = "healthy";
  else if (healthyCount >= 2) overall = "degraded";
  else overall = "unhealthy";

  return {
    orchestrator,
    strategy,
    risk,
    execution,
    overall,
  };
}
