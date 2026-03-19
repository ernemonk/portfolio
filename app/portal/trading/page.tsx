"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/context/AuthContext";
import * as tradingAPI from "@/lib/trading-api";

// ─── Types ────────────────────────────────────────────────────────────────

type ServiceStatus = "healthy" | "degraded" | "unhealthy" | "loading";

interface ServiceCard {
  name: string;
  status: ServiceStatus;
  uptime?: number;
  latency?: number;
  details?: Record<string, string>;
}

// ─── Components ───────────────────────────────────────────────────────────

function StatusIndicator({ status }: { status: ServiceStatus }) {
  const colors: Record<ServiceStatus, string> = {
    healthy: "bg-emerald-400",
    degraded: "bg-yellow-400",
    unhealthy: "bg-red-400",
    loading: "bg-white/20 animate-pulse",
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status]}`} />;
}

function ServiceStatusCard({ service }: { service: ServiceCard }) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold capitalize">{service.name}</h3>
        <StatusIndicator status={service.status} />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-white/60">
          <span>Status</span>
          <span className={`font-medium ${
            service.status === "healthy" ? "text-emerald-400" :
            service.status === "degraded" ? "text-yellow-400" :
            service.status === "unhealthy" ? "text-red-400" : "text-white/40"
          }`}>
            {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
          </span>
        </div>
        {service.uptime !== undefined && (
          <div className="flex justify-between text-white/60">
            <span>Uptime</span>
            <span className="font-mono">{formatUptime(service.uptime)}</span>
          </div>
        )}
        {service.details && Object.entries(service.details).map(([key, value]) => (
          <div key={key} className="flex justify-between text-white/60">
            <span>{key}</span>
            <span className="font-mono">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategyRow({ 
  strategy,
  onToggle,
  loading 
}: { 
  strategy: tradingAPI.Strategy;
  onToggle: () => void;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors">
      <div>
        <div className="font-medium">{strategy.name}</div>
        {strategy.description && (
          <p className="text-sm text-white/40 mt-0.5">{strategy.description}</p>
        )}
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          strategy.enabled
            ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
            : "bg-white/5 text-white/40 hover:bg-white/10"
        }`}
      >
        {loading ? "..." : strategy.enabled ? "Enabled" : "Disabled"}
      </button>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function TradingPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<tradingAPI.SystemHealth | null>(null);
  const [strategies, setStrategies] = useState<tradingAPI.Strategy[]>([]);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [togglingStrategy, setTogglingStrategy] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [health, strats, queue] = await Promise.all([
        tradingAPI.getSystemHealth(),
        tradingAPI.getStrategies().catch(() => []),
        tradingAPI.getQueueDepth().catch(() => ({ depth: 0 })),
      ]);
      setSystemHealth(health);
      setStrategies(strats);
      setQueueDepth(queue.depth);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load trading data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user, loadData]);

  const handleToggleStrategy = async (strategy: tradingAPI.Strategy) => {
    setTogglingStrategy(strategy.name);
    try {
      if (strategy.enabled) {
        await tradingAPI.disableStrategy(strategy.name);
      } else {
        await tradingAPI.enableStrategy(strategy.name);
      }
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle strategy");
    } finally {
      setTogglingStrategy(null);
    }
  };

  const handleTriggerPipeline = async () => {
    try {
      await tradingAPI.triggerPipeline();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to trigger pipeline");
    }
  };

  if (!user) {
    return (
      <PortalShell title="Trading">
        <div className="text-center py-20 text-white/40">Please sign in to access trading.</div>
      </PortalShell>
    );
  }

  const services: ServiceCard[] = systemHealth ? [
    {
      name: "Orchestrator",
      status: systemHealth.orchestrator?.status === "ok" ? "healthy" : 
              systemHealth.orchestrator ? "degraded" : "unhealthy",
      uptime: systemHealth.orchestrator?.uptime,
      details: systemHealth.orchestrator?.checks,
    },
    {
      name: "Strategy",
      status: systemHealth.strategy?.status === "ok" ? "healthy" : 
              systemHealth.strategy ? "degraded" : "unhealthy",
      uptime: systemHealth.strategy?.uptime,
      details: systemHealth.strategy?.checks,
    },
    {
      name: "Risk",
      status: systemHealth.risk?.status === "ok" ? "healthy" : 
              systemHealth.risk ? "degraded" : "unhealthy",
      uptime: systemHealth.risk?.uptime,
      details: systemHealth.risk?.checks,
    },
    {
      name: "Execution",
      status: systemHealth.execution?.status === "ok" ? "healthy" : 
              systemHealth.execution ? "degraded" : "unhealthy",
      uptime: systemHealth.execution?.uptime,
      details: {
        ...systemHealth.execution?.checks,
        ...(queueDepth !== null ? { "Queue Depth": String(queueDepth) } : {}),
      },
    },
  ] : [];

  return (
    <PortalShell
      title="Trading"
      action={
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPipeline}
            disabled={loading}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors"
          >
            ▶ Run Pipeline
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* System Overview */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">System Status</h2>
            {systemHealth && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                systemHealth.overall === "healthy" ? "bg-emerald-400/10 text-emerald-400" :
                systemHealth.overall === "degraded" ? "bg-yellow-400/10 text-yellow-400" :
                "bg-red-400/10 text-red-400"
              }`}>
                {systemHealth.overall.charAt(0).toUpperCase() + systemHealth.overall.slice(1)}
              </span>
            )}
          </div>

          {loading && !systemHealth ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-5 animate-pulse">
                  <div className="h-5 bg-white/10 rounded w-24 mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded" />
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((service) => (
                <ServiceStatusCard key={service.name} service={service} />
              ))}
            </div>
          )}
        </section>

        {/* Strategies */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Strategies</h2>
          
          {strategies.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 text-center">
              <p className="text-white/40">No strategies configured.</p>
              <p className="text-sm text-white/20 mt-2">Strategies will appear here when the strategy service is running.</p>
            </div>
          ) : (
            <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
              <div className="divide-y divide-white/5">
                {strategies.map((strategy) => (
                  <StrategyRow
                    key={strategy.name}
                    strategy={strategy}
                    onToggle={() => handleToggleStrategy(strategy)}
                    loading={togglingStrategy === strategy.name}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Quick Stats */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Execution Queue</h2>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Pending Orders</p>
                <p className="text-3xl font-bold mt-1">
                  {queueDepth !== null ? queueDepth : "—"}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                queueDepth === 0 ? "bg-emerald-400/10" : "bg-yellow-400/10"
              }`}>
                <svg className={`w-6 h-6 ${queueDepth === 0 ? "text-emerald-400" : "text-yellow-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <div className="text-center text-sm text-white/30">
          Auto-refreshes every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </PortalShell>
  );
}
