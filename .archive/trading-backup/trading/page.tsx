"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import * as tradingAPI from "@/lib/trading-api";
import { HealthCheckResponse, getSystemHealthStatus } from "@/lib/service-health";

const SystemFlowView = dynamic(
  () => import("@/components/portal/SystemFlowView"),
  { ssr: false, loading: () => (
    <div className="w-full h-[860px] bg-white/[0.02] border border-white/5 rounded-xl animate-pulse flex items-center justify-center">
      <span className="text-white/30">Loading Flow View…</span>
    </div>
  )}
);

// ─── Types ────────────────────────────────────────────────────────────────

type ServiceStatus = "healthy" | "degraded" | "unhealthy" | "loading";

interface ServiceCard {
  name: string;
  status: ServiceStatus;
  uptime?: number;
  latency?: number;
  details?: Record<string, string>;
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
  const [strategies, setStrategies] = useState<tradingAPI.Strategy[]>([]);
  const [queueDepth, setQueueDepth] = useState<number | null>(null);
  const [togglingStrategy, setTogglingStrategy] = useState<string | null>(null);
  const [healthData, setHealthData] = useState<HealthCheckResponse[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [strats, queue] = await Promise.all([
        tradingAPI.getStrategies().catch(() => []),
        tradingAPI.getQueueDepth().catch(() => ({ depth: 0 })),
      ]);
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

  // Load health data for flow view
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const loadHealth = async () => {
      try {
        const health = await getSystemHealthStatus();
        if (!cancelled) setHealthData(health.services);
      } catch {}
    };
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

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

        {/* System Status Overview - NEW */}
        <SystemFlowView healthData={healthData} loading={loading} />

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
