"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/context/AuthContext";
import CredentialManager from "@/components/portal/CredentialManager";
import DatabaseBrowser from "@/components/portal/DatabaseBrowser";
import * as configAPI from "@/lib/config-api";

// ─── Types ────────────────────────────────────────────────────────────────

interface ServiceHealth {
  status: string;
  service: string;
  timestamp: number;
}

// ─── Shared Components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ok: "bg-emerald-400/10 text-emerald-400",
    healthy: "bg-emerald-400/10 text-emerald-400",
    degraded: "bg-yellow-400/10 text-yellow-400",
    error: "bg-red-400/10 text-red-400",
    unhealthy: "bg-red-400/10 text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status] || colors.error}`}>
      {status.toUpperCase()}
    </span>
  );
}

function ConfigSection({
  title,
  children,
  expanded = false,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <svg
          className={`w-5 h-5 text-white/40 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="px-5 pb-5 border-t border-white/5">{children}</div>
      )}
    </div>
  );
}

function ConfigField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "number";
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-white/60">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 disabled:opacity-50"
      />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────

const TABS = [
  { id: "settings", label: "Settings", icon: "⚙️" },
  { id: "credentials", label: "Credentials", icon: "🔐" },
  { id: "database", label: "Database", icon: "🗄️" },
] as const;

type TabId = (typeof TABS)[number]["id"];

// ─── Main Page ────────────────────────────────────────────────────────────

export default function ConfigPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [config, setConfig] = useState<configAPI.BackendConfiguration | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>("db");
  const [activeTab, setActiveTab] = useState<TabId>("settings");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthData, configData] = await Promise.all([
        configAPI.getHealth().catch(() => null),
        configAPI.getConfig().catch(() => null),
      ]);
      setHealth(healthData);
      setConfig(configData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  if (!user) {
    return (
      <PortalShell title="Config">
        <div className="text-center py-20 text-white/40">Please sign in to access configuration.</div>
      </PortalShell>
    );
  }

  return (
    <PortalShell
      title="Config"
      action={
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
      }
    >
      <div className="max-w-5xl mx-auto space-y-6">
        {/* ── Service Header ─────────────────────────────────────────── */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              <div>
                <h2 className="text-lg font-semibold">Config Service</h2>
                <p className="text-sm text-white/40">
                  System configuration, credential vault &amp; database admin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/30 font-mono">localhost:3007</span>
              {health ? <StatusBadge status={health.status} /> : <StatusBadge status="error" />}
            </div>
          </div>
        </div>

        {/* ── Tab Bar ────────────────────────────────────────────────── */}
        <div className="flex gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/5">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Error / Save Messages ──────────────────────────────────── */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}
        {saveMessage && (
          <div
            className={`rounded-xl p-4 ${
              saveMessage.includes("success")
                ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
                : "bg-red-400/10 border border-red-400/20 text-red-400"
            }`}
          >
            {saveMessage}
          </div>
        )}

        {/* ── Settings Tab ───────────────────────────────────────────── */}
        {activeTab === "settings" && (
          <>
            {loading ? (
              <div className="text-center py-12 text-white/40">Loading configuration...</div>
            ) : config ? (
              <div className="space-y-4">
                <ConfigSection title="🗄️ Database" expanded={expandedSection === "db"} onToggle={() => toggleSection("db")}>
                  <div className="pt-4 space-y-6">
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-3">PostgreSQL</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <ConfigField label="Host" value={config.database.postgresql.host} onChange={() => {}} disabled />
                        <ConfigField label="Port" value={String(config.database.postgresql.port)} onChange={() => {}} disabled />
                        <ConfigField label="Database" value={config.database.postgresql.database} onChange={() => {}} disabled />
                        <ConfigField label="Username" value={config.database.postgresql.username} onChange={() => {}} disabled />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-3">Redis</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <ConfigField label="Host" value={config.database.redis.host} onChange={() => {}} disabled />
                        <ConfigField label="Port" value={String(config.database.redis.port)} onChange={() => {}} disabled />
                      </div>
                    </div>
                  </div>
                </ConfigSection>

                <ConfigSection title="💱 Exchanges" expanded={expandedSection === "exchanges"} onToggle={() => toggleSection("exchanges")}>
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <span className="text-white/60">Active Exchange</span>
                      <span className="font-medium">{config.exchanges.activeExchange}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <span className="text-white/60">Paper Mode</span>
                      <span className={`font-medium ${config.exchanges.paperMode ? "text-yellow-400" : "text-emerald-400"}`}>
                        {config.exchanges.paperMode ? "Enabled (Simulation)" : "Disabled (Live)"}
                      </span>
                    </div>
                  </div>
                </ConfigSection>

                <ConfigSection title="🔌 Services" expanded={expandedSection === "service"} onToggle={() => toggleSection("service")}>
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <span className="text-white/60">Environment</span>
                      <span className={`font-medium ${config.service.environment === "production" ? "text-red-400" : "text-emerald-400"}`}>
                        {config.service.environment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <span className="text-white/60">Execution Queue Backend</span>
                      <span className="font-medium">{config.service.executionQueueBackend}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white/60 mb-3">Service Ports</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(config.service.ports).map(([service, port]) => (
                          <div key={service} className="p-2 bg-white/[0.02] rounded text-sm">
                            <span className="text-white/40">{service}:</span>{" "}
                            <span className="font-mono">{port}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ConfigSection>

                <ConfigSection title="🤖 LLM Providers" expanded={expandedSection === "llm"} onToggle={() => toggleSection("llm")}>
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <span className="text-white/60">Active Provider</span>
                      <span className="font-medium">{config.llm.provider}</span>
                    </div>
                    {Object.entries(config.llm.providers).map(([key, provider]) => (
                      <div key={key} className="p-3 bg-white/[0.02] rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{provider.displayName}</span>
                          {config.llm.provider === key && (
                            <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded text-xs">Active</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ConfigSection>

                <div className="text-center text-sm text-white/30">
                  Last updated: {new Date(config.lastUpdated).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/40">Unable to load configuration.</p>
                <p className="text-sm text-white/20 mt-2">Make sure the config service is running on port 3007.</p>
              </div>
            )}
          </>
        )}

        {/* ── Credentials Tab ────────────────────────────────────────── */}
        {activeTab === "credentials" && <CredentialManager />}

        {/* ── Database Tab ───────────────────────────────────────────── */}
        {activeTab === "database" && <DatabaseBrowser />}
      </div>
    </PortalShell>
  );
}
