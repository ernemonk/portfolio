"use client";

import React from "react";
import Link from "next/link";
import { HealthCheckResponse, TestResult } from "@/lib/service-health";
import { ServiceConfig } from "@/lib/service-registry";

interface ServiceStatusCardProps {
  service: ServiceConfig;
  health?: HealthCheckResponse;
  loading?: boolean;
  onClick?: () => void;
  detailed?: boolean;
}

export const StatusIndicator: React.FC<{ status: string; loading?: boolean }> = ({
  status,
  loading,
}) => {
  const getColor = () => {
    if (loading) return "bg-white/20 animate-pulse";
    switch (status) {
      case "healthy":
        return "bg-emerald-400";
      case "degraded":
        return "bg-yellow-400";
      case "unhealthy":
        return "bg-red-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${getColor()}`} />
      <span className="text-sm font-medium capitalize">{status}</span>
    </div>
  );
};

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({
  service,
  health,
  loading = false,
  onClick,
  detailed = false,
}) => {
  const isClickable = !!onClick;
  const statusColor = {
    healthy: "border-emerald-500/20 hover:border-emerald-500/40",
    degraded: "border-yellow-500/20 hover:border-yellow-500/40",
    unhealthy: "border-red-500/20 hover:border-red-500/40",
  };

  const bgGradient = `bg-gradient-to-br ${service.color}`;

  return (
    <Link href={`/portal/trading/${service.id}`}>
      <div
        onClick={onClick}
        className={`
          bg-white/[0.02] border rounded-xl p-5 transition-all cursor-pointer
          ${loading ? "opacity-60" : ""}
          ${statusColor[health?.status || "unhealthy"]}
          hover:bg-white/[0.04] hover:shadow-lg hover:shadow-white/5
          group
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{service.icon}</span>
              <h3 className="font-semibold text-white group-hover:text-white/90">
                {service.name}
              </h3>
            </div>
            <p className="text-xs text-white/40 group-hover:text-white/50">
              {service.description}
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-4">
          <StatusIndicator status={health?.status || "unhealthy"} loading={loading} />
        </div>

        {/* Details Grid */}
        {detailed && health && (
          <div className="space-y-2 text-sm border-t border-white/5 pt-3 mt-3">
            {/* Uptime */}
            {health.uptime !== undefined && (
              <div className="flex justify-between text-white/60">
                <span>Uptime</span>
                <span className="font-mono text-white/80">
                  {formatUptime(health.uptime)}
                </span>
              </div>
            )}

            {/* Memory */}
            {health.memory && (
              <div className="flex justify-between text-white/60">
                <span>Memory</span>
                <span className="font-mono text-white/80">
                  {health.memory.percent.toFixed(1)}%
                </span>
              </div>
            )}

            {/* CPU */}
            {health.cpu !== undefined && (
              <div className="flex justify-between text-white/60">
                <span>CPU</span>
                <span className="font-mono text-white/80">
                  {health.cpu.toFixed(1)}%
                </span>
              </div>
            )}

            {/* Dependencies */}
            {health.dependencies && Object.keys(health.dependencies).length > 0 && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-white/60 text-xs mb-2">Dependencies</p>
                <div className="space-y-1">
                  {Object.entries(health.dependencies).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-white/40">{key}</span>
                      <span
                        className={
                          value === "ok"
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <span className="text-xs text-white/30 group-hover:text-white/40">
            {service.category}
          </span>
          <span className="text-xs text-white/30 group-hover:text-white/40 transition-transform group-hover:translate-x-1">
            →
          </span>
        </div>
      </div>
    </Link>
  );
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86400)}d`;
}

export default ServiceStatusCard;
