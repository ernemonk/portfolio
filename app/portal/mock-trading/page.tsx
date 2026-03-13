"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface MockTradingSession {
  id: string;
  name: string;
  strategy_id: string;
  strategy_name: string;
  initial_capital: number;
  current_equity: number;
  total_pnl: number;
  daily_pnl: number;
  total_trades: number;
  win_rate: number;
  max_drawdown: number;
  sharpe_ratio: number;
  status: "running" | "paused" | "stopped" | "completed";
  start_date: string;
  last_trade?: string;
  current_positions: MockPosition[];
}

interface MockPosition {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entry_price: number;
  current_price: number;
  unrealized_pnl: number;
  duration: string;
}

interface MockTrade {
  id: string;
  session_id: string;
  timestamp: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  commission: number;
  realized_pnl: number;
  strategy_signal: string;
  market_conditions: {
    volatility: number;
    trend: string;
    volume_ratio: number;
  };
}

interface NewSessionConfig {
  name: string;
  strategy_id: string;
  initial_capital: number;
  max_position_size: number;
  enable_slippage: boolean;
  enable_commissions: boolean;
  risk_per_trade: number;
}

export default function MockTradingPage() {
  const [sessions, setSessions] = useState<MockTradingSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [sessionTrades, setSessionTrades] = useState<MockTrade[]>([]);
  const [strategies, setStrategies] = useState<any[]>([]);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSessionConfig, setNewSessionConfig] = useState<NewSessionConfig>({
    name: "",
    strategy_id: "",
    initial_capital: 100000,
    max_position_size: 0.05,
    enable_slippage: true,
    enable_commissions: true,
    risk_per_trade: 0.02,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // In a real implementation, these would be actual API calls
      const mockSessions: MockTradingSession[] = [
        {
          id: "session-1",
          name: "RSI Momentum Test",
          strategy_id: "rsi-momentum-v1",
          strategy_name: "RSI Momentum Strategy",
          initial_capital: 100000,
          current_equity: 108450,
          total_pnl: 8450,
          daily_pnl: 1250,
          total_trades: 47,
          win_rate: 68.1,
          max_drawdown: -2850,
          sharpe_ratio: 1.84,
          status: "running",
          start_date: "2024-03-01",
          last_trade: "2024-03-15 14:32:00",
          current_positions: [
            {
              symbol: "BTC",
              side: "long",
              quantity: 0.25,
              entry_price: 68500,
              current_price: 69200,
              unrealized_pnl: 175,
              duration: "2h 15m",
            },
            {
              symbol: "ETH",
              side: "short",
              quantity: 5.0,
              entry_price: 3420,
              current_price: 3380,
              unrealized_pnl: 200,
              duration: "45m",
            }
          ],
        },
        {
          id: "session-2", 
          name: "Mean Reversion BTC",
          strategy_id: "bollinger-reversion-v2",
          strategy_name: "Bollinger Band Mean Reversion",
          initial_capital: 50000,
          current_equity: 52750,
          total_pnl: 2750,
          daily_pnl: -180,
          total_trades: 23,
          win_rate: 73.9,
          max_drawdown: -980,
          sharpe_ratio: 2.12,
          status: "paused",
          start_date: "2024-03-10",
          current_positions: [],
        }
      ];

      const mockStrategies = [
        { id: "rsi-momentum-v1", name: "RSI Momentum Strategy" },
        { id: "bollinger-reversion-v2", name: "Bollinger Band Mean Reversion" },
        { id: "ml-signal-v1", name: "ML Signal Strategy" },
      ];

      setSessions(mockSessions);
      setStrategies(mockStrategies);
    } catch (error) {
      console.error("Failed to load mock trading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionTrades = async (sessionId: string) => {
    try {
      // Mock trade data
      const mockTrades: MockTrade[] = [
        {
          id: "trade-1",
          session_id: sessionId,
          timestamp: "2024-03-15 14:32:00",
          symbol: "BTC",
          side: "buy",
          quantity: 0.25,
          price: 68500,
          commission: 8.25,
          realized_pnl: 0,
          strategy_signal: "RSI oversold + volume spike",
          market_conditions: {
            volatility: 0.045,
            trend: "bullish",
            volume_ratio: 1.8,
          },
        },
        {
          id: "trade-2",
          session_id: sessionId,
          timestamp: "2024-03-15 12:15:00",
          symbol: "ETH",
          side: "sell",
          quantity: 3.0,
          price: 3445,
          commission: 12.40,
          realized_pnl: 385,
          strategy_signal: "RSI overbought + bearish divergence",
          market_conditions: {
            volatility: 0.052,
            trend: "bearish",
            volume_ratio: 1.2,
          },
        },
      ];
      setSessionTrades(mockTrades);
    } catch (error) {
      console.error("Failed to load session trades:", error);
    }
  };

  const createSession = async () => {
    try {
      // In a real implementation, this would be an API call
      const newSession: MockTradingSession = {
        id: `session-${Date.now()}`,
        name: newSessionConfig.name,
        strategy_id: newSessionConfig.strategy_id,
        strategy_name: strategies.find(s => s.id === newSessionConfig.strategy_id)?.name || "Unknown",
        initial_capital: newSessionConfig.initial_capital,
        current_equity: newSessionConfig.initial_capital,
        total_pnl: 0,
        daily_pnl: 0,
        total_trades: 0,
        win_rate: 0,
        max_drawdown: 0,
        sharpe_ratio: 0,
        status: "running",
        start_date: new Date().toISOString().split('T')[0],
        current_positions: [],
      };

      setSessions([newSession, ...sessions]);
      setShowNewSession(false);
      setNewSessionConfig({
        name: "",
        strategy_id: "",
        initial_capital: 100000,
        max_position_size: 0.05,
        enable_slippage: true,
        enable_commissions: true,
        risk_per_trade: 0.02,
      });
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const toggleSession = async (sessionId: string, action: "pause" | "resume" | "stop") => {
    try {
      setSessions(sessions.map(session => 
        session.id === sessionId 
          ? { ...session, status: action === "pause" ? "paused" : action === "resume" ? "running" : "stopped" }
          : session
      ));
    } catch (error) {
      console.error(`Failed to ${action} session:`, error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Mock Trading</h1>
          <p className="text-gray-400 mt-1">
            Paper trading simulation with realistic market conditions
          </p>
        </div>
        <button
          onClick={() => setShowNewSession(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Session
        </button>
      </div>

      {/* Sessions Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white">{session.name}</h3>
              <Badge variant={
                session.status === "running" ? "success" :
                session.status === "paused" ? "warning" :
                session.status === "stopped" ? "secondary" : "default"
              }>
                {session.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Strategy</span>
                <span className="text-white">{session.strategy_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Current Equity</span>
                <span className="text-white font-mono">
                  ${session.current_equity.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total P&L</span>
                <span className={`font-mono ${session.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {session.total_pnl >= 0 ? "+" : ""}${session.total_pnl.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate</span>
                <span className="text-white font-mono">{session.win_rate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sharpe Ratio</span>
                <span className="text-white font-mono">{session.sharpe_ratio.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setSelectedSession(session.id);
                  loadSessionTrades(session.id);
                }}
                className="flex-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                View Details
              </button>
              {session.status === "running" ? (
                <button
                  onClick={() => toggleSession(session.id, "pause")}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Pause
                </button>
              ) : session.status === "paused" ? (
                <button
                  onClick={() => toggleSession(session.id, "resume")}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                >
                  Resume
                </button>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

      {/* Session Details */}
      {selectedSession && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Session Details</h2>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {(() => {
            const session = sessions.find(s => s.id === selectedSession);
            if (!session) return null;

            return (
              <div className="space-y-6">
                {/* Current Positions */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Current Positions</h3>
                  {session.current_positions.length > 0 ? (
                    <div className="space-y-2">
                      {session.current_positions.map((position, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant={position.side === "long" ? "success" : "destructive"}>
                              {position.side.toUpperCase()}
                            </Badge>
                            <span className="font-semibold text-white">{position.symbol}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-400">
                              {position.quantity} @ ${position.entry_price.toLocaleString()}
                            </span>
                            <span className={`font-mono ${position.unrealized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {position.unrealized_pnl >= 0 ? "+" : ""}${position.unrealized_pnl}
                            </span>
                            <span className="text-gray-400">{position.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No open positions</p>
                  )}
                </div>

                {/* Recent Trades */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Recent Trades</h3>
                  {sessionTrades.length > 0 ? (
                    <div className="space-y-2">
                      {sessionTrades.map((trade) => (
                        <div key={trade.id} className="p-4 bg-gray-800 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <Badge variant={trade.side === "buy" ? "success" : "destructive"}>
                                {trade.side.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-white">{trade.symbol}</span>
                              <span className="text-gray-400 text-sm">{trade.timestamp}</span>
                            </div>
                            <span className={`font-mono ${trade.realized_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {trade.realized_pnl >= 0 ? "+" : ""}${trade.realized_pnl}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400">
                            <p>Signal: {trade.strategy_signal}</p>
                            <p>Market: {trade.market_conditions.trend}, Vol: {trade.market_conditions.volatility.toFixed(3)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400">No trades executed yet</p>
                  )}
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* New Session Modal */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Mock Trading Session</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Session Name</label>
                <input
                  type="text"
                  value={newSessionConfig.name}
                  onChange={(e) => setNewSessionConfig({ ...newSessionConfig, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  placeholder="e.g., BTC Momentum Test"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Strategy</label>
                <select
                  value={newSessionConfig.strategy_id}
                  onChange={(e) => setNewSessionConfig({ ...newSessionConfig, strategy_id: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                >
                  <option value="">Select a strategy</option>
                  {strategies.map((strategy) => (
                    <option key={strategy.id} value={strategy.id}>
                      {strategy.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Initial Capital</label>
                <input
                  type="number"
                  value={newSessionConfig.initial_capital}
                  onChange={(e) => setNewSessionConfig({ ...newSessionConfig, initial_capital: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Risk Per Trade (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newSessionConfig.risk_per_trade}
                  onChange={(e) => setNewSessionConfig({ ...newSessionConfig, risk_per_trade: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSessionConfig.enable_slippage}
                    onChange={(e) => setNewSessionConfig({ ...newSessionConfig, enable_slippage: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Enable realistic slippage</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newSessionConfig.enable_commissions}
                    onChange={(e) => setNewSessionConfig({ ...newSessionConfig, enable_commissions: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-300">Include commission costs</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewSession(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSession}
                disabled={!newSessionConfig.name || !newSessionConfig.strategy_id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Create Session
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}