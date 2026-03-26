"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  checkServiceHealth,
  runAllServiceTests,
  HealthCheckResponse,
  TestResult,
} from "@/lib/service-health";
import { getService, ServiceConfig } from "@/lib/service-registry";
import Link from "next/link";
import ServiceInfoCard from "@/components/portal/ServiceInfoCard";
import DataIngestionControls from "@/components/portal/services/DataIngestionControls";

interface ServiceDetailViewProps {
  serviceId: string;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({ serviceId }) => {
  const service = getService(serviceId);

  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [testLoading, setTestLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadHealth = useCallback(async () => {
    if (!service) return;
    try {
      setError(null);
      const data = await checkServiceHealth(service);
      setHealth(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load health");
    } finally {
      setLoading(false);
    }
  }, [service]);

  const runTests = useCallback(async () => {
    if (!service) return;
    setTestLoading(true);
    setTestError(null);
    try {
      const results = await runAllServiceTests(service);
      setTests(results);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Failed to run tests");
    } finally {
      setTestLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadHealth();
  }, [loadHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadHealth]);

  if (!service) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Service Not Found</h2>
        <p className="text-white/40 mb-6">The service &quot;{serviceId}&quot; could not be found.</p>
        <Link href="/portal/trading" className="text-purple-400 hover:text-purple-300">
          ← Back to Trading
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link href="/portal/trading" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Trading
      </Link>

      {/* Service Header */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{service.icon}</span>
              <h1 className="text-3xl font-bold">{service.name}</h1>
            </div>
            <p className="text-white/60">{service.description}</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-white/40 mb-2">Running on</div>
            <div className="text-lg font-mono text-white/60">localhost:{service.port}</div>
          </div>
        </div>

        {/* Category Badge */}
        <div className="flex gap-2">
          <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs text-white/60 capitalize">
            {service.category}
          </span>
        </div>
      </div>

      {/* Service Information Card */}
      <ServiceInfoCard serviceId={serviceId} />

      {/* Service-Specific Controls */}
      {serviceId === "data_ingestion" && (
        <DataIngestionControls servicePort={service.port} />
      )}

      {/* Health Status Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Health Status</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                autoRefresh
                  ? "bg-purple-500/20 text-purple-400"
                  : "bg-white/5 text-white/60"
              }`}
            >
              {autoRefresh ? "Auto" : "Manual"}
            </button>
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

        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400 text-sm mb-4">
            {error}
          </div>
        )}

        {!loading && health && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Main Status Card */}
            <div className="lg:col-span-1 bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <div className="text-sm text-white/60 mb-2">Status</div>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-4 h-4 rounded-full ${
                    health.status === "healthy"
                      ? "bg-emerald-400"
                      : health.status === "degraded"
                      ? "bg-yellow-400"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-2xl font-bold capitalize">{health.status}</span>
              </div>

              {health.version && (
                <div className="mb-3">
                  <div className="text-sm text-white/60 mb-1">Version</div>
                  <div className="text-white/80 font-mono">{health.version}</div>
                </div>
              )}

              {health.uptime !== undefined && (
                <div>
                  <div className="text-sm text-white/60 mb-1">Uptime</div>
                  <div className="text-white/80 font-mono">{formatUptime(health.uptime)}</div>
                </div>
              )}
            </div>

            {/* Resources */}
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4 text-white/80">Resources</h3>
              <div className="space-y-4">
                {health.memory && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">Memory</span>
                      <span className="text-white/80">{health.memory.percent.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          health.memory.percent > 80
                            ? "bg-red-400"
                            : health.memory.percent > 60
                            ? "bg-yellow-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${health.memory.percent}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/40 mt-1">
                      {Math.round(health.memory.used / 1024 / 1024)}MB / {Math.round(health.memory.total / 1024 / 1024)}MB
                    </div>
                  </div>
                )}

                {health.cpu !== undefined && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/60">CPU</span>
                      <span className="text-white/80">{health.cpu.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          health.cpu > 80
                            ? "bg-red-400"
                            : health.cpu > 60
                            ? "bg-yellow-400"
                            : "bg-emerald-400"
                        }`}
                        style={{ width: `${Math.min(health.cpu, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dependencies */}
            {health.dependencies && Object.keys(health.dependencies).length > 0 && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
                <h3 className="text-sm font-semibold mb-4 text-white/80">Dependencies</h3>
                <div className="space-y-2">
                  {Object.entries(health.dependencies).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span className="text-white/60">{key}</span>
                      <span
                        className={
                          value === "ok"
                            ? "text-emerald-400 font-medium"
                            : "text-red-400 font-medium"
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

        {loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/[0.02] border border-white/5 rounded-xl p-6 animate-pulse"
              >
                <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
                <div className="space-y-2">
                  <div className="h-8 bg-white/5 rounded" />
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tests Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Service Tests</h2>
          <button
            onClick={runTests}
            disabled={testLoading}
            className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {testLoading ? "Running..." : "Run Tests"}
          </button>
        </div>

        {testError && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400 text-sm mb-4">
            {testError}
          </div>
        )}

        {tests.length === 0 ? (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-8 text-center">
            <p className="text-white/40">No tests have been run yet.</p>
            <p className="text-sm text-white/20 mt-2">Click {`"Run Tests"`} to start testing this service.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tests.map((test, idx) => (
              <div
                key={idx}
                className={`bg-white/[0.02] border rounded-xl p-4 ${
                  test.status === "pass"
                    ? "border-emerald-500/20"
                    : test.status === "fail"
                    ? "border-red-500/20"
                    : "border-yellow-500/20"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          test.status === "pass"
                            ? "bg-emerald-400/10 text-emerald-400"
                            : test.status === "fail"
                            ? "bg-red-400/10 text-red-400"
                            : "bg-yellow-400/10 text-yellow-400"
                        }`}
                      >
                        {test.status.toUpperCase()}
                      </span>
                      <span className="font-mono text-sm text-white/80">{test.name}</span>
                    </div>
                    {test.message && (
                      <p className="text-sm text-white/40 mt-1">{test.message}</p>
                    )}
                    {test.data && Object.keys(test.data).length > 0 && (
                      <pre className="bg-black/30 rounded p-3 mt-2 text-xs text-white/60 overflow-auto max-h-40">
                        {JSON.stringify(test.data, null, 2)}
                      </pre>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <div className="text-xs text-white/40 font-mono">{test.duration}ms</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Additional Info */}
      {health?.checks && Object.keys(health.checks).length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">System Checks</h2>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
            <div className="space-y-3">
              {Object.entries(health.checks).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <span className="text-white/60">{key}</span>
                  <span className="text-white/80 font-mono">
                    {typeof value === "boolean" ? (value ? "✓" : "✗") : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  return `${Math.round(seconds / 86400)} days`;
}

export default ServiceDetailView;
