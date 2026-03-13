"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface MarketSignal {
  asset: string;
  exchange: string;
  signal_type: string;
  strength: number;
  price: number;
  change_24h: number;
  volume_24h: number;
  rsi: number;
  macd_signal: string;
  momentum_score: number;
  volatility: number;
  ml_prediction?: string;
  confidence?: number;
}

interface ScannerFilters {
  signal_types: string[];
  min_strength: number;
  min_volume: number;
  exchanges: string[];
  asset_classes: string[];
}

export default function MarketScanner() {
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ScannerFilters>({
    signal_types: ["momentum", "mean_reversion", "breakout"],
    min_strength: 0.6,
    min_volume: 100000,
    exchanges: ["kraken", "coinbase", "binance"],
    asset_classes: ["crypto", "stocks"]
  });

  useEffect(() => {
    fetchMarketSignals();
  }, [filters]);

  const fetchMarketSignals = async () => {
    setLoading(true);
    try {
      // Get signals from Analytics service
      const response = await api.analytics.getMarketSignals(filters);
      setSignals(response.signals || []);
    } catch (error) {
      console.error("Failed to fetch market signals:", error);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (type: string, strength: number) => {
    if (strength >= 0.8) return "bg-emerald-500";
    if (strength >= 0.6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case "momentum": return "📈";
      case "mean_reversion": return "🔄";
      case "breakout": return "🚀";
      case "volume_surge": return "📊";
      default: return "⚡";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Market Scanner</h1>
            <p className="text-gray-400 mt-1">Real-time opportunity detection across 100+ markets</p>
          </div>
          <button 
            onClick={fetchMarketSignals}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium"
          >
            🔄 Refresh Signals
          </button>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Scanner Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Signal Types */}
            <div>
              <label className="block text-sm font-medium mb-2">Signal Types</label>
              <div className="space-y-2">
                {["momentum", "mean_reversion", "breakout", "volume_surge"].map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.signal_types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            signal_types: [...prev.signal_types, type]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            signal_types: prev.signal_types.filter(t => t !== type)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Minimum Strength */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Min Strength: {filters.min_strength}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={filters.min_strength}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  min_strength: parseFloat(e.target.value)
                }))}
                className="w-full"
              />
            </div>

            {/* Exchanges */}
            <div>
              <label className="block text-sm font-medium mb-2">Exchanges</label>
              <div className="space-y-2">
                {["kraken", "coinbase", "binance", "bitfinex"].map(exchange => (
                  <label key={exchange} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.exchanges.includes(exchange)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            exchanges: [...prev.exchanges, exchange]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            exchanges: prev.exchanges.filter(ex => ex !== exchange)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{exchange}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Asset Classes */}
            <div>
              <label className="block text-sm font-medium mb-2">Asset Classes</label>
              <div className="space-y-2">
                {["crypto", "stocks", "forex", "commodities"].map(asset_class => (
                  <label key={asset_class} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.asset_classes.includes(asset_class)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            asset_classes: [...prev.asset_classes, asset_class]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            asset_classes: prev.asset_classes.filter(ac => ac !== asset_class)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{asset_class}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Top Signals */}
        {loading ? (
          <Card className="p-12 text-center bg-gray-900/50 border-gray-800">
            <div className="animate-spin h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Scanning markets for opportunities...</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">🎯 Top Signals</h2>
            
            {signals.length === 0 ? (
              <Card className="p-8 text-center bg-gray-900/50 border-gray-800">
                <p className="text-gray-400">No signals found matching current filters</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filter criteria</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {signals.map((signal, index) => (
                  <Card key={`${signal.asset}-${index}`} className="p-6 bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-colors">
                    
                    {/* Signal Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold">{signal.asset}</h3>
                        <p className="text-sm text-gray-400">{signal.exchange}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${signal.price?.toFixed(2)}</div>
                        <div className={`text-sm ${signal.change_24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {signal.change_24h >= 0 ? "+" : ""}{signal.change_24h?.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    {/* Signal Type & Strength */}
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xl">{getSignalIcon(signal.signal_type)}</span>
                      <Badge 
                        className={`${getSignalColor(signal.signal_type, signal.strength)} text-white px-3 py-1`}
                      >
                        {signal.signal_type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="text-sm">
                        <span className="text-gray-400">Strength:</span>
                        <span className="font-bold ml-1">{(signal.strength * 100).toFixed(0)}%</span>
                      </div>
                    </div>

                    {/* Technical Indicators */}
                    <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                      <div>
                        <span className="text-gray-400">RSI:</span>
                        <span className={`ml-1 font-medium ${
                          signal.rsi > 70 ? "text-red-400" : 
                          signal.rsi < 30 ? "text-emerald-400" : "text-yellow-400"
                        }`}>
                          {signal.rsi?.toFixed(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">MACD:</span>
                        <span className={`ml-1 font-medium ${
                          signal.macd_signal === "BUY" ? "text-emerald-400" : 
                          signal.macd_signal === "SELL" ? "text-red-400" : "text-yellow-400"
                        }`}>
                          {signal.macd_signal}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Momentum:</span>
                        <span className="ml-1 font-medium">{(signal.momentum_score * 100).toFixed(0)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Vol:</span>
                        <span className="ml-1 font-medium">{(signal.volatility * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="mb-4">
                      <span className="text-gray-400 text-sm">24h Volume:</span>
                      <span className="ml-1 font-medium">
                        ${(signal.volume_24h / 1000000).toFixed(1)}M
                      </span>
                    </div>

                    {/* ML Prediction */}
                    {signal.ml_prediction && (
                      <div className="border-t border-gray-700 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">AI Prediction:</span>
                          <div className="text-right">
                            <div className={`font-medium ${
                              signal.ml_prediction === "BUY" ? "text-emerald-400" : 
                              signal.ml_prediction === "SELL" ? "text-red-400" : "text-yellow-400"
                            }`}>
                              {signal.ml_prediction}
                            </div>
                            {signal.confidence && (
                              <div className="text-xs text-gray-400">
                                {(signal.confidence * 100).toFixed(0)}% confidence
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4 pt-3 border-t border-gray-700">
                      <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium text-sm transition-colors">
                        📊 Analyze in Strategy Lab
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Summary Statistics */}
        <Card className="p-6 bg-gray-900/50 border-gray-800">
          <h3 className="text-lg font-semibold mb-4">📈 Market Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{signals.length}</div>
              <div className="text-sm text-gray-400">Active Signals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {signals.filter(s => s.strength >= 0.8).length}
              </div>
              <div className="text-sm text-gray-400">High Conviction</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {signals.filter(s => s.signal_type === "momentum").length}
              </div>
              <div className="text-sm text-gray-400">Momentum Plays</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {signals.filter(s => s.signal_type === "mean_reversion").length}
              </div>
              <div className="text-sm text-gray-400">Mean Reversion</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}