"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getSystemHealthStatus, HealthCheckResponse } from "@/lib/service-health";
import { ServiceStatusCard, StatusIndicator } from "./ServiceStatusCard";
import { getAllServices } from "@/lib/service-registry";

interface SystemHealthOverviewProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onHealthUpdate?: (health: HealthCheckResponse[]) => void;
}

export const SystemHealthOverview: React.FC<SystemHealthOverviewProps> = ({
  autoRefresh = true,
  refreshInterval = 30000,
  onHealthUpdate,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overall, setOverall] = useState<"healthy" | "degraded" | "unhealthy">("unhealthy");
  const [services, setServices] = useState<HealthCheckResponse[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadHealth = useCallback(async () => {
    try {
      setError(null);
      const health = await getSystemHealthStatus();
      setOverall(health.overall);
      setServices(health.services);
      setLastUpdated(new Date());
      onHealthUpdate?.(health.services);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load system health");
    } finally {
      setLoading(false);
    }
  }, [onHealthUpdate]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(loadHealth, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadHealth]);

  const allServices = getAllServices();
  const healthMap = new Map(services.map(s => [s.service.toLowerCase(), s]));

  const overallColor = {
    healthy: "bg-emerald-400/10 text-emerald-400 border-emerald-500/20",
    degraded: "bg-yellow-400/10 text-yellow-400 border-yellow-500/20",
    unhealthy: "bg-red-400/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium">System Health Check Failed</p>
              <p className="text-sm text-red-300/60 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Overall Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">System Status</h2>
          <p className="text-sm text-white/40">
            {services.length > 0
              ? `${services.filter(s => s.status === "healthy").length} of ${services.length} services healthy`
              : "Loading services..."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-lg border font-medium text-sm ${overallColor[overall]}`}
          >
            {overall.charAt(0).toUpperCase() + overall.slice(1)}
          </div>
          <button
            onClick={loadHealth}
            disabled={loading}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading && !services.length
          ? // Loading skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/[0.03] border border-white/5 rounded-xl p-5 animate-pulse"
              >
                <div className="h-6 bg-white/10 rounded w-24 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))
          : // Rendered services
            allServices.map(service => {
              const health = healthMap.get(service.name.toLowerCase());
              return (
                <ServiceStatusCard
                  key={service.id}
                  service={service}
                  health={health}
                  loading={loading}
                  detailed={false}
                />
              );
            })}
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-xs text-white/30">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default SystemHealthOverview;
