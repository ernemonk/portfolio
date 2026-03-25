"use client";

import React, { useState, useEffect } from "react";

interface Credential {
  id: number;
  provider_name: string;
  credential_key: string;
  credential_type: string;
  label: string | null;
  is_active: boolean;
  created_at: string;
}

interface VaultStatus {
  total_credentials: number;
  active_credentials: number;
  encryption?: string;
  vault_key_set?: boolean;
  providers?: string[];
}

export default function CredentialManager() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [vaultStatus, setVaultStatus] = useState<VaultStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newCred, setNewCred] = useState({
    provider_name: "",
    credential_key: "api_key",
    value: "",
    credential_type: "api_key",
    label: "",
  });

  useEffect(() => {
    loadCredentials();
    loadVaultStatus();
  }, []);

  const loadCredentials = async () => {
    try {
      const res = await fetch("http://localhost:3007/credentials");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCredentials(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load credentials");
    } finally {
      setLoading(false);
    }
  };

  const loadVaultStatus = async () => {
    try {
      const res = await fetch("http://localhost:3007/vault/status");
      if (res.ok) {
        const data = await res.json();
        setVaultStatus(data);
      }
    } catch (err) {
      console.error("Failed to load vault status:", err);
    }
  };

  const handleAddCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("http://localhost:3007/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCred),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }

      setSuccess(`Credential stored successfully for ${newCred.provider_name}`);
      setNewCred({
        provider_name: "",
        credential_key: "api_key",
        value: "",
        credential_type: "api_key",
        label: "",
      });
      setShowAddForm(false);
      loadCredentials();
      loadVaultStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add credential");
    }
  };

  const handleDelete = async (id: number, provider: string) => {
    if (!confirm(`Delete credential for ${provider}?`)) return;

    try {
      const res = await fetch(`http://localhost:3007/credentials/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setSuccess("Credential deleted successfully");
      loadCredentials();
      loadVaultStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete credential");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">🔐 Encrypted Credential Vault</h2>
          <p className="text-white/60 mt-1">
            Central source of truth for all API keys and secrets
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Credential"}
        </button>
      </div>

      {/* Vault Status */}
      {vaultStatus && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Total Credentials</div>
            <div className="text-2xl font-bold">{vaultStatus.total_credentials}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Active</div>
            <div className="text-2xl font-bold text-emerald-400">
              {vaultStatus.active_credentials}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Providers</div>
            <div className="text-2xl font-bold">
              {Array.isArray(vaultStatus.providers) ? vaultStatus.providers.length : "-"}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/60 mb-1">Encryption</div>
            <div className="text-sm font-mono text-emerald-400">AES-256</div>
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-4 text-emerald-400 text-sm">
          {success}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Add New Credential</h3>
          <form onSubmit={handleAddCredential} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Provider Name *</label>
                <input
                  type="text"
                  required
                  value={newCred.provider_name}
                  onChange={(e) =>
                    setNewCred({ ...newCred, provider_name: e.target.value })
                  }
                  placeholder="e.g., binance, anthropic, aws"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Credential Key *</label>
                <input
                  type="text"
                  required
                  value={newCred.credential_key}
                  onChange={(e) =>
                    setNewCred({ ...newCred, credential_key: e.target.value })
                  }
                  placeholder="e.g., api_key, api_secret"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Value (Secret) *</label>
              <input
                type="password"
                required
                value={newCred.value}
                onChange={(e) => setNewCred({ ...newCred, value: e.target.value })}
                placeholder="Enter API key, secret, or password"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50"
              />
              <p className="text-xs text-white/40 mt-1">
                ⚠️ Will be encrypted with AES-256 before storage
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Type</label>
                <select
                  value={newCred.credential_type}
                  onChange={(e) =>
                    setNewCred({ ...newCred, credential_type: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-400/50"
                >
                  <option value="api_key">API Key</option>
                  <option value="api_secret">API Secret</option>
                  <option value="password">Password</option>
                  <option value="token">Token</option>
                  <option value="oauth">OAuth</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Label (Optional)</label>
                <input
                  type="text"
                  value={newCred.label}
                  onChange={(e) => setNewCred({ ...newCred, label: e.target.value })}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-purple-400/50"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Add Credential
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Credentials List */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-lg font-semibold">Stored Credentials</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-white/40">Loading credentials...</div>
        ) : credentials.length === 0 ? (
          <div className="p-8 text-center text-white/40">
            <p>No credentials stored yet.</p>
            <p className="text-sm mt-2">Click &quot;Add Credential&quot; to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {credentials.map((cred) => (
              <div key={cred.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-semibold">{cred.provider_name}</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-xs text-white/60">
                        {cred.credential_type}
                      </span>
                      {cred.is_active ? (
                        <span className="px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-red-400/10 text-red-400 rounded text-xs">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-white/60">
                      <div>
                        <span className="text-white/40">Key:</span>{" "}
                        <span className="font-mono">{cred.credential_key}</span>
                      </div>
                      {cred.label && (
                        <div>
                          <span className="text-white/40">Label:</span> {cred.label}
                        </div>
                      )}
                      <div>
                        <span className="text-white/40">Added:</span>{" "}
                        {new Date(cred.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(cred.id, cred.provider_name)}
                    className="px-3 py-1.5 bg-red-400/10 hover:bg-red-400/20 text-red-400 rounded text-sm transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
