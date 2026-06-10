/**
 * Service Registry & Configuration
 * Centralized service configuration for the trading platform
 */

export interface ServiceConfig {
  id: string;
  name: string;
  port: number;
  baseUrl: string;
  description: string;
  category: "core" | "execution" | "analysis" | "ai";
  icon: string;
  color: string;
  healthEndpoint: string;
  testEndpoints?: string[];
}

export const SERVICES: Record<string, ServiceConfig> = {
  orchestrator: {
    id: "orchestrator",
    name: "Orchestrator",
    port: 3001,
    baseUrl: "http://localhost:3001",
    description: "Coordinates the full trade pipeline and agent voting layer",
    category: "core",
    icon: "🎯",
    color: "from-purple-500 to-purple-600",
    healthEndpoint: "/health",
    testEndpoints: ["/test/regime-classification", "/test/pipeline-trigger"],
  },
  strategy: {
    id: "strategy",
    name: "Strategy",
    port: 3002,
    baseUrl: "http://localhost:3002",
    description: "Trading strategy generation and management",
    category: "core",
    icon: "📈",
    color: "from-blue-500 to-blue-600",
    healthEndpoint: "/health",
    testEndpoints: ["/strategies", "/test/evaluate-strategy"],
  },
  risk: {
    id: "risk",
    name: "Risk",
    port: 3003,
    baseUrl: "http://localhost:3003",
    description: "Risk assessment and management",
    category: "analysis",
    icon: "⚠️",
    color: "from-amber-500 to-orange-600",
    healthEndpoint: "/health",
    testEndpoints: ["/test/risk-assessment"],
  },
  execution: {
    id: "execution",
    name: "Execution",
    port: 3004,
    baseUrl: "http://localhost:3004",
    description: "Order execution and queue management",
    category: "execution",
    icon: "⚡",
    color: "from-green-500 to-emerald-600",
    healthEndpoint: "/health",
    testEndpoints: ["/queue/depth", "/test/order-execution"],
  },
  portfolio: {
    id: "portfolio",
    name: "Portfolio",
    port: 3005,
    baseUrl: "http://localhost:3005",
    description: "Portfolio management and analytics",
    category: "analysis",
    icon: "💼",
    color: "from-cyan-500 to-blue-600",
    healthEndpoint: "/health",
    testEndpoints: ["/test/portfolio-snapshot"],
  },
  analytics: {
    id: "analytics",
    name: "Analytics",
    port: 3006,
    baseUrl: "http://localhost:3006",
    description: "Data analytics and reporting",
    category: "analysis",
    icon: "📊",
    color: "from-pink-500 to-rose-600",
    healthEndpoint: "/health",
    testEndpoints: ["/test/analytics-query"],
  },
  config: {
    id: "config",
    name: "Config",
    port: 3007,
    baseUrl: "http://localhost:3007",
    description: "Service configuration management",
    category: "core",
    icon: "⚙️",
    color: "from-slate-500 to-gray-600",
    healthEndpoint: "/health",
    testEndpoints: ["/config/services"],
  },
  local_ai: {
    id: "local_ai",
    name: "Local AI",
    port: 3008,
    baseUrl: "http://localhost:3008",
    description: "Local AI models for trading analysis",
    category: "ai",
    icon: "🤖",
    color: "from-indigo-500 to-purple-600",
    healthEndpoint: "/health",
    testEndpoints: ["/models", "/test/inference"],
  },
  data_ingestion: {
    id: "data_ingestion",
    name: "Data Ingestion",
    port: 3009,
    baseUrl: "http://localhost:3009",
    description: "Market data ingestion and API credential management",
    category: "core",
    icon: "📡",
    color: "from-teal-500 to-cyan-600",
    healthEndpoint: "/health",
    testEndpoints: ["/connectors", "/vault/status"],
  },
};

export const SERVICE_ORDER = [
  "orchestrator",
  "strategy",
  "risk",
  "execution",
  "portfolio",
  "analytics",
  "config",
  "local_ai",
  "data_ingestion",
];

export function getService(id: string): ServiceConfig | undefined {
  return SERVICES[id];
}

export function getAllServices(): ServiceConfig[] {
  return SERVICE_ORDER.map(id => SERVICES[id]).filter(Boolean);
}

export function getServicesByCategory(category: ServiceConfig["category"]): ServiceConfig[] {
  return getAllServices().filter(s => s.category === category);
}
