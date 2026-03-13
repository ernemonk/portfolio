"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface DataSource {
  name: string;
  type: "crypto" | "stocks" | "economic" | "alternative";
  status: "healthy" | "degraded" | "failed";
  response_time: number;
  last_update: string;
  data_points: number;
  coverage: string[];
}

interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap?: number;
  indicators: {
    rsi: number;
    macd: number;
    macd_signal: string;
    bollinger_position: number;
    volatility: number;
    trend_strength: number;
    volume_sma_ratio: number;
  };
  data_quality: {
    completeness: number;
    freshness: number;
    accuracy: number;
  };
}

interface PipelineStatus {
  stage: string;
  status: "running" | "completed" | "failed";
  processed_records: number;
  error_rate: number;
  last_run: string;
}

export default function DataExplorer() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<AssetData[]>([]);
  const [pipelineStatus, setPipelineStatus] = useState<PipelineStatus[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("crypto");
  const [selectedAsset, setSelectedAsset] = useState<string>("BTC");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDataSources();
    fetchPipelineStatus();
  }, []);

  useEffect(() => {
    if (selectedSource) {
      fetchAssetData();
    }
  }, [selectedSource, selectedAsset]);

  const fetchDataSources = async () => {
    try {
      const response = await api.dataIngestion.getDataSources();
      setDataSources(response.sources || []);
    } catch (error) {
      console.error("Failed to fetch data sources:", error);
    }
  };

  const fetchPipelineStatus = async () => {
    try {
      const response = await api.dataIngestion.getPipelineStatus();
      setPipelineStatus(response.pipelines || []);
    } catch (error) {
      console.error("Failed to fetch pipeline status:", error);
    }
  };

  const fetchAssetData = async () => {
    setLoading(true);
    try {
      const response = await api.featureStore.getAssetData({
        source: selectedSource,
        symbols: [selectedAsset],
        include_indicators: true,
        include_quality_metrics: true
      });
      setSelectedAssets(response.assets || []);
    } catch (error) {
      console.error("Failed to fetch asset data:", error);
      setSelectedAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": case "running": case "completed": return "text-emerald-400";
      case "degraded": return "text-yellow-400";
      case "failed": return "text-red-400";
      default: return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": case "completed": return "✅";
      case "degraded": case "running": return "⚠️";
      case "failed": return "❌";
      default: return "⚪";
    }
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Data Explorer</h1>
            <p className="text-gray-400 mt-1">Explore market data sources, indicators, and pipeline health</p>
          </div>
          <button 
            onClick={() => {
              fetchDataSources();
              fetchPipelineStatus();
              fetchAssetData();
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
          >
            🔄 Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Data Sources Panel */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-lg font-semibold mb-4">📊 Data Sources</h3>
              
              <div className="space-y-3">
                {dataSources.map((source) => (
                  <div 
                    key={source.name}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSource === source.type 
                        ? "bg-blue-600/20 border-blue-500" 
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedSource(source.type)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-sm text-gray-400 capitalize">{source.type}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm ${getStatusColor(source.status)}`}>
                          {getStatusIcon(source.status)} {source.status}
                        </div>
                        <div className="text-xs text-gray-400">
                          {source.response_time}ms
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Data Points:</span>
                        <span>{source.data_points.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Coverage:</span>
                        <span>{source.coverage.length} assets</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Updated: {source.last_update}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Asset Selection */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Select Asset</h4>
                <div className="grid grid-cols-2 gap-2">
                  {["BTC", "ETH", "SOL", "AAPL", "NVDA", "TSLA"].map(asset => (
                    <button
                      key={asset}
                      onClick={() => setSelectedAsset(asset)}
                      className={`p-2 text-sm rounded-lg transition-colors ${
                        selectedAsset === asset 
                          ? "bg-emerald-600 text-white" 
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Pipeline Status */}
            <Card className="p-6 bg-gray-900/50 border-gray-800 mt-6">
              <h3 className="text-lg font-semibold mb-4">⚙️ Pipeline Health</h3>
              
              <div className="space-y-3">
                {pipelineStatus.map((pipeline) => (
                  <div key={pipeline.stage} className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{pipeline.stage}</div>
                      <div className={`text-sm ${getStatusColor(pipeline.status)}`}>
                        {getStatusIcon(pipeline.status)}
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Processed:</span>
                        <span>{pipeline.processed_records.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Error Rate:</span>
                        <span className={`${
                          pipeline.error_rate > 0.05 ? "text-red-400" : "text-emerald-400"
                        }`}>
                          {(pipeline.error_rate * 100).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Last: {pipeline.last_run}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Asset Data Panel */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card className="p-12 text-center bg-gray-900/50 border-gray-800">
                <div className="animate-spin h-8 w-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading asset data...</p>
              </Card>
            ) : selectedAssets.length > 0 ? (
              <div className="space-y-6">
                {selectedAssets.map((asset) => (
                  <div key={asset.symbol} className="space-y-6">
                    
                    {/* Asset Overview */}
                    <Card className="p-6 bg-gray-900/50 border-gray-800">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold">{asset.symbol}</h2>
                          <p className="text-gray-400">{asset.name}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">${formatNumber(asset.price)}</div>
                          <div className={`text-lg ${
                            asset.change_24h >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {asset.change_24h >= 0 ? "+" : ""}{formatNumber(asset.change_24h, 2)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">24h Volume</div>
                          <div className="text-lg font-medium">
                            ${(asset.volume_24h / 1000000).toFixed(1)}M
                          </div>
                        </div>
                        {asset.market_cap && (
                          <div>
                            <div className="text-sm text-gray-400">Market Cap</div>
                            <div className="text-lg font-medium">
                              ${(asset.market_cap / 1000000000).toFixed(1)}B
                            </div>
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-gray-400">Volatility</div>
                          <div className="text-lg font-medium">
                            {(asset.indicators.volatility * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Trend Strength</div>
                          <div className="text-lg font-medium">
                            {(asset.indicators.trend_strength * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Technical Indicators */}
                    <Card className="p-6 bg-gray-900/50 border-gray-800">
                      <h3 className="text-lg font-semibold mb-4">📈 Technical Indicators</h3>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">RSI</div>
                          <div className={`text-2xl font-bold ${
                            asset.indicators.rsi > 70 ? "text-red-400" : 
                            asset.indicators.rsi < 30 ? "text-emerald-400" : "text-yellow-400"
                          }`}>
                            {asset.indicators.rsi.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {asset.indicators.rsi > 70 ? "Overbought" : 
                             asset.indicators.rsi < 30 ? "Oversold" : "Neutral"}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">MACD</div>
                          <div className={`text-2xl font-bold ${
                            asset.indicators.macd_signal === "BUY" ? "text-emerald-400" : 
                            asset.indicators.macd_signal === "SELL" ? "text-red-400" : "text-yellow-400"
                          }`}>
                            {asset.indicators.macd.toFixed(3)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {asset.indicators.macd_signal}
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Bollinger</div>
                          <div className={`text-2xl font-bold ${
                            asset.indicators.bollinger_position > 0.8 ? "text-red-400" : 
                            asset.indicators.bollinger_position < 0.2 ? "text-emerald-400" : "text-yellow-400"
                          }`}>
                            {(asset.indicators.bollinger_position * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Position
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Volume SMA</div>
                          <div className={`text-2xl font-bold ${
                            asset.indicators.volume_sma_ratio > 1.2 ? "text-emerald-400" : 
                            asset.indicators.volume_sma_ratio < 0.8 ? "text-red-400" : "text-yellow-400"
                          }`}>
                            {asset.indicators.volume_sma_ratio.toFixed(1)}x
                          </div>
                          <div className="text-xs text-gray-400">
                            vs Average
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Data Quality */}
                    <Card className="p-6 bg-gray-900/50 border-gray-800">
                      <h3 className="text-lg font-semibold mb-4">✅ Data Quality</h3>
                      
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Completeness</div>
                          <div className={`text-xl font-bold ${
                            asset.data_quality.completeness > 0.95 ? "text-emerald-400" : 
                            asset.data_quality.completeness > 0.85 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {(asset.data_quality.completeness * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Data Coverage
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Freshness</div>
                          <div className={`text-xl font-bold ${
                            asset.data_quality.freshness > 0.95 ? "text-emerald-400" : 
                            asset.data_quality.freshness > 0.85 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {(asset.data_quality.freshness * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Recent Data
                          </div>
                        </div>

                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                          <div className={`text-xl font-bold ${
                            asset.data_quality.accuracy > 0.95 ? "text-emerald-400" : 
                            asset.data_quality.accuracy > 0.85 ? "text-yellow-400" : "text-red-400"
                          }`}>
                            {(asset.data_quality.accuracy * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Validation Score
                          </div>
                        </div>
                      </div>

                      {/* Data Quality Progress Bars */}
                      <div className="mt-4 space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Completeness</span>
                            <span>{(asset.data_quality.completeness * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-emerald-400 h-2 rounded-full" 
                              style={{width: `${asset.data_quality.completeness * 100}%`}}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Freshness</span>
                            <span>{(asset.data_quality.freshness * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-400 h-2 rounded-full" 
                              style={{width: `${asset.data_quality.freshness * 100}%`}}
                            ></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-400">Accuracy</span>
                            <span>{(asset.data_quality.accuracy * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-purple-400 h-2 rounded-full" 
                              style={{width: `${asset.data_quality.accuracy * 100}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-gray-900/50 border-gray-800">
                <p className="text-gray-400">No asset data available</p>
                <p className="text-sm text-gray-500 mt-1">Select a data source and asset to explore</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}