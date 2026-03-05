/**
 * Trading OS Configuration API Client
 * 
 * Manages backend configuration through the config service (port 3007)
 */

const CONFIG_API_BASE = "http://localhost:3007";

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
        config: 3007
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