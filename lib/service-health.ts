/**
 * Service Health & Testing API
 * Utilities for checking service health and running tests
 */

import { getService, ServiceConfig } from "./service-registry";

export interface HealthCheckResponse {
  status: "healthy" | "degraded" | "unhealthy";
  service: string;
  version?: string;
  uptime?: number;
  timestamp: number;
  checks?: Record<string, string | number | boolean>;
  dependencies?: Record<string, "ok" | "error">;
  memory?: {
    used: number;
    total: number;
    percent: number;
  };
  cpu?: number;
}

export interface ServiceMetrics {
  responseTimes: number[];
  errorRate: number;
  requestCount: number;
}

export interface TestResult {
  name: string;
  status: "pass" | "fail" | "error";
  duration: number;
  message?: string;
  data?: Record<string, unknown>;
}

async function fetchServiceWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout = 15000
): Promise<Response> {
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

/**
 * Check health status of a service
 */
export async function checkServiceHealth(
  service: ServiceConfig | string
): Promise<HealthCheckResponse> {
  const serviceConfig = typeof service === "string" ? getService(service) : service;
  if (!serviceConfig) throw new Error("Service not found");

  try {
    const response = await fetchServiceWithTimeout(
      `${serviceConfig.baseUrl}${serviceConfig.healthEndpoint}`
    );

    if (!response.ok) {
      return {
        status: "unhealthy",
        service: serviceConfig.name,
        timestamp: Date.now(),
        checks: {
          "health_check_failed": `HTTP ${response.status}`,
        },
      };
    }

    const data = await response.json();
    return {
      status: data.status === "ok" ? "healthy" : "degraded",
      service: serviceConfig.id, // Use ID for consistent matching
      version: data.version,
      uptime: data.uptime,
      timestamp: data.timestamp || Date.now(),
      checks: data.checks,
      dependencies: data.dependencies,
      memory: data.memory,
      cpu: data.cpu,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      service: serviceConfig.id, // Use ID for consistent matching
      timestamp: Date.now(),
      checks: {
        "error": error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}

/**
 * Check health of multiple services in parallel
 */
export async function checkMultipleServices(
  services: (ServiceConfig | string)[]
): Promise<HealthCheckResponse[]> {
  const promises = services.map(s => checkServiceHealth(s));
  return Promise.all(promises);
}

/**
 * Get aggregated system health
 */
export async function getSystemHealthStatus(): Promise<{
  overall: "healthy" | "degraded" | "unhealthy";
  services: HealthCheckResponse[];
  healthyCount: number;
  totalCount: number;
  timestamp: number;
}> {
  const services = await import("./service-registry").then(m =>
    m.getAllServices().map(s => s.id)
  );

  const healthStatuses = await checkMultipleServices(services);

  const healthyCount = healthStatuses.filter(
    h => h.status === "healthy"
  ).length;

  let overall: "healthy" | "degraded" | "unhealthy";
  const totalCount = healthStatuses.length;

  if (healthyCount === totalCount) {
    overall = "healthy";
  } else if (healthyCount >= Math.ceil(totalCount / 2)) {
    overall = "degraded";
  } else {
    overall = "unhealthy";
  }

  return {
    overall,
    services: healthStatuses,
    healthyCount,
    totalCount,
    timestamp: Date.now(),
  };
}

/**
 * Run a test endpoint on a service
 */
export async function runServiceTest(
  service: ServiceConfig | string,
  testPath: string
): Promise<TestResult> {
  const serviceConfig = typeof service === "string" ? getService(service) : service;
  if (!serviceConfig) throw new Error("Service not found");

  const startTime = Date.now();

  try {
    const response = await fetchServiceWithTimeout(
      `${serviceConfig.baseUrl}${testPath}`
    );

    const duration = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      return {
        name: testPath,
        status: "fail",
        duration,
        message: `HTTP ${response.status}`,
        data,
      };
    }

    return {
      name: testPath,
      status: "pass",
      duration,
      data,
    };
  } catch (error) {
    return {
      name: testPath,
      status: "error",
      duration: Date.now() - startTime,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Run all available tests for a service
 */
export async function runAllServiceTests(
  service: ServiceConfig | string
): Promise<TestResult[]> {
  const serviceConfig = typeof service === "string" ? getService(service) : service;
  if (!serviceConfig) throw new Error("Service not found");

  if (!serviceConfig.testEndpoints) return [];

  const promises = serviceConfig.testEndpoints.map(endpoint =>
    runServiceTest(serviceConfig, endpoint)
  );

  return Promise.all(promises);
}

/**
 * Stream service metrics over time
 */
export async function* streamServiceMetrics(
  service: ServiceConfig | string,
  intervalMs = 5000,
  durationMs = 30000
): AsyncGenerator<HealthCheckResponse> {
  const serviceConfig = typeof service === "string" ? getService(service) : service;
  if (!serviceConfig) throw new Error("Service not found");

  const startTime = Date.now();
  const maxTime = startTime + durationMs;

  while (Date.now() < maxTime) {
    yield await checkServiceHealth(serviceConfig);
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
}

/**
 * Compute rolling statistics for service health
 */
export function computeHealthStats(healthChecks: HealthCheckResponse[]): {
  averageResponseTime: number;
  healthyPercent: number;
  degradedPercent: number;
  unhealthyPercent: number;
} {
  const total = healthChecks.length;
  const healthy = healthChecks.filter(h => h.status === "healthy").length;
  const degraded = healthChecks.filter(h => h.status === "degraded").length;
  const unhealthy = healthChecks.filter(h => h.status === "unhealthy").length;

  return {
    averageResponseTime: healthChecks.reduce((sum, h) => sum + (h.timestamp || 0), 0) / total,
    healthyPercent: (healthy / total) * 100,
    degradedPercent: (degraded / total) * 100,
    unhealthyPercent: (unhealthy / total) * 100,
  };
}
