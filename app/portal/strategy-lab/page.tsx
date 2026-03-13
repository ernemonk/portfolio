"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface StrategyTemplate {
  id: string;
  name: string;
  type: "momentum" | "mean_reversion" | "arbitrage" | "ml_based" | "custom";
  description: string;
  parameters: StrategyParameter[];
  example_assets: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  historical_performance?: {
    sharpe_ratio: number;
    max_drawdown: number;
    win_rate: number;
  };
}

interface StrategyParameter {
  name: string;
  type: "number" | "boolean" | "select" | "multiselect";
  default_value: any;
  min_value?: number;
  max_value?: number;
  options?: string[];
  description: string;
}

interface BuiltStrategy {
  id: string;
  name: string;
  template_id: string;
  asset: string;
  indicators: string[];
  parameters: Record<string, any>;
  entry_conditions: string[];
  exit_conditions: string[];
  risk_management: {
    stop_loss: number;
    take_profit: number;
    position_size: number;
  };
  status: "draft" | "testing" | "validated" | "deployed";
  created_at: string;
}

const STRATEGY_TEMPLATES: StrategyTemplate[] = [
  {
    id: "rsi_momentum",
    name: "RSI Momentum Strategy",
    type: "momentum",
    description: "Buy on RSI oversold conditions with momentum confirmation",
    complexity: "beginner",
    example_assets: ["BTC", "ETH", "SOL"],
    parameters: [
      {
        name: "rsi_oversold",
        type: "number",
        default_value: 30,
        min_value: 10,
        max_value: 40,
        description: "RSI oversold threshold"
      },
      {
        name: "rsi_overbought",
        type: "number",
        default_value: 70,
        min_value: 60,
        max_value: 90,
        description: "RSI overbought threshold"
      },
      {
        name: "volume_confirmation",
        type: "boolean",
        default_value: true,
        description: "Require volume confirmation"
      }
    ],
    historical_performance: {
      sharpe_ratio: 1.24,
      max_drawdown: -12.4,
      win_rate: 0.58
    }
  },
  {
    id: "bollinger_mean_reversion",
    name: "Bollinger Band Mean Reversion",
    type: "mean_reversion",
    description: "Trade reversals at Bollinger Band extremes",
    complexity: "intermediate",
    example_assets: ["AAPL", "NVDA", "BTC"],
    parameters: [
      {
        name: "bb_period",
        type: "number",
        default_value: 20,
        min_value: 10,
        max_value: 50,
        description: "Bollinger Band period"
      },
      {
        name: "bb_std_dev",
        type: "number",
        default_value: 2.0,
        min_value: 1.0,
        max_value: 3.0,
        description: "Standard deviation multiplier"
      },
      {
        name: "mean_reversion_threshold",
        type: "number",
        default_value: 0.1,
        min_value: 0.05,
        max_value: 0.2,
        description: "Distance from band for entry"
      }
    ],
    historical_performance: {
      sharpe_ratio: 1.67,
      max_drawdown: -8.9,
      win_rate: 0.64
    }
  },
  {
    id: "ml_signal_strategy",
    name: "ML Signal Strategy",
    type: "ml_based",
    description: "AI-powered strategy using multiple ML models",
    complexity: "advanced",
    example_assets: ["BTC", "ETH", "SOL", "AAPL"],
    parameters: [
      {
        name: "model_types",
        type: "multiselect",
        default_value: ["lstm", "xgboost"],
        options: ["lstm", "xgboost", "random_forest", "svm"],
        description: "ML models to use"
      },
      {
        name: "confidence_threshold",
        type: "number",
        default_value: 0.7,
        min_value: 0.5,
        max_value: 0.95,
        description: "Minimum prediction confidence"
      },
      {
        name: "ensemble_method",
        type: "select",
        default_value: "weighted_average",
        options: ["majority_vote", "weighted_average", "stacking"],
        description: "Model ensemble method"
      }
    ],
    historical_performance: {
      sharpe_ratio: 2.13,
      max_drawdown: -6.2,
      win_rate: 0.72
    }
  }
];

