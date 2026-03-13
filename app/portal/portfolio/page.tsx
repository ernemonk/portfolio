"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface Portfolio {
  total_value_usd: number;
  daily_pnl: number;
  daily_pnl_pct: number;
  unrealized_pnl: number;
  realized_pnl: number;
  available_cash: number;
  total_equity: number;
  margin_used: number;
  buying_power: number;
  portfolio_heat_pct: number;
}

interface Position {
  symbol: string;
  asset_class: string;
  side: "long" | "short";
  quantity: number;
  avg_cost: number;
  current_price: number;
  market_value: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  weight: number;
  risk_contribution: number;
  strategy: string;
  entry_date: string;
  duration_days: number;
}

interface RiskMetrics {
  portfolio_var_1d: number;
  portfolio_var_5d: number;
  beta: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  concentration_risk: number;
  correlation_risk: number;
  sector_exposure: Record<string, number>;
  geographic_exposure: Record<string, number>;
}

interface PerformanceData {
  date: string;
  portfolio_value: number;
  daily_return: number;
  cumulative_return: number;
  benchmark_return: number;
  alpha: number;
}

interface Trade {
  id: string;
  timestamp: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  value: number;
  commission: number;
  strategy: string;
  pnl?: number;
  status: "filled" | "partial" | "cancelled" | "pending";
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<"1d" | "7d" | "30d" | "90d" | "1y">("30d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPortfolioData();
  }, [timeframe]);

  const loadPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Mock portfolio data
      const mockPortfolio: Portfolio = {
        total_value_usd: 285670.45,
        daily_pnl: 3250.80,
        daily_pnl_pct: 1.15,
        unrealized_pnl: 18540.30,
        realized_pnl: 12480.75,
        available_cash: 45230.20,
        total_equity: 285670.45,
        margin_used: 0,
        buying_power: 45230.20,
        portfolio_heat_pct: 72.5,
      };

      const mockPositions: Position[] = [
        {
          symbol: "BTC",
          asset_class: "cryptocurrency",
          side: "long",
          quantity: 2.5,
          avg_cost: 65420.00,
          current_price: 69200.00,
          market_value: 173000.00,
          unrealized_pnl: 9450.00,
          unrealized_pnl_pct: 5.77,
          weight: 60.6,
          risk_contribution: 45.2,
          strategy: "Momentum Strategy",
          entry_date: "2024-02-15",
          duration_days: 29,
        },
        {
          symbol: "ETH",
          asset_class: "cryptocurrency",
          side: "long",
          quantity: 15.0,
          avg_cost: 3280.00,
          current_price: 3420.00,
          market_value: 51300.00,
          unrealized_pnl: 2100.00,
          unrealized_pnl_pct: 4.27,
          weight: 18.0,
          risk_contribution: 22.8,
          strategy: "Mean Reversion",
          entry_date: "2024-03-01",
          duration_days: 14,
        },
        {
          symbol: "SOL",
          asset_class: "cryptocurrency",
          side: "short",
          quantity: -50.0,
          avg_cost: 185.50,
          current_price: 178.20,
          market_value: -8910.00,
          unrealized_pnl: 365.00,
          unrealized_pnl_pct: 3.93,
          weight: -3.1,
          risk_contribution: 8.5,
          strategy: "Arbitrage Strategy",
          entry_date: "2024-03-10",
          duration_days: 5,
        },
        {
          symbol: "AAPL",
          asset_class: "equity",
          side: "long",
          quantity: 200,
          avg_cost: 175.30,
          current_price: 182.45,
          market_value: 36490.00,
          unrealized_pnl: 1430.00,
          unrealized_pnl_pct: 4.08,
          weight: 12.8,
          risk_contribution: 15.2,
          strategy: "Tech Momentum",
          entry_date: "2024-02-20",
          duration_days: 24,
        },
        {
          symbol: "SPY",
          asset_class: "etf",
          side: "long",
          quantity: 50,
          avg_cost: 495.20,
          current_price: 510.80,
          market_value: 25540.00,
          unrealized_pnl: 780.00,
          unrealized_pnl_pct: 3.15,
          weight: 8.9,
          risk_contribution: 12.8,
          strategy: "Market Hedge",
          entry_date: "2024-03-05",
          duration_days: 10,
        },
      ];

      const mockRiskMetrics: RiskMetrics = {
        portfolio_var_1d: -12500.00,
        portfolio_var_5d: -28000.00,
        beta: 1.25,
        sharpe_ratio: 1.84,
        sortino_ratio: 2.12,
        max_drawdown: -8.5,
        concentration_risk: 0.72,
        correlation_risk: 0.45,
        sector_exposure: {
          "Technology": 25.6,
          "Cryptocurrency": 75.5,
          "Broad Market": 8.9,
        },
        geographic_exposure: {
          "United States": 47.7,
          "Global": 52.3,
        },
      };

      const mockPerformanceData: PerformanceData[] = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const baseReturn = (Math.random() - 0.48) * 0.05;
        const cumulativeReturn = i * 0.008 + baseReturn;
        
        return {
          date: date.toISOString().split('T')[0],
          portfolio_value: 250000 + cumulativeReturn * 250000 + Math.random() * 10000,
          daily_return: baseReturn,
          cumulative_return: cumulativeReturn,
          benchmark_return: cumulativeReturn * 0.7,
          alpha: baseReturn * 0.3,
        };
      });

      const mockTrades: Trade[] = [
        {
          id: "trade-1",
          timestamp: "2024-03-15 14:30:00",
          symbol: "BTC",
          side: "buy",
          quantity: 0.25,
          price: 69100.00,
          value: 17275.00,
          commission: 25.91,
          strategy: "Momentum Strategy",
          status: "filled",
        },
        {
          id: "trade-2", 
          timestamp: "2024-03-15 11:45:00",
          symbol: "ETH",
          side: "sell",
          quantity: 2.0,
          price: 3445.00,
          value: 6890.00,
          commission: 10.34,
          strategy: "Mean Reversion",
          pnl: 285.50,
          status: "filled",
        },
        {
          id: "trade-3",
          timestamp: "2024-03-15 09:20:00",
          symbol: "SOL",
          side: "sell",
          quantity: 10.0,
          price: 178.80,
          value: 1788.00,
          commission: 3.58,
          strategy: "Arbitrage Strategy",
          status: "filled",
        },
        {
          id: "trade-4",
          timestamp: "2024-03-14 16:15:00",
          symbol: "AAPL",
          side: "buy",
          quantity: 50,
          price: 181.20,
          value: 9060.00,
          commission: 7.50,
          strategy: "Tech Momentum",
          status: "filled",
        },
      ];

      setPortfolio(mockPortfolio);
      setPositions(mockPositions);
      setRiskMetrics(mockRiskMetrics);
      setPerformanceData(mockPerformanceData);
      setRecentTrades(mockTrades);
    } catch (error) {
      console.error("Failed to load portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  const closePosition = async (symbol: string) => {
    try {
      // Mock close position
      setPositions(positions.filter(p => p.symbol !== symbol));
    } catch (error) {
      console.error(`Failed to close position ${symbol}:`, error);
    }
  };

  const rebalancePortfolio = async () => {
    try {
      // Mock rebalancing logic
      console.log("Portfolio rebalancing initiated...");
    } catch (error) {
      console.error("Failed to rebalance portfolio:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 mt-1">
            Real-time portfolio tracking and risk management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg"
          >
            <option value="1d">1 Day</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
          <button
            onClick={rebalancePortfolio}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Rebalance
          </button>
        </div>
      </div>

      {/* Portfolio Overview */}
      {portfolio && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-white">
                  ${portfolio.total_value_usd.toLocaleString()}
                </p>
              </div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Available Cash: ${portfolio.available_cash.toLocaleString()}
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Daily P&L</p>
                <p className={`text-2xl font-bold ${portfolio.daily_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {portfolio.daily_pnl >= 0 ? "+" : ""}${portfolio.daily_pnl.toLocaleString()}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${portfolio.daily_pnl >= 0 ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
            <p className={`text-xs mt-1 ${portfolio.daily_pnl_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
              {portfolio.daily_pnl >= 0 ? "+" : ""}{portfolio.daily_pnl_pct.toFixed(2)}%
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Unrealized P&L</p>
                <p className={`text-2xl font-bold ${portfolio.unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {portfolio.unrealized_pnl >= 0 ? "+" : ""}${portfolio.unrealized_pnl.toLocaleString()}
                </p>
              </div>
              <div className={`w-3 h-3 rounded-full ${portfolio.unrealized_pnl >= 0 ? "bg-green-500" : "bg-red-500"}`}></div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Portfolio Heat</p>
                <p className="text-2xl font-bold text-white">{portfolio.portfolio_heat_pct.toFixed(1)}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                portfolio.portfolio_heat_pct < 60 ? "bg-green-500" :
                portfolio.portfolio_heat_pct < 80 ? "bg-yellow-500" : "bg-red-500"
              }`}></div>
            </div>
          </Card>
        </div>
      )}

      {/* Risk Metrics */}
      {riskMetrics && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">VaR (1D, 95%)</p>
              <p className="text-red-400 text-xl font-mono">${riskMetrics.portfolio_var_1d.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Sharpe Ratio</p>
              <p className="text-white text-xl font-mono">{riskMetrics.sharpe_ratio.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Max Drawdown</p>
              <p className="text-red-400 text-xl font-mono">{riskMetrics.max_drawdown.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <p className="text-gray-400 text-sm">Beta</p>
              <p className="text-white text-xl font-mono">{riskMetrics.beta.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Current Positions */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Current Positions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">Symbol</th>
                <th className="text-right py-2 text-gray-400">Side</th>
                <th className="text-right py-2 text-gray-400">Quantity</th>
                <th className="text-right py-2 text-gray-400">Avg Cost</th>
                <th className="text-right py-2 text-gray-400">Current Price</th>
                <th className="text-right py-2 text-gray-400">Market Value</th>
                <th className="text-right py-2 text-gray-400">P&L</th>
                <th className="text-right py-2 text-gray-400">Weight</th>
                <th className="text-center py-2 text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => (
                <tr key={position.symbol} className="border-b border-gray-800 hover:bg-gray-800/30">
                  <td className="py-3">
                    <div>
                      <p className="text-white font-medium">{position.symbol}</p>
                      <p className="text-gray-400 text-xs">{position.strategy}</p>
                    </div>
                  </td>
                  <td className="py-3 text-right">
                    <Badge variant={position.side === "long" ? "success" : "destructive"}>
                      {position.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    {Math.abs(position.quantity).toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    ${position.avg_cost.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    ${position.current_price.toLocaleString()}
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    ${Math.abs(position.market_value).toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex flex-col">
                      <span className={`font-mono ${position.unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {position.unrealized_pnl >= 0 ? "+" : ""}${position.unrealized_pnl.toLocaleString()}
                      </span>
                      <span className={`text-xs ${position.unrealized_pnl_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ({position.unrealized_pnl_pct >= 0 ? "+" : ""}{position.unrealized_pnl_pct.toFixed(2)}%)
                      </span>
                    </div>
                  </td>
                  <td className="py-3 text-right text-white font-mono">
                    {Math.abs(position.weight).toFixed(1)}%
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <button
                        onClick={() => setSelectedPosition(position.symbol)}
                        className="px-2 py-1 bg-gray-700 text-white rounded text-xs hover:bg-gray-600 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => closePosition(position.symbol)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Trades */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Trades</h3>
        <div className="space-y-2">
          {recentTrades.map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge variant={trade.side === "buy" ? "success" : "destructive"}>
                  {trade.side.toUpperCase()}
                </Badge>
                <div>
                  <p className="text-white font-medium">{trade.symbol}</p>
                  <p className="text-gray-400 text-sm">{trade.strategy}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">
                  {trade.quantity} @ ${trade.price.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">{trade.timestamp}</p>
              </div>
              <div className="text-right">
                <p className="text-white font-mono">${trade.value.toLocaleString()}</p>
                {trade.pnl && (
                  <p className={`text-sm font-mono ${trade.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    P&L: {trade.pnl >= 0 ? "+" : ""}${trade.pnl}
                  </p>
                )}
              </div>
              <Badge variant={
                trade.status === "filled" ? "success" :
                trade.status === "pending" ? "warning" : "secondary"
              }>
                {trade.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Position Detail Modal */}
      {selectedPosition && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Position Details: {selectedPosition}</h2>
              <button
                onClick={() => setSelectedPosition(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const position = positions.find(p => p.symbol === selectedPosition);
              if (!position) return null;

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Side</p>
                      <Badge variant={position.side === "long" ? "success" : "destructive"}>
                        {position.side.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Asset Class</p>
                      <p className="text-white text-lg">{position.asset_class}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Quantity</p>
                      <p className="text-white text-lg font-mono">{Math.abs(position.quantity)}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Entry Date</p>
                      <p className="text-white text-lg">{position.entry_date}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Average Cost</p>
                      <p className="text-white text-lg font-mono">${position.avg_cost.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Current Price</p>
                      <p className="text-white text-lg font-mono">${position.current_price.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Market Value</p>
                      <p className="text-white text-lg font-mono">${Math.abs(position.market_value).toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Unrealized P&L</p>
                      <p className={`text-lg font-mono ${position.unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {position.unrealized_pnl >= 0 ? "+" : ""}${position.unrealized_pnl.toLocaleString()}
                      </p>
                      <p className={`text-sm ${position.unrealized_pnl_pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                        ({position.unrealized_pnl_pct >= 0 ? "+" : ""}{position.unrealized_pnl_pct.toFixed(2)}%)
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Portfolio Weight</p>
                      <p className="text-white text-lg font-mono">{Math.abs(position.weight).toFixed(2)}%</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Risk Contribution</p>
                      <p className="text-white text-lg font-mono">{position.risk_contribution.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Duration</p>
                      <p className="text-white text-lg">{position.duration_days} days</p>
                    </div>
                    <div className="p-3 bg-gray-800 rounded-lg">
                      <p className="text-gray-400 text-sm">Strategy</p>
                      <p className="text-white text-lg">{position.strategy}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => {
                        closePosition(position.symbol);
                        setSelectedPosition(null);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Close Position
                    </button>
                    <button
                      onClick={() => setSelectedPosition(null)}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}
    </div>
  );
}