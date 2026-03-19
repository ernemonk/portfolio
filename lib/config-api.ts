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
  };
  redis: {
    host: string;
    port: number;
    password?: string;
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
    };
  };
}

export interface LLMProvider {
  name: string;
  displayName: string;
  fields: { [key: string]: string };
}

export interface LLMConfig {
  provider: string;
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
  provider: string;
  apiKey?: string;
  updateInterval: number;
  cacheTtl: number;
}

export interface BackendConfiguration {
  database: DatabaseConfig;
  exchanges: ExchangeConfig;
  llm: LLMConfig;
  service: ServiceConfig;
  pricing: PricingConfig;
  lastUpdated: string;
}

export interface Credential {
  id: string;
  provider_name: string;
  credential_key: string;
  credential_type: string;
  label?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DataSource {
  name: string;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: number;
  checks?: Record<string, string>;
}

// ─── API Functions ────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> {
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

export async function getHealth(): Promise<HealthStatus> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/health`);
  if (!response.ok) throw new Error(`Health check failed: ${response.status}`);
  return response.json();
}

export async function getConfig(): Promise<BackendConfiguration> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config`);
  if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`);
  return response.json();
}

export async function updateConfig(config: Partial<BackendConfiguration>): Promise<BackendConfiguration> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(config),
  });
  if (!response.ok) throw new Error(`Failed to update config: ${response.status}`);
  return response.json();
}

export async function updateConfigSection(section: string, data: Record<string, unknown>): Promise<BackendConfiguration> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config/${section}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to update ${section}: ${response.status}`);
  return response.json();
}

export async function getConfigHistory(): Promise<{ versions: string[]; current: string }> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config/history`);
  if (!response.ok) throw new Error(`Failed to fetch history: ${response.status}`);
  return response.json();
}

export async function rollbackConfig(version: string): Promise<BackendConfiguration> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config/rollback/${version}`, {
    method: "POST",
  });
  if (!response.ok) throw new Error(`Failed to rollback: ${response.status}`);
  return response.json();
}

export async function validateConfig(): Promise<{ valid: boolean; errors: string[] }> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config/validate`);
  if (!response.ok) throw new Error(`Failed to validate: ${response.status}`);
  return response.json();
}

export async function testConnection(type: string, config: Record<string, unknown>): Promise<{ success: boolean; message: string }> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/config/test-connection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, config }),
  });
  if (!response.ok) throw new Error(`Connection test failed: ${response.status}`);
  return response.json();
}

// ─── Credentials ──────────────────────────────────────────────────────────

export async function getCredentials(): Promise<Credential[]> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/credentials`);
  if (!response.ok) throw new Error(`Failed to fetch credentials: ${response.status}`);
  return response.json();
}

export async function addCredential(credential: {
  provider_name: string;
  credential_key: string;
  value: string;
  credential_type?: string;
  label?: string;
}): Promise<Credential> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/credentials`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credential),
  });
  if (!response.ok) throw new Error(`Failed to add credential: ${response.status}`);
  return response.json();
}

export async function updateCredential(id: string, updates: {
  value?: string;
  label?: string;
  is_active?: boolean;
}): Promise<Credential> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/credentials/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Failed to update credential: ${response.status}`);
  return response.json();
}

export async function deleteCredential(id: string): Promise<void> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/credentials/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error(`Failed to delete credential: ${response.status}`);
}

// ─── Data Sources ─────────────────────────────────────────────────────────

export async function getDataSources(): Promise<DataSource[]> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/data-sources`);
  if (!response.ok) throw new Error(`Failed to fetch data sources: ${response.status}`);
  return response.json();
}

export async function updateDataSource(name: string, updates: Partial<DataSource>): Promise<DataSource> {
  const response = await fetchWithTimeout(`${CONFIG_API_BASE}/data-sources/${name}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error(`Failed to update data source: ${response.status}`);
  return response.json();
}
