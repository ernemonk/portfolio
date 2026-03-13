/**
 * Trading OS Configuration API Client
 * 
 * Manages backend configuration through the config service (port 3007)
 */

const CONFIG_API_BASE = "http://localhost:3007";
const DATA_INGESTION_API_BASE = "http://localhost:3009";

// ─── Types ────────────────────────────────────────────────────────────────

export interface DatabaseConfig {
  postgresql: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
    connectionString?: string;
  };
  redis: {
    host: string;
    port: number;
    password?: string;
    url?: string;
  };
}

export interface ExchangeConfig {
  activeExchange: string;
  paperMode: boolean;
  credentials: {
    [key: string]: {
      apiKey: string;
      apiSecret: string;
      sandbox?: boolean;
      baseUrl?: string;
    };
  };
}

export interface LLMProvider {
  name: string;
  displayName: string;
  fields: { [key: string]: string }; // Completely dynamic fields
}

export interface LLMConfig {
  provider: string; // Now supports custom provider names
  providers: {
    [key: string]: LLMProvider;
  };
}

export interface ServiceConfig {
  executionQueueBackend: "memory" | "redis";
  environment: "development" | "production";
  ports: {
    [serviceName: string]: number;
  };
}

export interface PricingConfig {
  provider: "coingecko" | "binance" | "custom";
  apiKey?: string;
  updateInterval: number;
  cacheTtl: number;
}

export interface BackendConfig {
  database: DatabaseConfig;
  exchanges: ExchangeConfig;
  llm: LLMConfig;
  service: ServiceConfig;
  pricing: PricingConfig;
  lastUpdated: string; // ISO string
}

export interface HealthCheck {
  status: string;
  timestamp: number;
  service: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  timestamp: string;
}

export interface ConnectionTestResult {
  status: "ok" | "error";
  message: string;
}

// ─── API Client ──────────────────────────────────────────────────────────

class ConfigAPIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ConfigAPIError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${CONFIG_API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new ConfigAPIError(errorMessage, response.status);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ConfigAPIError) {
      throw error;
    }
    throw new ConfigAPIError(`Network error: ${error}`);
  }
}

// ─── Config Management ───────────────────────────────────────────────────

export async function getConfig(): Promise<BackendConfig> {
  return apiRequest<BackendConfig>('/config');
}