export default function StrategyLab() {
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyTemplate | null>(null);
  const [strategyName, setStrategyName] = useState("");
  const [selectedAsset, setSelectedAsset] = useState("BTC");
  const [selectedIndicators, setSelectedIndicators] = useState<string[]>([]);
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [builtStrategies, setBuiltStrategies] = useState<BuiltStrategy[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const availableIndicators = [
    "RSI", "MACD", "Bollinger Bands", "Moving Average", "Volume SMA",
    "ATR", "Stochastic", "Williams %R", "CCI", "OBV"
  ];

  const availableAssets = [
    "BTC", "ETH", "SOL", "ADA", "DOT", "LINK",
    "AAPL", "NVDA", "MSFT", "GOOGL", "TSLA", "META"
  ];

  useEffect(() => {
    if (selectedTemplate) {
      // Initialize parameters with default values
      const defaultParams: Record<string, any> = {};
      selectedTemplate.parameters.forEach(param => {
        defaultParams[param.name] = param.default_value;
      });
      setParameters(defaultParams);
      
      // Set strategy name
      setStrategyName(`${selectedTemplate.name} - ${selectedAsset}`);
    }
  }, [selectedTemplate, selectedAsset]);

  useEffect(() => {
    fetchBuiltStrategies();
  }, []);

  const fetchBuiltStrategies = async () => {
    try {
      const response = await api.strategy.getStrategies();
      setBuiltStrategies(response.strategies || []);
    } catch (error) {
      console.error("Failed to fetch strategies:", error);
    }
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  const buildStrategy = async () => {
    if (!selectedTemplate || !strategyName || !selectedAsset) {
      alert("Please select template, asset, and provide strategy name");
      return;
    }

    try {
      const strategyConfig = {
        name: strategyName,
        template_id: selectedTemplate.id,
        asset: selectedAsset,
        indicators: selectedIndicators,
        parameters: parameters,
        risk_management: {
          stop_loss: parameters.stop_loss || 0.02,
          take_profit: parameters.take_profit || 0.05,
          position_size: parameters.position_size || 0.1
        }
      };

      await api.strategy.createStrategy(strategyConfig);
      alert("Strategy created successfully!");
      fetchBuiltStrategies();
      
      // Reset form
      setSelectedTemplate(null);
      setStrategyName("");
      setSelectedIndicators([]);
      setParameters({});
      
    } catch (error) {
      console.error("Failed to create strategy:", error);
      alert("Failed to create strategy");
    }
  };

  const testStrategy = async (strategyId: string) => {
    try {
      await api.backtesting.startBacktest({
        strategy_id: strategyId,
        start_date: "2023-01-01",
        end_date: "2024-01-01",
        initial_capital: 10000
      });
      alert("Backtest started!");
    } catch (error) {
      console.error("Failed to start backtest:", error);
    }
  };

  const renderParameterInput = (param: StrategyParameter) => {
    const value = parameters[param.name];

    switch (param.type) {
      case "number":
        return (
          <input
            type="number"
            value={value || param.default_value}
            onChange={(e) => handleParameterChange(param.name, parseFloat(e.target.value))}
            min={param.min_value}
            max={param.max_value}
            step={param.name.includes("threshold") ? 0.01 : 1}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
        );
      
      case "boolean":
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value !== undefined ? value : param.default_value}
              onChange={(e) => handleParameterChange(param.name, e.target.checked)}
              className="rounded"
            />
            <span>Enabled</span>
          </label>
        );
      
      case "select":
        return (
          <select
            value={value || param.default_value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          >
            {param.options?.map(option => (
              <option key={option} value={option}>
                {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </option>
            ))}
          </select>
        );
      
      case "multiselect":
        const selectedValues = value || param.default_value || [];
        return (
          <div className="space-y-2">
            {param.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option);
                    handleParameterChange(param.name, newValues);
                  }}
                  className="rounded"
                />
                <span className="capitalize">{option.replace('_', ' ')}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return (
          <input
            type="text"
            value={value || param.default_value}
            onChange={(e) => handleParameterChange(param.name, e.target.value)}
            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Strategy Lab</h1>
            <p className="text-gray-400 mt-1">Build, test, and optimize trading strategies</p>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showAdvanced ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-600 hover:bg-gray-700"
              }`}
            >
              {showAdvanced ? "Simple Mode" : "Advanced Mode"}
            </button>
            <button 
              onClick={fetchBuiltStrategies}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Strategy Templates */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-gray-900/50 border-gray-800">
              <h3 className="text-lg font-semibold mb-4">🧬 Strategy Templates</h3>
              
              <div className="space-y-3">
                {STRATEGY_TEMPLATES.map((template) => (
                  <div 
                    key={template.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id 
                        ? "bg-emerald-600/20 border-emerald-500" 
                        : "bg-gray-800/50 border-gray-700 hover:border-gray-600"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <Badge className={`mt-1 text-xs ${
                          template.type === "momentum" ? "bg-green-600" :
                          template.type === "mean_reversion" ? "bg-blue-600" :
                          template.type === "ml_based" ? "bg-purple-600" :
                          "bg-gray-600"
                        }`}>
                          {template.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Badge className={`text-xs ${
                        template.complexity === "beginner" ? "bg-green-700" :
                        template.complexity === "intermediate" ? "bg-yellow-700" :
                        "bg-red-700"
                      }`}>
                        {template.complexity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                    
                    {template.historical_performance && (
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Sharpe:</span>
                          <span className="text-emerald-400">{template.historical_performance.sharpe_ratio}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Max DD:</span>
                          <span className="text-red-400">{template.historical_performance.max_drawdown}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Win Rate:</span>
                          <span>{(template.historical_performance.win_rate * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Strategy Builder */}
          <div className="lg:col-span-2">
            {selectedTemplate ? (
              <div className="space-y-6">
                
                {/* Basic Configuration */}
                <Card className="p-6 bg-gray-900/50 border-gray-800">
                  <h3 className="text-lg font-semibold mb-4">⚙️ Strategy Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Strategy Name</label>
                      <input
                        type="text"
                        value={strategyName}
                        onChange={(e) => setStrategyName(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                        placeholder="Enter strategy name..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Target Asset</label>
                      <select
                        value={selectedAsset}
                        onChange={(e) => setSelectedAsset(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
                      >
                        {availableAssets.map(asset => (
                          <option key={asset} value={asset}>{asset}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Indicators Selection */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-2">Technical Indicators</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableIndicators.map(indicator => (
                        <label key={indicator} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedIndicators.includes(indicator)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIndicators(prev => [...prev, indicator]);
                              } else {
                                setSelectedIndicators(prev => prev.filter(i => i !== indicator));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{indicator}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Parameters */}
                <Card className="p-6 bg-gray-900/50 border-gray-800">
                  <h3 className="text-lg font-semibold mb-4">🎛️ Strategy Parameters</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedTemplate.parameters.map((param) => (
                      <div key={param.name}>
                        <label className="block text-sm font-medium mb-2 capitalize">
                          {param.name.replace(/_/g, ' ')}
                        </label>
                        {renderParameterInput(param)}
                        <p className="text-xs text-gray-400 mt-1">{param.description}</p>
                      </div>
                    ))}
                  </div>

                  {showAdvanced && (
                    <div className="mt-6 pt-6 border-t border-gray-700">
                      <h4 className="font-medium mb-4">🛡️ Risk Management</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Stop Loss (%)</label>
                          <input
                            type="number"
                            value={parameters.stop_loss || 2}
                            onChange={(e) => handleParameterChange("stop_loss", parseFloat(e.target.value))}
                            step="0.1"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Take Profit (%)</label>
                          <input
                            type="number"
                            value={parameters.take_profit || 5}
                            onChange={(e) => handleParameterChange("take_profit", parseFloat(e.target.value))}
                            step="0.1"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Position Size (%)</label>
                          <input
                            type="number"
                            value={parameters.position_size || 10}
                            onChange={(e) => handleParameterChange("position_size", parseFloat(e.target.value))}
                            step="1"
                            className="w-full p-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </Card>

                {/* Build Strategy */}
                <Card className="p-6 bg-gray-900/50 border-gray-800">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">🚀 Build Strategy</h3>
                      <p className="text-sm text-gray-400">Create strategy and run initial validation</p>
                    </div>
                    <button
                      onClick={buildStrategy}
                      disabled={!strategyName || !selectedAsset}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
                    >
                      🧪 Build & Test Strategy
                    </button>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center bg-gray-900/50 border-gray-800">
                <div className="text-6xl mb-4">🧬</div>
                <h3 className="text-xl font-semibold mb-2">Select Strategy Template</h3>
                <p className="text-gray-400">Choose a strategy template from the left panel to start building</p>
              </Card>
            )}
          </div>
        </div>

        {/* Built Strategies */}
        {builtStrategies.length > 0 && (
          <Card className="p-6 bg-gray-900/50 border-gray-800">
            <h3 className="text-lg font-semibold mb-4">📋 Your Strategies</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {builtStrategies.map((strategy) => (
                <div key={strategy.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{strategy.name}</h4>
                      <p className="text-sm text-gray-400">{strategy.asset}</p>
                    </div>
                    <Badge className={`text-xs ${
                      strategy.status === "deployed" ? "bg-emerald-600" :
                      strategy.status === "validated" ? "bg-blue-600" :
                      strategy.status === "testing" ? "bg-yellow-600" :
                      "bg-gray-600"
                    }`}>
                      {strategy.status}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1 mb-3">
                    <div>Indicators: {strategy.indicators.join(", ")}</div>
                    <div className="text-gray-400">Created: {strategy.created_at}</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => testStrategy(strategy.id)}
                      className="flex-1 py-2 text-xs bg-blue-600 hover:bg-blue-700 rounded font-medium transition-colors"
                    >
                      📊 Backtest
                    </button>
                    <button className="flex-1 py-2 text-xs bg-gray-600 hover:bg-gray-700 rounded font-medium transition-colors">
                      📝 Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}