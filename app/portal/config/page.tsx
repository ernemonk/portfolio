"use client";
import { useEffect, useState, useCallback } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/context/AuthContext";
import * as configAPI from "@/lib/config-api";

// ─── Types ────────────────────────────────────────────────────────────────

interface ServiceHealth {
  status: string;
  service: string;
  timestamp: number;
}

// ─── Components ───────────────────────────────────────────────────────────

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
  onToggle 
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
        <div className="px-5 pb-5 border-t border-white/5">
          {children}
        </div>
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

function CredentialRow({
  credential,
  onDelete,
  onToggle,
}: {
  credential: configAPI.Credential;
  onDelete: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{credential.provider_name}</span>
          <span className="text-white/40 text-sm">/ {credential.credential_key}</span>
        </div>
        {credential.label && (
          <p className="text-sm text-white/40 mt-0.5">{credential.label}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onToggle}
          className={`px-2 py-1 rounded text-xs ${
            credential.is_active 
              ? "bg-emerald-400/10 text-emerald-400" 
              : "bg-white/5 text-white/40"
          }`}
        >
          {credential.is_active ? "Active" : "Inactive"}
        </button>
        <button
          onClick={onDelete}
          className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────

export default function ConfigPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<ServiceHealth | null>(null);
  const [config, setConfig] = useState<configAPI.BackendConfiguration | null>(null);
  const [credentials, setCredentials] = useState<configAPI.Credential[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>("database");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // New credential form state
  const [newCred, setNewCred] = useState({
    provider_name: "",
    credential_key: "",
    value: "",
    label: "",
  });
  const [addingCred, setAddingCred] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [healthData, configData, credsData] = await Promise.all([
        configAPI.getHealth().catch(() => null),
        configAPI.getConfig().catch(() => null),
        configAPI.getCredentials().catch(() => []),
      ]);
      setHealth(healthData);
      setConfig(configData);
      setCredentials(credsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load configuration");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  const handleSaveSection = async (section: string, data: Record<string, unknown>) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await configAPI.updateConfigSection(section, data);
      setSaveMessage("Configuration saved successfully");
      await loadData();
    } catch (err) {
      setSaveMessage(err instanceof Error ? err.message : "Failed to save configuration");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const handleAddCredential = async () => {
    if (!newCred.provider_name || !newCred.credential_key || !newCred.value) return;
    setAddingCred(true);
    try {
      await configAPI.addCredential(newCred);
      setNewCred({ provider_name: "", credential_key: "", value: "", label: "" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credential");
    } finally {
      setAddingCred(false);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!confirm("Delete this credential?")) return;
    try {
      await configAPI.deleteCredential(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete credential");
    }
  };

  const handleToggleCredential = async (cred: configAPI.Credential) => {
    try {
      await configAPI.updateCredential(cred.id, { is_active: !cred.is_active });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update credential");
    }
  };

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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Service Status */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Config Service</h2>
              <p className="text-sm text-white/40 mt-0.5">Backend configuration management</p>
            </div>
            {health ? (
              <StatusBadge status={health.status} />
            ) : (
              <StatusBadge status="error" />
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div className={`rounded-xl p-4 ${
            saveMessage.includes("success") 
              ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-400"
              : "bg-red-400/10 border border-red-400/20 text-red-400"
          }`}>
            {saveMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-white/40">Loading configuration...</div>
        ) : config ? (
          <div className="space-y-4">
            {/* Database Config */}
            <ConfigSection
              title="🗄️ Database"
              expanded={expandedSection === "database"}
              onToggle={() => toggleSection("database")}
            >
              <div className="pt-4 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-3">PostgreSQL</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ConfigField
                      label="Host"
                      value={config.database.postgresql.host}
                      onChange={() => {}}
                      disabled
                    />
                    <ConfigField
                      label="Port"
                      value={String(config.database.postgresql.port)}
                      onChange={() => {}}
                      type="number"
                      disabled
                    />
                    <ConfigField
                      label="Database"
                      value={config.database.postgresql.database}
                      onChange={() => {}}
                      disabled
                    />
                    <ConfigField
                      label="Username"
                      value={config.database.postgresql.username}
                      onChange={() => {}}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/60 mb-3">Redis</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <ConfigField
                      label="Host"
                      value={config.database.redis.host}
                      onChange={() => {}}
                      disabled
                    />
                    <ConfigField
                      label="Port"
                      value={String(config.database.redis.port)}
                      onChange={() => {}}
                      type="number"
                      disabled
                    />
                  </div>
                </div>
              </div>
            </ConfigSection>

            {/* Exchange Config */}
            <ConfigSection
              title="💱 Exchanges"
              expanded={expandedSection === "exchanges"}
              onToggle={() => toggleSection("exchanges")}
            >
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

            {/* Service Config */}
            <ConfigSection
              title="⚙️ Services"
              expanded={expandedSection === "service"}
              onToggle={() => toggleSection("service")}
            >
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                  <span className="text-white/60">Environment</span>
                  <span className={`font-medium ${
                    config.service.environment === "production" ? "text-red-400" : "text-emerald-400"
                  }`}>
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

            {/* LLM Config */}
            <ConfigSection
              title="🤖 LLM Providers"
              expanded={expandedSection === "llm"}
              onToggle={() => toggleSection("llm")}
            >
              <div className="pt-4 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                  <span className="text-white/60">Active Provider</span>
                  <span className="font-medium">{config.llm.provider}</span>
                </div>
                {Object.entries(config.llm.providers).map(([key, provider]) => (
                  <div key={key} className="p-3 bg-white/[0.02] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{provider.displayName}</span>
                      {config.llm.provider === key && (
                        <span className="px-2 py-0.5 bg-emerald-400/10 text-emerald-400 rounded text-xs">Active</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ConfigSection>

            {/* Credentials */}
            <ConfigSection
              title="🔐 Credentials"
              expanded={expandedSection === "credentials"}
              onToggle={() => toggleSection("credentials")}
            >
              <div className="pt-4 space-y-4">
                {credentials.length === 0 ? (
                  <p className="text-white/40 text-sm">No credentials configured.</p>
                ) : (
                  <div className="space-y-2">
                    {credentials.map((cred) => (
                      <CredentialRow
                        key={cred.id}
                        credential={cred}
                        onDelete={() => handleDeleteCredential(cred.id)}
                        onToggle={() => handleToggleCredential(cred)}
                      />
                    ))}
                  </div>
                )}

                {/* Add Credential Form */}
                <div className="border-t border-white/5 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-white/60 mb-3">Add New Credential</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <ConfigField
                      label="Provider"
                      value={newCred.provider_name}
                      onChange={(v) => setNewCred({ ...newCred, provider_name: v })}
                      placeholder="e.g., openai, coinbase"
                    />
                    <ConfigField
                      label="Key Name"
                      value={newCred.credential_key}
                      onChange={(v) => setNewCred({ ...newCred, credential_key: v })}
                      placeholder="e.g., api_key, api_secret"
                    />
                    <ConfigField
                      label="Value"
                      value={newCred.value}
                      onChange={(v) => setNewCred({ ...newCred, value: v })}
                      type="password"
                      placeholder="Enter secret value"
                    />
                    <ConfigField
                      label="Label (optional)"
                      value={newCred.label}
                      onChange={(v) => setNewCred({ ...newCred, label: v })}
                      placeholder="Description"
                    />
                  </div>
                  <button
                    onClick={handleAddCredential}
                    disabled={addingCred || !newCred.provider_name || !newCred.credential_key || !newCred.value}
                    className="mt-3 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-white/10 disabled:text-white/30 rounded-lg text-sm font-medium transition-colors"
                  >
                    {addingCred ? "Adding..." : "Add Credential"}
                  </button>
                </div>
              </div>
            </ConfigSection>

            {/* Last Updated */}
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
      </div>
    </PortalShell>
  );
}