export async function updateConfig(config: BackendConfig): Promise<BackendConfig> {
  return apiRequest<BackendConfig>('/config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

export async function updateConfigSection(section: string, data: any): Promise<{ status: string; section: string }> {
  return apiRequest<{ status: string; section: string }>(`/config/${section}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getConfigHistory(): Promise<{ history: Array<{ lastUpdated: string; version: number }> }> {
  return apiRequest<{ history: Array<{ lastUpdated: string; version: number }> }>('/config/history');
}

export async function rollbackConfig(version: number): Promise<{ status: string; version: number }> {
  return apiRequest<{ status: string; version: number }>(`/config/rollback/${version}`, {
    method: 'POST',
  });
}

// ─── Utilities ───────────────────────────────────────────────────────────

export async function generateEnvFile(): Promise<{ content: string }> {
  return apiRequest<{ content: string }>('/config/env');
}

export async function validateConfig(): Promise<ValidationResult> {
  return apiRequest<ValidationResult>('/config/validate');
}

export async function testConnection(service: string): Promise<ConnectionTestResult> {
  return apiRequest<ConnectionTestResult>('/config/test-connection', {
    method: 'POST',
    body: JSON.stringify({ service }),
  });
}

// ─── Health Checks ───────────────────────────────────────────────────────

export async function getConfigServiceHealth(): Promise<HealthCheck> {
  return apiRequest<HealthCheck>('/health');
}

// ─── Default Config ──────────────────────────────────────────────────────

export function getDefaultConfig(): BackendConfig {
  return {
    database: {
      postgresql: {
        host: "localhost",
        port: 5432,
        database: "trading_os",
        username: "trading_os",
        password: "trading_os_dev",
        connectionString: "postgresql+asyncpg://trading_os:trading_os_dev@localhost:5432/trading_os"
      },
      redis: {
        host: "localhost",
        port: 6379,
        url: "redis://localhost:6379"
      }
    },
    exchanges: {
      activeExchange: "paper",
      paperMode: true,
      credentials: {
        binance: { apiKey: "", apiSecret: "", sandbox: true },
        kraken: { apiKey: "", apiSecret: "" },
        coinbase: { apiKey: "", apiSecret: "" },
        alpaca: { apiKey: "", apiSecret: "", baseUrl: "https://paper-api.alpaca.markets" }
      }
    },
    llm: {
      provider: "mock",
      providers: {
        mock: {
          name: "mock",
          displayName: "Mock (Free, Local Testing)",
          fields: {}
        },
        anthropic: {
          name: "anthropic",
          displayName: "Anthropic Claude",
          fields: {
            apiKey: "",
            model: "claude-3.5-sonnet",
            baseUrl: "https://api.anthropic.com"
          }
        },
        openai: {
          name: "openai",
          displayName: "OpenAI GPT",
          fields: {
            apiKey: "",
            model: "gpt-4o",
            baseUrl: "https://api.openai.com"
          }
        }
      }
    },
    service: {
      executionQueueBackend: "memory",
      environment: "development",
      ports: {
        portfolio: 3001,
        strategy: 3002,
        risk: 3003,
        execution: 3004,
        orchestrator: 3005,
        analytics: 3006,
        config: 3007,
        data_ingestion: 3009
      }
    },
    pricing: {
      provider: "coingecko",
      updateInterval: 300,
      cacheTtl: 300
    },
    lastUpdated: new Date().toISOString()
  };
}

export { ConfigAPIError };

// ─── Credential Vault Types ──────────────────────────────────────────────

export interface StoredCredential {
  id: number;
  provider_name: string;
  credential_key: string;
  credential_type: string;
  label: string | null;
  is_active: boolean;
  is_set: boolean;
  last_used_at: string | null;
  last_verified_at: string | null;
  created_at: string | null;
  updated_at?: string | null;
}

export interface CredentialInput {
  provider_name: string;
  credential_key: string;
  value: string;
  credential_type?: string;
  label?: string;
}

export interface DataSourceInfo {
  id: number;
  name: string;
  display_name: string;
  provider_type: string;
  base_url: string;
  requires_auth: boolean;
  rate_limit_requests: number;
  rate_limit_period_seconds: number;
  poll_interval_seconds: number;
  status: string;
  error_count: number;
  last_success_at: string | null;
  last_error_at: string | null;
  last_error_message?: string | null;
  enabled_pairs: string[];
  is_active: boolean;
}

export interface RateLimitStatus {
  [source: string]: {
    max_requests: number;
    period_seconds: number;
    tokens_remaining: number;
  };
}

export interface IngestionLog {
  id: number;
  source_name: string;
  endpoint: string;
  status: string;
  response_time_ms: number | null;
  records_fetched: number;
  error_message: string | null;
  created_at: string | null;
}

export interface TestSourceResult {
  ok: boolean;
  message: string;
  response_time_ms?: number;
}

export interface PriceData {
  source: string;
  symbol: string;
  price_usd: number;
  volume_24h?: number;
  change_24h_pct?: number;
  market_cap?: number;
  fetched_at?: string;
  error?: string;
}

// ─── Credential Vault API (config service :3007) ─────────────────────────

export async function getCredentials(): Promise<StoredCredential[]> {
  return apiRequest<StoredCredential[]>('/credentials');
}

export async function storeCredential(cred: CredentialInput): Promise<{ status: string; id: number; provider: string }> {
  return apiRequest<{ status: string; id: number; provider: string }>('/credentials', {
    method: 'POST',
    body: JSON.stringify(cred),
  });
}

export async function updateCredential(id: number, data: { value?: string; label?: string; is_active?: boolean }): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/credentials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCredential(id: number): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/credentials/${id}`, {
    method: 'DELETE',
  });
}

export async function verifyCredential(id: number): Promise<{ status: string; message: string; length?: number; preview?: string }> {
  return apiRequest<{ status: string; message: string }>(`/credentials/verify/${id}`, {
    method: 'POST',
  });
}

// ─── Data Source API (config service :3007) ──────────────────────────────

export async function getDataSources(): Promise<DataSourceInfo[]> {
  return apiRequest<DataSourceInfo[]>('/data-sources');
}

export async function updateDataSource(sourceName: string, data: Partial<DataSourceInfo>): Promise<{ status: string }> {
  return apiRequest<{ status: string }>(`/data-sources/${sourceName}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ─── Data Ingestion API (:3009) ──────────────────────────────────────────

async function ingestionRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  try {
    const response = await fetch(`${DATA_INGESTION_API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      try { const err = await response.json(); errorMessage = err.detail || err.message || errorMessage; } catch {}
      throw new ConfigAPIError(errorMessage, response.status);
    }
    return await response.json();
  } catch (error) {
    if (error instanceof ConfigAPIError) throw error;
    throw new ConfigAPIError(`Network error: ${error}`);
  }
}

export async function getIngestionSources(): Promise<DataSourceInfo[]> {
  return ingestionRequest<DataSourceInfo[]>('/sources');
}

export async function getRateLimits(): Promise<RateLimitStatus> {
  return ingestionRequest<RateLimitStatus>('/rate-limits');
}

export async function updateRateLimit(source: string, maxRequests: number, periodSeconds: number): Promise<{ status: string }> {
  return ingestionRequest<{ status: string }>(`/sources/${source}/rate-limit`, {
    method: 'PATCH',
    body: JSON.stringify({ source, max_requests: maxRequests, period_seconds: periodSeconds }),
  });
}

export async function toggleSource(sourceName: string): Promise<{ status: string; is_active: boolean }> {
  return ingestionRequest<{ status: string; is_active: boolean }>(`/sources/${sourceName}/toggle`, {
    method: 'PATCH',
  });
}

export async function testDataSource(source: string): Promise<TestSourceResult> {
  return ingestionRequest<TestSourceResult>('/test-source', {
    method: 'POST',
    body: JSON.stringify({ source }),
  });
}

export async function testAllFreeSources(): Promise<{
  tested: number;
  passed: number;
  results: { [source: string]: TestSourceResult };
}> {
  return ingestionRequest<{ tested: number; passed: number; results: { [source: string]: TestSourceResult } }>('/test-all-free');
}

export async function fetchPrices(source: string, symbols: string[]): Promise<{ source: string; count: number; prices: PriceData[] }> {
  return ingestionRequest<{ source: string; count: number; prices: PriceData[] }>('/fetch/prices', {
    method: 'POST',
    body: JSON.stringify({ source, symbols }),
  });
}

export async function fetchCandles(source: string, symbol: string, timeframe: string = '1h', limit: number = 100): Promise<any> {
  return ingestionRequest<any>('/fetch/candles', {
    method: 'POST',
    body: JSON.stringify({ source, symbol, timeframe, limit }),
  });
}

export async function getSourceSymbols(source: string): Promise<{ source: string; symbols: string[] }> {
  return ingestionRequest<{ source: string; symbols: string[] }>(`/sources/${source}/symbols`);
}

export async function getIngestionLogs(source?: string, status?: string, limit: number = 50): Promise<IngestionLog[]> {
  const params = new URLSearchParams();
  if (source) params.set('source', source);
  if (status) params.set('status', status);
  params.set('limit', String(limit));
  return ingestionRequest<IngestionLog[]>(`/logs?${params.toString()}`);
}

export async function getLatestPrices(symbol?: string, source?: string, limit: number = 20): Promise<PriceData[]> {
  const params = new URLSearchParams();
  if (symbol) params.set('symbol', symbol);
  if (source) params.set('source', source);
  params.set('limit', String(limit));
  return ingestionRequest<PriceData[]>(`/prices/latest?${params.toString()}`);
}

export async function getDataIngestionHealth(): Promise<HealthCheck> {
  return ingestionRequest<HealthCheck>('/health');
}