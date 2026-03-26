"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Database, RefreshCw, Download, Clock, Activity, Trash2, Plus, Layers, TrendingUp } from "lucide-react";
import { Toaster, toast } from "sonner";
import DatabaseBrowser from "@/components/portal/DatabaseBrowser";

interface TrackedSymbol {
  symbol: string;
  source: string;
  interval: string;
  last_updated?: string;
  candle_count?: number;
}

interface ActiveTracking {
  symbol: string;
  source: string;
  poll_interval_seconds: number;
  added_at: string;
}

interface DataSource {
  id: number;
  name: string;
  display_name: string;
  provider_type: string; // "crypto" | "stock" | "mixed"
  is_active: boolean;
  enabled_pairs: string[];
  status: string;
}

interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ 
  title, 
  icon, 
  defaultOpen = false,
  badge,
  children 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-purple-400">{icon}</span>
          <span className="font-semibold">{title}</span>
          {badge && (
            <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-white/40" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white/40" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-white/5 p-4">
          {children}
        </div>
      )}
    </div>
  );
};

interface DataIngestionControlsProps {
  servicePort: number;
}

export const DataIngestionControls: React.FC<DataIngestionControlsProps> = ({ servicePort }) => {
  const baseUrl = `http://localhost:${servicePort}`;
  
  // Data sources from backend
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [availableSymbols, setAvailableSymbols] = useState<Record<string, string[]>>({});
  const [loadingSources, setLoadingSources] = useState(true);
  
  // State
  const [trackedSymbols, setTrackedSymbols] = useState<TrackedSymbol[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Load data form
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [selectedSymbol, setSelectedSymbol] = useState<string>("");
  const [selectedInterval, setSelectedInterval] = useState<string>("1d");
  const [loadDays, setLoadDays] = useState<number>(30);
  const [loadingData, setLoadingData] = useState(false);
  
  // Tracking configuration
  const [pollInterval, setPollInterval] = useState<number>(300); // 5 minutes default
  const [activelyTracked, setActivelyTracked] = useState<ActiveTracking[]>([]);
  
  // Stats
  const [stats, setStats] = useState<{
    total_candles: number;
    symbols_tracked: number;
    last_ingestion: string | null;
  } | null>(null);

  // Fetch all data sources from backend
  const fetchDataSources = useCallback(async () => {
    setLoadingSources(true);
    try {
      const res = await fetch(`${baseUrl}/sources`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const sources: DataSource[] = await res.json();
      setDataSources(sources.filter(s => s.is_active));
      
      // Set default source
      if (sources.length > 0 && !selectedSource) {
        const defaultSource = sources.find(s => s.name === "coingecko") || 
                              sources.find(s => s.name === "yahoo_finance") || 
                              sources[0];
        setSelectedSource(defaultSource.name);
      }
    } catch (err) {
      console.error("Failed to fetch data sources:", err);
    } finally {
      setLoadingSources(false);
    }
  }, [baseUrl, selectedSource]);

  // Fetch available symbols for a source
  const fetchSymbolsForSource = useCallback(async (sourceName: string) => {
    if (availableSymbols[sourceName]) return; // Already cached
    
    try {
      const res = await fetch(`${baseUrl}/sources/${sourceName}/symbols`);
      if (!res.ok) return;
      const data = await res.json();
      setAvailableSymbols(prev => ({
        ...prev,
        [sourceName]: data.symbols || []
      }));
      
      // Set default symbol
      if (data.symbols && data.symbols.length > 0 && !selectedSymbol) {
        setSelectedSymbol(data.symbols[0]);
      }
    } catch (err) {
      console.error(`Failed to fetch symbols for ${sourceName}:`, err);
    }
  }, [baseUrl, availableSymbols, selectedSymbol]);

  const fetchTrackedSymbols = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/data/tracked-symbols`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setTrackedSymbols(data.symbols || []);
    } catch {
      // May not exist yet
      setTrackedSymbols([]);
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/data/stats`);
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
      // Stats endpoint may not exist
    }
  }, [baseUrl]);

  // Initial load
  useEffect(() => {
    fetchDataSources();
    fetchTrackedSymbols();
    fetchStats();
  }, [fetchDataSources, fetchTrackedSymbols, fetchStats]);

  // Fetch symbols when source changes
  useEffect(() => {
    if (selectedSource) {
      fetchSymbolsForSource(selectedSource);
    }
  }, [selectedSource, fetchSymbolsForSource]);

  // Reset selected symbol when source changes
  useEffect(() => {
    const symbols = availableSymbols[selectedSource];
    if (symbols && symbols.length > 0) {
      setSelectedSymbol(symbols[0]);
    } else {
      setSelectedSymbol("");
    }
  }, [selectedSource, availableSymbols]);

  const handleFetchCandles = async () => {
    if (!selectedSource || !selectedSymbol) return;
    
    setLoadingData(true);
    
    try {
      const res = await fetch(`${baseUrl}/fetch/candles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selectedSource,
          symbol: selectedSymbol,
          timeframe: selectedInterval,
          limit: loadDays * (selectedInterval === "1d" ? 1 : selectedInterval === "1h" ? 24 : 60)
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const candleCount = data.count || data.candles?.length || 0;
      toast.success(`Loaded ${candleCount} candles`, {
        description: `${selectedSymbol} • ${selectedInterval} • from ${currentSource?.display_name || selectedSource}`,
        duration: 4000
      });
      fetchTrackedSymbols();
      fetchStats();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load data", {
        duration: 4000
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleFetchPrices = async () => {
    if (!selectedSource || !selectedSymbol) return;
    
    setLoadingData(true);
    
    try {
      const res = await fetch(`${baseUrl}/fetch/prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: selectedSource,
          symbols: [selectedSymbol]
        })
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const price = data.prices?.[0];
      if (price && !price.error) {
        const priceUSD = price.price_usd?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const change24h = price.change_24h_pct?.toFixed(2);
        const marketCap = price.market_cap ? `$${(price.market_cap / 1e9).toFixed(2)}B` : null;
        
        let message = `${selectedSymbol} • $${priceUSD}`;
        if (change24h) message += ` • 24h: ${change24h > 0 ? '+' : ''}${change24h}%`;
        if (marketCap) message += ` • ${marketCap}`;
        
        toast.success(message, {
          description: `From ${currentSource?.display_name || selectedSource}`,
          duration: 5000
        });
      } else {
        toast.success(`Fetched price data for ${selectedSymbol}`, {
          duration: 3000
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to fetch prices", {
        duration: 4000
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleRemoveSymbol = async (symbol: string, source: string) => {
    try {
      const res = await fetch(`${baseUrl}/data/untrack-symbol`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, source })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      toast.success(`Removed ${symbol} from tracking`, { duration: 3000 });
      fetchTrackedSymbols();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove symbol", {
        duration: 4000
      });
    }
  };

  const handleTestSource = async (sourceName: string) => {
    try {
      const res = await fetch(`${baseUrl}/test-source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: sourceName })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.ok) {
        toast.success(`${sourceName}`, {
          description: `${data.message} (${data.response_time_ms || 0}ms)`,
          duration: 4000
        });
      } else {
        toast.error(`${sourceName}`, {
          description: data.message || "Connection failed",
          duration: 4000
        });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to test ${sourceName}`, {
        duration: 4000
      });
    }
  };

  // Add symbol to continuous tracking
  const handleAddToTracking = async () => {
    if (!selectedSource || !selectedSymbol) return;
    
    try {
      const res = await fetch(`${baseUrl}/symbols/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          source: selectedSource,
          symbols: [selectedSymbol]
        })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      // Add to active tracking
      const newTracking: ActiveTracking = {
        symbol: selectedSymbol,
        source: selectedSource,
        poll_interval_seconds: pollInterval,
        added_at: new Date().toISOString()
      };
      
      setActivelyTracked([...activelyTracked, newTracking]);
      
      toast.success(`📡 Started tracking ${selectedSymbol}`, {
        description: `Will poll every ${pollInterval}s for updates`,
        duration: 3000
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add tracking", {
        duration: 4000
      });
    }
  };

  // Remove from continuous tracking
  const handleRemoveTracking = (symbol: string, source: string) => {
    setActivelyTracked(activelyTracked.filter(
      t => !(t.symbol === symbol && t.source === source)
    ));
    toast.info(`Stopped tracking ${symbol}`, { duration: 2000 });
  };

  const currentSource = dataSources.find(s => s.name === selectedSource);
  const currentSymbols = availableSymbols[selectedSource] || [];
  const isStock = currentSource?.provider_type === "stock";
  const isCrypto = currentSource?.provider_type === "crypto";
  const isMixed = currentSource?.provider_type === "mixed";

  return (
    <div className="space-y-4">
      <Toaster position="top-right" richColors />

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/40 mb-1">Total Candles</div>
            <div className="text-2xl font-bold text-purple-400">{stats.total_candles.toLocaleString()}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/40 mb-1">Symbols Tracked</div>
            <div className="text-2xl font-bold text-purple-400">{stats.symbols_tracked}</div>
          </div>
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
            <div className="text-sm text-white/40 mb-1">Last Ingestion</div>
            <div className="text-sm font-mono text-white/60">
              {stats.last_ingestion ? new Date(stats.last_ingestion).toLocaleString() : "Never"}
            </div>
          </div>
        </div>
      )}

      {/* Data Sources */}
      <CollapsibleSection 
        title="Available Data Sources" 
        icon={<Layers className="w-5 h-5" />}
        badge={`${dataSources.length} sources`}
        defaultOpen={true}
      >
        {loadingSources ? (
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {dataSources.map((source) => (
              <div
                key={source.id}
                onClick={() => setSelectedSource(source.name)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedSource === source.name 
                    ? "bg-purple-500/20 border border-purple-500/30" 
                    : "bg-white/[0.03] border border-white/5 hover:bg-white/[0.05]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${source.status === "active" ? "bg-emerald-400" : "bg-yellow-400"}`} />
                  <div>
                    <div className="font-medium">{source.display_name}</div>
                    <div className="text-xs text-white/40">
                      {source.provider_type === "crypto" && "🪙 Crypto"}
                      {source.provider_type === "stock" && "📈 Stocks"}
                      {source.provider_type === "mixed" && "📊 Crypto + Stocks"}
                      {" • "}{(availableSymbols[source.name] || source.enabled_pairs || []).length} symbols
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTestSource(source.name);
                  }}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs text-white/60 hover:text-white transition-colors"
                >
                  Test
                </button>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Fetch Data */}
      <CollapsibleSection 
        title="Fetch Market Data" 
        icon={<Download className="w-5 h-5" />}
        defaultOpen={true}
      >
        <div className="space-y-4">
          {/* Source Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Data Source (API)</label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select a data source...</option>
              {dataSources.map((source) => (
                <option key={source.id} value={source.name}>
                  {source.display_name} ({source.provider_type})
                </option>
              ))}
            </select>
          </div>

          {/* Symbol Selection */}
          <div>
            <label className="block text-sm text-white/60 mb-2">
              {isStock ? "Stock / ETF" : isCrypto ? "Cryptocurrency" : "Symbol"}
              {currentSymbols.length > 0 && (
                <span className="text-white/30 ml-2">({currentSymbols.length} available)</span>
              )}
            </label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              disabled={!selectedSource || currentSymbols.length === 0}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
            >
              <option value="">
                {!selectedSource 
                  ? "Select a source first..." 
                  : currentSymbols.length === 0 
                    ? "Loading symbols..." 
                    : "Select a symbol..."}
              </option>
              {currentSymbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Interval & Days */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Interval</label>
              <select
                value={selectedInterval}
                onChange={(e) => setSelectedInterval(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-2">Days of History</label>
              <input
                type="number"
                value={loadDays}
                onChange={(e) => setLoadDays(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Polling Interval - only show if symbol selected */}
          {selectedSymbol && (
            <div>
              <label className="block text-sm text-white/60 mb-2">Polling Interval (for continuous tracking)</label>
              <select
                value={pollInterval}
                onChange={(e) => setPollInterval(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
              >
                <option value={60}>Every minute</option>
                <option value={300}>Every 5 minutes</option>
                <option value={600}>Every 10 minutes</option>
                <option value={1800}>Every 30 minutes</option>
                <option value={3600}>Every hour</option>
              </select>
              <p className="text-xs text-white/30 mt-2">Set how often to automatically fetch updates after adding to tracking</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={handleFetchPrices}
              disabled={loadingData || !selectedSource || !selectedSymbol}
              className="px-4 py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              Price
            </button>
            <button
              onClick={handleFetchCandles}
              disabled={loadingData || !selectedSource || !selectedSymbol}
              className="px-4 py-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {loadingData ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Loading</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Candles</span>
                </>
              )}
            </button>
            <button
              onClick={handleAddToTracking}
              disabled={!selectedSource || !selectedSymbol}
              className="px-4 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Track</span>
            </button>
          </div>
          <p className="text-xs text-white/40 mt-2">
            <strong>Fetch:</strong> One-time historical data load • <strong>Track:</strong> Register for continuous polling
          </p>
        </div>
      </CollapsibleSection>

      {/* Actively Tracked Symbols */}
      <CollapsibleSection 
        title="🔴 Actively Tracked" 
        icon={<Layers className="w-5 h-5" />}
        badge={activelyTracked.length > 0 ? `${activelyTracked.length}` : undefined}
      >
        <div className="space-y-4">
          {activelyTracked.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <p>No symbols being continuously tracked.</p>
              <p className="text-sm mt-2">Select a symbol above and click &quot;Track&quot; to start automatic polling.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activelyTracked.map((tracked, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-cyan-500/[0.05] border border-cyan-500/20 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <div>
                      <div className="font-mono font-medium">{tracked.symbol}</div>
                      <div className="text-xs text-white/40">
                        {tracked.source} • Polling every {tracked.poll_interval_seconds}s
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveTracking(tracked.symbol, tracked.source)}
                    className="p-2 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Historical Data Loaded */}
      <CollapsibleSection 
        title="📊 Historical Data Loaded" 
        icon={<Database className="w-5 h-5" />}
        badge={trackedSymbols.length > 0 ? `${trackedSymbols.length}` : undefined}
      >
        <div className="space-y-4">
          {loading ? (
            <div className="animate-pulse space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-white/5 rounded-lg" />
              ))}
            </div>
          ) : trackedSymbols.length === 0 ? (
            <div className="text-center py-8 text-white/40">
              <p>No historical data loaded yet.</p>
              <p className="text-sm mt-2">Fetch candles above to load historical data into the database.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trackedSymbols.map((sym, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3"
                >
                  <div className="flex items-center gap-4">
                    <Database className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="font-mono font-medium">{sym.symbol}</div>
                      <div className="text-xs text-white/40">
                        {sym.source} • {sym.interval}
                        {sym.candle_count && ` • ${sym.candle_count.toLocaleString()} candles`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sym.last_updated && (
                      <span className="text-xs text-white/30">
                        {new Date(sym.last_updated).toLocaleDateString()}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveSymbol(sym.symbol, sym.source)}
                      className="p-2 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Manual Ingestion Trigger */}
      <CollapsibleSection 
        title="Ingestion Control" 
        icon={<Clock className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <p className="text-sm text-white/60">
            Test all configured data sources to verify connectivity and API availability.
          </p>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`${baseUrl}/test-all-free`, { method: "POST" });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                toast.success(`Tested ${data.passed}/${data.tested} sources`, {
                  description: `${data.tested} sources tested successfully`,
                  duration: 4000
                });
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Test failed", {
                  duration: 4000
                });
              }
            }}
            className="w-full px-4 py-3 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Test All Data Sources
          </button>
        </div>
      </CollapsibleSection>

      {/* Database Browser */}
      <CollapsibleSection 
        title="🗄️ Database Viewer" 
        icon={<Database className="w-5 h-5" />}
        badge="Live"
      >
        <div className="mb-4">
          <p className="text-sm text-white/60 mb-4">
            View raw market candles and price snapshots stored in PostgreSQL. Browse, search, and filter historical data.
          </p>
        </div>
        <DatabaseBrowser baseUrl={baseUrl} />
      </CollapsibleSection>
    </div>
  );
};

export default DataIngestionControls;
