"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchModelDashboard, configureHostedModel } from "@/lib/trading-api";
import type { LocalModel, HostedModel, ModelDashboardData } from "@/lib/trading-api";
import ModelChat from "./ModelChat";

type Model = LocalModel | HostedModel;

// WORKING chat-capable models - actually functional and tested
const WORKING_MODELS = new Set([
  "orca-mini-3b-gguf2-q4_0",        // ✅ Fast GPT4All model
  "microsoft/DialoGPT-medium",      // ✅ Conversational model
  "ProsusAI/finbert",               // ✅ Sentiment analysis (special output format)
]);

// Chat-capable models that require loading time
const LOADING_REQUIRED_MODELS = new Set([
  "microsoft/phi-2",                                   // ⚠️ Takes 1-2 min to load, may OOM
  "codellama/CodeLlama-7b-Instruct-hf",               // ⚠️ Takes 2-3 min to load
]);

// Models that are NOT available (need download)
const DOWNLOAD_REQUIRED_MODELS = new Set([
  "mistral-7b-instruct-v0.1.Q4_0",                    // GPT4All GGUF not downloaded
  "nous-hermes-llama2-13b.q4_0",                      // GPT4All GGUF not downloaded
]);

// Models that can't be used for chat
const NOT_FOR_CHAT_MODELS = new Set([
  "sentence-transformers/all-MiniLM-L6-v2",           // Embeddings only
  "cognitivecomputations/dolphin-2.6-mixtral-8x7b",   // Download incomplete
]);

const MODEL_DESCRIPTIONS: Record<string, string> = {
  "orca-mini-3b-gguf2-q4_0": "✅ READY: Ultra-fast general-purpose model. Best for real-time trading decisions.",
  "microsoft/DialoGPT-medium": "✅ READY: Conversational AI. Great for interactive Q&A.",
  "ProsusAI/finbert": "✅ READY: Financial sentiment analysis. Returns sentiment scores instead of chat.",
  "microsoft/phi-2": "⏳ SLOW LOAD: Excellent reasoning, but takes 1-2 min to load into memory.",
  "codellama/CodeLlama-7b-Instruct-hf": "⏳ SLOW LOAD: Code specialist, takes 2-3 min to load.",
  "mistral-7b-instruct-v0.1.Q4_0": "❌ NOT DOWNLOADED: Requires GPT4All GGUF file download.",
  "nous-hermes-llama2-13b.q4_0": "❌ NOT DOWNLOADED: Requires GPT4All GGUF file download.",
  "cognitivecomputations/dolphin-2.6-mixtral-8x7b": "❌ INCOMPLETE: Download was interrupted, 26GB model.",
  "sentence-transformers/all-MiniLM-L6-v2": "🔍 EMBEDDINGS ONLY: For document search, not chat.",
};

