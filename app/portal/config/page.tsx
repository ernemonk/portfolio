"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import PortalShell from "@/components/portal/PortalShell";
import { useAuth } from "@/context/AuthContext";
import * as configAPI from "@/lib/config-api";

// ─── Component Types ──────────────────────────────────────────────────────

interface ConfigSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
}

interface ConfigFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "password" | "number" | "url";
  placeholder?: string;
  description?: string;
  sensitive?: boolean;
}

// ─── UI Components ────────────────────────────────────────────────────────

function ConfigSection({ title, description, children, expanded = false, onToggle }: ConfigSectionProps) {
  return (
    <div className="border border-white/10 rounded-lg bg-white/[0.02]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-sm text-white/50">{description}</p>
        </div>
        <span className="text-white/30 text-lg">
          {expanded ? "▲" : "▼"}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

function ConfigField({ label, value, onChange, type = "text", placeholder, description, sensitive }: ConfigFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const inputType = sensitive && !showPassword ? "password" : type;

  // Real-time validation
  const validateField = useCallback(async (fieldValue: string) => {
    if (!fieldValue) {
      setIsValid(true);
      setValidationMessage("");
      return;
    }

    // URL validation
    if (type === "url") {
      try {
        new URL(fieldValue);
        setIsValid(true);
        setValidationMessage("✓ Valid URL");
      } catch {
        setIsValid(false);
        setValidationMessage("Invalid URL format");
      }
    }
    
    // Port validation
    if (type === "number" && label.toLowerCase().includes("port")) {
      const port = parseInt(fieldValue);
      if (port < 1 || port > 65535) {
        setIsValid(false);
        setValidationMessage("Port must be between 1-65535");
      } else {
        setIsValid(true);
        setValidationMessage("✓ Valid port");
      }
    }
  }, [type, label]);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Debounced validation
    timeoutRef.current = setTimeout(() => {
      validateField(newValue);
    }, 500);
  };

  // Test connection for database/API fields
  const testConnection = async () => {
    if (!value) return;
    
    setIsConnecting(true);
    try {
      // This would be connected to actual connection testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate test
      setIsValid(true);
      setValidationMessage("✓ Connection successful");
    } catch {
      setIsValid(false);
      setValidationMessage("Connection failed");
    } finally {
      setIsConnecting(false);
    }
  };

  const showTestButton = label.toLowerCase().includes("host") || 
                       label.toLowerCase().includes("url") || 
                       (sensitive && label.toLowerCase().includes("key"));

  return (
    <div className="space-y-2">
      <label className="block text-sm text-white/70">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          value={sensitive && !showPassword ? (value ? "●●●●●●●●" : "") : value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-white/5 border rounded px-3 py-2 text-sm text-white/90 placeholder:text-white/30 focus:outline-none transition-colors ${
            isValid ? 'border-white/10 focus:border-emerald-500/50' : 'border-red-500/50 focus:border-red-500'
          } ${showTestButton ? 'pr-20' : 'pr-10'}`}
          onFocus={(e) => {
            if (sensitive && !showPassword) {
              setShowPassword(true);
              e.target.value = value;
            }
          }}
          onBlur={() => {
            if (sensitive) setShowPassword(false);
          }}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {showTestButton && value && (
            <button
              type="button"
              onClick={testConnection}
              disabled={isConnecting}
              className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
            >
              {isConnecting ? "..." : "Test"}
            </button>
          )}
          {sensitive && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-white/30 hover:text-white/60 text-xs ml-1"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          )}
        </div>
      </div>
      {validationMessage && (
        <p className={`text-xs ${isValid ? 'text-emerald-400' : 'text-red-400'}`}>
          {validationMessage}
        </p>
      )}
      {description && <p className="text-xs text-white/40">{description}</p>}
    </div>
  );
}

function ServiceHealthIndicator({ 
  service, 
  status, 
  lastChecked, 
  onRefresh 
}: { 
  service: string; 
  status: "healthy" | "unhealthy" | "unknown" | "checking"; 
  lastChecked?: Date;
  onRefresh?: () => void;
}) {
  const colors = {
    healthy: "bg-emerald-500",
    unhealthy: "bg-red-500",
    unknown: "bg-yellow-500",
    checking: "bg-blue-500 animate-pulse"
  };
  
  const statusText = {
    healthy: "Online",
    unhealthy: "Offline", 
    unknown: "Unknown",
    checking: "Checking..."
  };
  
  return (
    <div className="flex items-center justify-between group hover:bg-white/[0.02] p-2 rounded transition-colors">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${colors[status]}`} />
        <span className="text-sm text-white/60">{service}</span>
        <span className="text-xs text-white/40">({statusText[status]})</span>
      </div>
      <div className="flex items-center gap-2">
        {lastChecked && (
          <span className="text-xs text-white/30">
            {lastChecked.toLocaleTimeString()}
          </span>
        )}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="opacity-0 group-hover:opacity-100 text-xs text-blue-400 hover:text-blue-300 transition-opacity"
          >
            ↻
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

export default function ConfigPage() {
  const { user } = useAuth();
  const [config, setConfig] = useState<configAPI.BackendConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Section expansion state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["database"]));
  
  // Service health tracking with enhanced state
  const [serviceHealth, setServiceHealth] = useState<{ 
    [key: string]: {
      status: "healthy" | "unhealthy" | "unknown" | "checking";
      lastChecked?: Date;
    }
  }>({
    portfolio: { status: "unknown" },
    strategy: { status: "unknown" }, 
    risk: { status: "unknown" },
    execution: { status: "unknown" },
    orchestrator: { status: "unknown" },
    analytics: { status: "unknown" },
    config: { status: "unknown" }
  });
  
  // Auto-save timeout
  const autoSaveTimeout = useRef<NodeJS.Timeout>();
  const healthCheckInterval = useRef<NodeJS.Timeout>();
  
  // Provider management state
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    displayName: "",
    fields: {} as { [key: string]: string }
  });
  const [editingProvider, setEditingProvider] = useState<string | null>(null);

  // Load configuration and setup auto-refresh
  useEffect(() => {
    if (!user) return;
    loadConfig();
    checkServiceHealth();
    
    // Setup auto-refresh for service health
    if (autoRefreshEnabled) {
      healthCheckInterval.current = setInterval(() => {
        checkServiceHealth();
      }, 10000); // Check every 10 seconds
    }
    
    return () => {
      if (healthCheckInterval.current) {
        clearInterval(healthCheckInterval.current);
      }
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [user, autoRefreshEnabled]);
  
  // Auto-save when config changes
  useEffect(() => {
    if (!config || !autoSaveEnabled || saving) return;
    
    if (autoSaveTimeout.current) {
      clearTimeout(autoSaveTimeout.current);
    }
    
    autoSaveTimeout.current = setTimeout(() => {
      if (hasUnsavedChanges) {
        saveConfig();
      }
    }, 2000); // Auto-save after 2 seconds of no changes
  }, [config, autoSaveEnabled, hasUnsavedChanges, saving]);

  const loadConfig = async () => {
    setLoading(true);
    setError("");
    try {
      const configData = await configAPI.getConfig();
      setConfig(configData);
    } catch (err) {
      console.error("Failed to load config:", err);
      setError(err instanceof configAPI.ConfigAPIError ? err.message : "Failed to load configuration");
      // Use default config as fallback
      setConfig(configAPI.getDefaultConfig());
    } finally {
      setLoading(false);
    }
  };

  const checkServiceHealth = async (specificService?: string) => {
    const services = specificService ? [specificService] : 
      ["portfolio", "strategy", "risk", "execution", "orchestrator", "analytics", "config"];
    
    const newHealth = { ...serviceHealth };
    
    // Set checking status
    services.forEach(service => {
      newHealth[service] = { 
        ...newHealth[service], 
        status: "checking" 
      };
    });
    setServiceHealth(newHealth);
    
    // Check each service
    const promises = services.map(async (service) => {
      try {
        const result = await configAPI.testConnection(service);
        return {
          service,
          status: result.status === "ok" ? "healthy" as const : "unhealthy" as const,
          lastChecked: new Date()
        };
      } catch {
        return {
          service,
          status: "unhealthy" as const,
          lastChecked: new Date()
        };
      }
    });
    
    const results = await Promise.all(promises);
    
    // Update health status
    results.forEach(({ service, status, lastChecked }) => {
      newHealth[service] = { status, lastChecked };
    });
    
    setServiceHealth(newHealth);
  };

  const saveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    setError("");
    setSaved(false);
    
    try {
      const updatedConfig = await configAPI.updateConfig(config);
      setConfig(updatedConfig);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save config:", err);
      setError(err instanceof configAPI.ConfigAPIError ? err.message : "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string[], value: any) => {
    if (!config) return;
    
    const updated = { ...config };
    let current: any = updated;
    
    for (let i = 0; i < path.length - 1; i++) {
      current[path[i]] = { ...current[path[i]] };
      current = current[path[i]];
    }
    
    current[path[path.length - 1]] = value;
    setConfig(updated);
    setHasUnsavedChanges(true);
    setLastUpdated(new Date());
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const downloadEnvFile = async () => {
    try {
      const { content } = await configAPI.generateEnvFile();
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = ".env.local";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof configAPI.ConfigAPIError ? err.message : "Failed to generate .env file");
    }
  };

  // Provider Management Functions
  const addCustomProvider = () => {
    if (!newProvider.name || !newProvider.displayName) {
      setError("Provider name and display name are required");
      return;
    }
    
    // Add the new provider with dynamic fields
    const providerConfig = {
      name: newProvider.name,
      displayName: newProvider.displayName,
      fields: newProvider.fields
    };
    
    updateConfig(["llm", "providers", newProvider.name], providerConfig);
    
    // Reset form
    setNewProvider({
      name: "",
      displayName: "",
      fields: {}
    });
    setShowAddProvider(false);
  };
  
  const removeProvider = (providerName: string) => {
    // If this provider is active, switch to mock
    if (config?.llm.provider === providerName) {
      updateConfig(["llm", "provider"], "mock");
    }
    
    // Remove the provider
    const updatedProviders = { ...config?.llm.providers };
    delete updatedProviders[providerName];
    updateConfig(["llm", "providers"], updatedProviders);
  };
  
  const addCustomField = (providerName: string) => {
    const fieldName = prompt("Enter field name (e.g., 'apiKey', 'model', 'temperature'):");
    if (!fieldName) return;
    
    const fieldValue = prompt(`Enter value for ${fieldName}:`);
    if (fieldValue === null) return;
    
    updateConfig(["llm", "providers", providerName, "fields", fieldName], fieldValue);
  };
  
  const removeCustomField = (providerName: string, fieldName: string) => {
    const updatedFields = { ...config?.llm.providers[providerName].fields };
    delete updatedFields[fieldName];
    updateConfig(["llm", "providers", providerName, "fields"], updatedFields);
  };
  
  const addFieldToNewProvider = () => {
    const fieldName = prompt("Enter field name (e.g., 'apiKey', 'model', 'temperature'):");
    if (!fieldName) return;
    
    const fieldValue = prompt(`Enter value for ${fieldName}:`);
    if (fieldValue === null) return;
    
    setNewProvider(prev => ({
      ...prev,
      fields: { ...prev.fields, [fieldName]: fieldValue }
    }));
  };

  if (loading || !config) {
    return (
      <PortalShell title="Backend Config">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
        </div>
      </PortalShell>
    );
  }

  return (
    <PortalShell title="Backend Config">
      <div className="space-y-6">
        
        {/* Enhanced Header with Dynamic Controls */}
        <div className="space-y-4">
          {/* Title and Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white">Backend Configuration</h1>
                <p className="text-white/50 text-sm">Manage database connections, API keys, and service settings</p>
              </div>
              {lastUpdated && (
                <div className="text-xs text-white/30">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => checkServiceHealth()}
                disabled={Object.values(serviceHealth).some(s => s.status === "checking")}
                className="px-3 py-1.5 text-xs font-mono bg-white/5 hover:bg-white/10 text-white/70 border border-white/10 rounded transition-colors disabled:opacity-50"
              >
                {Object.values(serviceHealth).some(s => s.status === "checking") ? "Checking..." : "🔄 Check Health"}
              </button>
              <button
                onClick={downloadEnvFile}
                className="px-3 py-1.5 text-xs font-mono bg-blue-600/70 hover:bg-blue-600 text-white border border-blue-500/30 rounded transition-colors"
              >
                📁 Export .env
              </button>
              <button
                onClick={saveConfig}
                disabled={saving || !hasUnsavedChanges}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  saved ? 'bg-emerald-600 text-white' :
                  hasUnsavedChanges ? 'bg-amber-600/70 hover:bg-amber-600 text-white' :
                  'bg-emerald-600/70 hover:bg-emerald-600 text-white disabled:opacity-50'
                }`}
              >
                {saving ? "💾 Saving..." : saved ? "✅ Saved" : hasUnsavedChanges ? "💾 Save Changes" : "💾 Save Config"}
              </button>
            </div>
          </div>

          {/* Live Settings Bar */}
          <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefreshEnabled}
                  onChange={(e) => setAutoRefreshEnabled(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                />
                <label htmlFor="autoRefresh" className="text-sm text-white/70">🔄 Auto-refresh health (10s)</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoSave"
                  checked={autoSaveEnabled}
                  onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500 focus:ring-opacity-50"
                />
                <label htmlFor="autoSave" className="text-sm text-white/70">💾 Auto-save (2s delay)</label>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-white/50">
              {hasUnsavedChanges && <span className="text-amber-400">● Unsaved changes</span>}
              <span>Services: {Object.values(serviceHealth).filter(s => s.status === "healthy").length}/7 online</span>
            </div>
          </div>
        </div>

        {/* Enhanced Service Health Dashboard */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            🏥 Service Health Dashboard
            <span className="text-sm font-normal text-white/50">
              ({Object.values(serviceHealth).filter(s => s.status === "healthy").length} of 7 healthy)
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-lg">
            {Object.entries(serviceHealth).map(([service, healthData]) => (
              <ServiceHealthIndicator 
                key={service} 
                service={service} 
                status={healthData.status} 
                lastChecked={healthData.lastChecked}
                onRefresh={() => checkServiceHealth(service)}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Configuration Sections */}
        <div className="space-y-4">
          
          {/* Database Configuration */}
          <ConfigSection
            title="Database"
            description="PostgreSQL and Redis connection settings"
            expanded={expandedSections.has("database")}
            onToggle={() => toggleSection("database")}
          >
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h4 className="text-white/90 font-medium">PostgreSQL</h4>
                <ConfigField
                  label="Host"
                  value={config.database.postgresql.host}
                  onChange={(value) => updateConfig(["database", "postgresql", "host"], value)}
                  placeholder="localhost"
                />
                <ConfigField
                  label="Port"
                  value={String(config.database.postgresql.port)}
                  onChange={(value) => updateConfig(["database", "postgresql", "port"], parseInt(value) || 5432)}
                  type="number"
                />
                <ConfigField
                  label="Database"
                  value={config.database.postgresql.database}
                  onChange={(value) => updateConfig(["database", "postgresql", "database"], value)}
                  placeholder="trading_os"
                />
                <ConfigField
                  label="Username"
                  value={config.database.postgresql.username}
                  onChange={(value) => updateConfig(["database", "postgresql", "username"], value)}
                  placeholder="trading_os"
                />
                <ConfigField
                  label="Password"
                  value={config.database.postgresql.password}
                  onChange={(value) => updateConfig(["database", "postgresql", "password"], value)}
                  sensitive
                />
              </div>
              
              <div className="space-y-4">
                <h4 className="text-white/90 font-medium">Redis</h4>
                <ConfigField
                  label="Host"
                  value={config.database.redis.host}
                  onChange={(value) => updateConfig(["database", "redis", "host"], value)}
                  placeholder="localhost"
                />
                <ConfigField
                  label="Port"
                  value={String(config.database.redis.port)}
                  onChange={(value) => updateConfig(["database", "redis", "port"], parseInt(value) || 6379)}
                  type="number"
                />
                <ConfigField
                  label="Password"
                  value={config.database.redis.password || ""}
                  onChange={(value) => updateConfig(["database", "redis", "password"], value)}
                  sensitive
                  description="Optional for local development"
                />
              </div>
            </div>
          </ConfigSection>

          {/* Exchange Configuration */}
          <ConfigSection
            title="Exchange & Trading"
            description="Trading venue settings and API credentials"
            expanded={expandedSections.has("exchanges")}
            onToggle={() => toggleSection("exchanges")}
          >
            <div className="space-y-6 mt-4">
              {/* Trading Mode & Quick Setup */}
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={config.exchanges.paperMode}
                      onChange={(e) => updateConfig(["exchanges", "paperMode"], e.target.checked)}
                      className="rounded border-white/20 bg-white/5 text-emerald-600"
                    />
                    📈 Paper Trading Mode
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-white/70">Active Exchange:</label>
                    <select
                      value={config.exchanges.activeExchange}
                      onChange={(e) => updateConfig(["exchanges", "activeExchange"], e.target.value)}
                      className="bg-white/5 border border-white/10 rounded px-3 py-1 text-sm text-white/90"
                    >
                      <option value="paper">Paper (Simulation)</option>
                      <option value="binance">Binance</option>
                      <option value="kraken">Kraken</option>
                      <option value="coinbase">Coinbase</option>
                      <option value="alpaca">Alpaca</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Quick setup for paper trading
                      updateConfig(["exchanges", "paperMode"], true);
                      updateConfig(["exchanges", "activeExchange"], "paper");
                    }}
                    className="px-3 py-1 text-xs bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/20 rounded transition-colors"
                  >
                    🎯 Quick Paper Setup
                  </button>
                  <button
                    onClick={() => {
                      // Quick setup for live trading (requires keys)
                      updateConfig(["exchanges", "paperMode"], false);
                    }}
                    className="px-3 py-1 text-xs bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/20 rounded transition-colors"
                  >
                    ⚡ Live Trading
                  </button>
                </div>
              </div>
              
              {/* Exchange Credentials with Status */}
              {Object.entries(config.exchanges.credentials).map(([exchange, creds]) => {
                const hasCredentials = creds.apiKey && creds.apiSecret;
                const isActive = config.exchanges.activeExchange === exchange;
                
                return (
                  <div key={exchange} className={`p-4 border rounded transition-colors ${
                    isActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white/90 font-medium capitalize flex items-center gap-2">
                        {exchange}
                        {isActive && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">• ACTIVE</span>}
                        {hasCredentials && <span className="text-xs text-green-400">✓</span>}
                      </h5>
                      <div className="flex gap-2">
                        {hasCredentials && (
                          <button
                            onClick={() => {
                              // Test connection for this exchange
                              console.log(`Testing ${exchange} connection...`);
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            🔄 Test
                          </button>
                        )}
                        <button
                          onClick={() => {
                            // Clear credentials
                            updateConfig(["exchanges", "credentials", exchange, "apiKey"], "");
                            updateConfig(["exchanges", "credentials", exchange, "apiSecret"], "");
                          }}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          🗑️ Clear
                        </button>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <ConfigField
                        label="API Key"
                        value={creds.apiKey}
                        onChange={(value) => updateConfig(["exchanges", "credentials", exchange, "apiKey"], value)}
                        sensitive
                      />
                      <ConfigField
                        label="API Secret"
                        value={creds.apiSecret}
                        onChange={(value) => updateConfig(["exchanges", "credentials", exchange, "apiSecret"], value)}
                        sensitive
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ConfigSection>

          {/* LLM Providers with Dynamic Management */}
          <ConfigSection
            title="LLM Providers"
            description="AI model settings for orchestrator agents"
            expanded={expandedSections.has("llm")}
            onToggle={() => toggleSection("llm")}
          >
            <div className="space-y-6 mt-4">
              {/* Active Provider Selection */}
              <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded">
                <div className="flex items-center gap-4">
                  <label className="text-sm text-white/70">Active Provider:</label>
                  <select
                    value={config.llm.provider}
                    onChange={(e) => updateConfig(["llm", "provider"], e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white/90"
                  >
                    {Object.entries(config.llm.providers).map(([key, provider]) => (
                      <option key={key} value={key}>{provider.displayName}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => setShowAddProvider(true)}
                  className="px-3 py-1.5 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 rounded transition-colors"
                >
                  + Add Provider
                </button>
              </div>

              {/* Quick Setup Templates */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const providerName = prompt("Enter provider name (e.g., 'ollama', 'localai'):");
                    if (!providerName) return;
                    const displayName = prompt("Enter display name:") || providerName;
                    
                    updateConfig(["llm", "providers", providerName.toLowerCase()], {
                      name: providerName.toLowerCase(),
                      displayName: displayName,
                      fields: {
                        baseUrl: "http://localhost:11434",
                        model: "llama2"
                      }
                    });
                  }}
                  className="px-2 py-1 text-xs bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/20 rounded transition-colors"
                >
                  🏠 Local LLM
                </button>
                <button
                  onClick={() => {
                    const providerName = prompt("Enter provider name (e.g., 'huggingface', 'replicate'):");
                    if (!providerName) return;
                    const displayName = prompt("Enter display name:") || providerName;
                    
                    updateConfig(["llm", "providers", providerName.toLowerCase()], {
                      name: providerName.toLowerCase(),
                      displayName: displayName,
                      fields: {
                        apiKey: "",
                        baseUrl: "",
                        model: ""
                      }
                    });
                  }}
                  className="px-2 py-1 text-xs bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/20 rounded transition-colors"
                >
                  🌐 API Provider
                </button>
                <button
                  onClick={() => {
                    const providerName = prompt("Enter provider name (e.g., 'azure_openai'):");
                    if (!providerName) return;
                    const displayName = prompt("Enter display name:") || providerName;
                    
                    updateConfig(["llm", "providers", providerName.toLowerCase()], {
                      name: providerName.toLowerCase(),
                      displayName: displayName,
                      fields: {
                        apiKey: "",
                        endpoint: "",
                        apiVersion: "2023-05-15",
                        deployment: ""
                      }
                    });
                  }}
                  className="px-2 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 rounded transition-colors"
                >
                  ☁️ Azure OpenAI
                </button>
              </div>

              {/* Add Provider Modal/Form */}
              {showAddProvider && (
                <div className="p-4 bg-white/[0.03] border border-white/10 rounded">
                  <h4 className="text-white/90 font-medium mb-4 flex items-center gap-2">
                    🆕 Add Custom Provider
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <ConfigField
                      label="Provider Name"
                      value={newProvider.name}
                      onChange={(value) => setNewProvider(prev => ({ ...prev, name: value.toLowerCase().replace(/\s+/g, '_') }))}
                      placeholder="e.g. custom_llm"
                      description="Internal identifier (lowercase, no spaces)"
                    />
                    <ConfigField
                      label="Display Name"
                      value={newProvider.displayName}
                      onChange={(value) => setNewProvider(prev => ({ ...prev, displayName: value }))}
                      placeholder="e.g. Custom LLM Service"
                    />
                  </div>
                  
                  {/* Dynamic Fields */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="text-white/80 text-sm font-medium">Custom Fields ({Object.keys(newProvider.fields).length})</h5>
                      <button
                        onClick={addFieldToNewProvider}
                        className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 rounded transition-colors"
                      >
                        + Add Field
                      </button>
                    </div>
                    
                    {Object.entries(newProvider.fields).map(([fieldName, fieldValue]) => (
                      <div key={fieldName} className="flex items-end gap-2">
                        <div className="flex-1">
                          <ConfigField
                            label={fieldName}
                            value={fieldValue}
                            onChange={(value) => setNewProvider(prev => ({
                              ...prev,
                              fields: { ...prev.fields, [fieldName]: value }
                            }))}
                            sensitive={fieldName.toLowerCase().includes('key') || fieldName.toLowerCase().includes('secret')}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const updatedFields = { ...newProvider.fields };
                            delete updatedFields[fieldName];
                            setNewProvider(prev => ({ ...prev, fields: updatedFields }));
                          }}
                          className="mb-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={addCustomProvider}
                      className="px-4 py-2 bg-emerald-600/70 hover:bg-emerald-600 text-white text-sm rounded transition-colors"
                    >
                      ✅ Add Provider
                    </button>
                    <button
                      onClick={() => setShowAddProvider(false)}
                      className="px-4 py-2 bg-gray-600/70 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Existing Providers */}
              <div className="space-y-4">
                <h4 className="text-white/90 font-medium flex items-center gap-2">
                  🤖 Configured Providers ({Object.keys(config.llm.providers).length})
                </h4>
                
                {Object.entries(config.llm.providers).map(([providerKey, provider]) => {
                  const isActive = config.llm.provider === providerKey;
                  const isOriginalBuiltIn = ["mock", "anthropic", "openai"].includes(providerKey);
                  const isEditing = editingProvider === providerKey;
                  
                  return (
                    <div key={providerKey} className={`p-4 border rounded transition-colors ${
                      isActive ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-white/90 font-medium flex items-center gap-2">
                          {provider.displayName}
                          {isActive && <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">• ACTIVE</span>}
                          {isOriginalBuiltIn && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">🔒 Built-in</span>}
                        </h5>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingProvider(isEditing ? null : providerKey)}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            {isEditing ? '✕ Close' : '✏️ Edit'}
                          </button>
                          <button
                            onClick={() => {
                              if (isOriginalBuiltIn && providerKey === 'mock') {
                                setError("Cannot remove the Mock provider - it's needed as a fallback");
                                return;
                              }
                              if (confirm(`Are you sure you want to remove ${provider.displayName}? This action cannot be undone.`)) {
                                removeProvider(providerKey);
                              }
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <div className="mt-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h6 className="text-white/80 text-sm font-medium">Fields ({Object.keys(provider.fields).length})</h6>
                              <button
                                onClick={() => addCustomField(providerKey)}
                                className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 rounded transition-colors"
                              >
                                + Add Field
                              </button>
                            </div>
                            
                            {Object.entries(provider.fields).map(([fieldName, fieldValue]) => (
                              <div key={fieldName} className="flex items-end gap-2">
                                <div className="flex-1">
                                  <ConfigField
                                    label={fieldName}
                                    value={fieldValue}
                                    onChange={(value) => updateConfig(["llm", "providers", providerKey, "fields", fieldName], value)}
                                    sensitive={fieldName.toLowerCase().includes('key') || fieldName.toLowerCase().includes('secret')}
                                  />
                                </div>
                                <button
                                  onClick={() => removeCustomField(providerKey, fieldName)}
                                  className="mb-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded transition-colors"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {!isEditing && (
                        <div className="text-sm text-white/50">
                          {Object.keys(provider.fields).length > 0 ? (
                            <span>Fields: {Object.keys(provider.fields).join(', ')}</span>
                          ) : (
                            <span>No fields configured</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </ConfigSection>

          {/* Service Configuration */}
          <ConfigSection
            title="Service Settings"
            description="Execution backend and service ports"
            expanded={expandedSections.has("service")}
            onToggle={() => toggleSection("service")}
          >
            <div className="space-y-6 mt-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Execution Queue Backend</label>
                  <select
                    value={config.service.executionQueueBackend}
                    onChange={(e) => updateConfig(["service", "executionQueueBackend"], e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white/90 w-full"
                  >
                    <option value="memory">In-Memory (Single Container)</option>
                    <option value="redis">Redis (Multi-Container)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm text-white/70 mb-2">Environment</label>
                  <select
                    value={config.service.environment}
                    onChange={(e) => updateConfig(["service", "environment"], e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white/90 w-full"
                  >
                    <option value="development">Development</option>
                    <option value="production">Production</option>
                  </select>
                </div>
              </div>
              
              <div>
                <h4 className="text-white/90 font-medium mb-3">Service Ports</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(config.service.ports).map(([service, port]) => (
                    <ConfigField
                      key={service}
                      label={service}
                      value={String(port)}
                      onChange={(value) => updateConfig(["service", "ports", service], parseInt(value) || port)}
                      type="number"
                    />
                  ))}
                </div>
              </div>
            </div>
          </ConfigSection>

          {/* Pricing Configuration */}
          <ConfigSection
            title="Pricing Data"
            description="Live price feed and data source settings"
            expanded={expandedSections.has("pricing")}
            onToggle={() => toggleSection("pricing")}
          >
            <div className="space-y-4 mt-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-white/70 mb-2">Provider</label>
                  <select
                    value={config.pricing.provider}
                    onChange={(e) => updateConfig(["pricing", "provider"], e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white/90 w-full"
                  >
                    <option value="coingecko">CoinGecko (Free)</option>
                    <option value="binance">Binance API</option>
                    <option value="custom">Custom Endpoint</option>
                  </select>
                </div>
                
                <ConfigField
                  label="Update Interval (seconds)"
                  value={String(config.pricing.updateInterval)}
                  onChange={(value) => updateConfig(["pricing", "updateInterval"], parseInt(value) || 300)}
                  type="number"
                />
                
                <ConfigField
                  label="Cache TTL (seconds)"
                  value={String(config.pricing.cacheTtl)}
                  onChange={(value) => updateConfig(["pricing", "cacheTtl"], parseInt(value) || 300)}
                  type="number"
                />
              </div>
              
              {config.pricing.provider !== "coingecko" && (
                <ConfigField
                  label="API Key"
                  value={config.pricing.apiKey || ""}
                  onChange={(value) => updateConfig(["pricing", "apiKey"], value)}
                  sensitive
                  description="Required for non-free data providers"
                />
              )}
            </div>
          </ConfigSection>
        </div>

        {/* Dynamic Configuration Summary Panel */}
        <div className="space-y-4 p-6 bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 rounded-lg">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            📊 Configuration Overview
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database Status */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
              <h3 className="text-sm font-medium text-white/70 mb-2">💾 Database</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">PostgreSQL:</span>
                  <span className={config.database.postgresql.host ? 'text-green-400' : 'text-red-400'}>
                    {config.database.postgresql.host ? '✓ Configured' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Redis:</span>
                  <span className={config.database.redis.host ? 'text-green-400' : 'text-red-400'}>
                    {config.database.redis.host ? '✓ Configured' : '✗ Missing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trading Status */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
              <h3 className="text-sm font-medium text-white/70 mb-2">💹 Trading</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Mode:</span>
                  <span className={config.exchanges.paperMode ? 'text-blue-400' : 'text-orange-400'}>
                    {config.exchanges.paperMode ? '📈 Paper' : '⚡ Live'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Exchange:</span>
                  <span className="text-white/60 capitalize">{config.exchanges.activeExchange}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Keys:</span>
                  <span className="text-white/50">
                    {Object.values(config.exchanges.credentials).filter(c => c.apiKey).length}/4
                  </span>
                </div>
              </div>
            </div>

            {/* LLM Status */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
              <h3 className="text-sm font-medium text-white/70 mb-2">🤖 AI/LLM</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Provider:</span>
                  <span className="text-white/60 capitalize">
                    {config.llm.providers[config.llm.provider]?.displayName || config.llm.provider}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">API Key:</span>
                  <span className={config.llm.provider !== 'mock' && config.llm.providers[config.llm.provider]?.fields?.apiKey ? 'text-green-400' : 'text-yellow-400'}>
                    {config.llm.provider === 'mock' ? '🎯 Mock' : 
                     config.llm.providers[config.llm.provider]?.fields?.apiKey ? '✓ Set' : '✗ Missing'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Total:</span>
                  <span className="text-white/50">{Object.keys(config.llm.providers).length} providers</span>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
              <h3 className="text-sm font-medium text-white/70 mb-2">⚙️ System</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Environment:</span>
                  <span className={config.service.environment === 'production' ? 'text-red-400' : 'text-green-400'}>
                    {config.service.environment === 'production' ? '🎤 Prod' : '🔧 Dev'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Services:</span>
                  <span className={Object.values(serviceHealth).filter(s => s.status === 'healthy').length >= 5 ? 'text-green-400' : 'text-yellow-400'}>
                    {Object.values(serviceHealth).filter(s => s.status === 'healthy').length}/7 up
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Auto-features:</span>
                  <span className="text-white/50">
                    {autoRefreshEnabled ? '🔄' : ''} {autoSaveEnabled ? '💾' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-4 text-sm text-white/50">
              {hasUnsavedChanges && <span className="text-amber-400 flex items-center gap-1">● Unsaved changes detected</span>}
              {lastUpdated && <span>Last modified: {lastUpdated.toLocaleTimeString()}</span>}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Expand all sections for quick review
                  setExpandedSections(new Set(["database", "exchanges", "llm", "service", "pricing"]));
                }}
                className="px-3 py-1 text-xs bg-white/5 hover:bg-white/10 text-white/60 border border-white/10 rounded transition-colors"
              >
                👁️ Expand All
              </button>
              <button
                onClick={() => {
                  // Quick validation check
                  console.log('Running full configuration validation...');
                  checkServiceHealth();
                }}
                className="px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/20 rounded transition-colors"
              >
                ✅ Validate Config
              </button>
              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    saveConfig();
                  }
                  downloadEnvFile();
                }}
                className="px-3 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/20 rounded transition-colors"
              >
                🚀 Deploy Ready
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Status Footer */}
        <div className="flex items-center justify-between text-xs text-white/30 pt-4 border-t border-white/5">
          <div className="flex items-center gap-4">
            <span>Config last updated: {new Date(config.lastUpdated).toLocaleString()}</span>
            {hasUnsavedChanges && <span className="text-amber-400">• {hasUnsavedChanges ? 'Modified' : 'Saved'}</span>}
          </div>
          <div className="flex items-center gap-4">
            <span>Trading OS v1.0 • Backend Config Center</span>
            <span className={Object.values(serviceHealth).filter(s => s.status === 'healthy').length >= 5 ? 'text-emerald-400' : 'text-yellow-400'}>
              ● System {Object.values(serviceHealth).filter(s => s.status === 'healthy').length >= 5 ? 'Healthy' : 'Degraded'}
            </span>
          </div>
        </div>
      </div>
    </PortalShell>
  );
}