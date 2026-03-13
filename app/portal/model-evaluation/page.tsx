"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface ModelPerformance {
  model_id: string;
  model_name: string;
  strategy_type: string;
  deployment_date: string;
  status: "active" | "paused" | "training" | "failed";
  performance_metrics: {
    accuracy: number;
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
    profit_factor: number;
    avg_trade_duration: number;
    total_trades: number;
    total_pnl: number;
  };
  recent_signals: {
    timestamp: string;
    signal: "buy" | "sell" | "hold";
    confidence: number;
    outcome?: "correct" | "incorrect" | "pending";
  }[];
  feature_importance: {
    feature: string;
    importance: number;
  }[];
  drift_metrics: {
    data_drift: number;
    prediction_drift: number;
    last_checked: string;
    needs_retraining: boolean;
  };
}

interface ModelComparison {
  model_a: string;
  model_b: string;
  timeframe: string;
  metrics: {
    metric: string;
    model_a_value: number;
    model_b_value: number;
    winner: "a" | "b" | "tie";
  }[];
}

interface RetrainingJob {
  id: string;
  model_id: string;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  started_at: string;
  estimated_completion?: string;
  hyperparameters: Record<string, any>;
}

export default function ModelEvaluationPage() {
  const [models, setModels] = useState<ModelPerformance[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [comparison, setComparison] = useState<ModelComparison | null>(null);
  const [retrainingJobs, setRetrainingJobs] = useState<RetrainingJob[]>([]);
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "90d">("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadModelData();
  }, [timeframe]);

  const loadModelData = async () => {
    try {
      setLoading(true);
      
      // Mock data for demonstration
      const mockModels: ModelPerformance[] = [
        {
          model_id: "lstm-momentum-v2.1",
          model_name: "LSTM Momentum Predictor v2.1",
          strategy_type: "momentum",
          deployment_date: "2024-03-01",
          status: "active",
          performance_metrics: {
            accuracy: 68.5,
            sharpe_ratio: 1.84,
            max_drawdown: -8.2,
            win_rate: 71.3,
            profit_factor: 1.42,
            avg_trade_duration: 4.2,
            total_trades: 89,
            total_pnl: 12450,
          },
          recent_signals: [
            { timestamp: "2024-03-15 14:30", signal: "buy", confidence: 0.87, outcome: "correct" },
            { timestamp: "2024-03-15 11:45", signal: "sell", confidence: 0.92, outcome: "correct" },
            { timestamp: "2024-03-15 09:15", signal: "hold", confidence: 0.65, outcome: "pending" },
          ],
          feature_importance: [
            { feature: "rsi_14", importance: 0.28 },
            { feature: "macd_signal", importance: 0.24 },
            { feature: "volume_sma_ratio", importance: 0.19 },
            { feature: "bollinger_position", importance: 0.16 },
            { feature: "momentum_20", importance: 0.13 },
          ],
          drift_metrics: {
            data_drift: 0.15,
            prediction_drift: 0.08,
            last_checked: "2024-03-15 10:00",
            needs_retraining: false,
          },
        },
        {
          model_id: "xgb-reversion-v1.3",
          model_name: "XGBoost Mean Reversion v1.3",
          strategy_type: "mean_reversion",
          deployment_date: "2024-02-15",
          status: "active",
          performance_metrics: {
            accuracy: 72.1,
            sharpe_ratio: 2.12,
            max_drawdown: -5.8,
            win_rate: 68.9,
            profit_factor: 1.67,
            avg_trade_duration: 2.8,
            total_trades: 124,
            total_pnl: 8720,
          },
          recent_signals: [
            { timestamp: "2024-03-15 14:00", signal: "sell", confidence: 0.91, outcome: "pending" },
            { timestamp: "2024-03-15 12:30", signal: "buy", confidence: 0.78, outcome: "incorrect" },
            { timestamp: "2024-03-15 10:45", signal: "hold", confidence: 0.82, outcome: "correct" },
          ],
          feature_importance: [
            { feature: "bollinger_position", importance: 0.32 },
            { feature: "rsi_divergence", importance: 0.26 },
            { feature: "price_distance_sma", importance: 0.21 },
            { feature: "volatility_ratio", importance: 0.12 },
            { feature: "support_resistance", importance: 0.09 },
          ],
          drift_metrics: {
            data_drift: 0.23,
            prediction_drift: 0.18,
            last_checked: "2024-03-15 09:30",
            needs_retraining: true,
          },
        },
        {
          model_id: "transformer-multi-v1.0",
          model_name: "Transformer Multi-Asset v1.0",
          strategy_type: "arbitrage",
          deployment_date: "2024-03-10",
          status: "training",
          performance_metrics: {
            accuracy: 0,
            sharpe_ratio: 0,
            max_drawdown: 0,
            win_rate: 0,
            profit_factor: 0,
            avg_trade_duration: 0,
            total_trades: 0,
            total_pnl: 0,
          },
          recent_signals: [],
          feature_importance: [],
          drift_metrics: {
            data_drift: 0,
            prediction_drift: 0,
            last_checked: "2024-03-10 15:00",
            needs_retraining: false,
          },
        },
      ];

      const mockRetrainingJobs: RetrainingJob[] = [
        {
          id: "retrain-001",
          model_id: "xgb-reversion-v1.3",
          status: "running",
          progress: 67,
          started_at: "2024-03-15 13:00",
          estimated_completion: "2024-03-15 16:30",
          hyperparameters: {
            learning_rate: 0.1,
            max_depth: 6,
            n_estimators: 200,
            subsample: 0.8,
          },
        },
      ];

      setModels(mockModels);
      setRetrainingJobs(mockRetrainingJobs);
    } catch (error) {
      console.error("Failed to load model data:", error);
    } finally {
      setLoading(false);
    }
  };

  const startRetraining = async (modelId: string) => {
    try {
      const newJob: RetrainingJob = {
        id: `retrain-${Date.now()}`,
        model_id: modelId,
        status: "queued",
        progress: 0,
        started_at: new Date().toISOString(),
        hyperparameters: {
          learning_rate: 0.1,
          max_depth: 6,
          n_estimators: 200,
        },
      };
      
      setRetrainingJobs([...retrainingJobs, newJob]);
      
      // Update model status
      setModels(models.map(model => 
        model.model_id === modelId 
          ? { ...model, status: "training" as const }
          : model
      ));
    } catch (error) {
      console.error("Failed to start retraining:", error);
    }
  };

  const pauseModel = async (modelId: string) => {
    try {
      setModels(models.map(model => 
        model.model_id === modelId 
          ? { ...model, status: "paused" as const }
          : model
      ));
    } catch (error) {
      console.error("Failed to pause model:", error);
    }
  };

  const compareModels = async (modelAId: string, modelBId: string) => {
    try {
      const mockComparison: ModelComparison = {
        model_a: modelAId,
        model_b: modelBId,
        timeframe: timeframe,
        metrics: [
          { metric: "Sharpe Ratio", model_a_value: 1.84, model_b_value: 2.12, winner: "b" },
          { metric: "Win Rate %", model_a_value: 71.3, model_b_value: 68.9, winner: "a" },
          { metric: "Max Drawdown %", model_a_value: -8.2, model_b_value: -5.8, winner: "b" },
          { metric: "Profit Factor", model_a_value: 1.42, model_b_value: 1.67, winner: "b" },
          { metric: "Total Trades", model_a_value: 89, model_b_value: 124, winner: "b" },
        ],
      };
      setComparison(mockComparison);
    } catch (error) {
      console.error("Failed to compare models:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Model Evaluation</h1>
          <p className="text-gray-400 mt-1">
            Monitor AI model performance and manage retraining
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 bg-gray-700 text-white rounded-lg"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Model Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <Card key={model.model_id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-white truncate pr-2">
                {model.model_name}
              </h3>
              <Badge variant={
                model.status === "active" ? "success" :
                model.status === "training" ? "warning" :
                model.status === "paused" ? "secondary" :
                "destructive"
              }>
                {model.status}
              </Badge>
            </div>

            {model.status === "active" && (
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Accuracy</span>
                  <span className="text-white font-mono">{model.performance_metrics.accuracy.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Sharpe Ratio</span>
                  <span className="text-white font-mono">{model.performance_metrics.sharpe_ratio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-white font-mono">{model.performance_metrics.win_rate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total P&L</span>
                  <span className={`font-mono ${model.performance_metrics.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${model.performance_metrics.total_pnl.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {model.status === "training" && (
              <div className="text-center py-6">
                <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Model training in progress...</p>
              </div>
            )}

            {/* Drift Warning */}
            {model.drift_metrics.needs_retraining && (
              <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-600/30 rounded text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⚠️</span>
                  <span className="text-yellow-300">Model drift detected</span>
                </div>
                <p className="text-yellow-200 text-xs mt-1">
                  Data drift: {(model.drift_metrics.data_drift * 100).toFixed(1)}%
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedModel(model.model_id)}
                className="flex-1 px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600 transition-colors"
              >
                Details
              </button>
              {model.status === "active" && model.drift_metrics.needs_retraining && (
                <button
                  onClick={() => startRetraining(model.model_id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Retrain
                </button>
              )}
              {model.status === "active" && (
                <button
                  onClick={() => pauseModel(model.model_id)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Pause
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Retraining Jobs */}
      {retrainingJobs.length > 0 && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Active Retraining Jobs</h3>
          <div className="space-y-3">
            {retrainingJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div>
                  <p className="text-white font-medium">{job.model_id}</p>
                  <p className="text-gray-400 text-sm">Started: {job.started_at}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={
                    job.status === "running" ? "warning" :
                    job.status === "completed" ? "success" :
                    job.status === "failed" ? "destructive" : "secondary"
                  }>
                    {job.status}
                  </Badge>
                  {job.status === "running" && (
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-600 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-white font-mono">{job.progress}%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Model Performance Details</h2>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {(() => {
              const model = models.find(m => m.model_id === selectedModel);
              if (!model) return null;

              return (
                <div className="space-y-6">
                  {/* Performance Metrics */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Performance Metrics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Accuracy</p>
                        <p className="text-white text-xl font-mono">
                          {model.performance_metrics.accuracy.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Sharpe Ratio</p>
                        <p className="text-white text-xl font-mono">
                          {model.performance_metrics.sharpe_ratio.toFixed(2)}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Max Drawdown</p>
                        <p className="text-red-400 text-xl font-mono">
                          {model.performance_metrics.max_drawdown.toFixed(1)}%
                        </p>
                      </div>
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-gray-400 text-sm">Total P&L</p>
                        <p className={`text-xl font-mono ${model.performance_metrics.total_pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                          ${model.performance_metrics.total_pnl.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Feature Importance */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Feature Importance</h3>
                    <div className="space-y-2">
                      {model.feature_importance.map((feature, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-gray-300">{feature.feature}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-600 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${feature.importance * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-white font-mono text-sm w-12">
                              {(feature.importance * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Signals */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Recent Signals</h3>
                    <div className="space-y-2">
                      {model.recent_signals.map((signal, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                          <div className="flex items-center gap-3">
                            <Badge variant={
                              signal.signal === "buy" ? "success" :
                              signal.signal === "sell" ? "destructive" : "secondary"
                            }>
                              {signal.signal.toUpperCase()}
                            </Badge>
                            <span className="text-gray-400 text-sm">{signal.timestamp}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-white font-mono">
                              {(signal.confidence * 100).toFixed(0)}%
                            </span>
                            {signal.outcome && (
                              <Badge variant={signal.outcome === "correct" ? "success" : "destructive"}>
                                {signal.outcome}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </div>
      )}

      {/* Model Comparison */}
      {comparison && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Model Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-400">Metric</th>
                  <th className="text-right py-2 text-gray-400">{comparison.model_a}</th>
                  <th className="text-right py-2 text-gray-400">{comparison.model_b}</th>
                  <th className="text-center py-2 text-gray-400">Winner</th>
                </tr>
              </thead>
              <tbody>
                {comparison.metrics.map((metric, index) => (
                  <tr key={index} className="border-b border-gray-800">
                    <td className="py-2 text-white">{metric.metric}</td>
                    <td className="py-2 text-right text-white font-mono">{metric.model_a_value}</td>
                    <td className="py-2 text-right text-white font-mono">{metric.model_b_value}</td>
                    <td className="py-2 text-center">
                      <Badge variant={metric.winner === "tie" ? "secondary" : "success"}>
                        {metric.winner === "a" ? comparison.model_a : 
                         metric.winner === "b" ? comparison.model_b : "TIE"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}