export default function ModelDashboard() {
  const [localModels, setLocalModels] = useState<LocalModel[]>([]);
  const [hostedModels, setHostedModels] = useState<HostedModel[]>([]);
  const [stats, setStats] = useState<ModelDashboardData["quick_stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "local" | "hosted">("all");
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [filterSpeed, setFilterSpeed] = useState<string>("all");
  const [filterUseCase, setFilterUseCase] = useState<string>("all");

  useEffect(() => {
    fetchModelData();
    const interval = setInterval(fetchModelData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchModelData = async () => {
    try {
      const data = await fetchModelDashboard();
      
      setLocalModels(data.local_models);
      setHostedModels(data.hosted_models);
      setStats(data.quick_stats);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching model data:", error);
      setLoading(false);
    }
  };

  const handleModelSelect = (model: Model) => {
    // Check model availability category
    if (WORKING_MODELS.has(model.id)) {
      // Ready to use immediately
      setSelectedModel(model);
      setSelectedModelId(model.id);
    } else if (LOADING_REQUIRED_MODELS.has(model.id)) {
      // Warn about slow loading but allow
      const proceed = confirm(`⏳ "${model.name}" takes 1-3 minutes to load.\n\nThe first message will be slow while the model loads into memory.\n\nProceed anyway?`);
      if (proceed) {
        setSelectedModel(model);
        setSelectedModelId(model.id);
      }
    } else if (DOWNLOAD_REQUIRED_MODELS.has(model.id)) {
      alert(`❌ Model "${model.name}" is not downloaded.\n\n${MODEL_DESCRIPTIONS[model.id] || "This model requires additional setup."}`);
    } else if (NOT_FOR_CHAT_MODELS.has(model.id)) {
      alert(`🔍 "${model.name}" cannot be used for chat.\n\n${MODEL_DESCRIPTIONS[model.id] || "This model is for embeddings/search only."}`);
    } else {
      // Unknown status - try anyway
      setSelectedModel(model);
      setSelectedModelId(model.id);
    }
  };

  const getStatusBadge = (model: Model) => {
    // Check model availability status
    if (WORKING_MODELS.has(model.id)) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-500/20 text-green-400">
          ✓ Ready
        </span>
      );
    }
    
    if (LOADING_REQUIRED_MODELS.has(model.id)) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-400">
          ⏳ Slow Load
        </span>
      );
    }
    
    if (DOWNLOAD_REQUIRED_MODELS.has(model.id)) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-500/20 text-red-400">
          ❌ Not Downloaded
        </span>
      );
    }
    
    if (NOT_FOR_CHAT_MODELS.has(model.id)) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-500/20 text-gray-400">
          🔍 Not For Chat
        </span>
      );
    }
    
    if (model.category === "local") {
      return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          model.status === "loaded" 
            ? "bg-green-500/20 text-green-400" 
            : "bg-blue-500/20 text-blue-400"
        }`}>
          {model.status === "loaded" ? "✓ Loaded" : "Available"}
        </span>
      );
    } else {
      return (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          model.status === "configured"
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-yellow-500/20 text-yellow-400"
        }`}>
          {model.status === "configured" ? "✓ Ready" : "Setup Required"}
        </span>
      );
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed.toLowerCase()) {
      case "ultra-fast":
        return "text-red-400";
      case "fast":
        return "text-orange-400";
      case "balanced":
        return "text-yellow-400";
      case "slow":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredLocalModels = localModels.filter(m => {
    if (filterSpeed !== "all" && m.speed !== filterSpeed) return false;
    if (filterUseCase !== "all" && !m.use_cases.includes(filterUseCase)) return false;
    return true;
  });

  const filteredHostedModels = hostedModels.filter(m => {
    if (filterSpeed !== "all" && m.speed !== filterSpeed) return false;
    if (filterUseCase !== "all" && !m.use_cases.includes(filterUseCase)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Model Dashboard</h1>
          <p className="text-gray-400 mt-1">Compare local and hosted models for trading</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4"
          >
            <p className="text-sm text-gray-400">Local Models</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{stats.total_local}</p>
            <p className="text-xs text-blue-400/60 mt-1">{stats.local_ready_to_use} installed</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4"
          >
            <p className="text-sm text-gray-400">Hosted Models</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.total_hosted}</p>
            <p className="text-xs text-emerald-400/60 mt-1">{stats.hosted_ready_to_use} configured</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-4"
          >
            <p className="text-sm text-gray-400">Total Available</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">
              {stats.total_local + stats.total_hosted}
            </p>
            <p className="text-xs text-purple-400/60 mt-1">
              {stats.local_ready_to_use + stats.hosted_ready_to_use} ready
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 rounded-xl p-4"
          >
            <p className="text-sm text-gray-400">Ready to Use</p>
            <p className="text-2xl font-bold text-pink-400 mt-1">
              {Math.round(
                ((stats.local_ready_to_use + stats.hosted_ready_to_use) /
                  (stats.total_local + stats.total_hosted)) *
                  100
              )}%
            </p>
            <p className="text-xs text-pink-400/60 mt-1">availability</p>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div>
          <label className="text-sm text-gray-400">Speed:</label>
          <select
            value={filterSpeed}
            onChange={(e) => setFilterSpeed(e.target.value)}
            className="mt-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white hover:border-white/20 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Speeds</option>
            <option value="ultra-fast">Ultra Fast</option>
            <option value="fast">Fast</option>
            <option value="balanced">Balanced</option>
            <option value="slow">Slow</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-400">Use Case:</label>
          <select
            value={filterUseCase}
            onChange={(e) => setFilterUseCase(e.target.value)}
            className="mt-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white hover:border-white/20 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Use Cases</option>
            <option value="real_time_trading">Real-time Trading</option>
            <option value="financial_analysis">Financial Analysis</option>
            <option value="code_generation">Code Generation</option>
            <option value="market_sentiment">Market Sentiment</option>
            <option value="research">Research</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "all"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          All Models ({filteredLocalModels.length + filteredHostedModels.length})
        </button>
        <button
          onClick={() => setActiveTab("local")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "local"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Local ({filteredLocalModels.length})
        </button>
        <button
          onClick={() => setActiveTab("hosted")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "hosted"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-gray-400 hover:text-gray-300"
          }`}
        >
          Hosted ({filteredHostedModels.length})
        </button>
      </div>

      {/* Side-by-Side Model Comparison */}
      <div className="grid grid-cols-2 gap-6">
        {/* Local Models */}
        <div>
          <h2 className="text-xl font-semibold text-blue-400 mb-4">📱 Local Models</h2>
          <div className="space-y-3">
            {(activeTab === "all" || activeTab === "local") && (filteredLocalModels.length > 0 ? (
              filteredLocalModels.map((model) => {
                const isChatCapable = !NOT_FOR_CHAT_MODELS.has(model.id) && !DOWNLOAD_REQUIRED_MODELS.has(model.id);
                const description = MODEL_DESCRIPTIONS[model.id];
                return (
                <motion.div
                  key={model.id}
                  whileHover={{ x: isChatCapable ? 5 : 0 }}
                  onClick={() => handleModelSelect(model)}
                  className={`p-4 rounded-lg border transition-all ${
                    isChatCapable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  } ${
                    selectedModel?.id === model.id
                      ? "bg-blue-500/20 border-blue-500 ring-1 ring-blue-500"
                      : isChatCapable
                      ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                      : "bg-white/[0.02] border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{model.name}</h3>
                        {isChatCapable && (
                          <span className="text-[10px] px-2 py-0.5 bg-emerald-500/30 text-emerald-400 rounded font-mono">Chat ✓</span>
                        )}
                        {!isChatCapable && (
                          <span className="text-[10px] px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded font-mono">Not for chat</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{model.type}</p>
                      {description && (
                        <p className={`text-xs mt-2 ${isChatCapable ? "text-gray-300" : "text-gray-500"}`}>
                          {description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className={`text-xs font-semibold ${getSpeedColor(model.speed)}`}>
                          ⚡ {model.speed}
                        </span>
                        <span className="text-xs text-purple-400">✨ {model.quality}</span>
                        <span className="text-xs text-gray-400">{model.size}</span>
                      </div>
                      {model.use_cases.length > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          For: {model.use_cases.slice(0, 2).join(", ")}
                        </p>
                      )}
                    </div>
                    <div className="ml-2">{getStatusBadge(model)}</div>
                  </div>
                </motion.div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">No local models match filters</p>
            ))}
          </div>
        </div>

        {/* Hosted Models */}
        <div>
          <h2 className="text-xl font-semibold text-emerald-400 mb-4">☁️ Hosted Models</h2>
          <div className="space-y-3">
            {(activeTab === "all" || activeTab === "hosted") && (filteredHostedModels.length > 0 ? (
              filteredHostedModels.map((model) => {
                const isChatCapable = !NOT_FOR_CHAT_MODELS.has(model.id) && !DOWNLOAD_REQUIRED_MODELS.has(model.id);
                const description = MODEL_DESCRIPTIONS[model.id];
                return (
                  <motion.div
                    key={model.id}
                    whileHover={{ x: isChatCapable ? 5 : 0 }}
                    onClick={() => handleModelSelect(model)}
                    className={`p-4 rounded-lg border transition-all ${
                      isChatCapable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                    } ${
                      selectedModel?.id === model.id
                        ? "bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500"
                        : isChatCapable
                        ? "bg-white/[0.03] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                        : "bg-white/[0.02] border-white/5"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white">{model.name}</h3>
                          {isChatCapable && (
                            <span className="text-[10px] px-2 py-0.5 bg-emerald-500/30 text-emerald-400 rounded font-mono">Chat ✓</span>
                          )}
                          {!isChatCapable && (
                            <span className="text-[10px] px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded font-mono">Not for chat</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{model.provider}</p>
                        {description && (
                          <p className={`text-xs mt-2 ${isChatCapable ? "text-gray-300" : "text-gray-500"}`}>
                            {description}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          <span className="text-xs font-semibold text-green-400">
                            ⚡ Instant
                          </span>
                          <span className="text-xs text-purple-400">✨ {model.quality}</span>
                          <span className="text-xs text-orange-400">
                            💰 ${model.cost_per_1k}/1k
                          </span>
                        </div>
                        {model.use_cases.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            For: {model.use_cases.slice(0, 2).join(", ")}
                          </p>
                        )}
                      </div>
                      <div className="ml-2">{getStatusBadge(model)}</div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm">No hosted models match filters</p>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Model Details */}
      {selectedModel && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/10 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Selected Model Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Model ID</p>
              <p className="text-white font-mono text-sm mt-1">{selectedModel.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Category</p>
              <p className="text-white capitalize mt-1">
                {selectedModel.category === "local" ? "📱 Local" : "☁️ Hosted"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Speed</p>
              <p className={`${getSpeedColor(selectedModel.speed)} mt-1`}>
                {selectedModel.speed}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Quality</p>
              <p className="text-purple-400 mt-1">{selectedModel.quality}</p>
            </div>
            {selectedModel.category === "local" && (
              <>
                <div>
                  <p className="text-sm text-gray-400">Size</p>
                  <p className="text-white mt-1">{selectedModel.size}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Type</p>
                  <p className="text-white mt-1">{selectedModel.type}</p>
                </div>
              </>
            )}
            {selectedModel.category === "hosted" && (
              <>
                <div>
                  <p className="text-sm text-gray-400">Provider</p>
                  <p className="text-white mt-1 capitalize">{selectedModel.provider}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Cost</p>
                  <p className="text-orange-400 mt-1">${selectedModel.cost_per_1k}/1k tokens</p>
                </div>
              </>
            )}
          </div>
          {selectedModel.use_cases.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-gray-400">Best For</p>
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedModel.use_cases.map((useCase) => (
                  <span key={useCase} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs">
                    {useCase.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Chat Component - Positioned as floating card */}
      {selectedModelId && (
        <ModelChat selectedModel={selectedModelId} />
      )}
    </div>
  );
}
