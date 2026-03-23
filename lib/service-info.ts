/**
 * Detailed Service Information
 * Comprehensive documentation for each microservice
 */

export interface ServiceDetailedInfo {
  overview: string;
  responsibilities: string[];
  keyFeatures: string[];
  endpoints: {
    path: string;
    method: string;
    description: string;
  }[];
  dependencies: string[];
  serviceInteractions: {
    inbound: {
      service: string;
      description: string;
    }[];
    outbound: {
      service: string;
      description: string;
    }[];
  };
  dataFlow: {
    inputs: string[];
    outputs: string[];
  };
  configuration: {
    key: string;
    description: string;
    default?: string;
  }[];
  performance: {
    avgResponseTime: string;
    throughput: string;
  };
}

export const SERVICE_DETAILED_INFO: Record<string, ServiceDetailedInfo> = {
  orchestrator: {
    overview: "The Orchestrator is the brain of the trading system. It coordinates all services in the pipeline, manages the agent voting mechanism for trade decisions, and ensures proper workflow execution from market regime detection through order placement.",
    responsibilities: [
      "Coordinate multi-agent voting system for trade decisions",
      "Manage the full trade pipeline workflow (Strategy → Risk → Execution)",
      "Detect and classify market regimes (trending, ranging, volatile)",
      "Route requests to appropriate services based on context",
      "Aggregate signals from multiple strategies",
      "Handle pipeline failures and implement retry logic",
      "Maintain state consistency across services"
    ],
    keyFeatures: [
      "Multi-agent consensus mechanism with configurable voting weights",
      "Real-time market regime classification using ML models",
      "Pipeline orchestration with dependency resolution",
      "Integration with LLM providers (Anthropic, OpenAI) for decision support",
      "Configurable confidence thresholds for trade execution",
      "Event-driven architecture with async task processing"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health check with dependencies" },
      { path: "/pipeline/trigger", method: "POST", description: "Trigger full trade pipeline execution" },
      { path: "/pipeline/status", method: "GET", description: "Get current pipeline execution status" },
      { path: "/regime/classify", method: "POST", description: "Classify current market regime" },
      { path: "/agents/vote", method: "POST", description: "Initiate agent voting for trade decision" },
      { path: "/config", method: "GET", description: "Get orchestrator configuration" }
    ],
    dependencies: [
      "Strategy Service (generate trading signals)",
      "Risk Service (assess position risk)",
      "Execution Service (place orders)",
      "Config Service (load orchestrator settings)",
      "Local AI Service (regime classification)",
      "PostgreSQL (pipeline state storage)",
      "Redis (task queue and caching)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "User/Frontend", description: "Pipeline trigger requests" },
        { service: "Strategy", description: "Strategy signals for aggregation" },
        { service: "Risk", description: "Risk assessment results" },
        { service: "Local AI", description: "Market regime classifications" }
      ],
      outbound: [
        { service: "Strategy", description: "Request trading signals" },
        { service: "Risk", description: "Send trades for risk assessment" },
        { service: "Execution", description: "Forward approved trades for execution" },
        { service: "Config", description: "Fetch orchestrator configuration" },
        { service: "Local AI", description: "Request regime classification" }
      ]
    },
    dataFlow: {
      inputs: [
        "Market data (price, volume, indicators)",
        "Strategy signals from multiple agents",
        "Risk limits and constraints",
        "User-defined trading parameters"
      ],
      outputs: [
        "Orchestrated trade decisions with consensus scores",
        "Market regime classifications",
        "Pipeline execution events",
        "Aggregated strategy signals"
      ]
    },
    configuration: [
      { key: "MODEL_PROVIDER", description: "LLM provider for AI decisions", default: "anthropic" },
      { key: "VOTING_THRESHOLD", description: "Minimum consensus score to execute trade", default: "0.7" },
      { key: "MAX_PIPELINE_TIMEOUT", description: "Maximum pipeline execution time", default: "30s" },
      { key: "REGIME_LOOKBACK_PERIOD", description: "Candles for regime analysis", default: "100" }
    ],
    performance: {
      avgResponseTime: "100-300ms per pipeline execution",
      throughput: "50-100 decisions per second"
    }
  },

  strategy: {
    overview: "The Strategy service is responsible for generating, evaluating, and managing trading strategies. It implements multiple algorithmic strategies (DCA, Grid, Momentum) and provides a framework for adding custom strategies.",
    responsibilities: [
      "Generate trading signals based on market conditions",
      "Evaluate strategy performance and metrics",
      "Manage strategy lifecycle (create, update, delete, pause)",
      "Calculate position sizing and entry/exit points",
      "Store strategy configurations and historical performance",
      "Backtest strategies against historical data",
      "Provide strategy recommendations based on market regime"
    ],
    keyFeatures: [
      "Built-in strategies: DCA (Dollar Cost Averaging), Grid Trading, Momentum",
      "Strategy templates with customizable parameters",
      "Real-time strategy performance tracking",
      "Risk-adjusted returns calculation (Sharpe, Sortino ratios)",
      "Strategy versioning and A/B testing",
      "Integration with backtesting engine",
      "Multi-timeframe analysis support"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and strategy count" },
      { path: "/strategies", method: "GET", description: "List all configured strategies" },
      { path: "/strategies", method: "POST", description: "Create new strategy" },
      { path: "/strategies/{id}/evaluate", method: "POST", description: "Evaluate strategy against market data" },
      { path: "/strategies/{id}/signals", method: "GET", description: "Get current strategy signals" },
      { path: "/strategies/{id}/performance", method: "GET", description: "Get strategy performance metrics" }
    ],
    dependencies: [
      "Config Service (strategy parameters)",
      "Data Ingestion (market data feed)",
      "PostgreSQL (strategy storage)",
      "Redis (signal caching)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "Orchestrator", description: "Signal generation requests" },
        { service: "User/Frontend", description: "Strategy CRUD operations" },
        { service: "Data Ingestion", description: "Market data for analysis" }
      ],
      outbound: [
        { service: "Orchestrator", description: "Generated trading signals" },
        { service: "Data Ingestion", description: "Request historical data" },
        { service: "Config", description: "Fetch strategy parameters" }
      ]
    },
    dataFlow: {
      inputs: [
        "Real-time market data (OHLCV candles)",
        "Technical indicators (RSI, MACD, Bollinger Bands)",
        "Market regime classification",
        "Portfolio state and available capital"
      ],
      outputs: [
        "Trading signals (BUY/SELL/HOLD)",
        "Position sizing recommendations",
        "Entry/exit price targets",
        "Strategy confidence scores",
        "Performance metrics and analytics"
      ]
    },
    configuration: [
      { key: "DEFAULT_STRATEGY", description: "Default strategy to use", default: "dca" },
      { key: "MAX_POSITION_SIZE", description: "Maximum position size per trade", default: "0.1" },
      { key: "SIGNAL_THRESHOLD", description: "Minimum signal strength to act", default: "0.6" },
      { key: "LOOKBACK_CANDLES", description: "Historical candles for analysis", default: "50" }
    ],
    performance: {
      avgResponseTime: "50-150ms per signal generation",
      throughput: "200+ signals per second"
    }
  },

  risk: {
    overview: "The Risk service acts as a critical safety layer, evaluating every trade for potential losses and ensuring compliance with risk management rules. It prevents catastrophic losses through position limits, drawdown controls, and exposure monitoring.",
    responsibilities: [
      "Assess risk for proposed trades before execution",
      "Monitor portfolio exposure and concentration",
      "Enforce position size limits and leverage constraints",
      "Track maximum drawdown and implement circuit breakers",
      "Calculate Value at Risk (VaR) and Expected Shortfall",
      "Manage stop-loss and take-profit rules",
      "Generate risk alerts and notifications"
    ],
    keyFeatures: [
      "Pre-trade risk assessment with veto power",
      "Real-time portfolio risk monitoring",
      "Dynamic position sizing based on volatility",
      "Correlation analysis for diversification",
      "Stress testing and scenario analysis",
      "Risk limits per asset, strategy, and portfolio",
      "Automatic position reduction on breach"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and risk limits status" },
      { path: "/assess", method: "POST", description: "Assess risk for proposed trade" },
      { path: "/limits", method: "GET", description: "Get current risk limits" },
      { path: "/limits", method: "PUT", description: "Update risk limits" },
      { path: "/portfolio/exposure", method: "GET", description: "Get current portfolio exposure" },
      { path: "/var", method: "POST", description: "Calculate Value at Risk" }
    ],
    dependencies: [
      "Portfolio Service (current positions)",
      "Config Service (risk limit configuration)",
      "Data Ingestion (price data for VaR)",
      "PostgreSQL (risk events storage)",
      "Redis (real-time exposure cache)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "Orchestrator", description: "Trade risk assessment requests" },
        { service: "Portfolio", description: "Current positions for exposure calculation" },
        { service: "Data Ingestion", description: "Volatility data for VaR" }
      ],
      outbound: [
        { service: "Orchestrator", description: "Risk approval/rejection decisions" },
        { service: "Portfolio", description: "Request current portfolio state" },
        { service: "Config", description: "Fetch risk limit configuration" }
      ]
    },
    dataFlow: {
      inputs: [
        "Proposed trade details (symbol, quantity, price)",
        "Current portfolio state",
        "Historical volatility data",
        "Correlation matrices",
        "Risk limits configuration"
      ],
      outputs: [
        "Risk approval/rejection decision",
        "Risk score (0-1 scale)",
        "Recommended position size adjustment",
        "Breach warnings and alerts",
        "Portfolio risk metrics"
      ]
    },
    configuration: [
      { key: "MAX_POSITION_SIZE_PCT", description: "Max position as % of portfolio", default: "10%" },
      { key: "MAX_PORTFOLIO_DRAWDOWN", description: "Maximum allowed drawdown", default: "20%" },
      { key: "MAX_DAILY_LOSS", description: "Maximum loss per day", default: "5%" },
      { key: "VAR_CONFIDENCE_LEVEL", description: "VaR confidence level", default: "0.95" }
    ],
    performance: {
      avgResponseTime: "20-50ms per risk assessment",
      throughput: "500+ assessments per second"
    }
  },

  execution: {
    overview: "The Execution service manages order routing, queue processing, and interaction with exchanges. It handles both paper trading (simulation) and live trading, ensuring orders are executed reliably with proper error handling and retry logic.",
    responsibilities: [
      "Queue and process orders from upstream services",
      "Route orders to appropriate exchanges (Binance, Coinbase, Kraken, Alpaca)",
      "Manage order lifecycle (pending, filled, cancelled, rejected)",
      "Handle partial fills and order amendments",
      "Implement order types (market, limit, stop-loss, take-profit)",
      "Track execution quality and slippage",
      "Store trade history and execution logs"
    ],
    keyFeatures: [
      "Multi-exchange support via CCXT library",
      "Paper trading mode for risk-free testing",
      "Smart order routing for best execution",
      "Redis-based order queue for async processing",
      "Automatic retry with exponential backoff",
      "Real-time order status updates via WebSocket",
      "Execution analytics (fill rate, slippage, fees)"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and queue depth" },
      { path: "/orders", method: "POST", description: "Submit new order" },
      { path: "/orders/{id}", method: "GET", description: "Get order status" },
      { path: "/orders/{id}/cancel", method: "POST", description: "Cancel pending order" },
      { path: "/queue/depth", method: "GET", description: "Get current queue depth" },
      { path: "/trades", method: "GET", description: "Get trade history" }
    ],
    dependencies: [
      "Data Ingestion (credentials for exchange APIs)",
      "Portfolio Service (update positions after fills)",
      "Config Service (execution settings)",
      "PostgreSQL (order and trade storage)",
      "Redis (order queue)",
      "Exchange APIs (Binance, Coinbase, etc.)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "Orchestrator", description: "Approved trade orders" },
        { service: "User/Frontend", description: "Manual order submissions" },
        { service: "Strategy", description: "Direct order placements" }
      ],
      outbound: [
        { service: "Portfolio", description: "Trade fill notifications" },
        { service: "Data Ingestion", description: "Fetch exchange credentials" },
        { service: "Config", description: "Fetch execution settings" },
        { service: "External Exchanges", description: "Order submissions" }
      ]
    },
    dataFlow: {
      inputs: [
        "Order requests from Orchestrator/Strategy",
        "Exchange API credentials from vault",
        "Market price data for limit order placement",
        "Order cancellation requests"
      ],
      outputs: [
        "Order confirmation and fill notifications",
        "Trade execution details",
        "Queue depth and processing metrics",
        "Execution quality reports",
        "Failed order alerts"
      ]
    },
    configuration: [
      { key: "PAPER_MODE", description: "Enable paper trading (no real orders)", default: "true" },
      { key: "DEFAULT_EXCHANGE", description: "Default exchange for orders", default: "binance" },
      { key: "MAX_RETRY_ATTEMPTS", description: "Order submission retries", default: "3" },
      { key: "ORDER_TIMEOUT_SECONDS", description: "Order expiration time", default: "300" }
    ],
    performance: {
      avgResponseTime: "100-500ms per order (depends on exchange)",
      throughput: "10-50 orders per second"
    }
  },

  portfolio: {
    overview: "The Portfolio service maintains the current state of all positions, tracks profit/loss, and provides analytics on portfolio performance. It's the single source of truth for what you own and how it's performing.",
    responsibilities: [
      "Track all open positions across exchanges and assets",
      "Calculate real-time P&L (realized and unrealized)",
      "Maintain portfolio balance and available capital",
      "Generate performance reports and analytics",
      "Track portfolio allocation and diversification",
      "Calculate portfolio-level metrics (total return, Sharpe ratio)",
      "Provide position history and trade journal"
    ],
    keyFeatures: [
      "Real-time position tracking with live P&L",
      "Multi-currency support with automatic conversion",
      "Cost basis tracking (FIFO, LIFO, Average)",
      "Portfolio optimization suggestions",
      "Risk-adjusted return calculations",
      "Historical performance charts",
      "Export to CSV/JSON for external analysis"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and position count" },
      { path: "/positions", method: "GET", description: "Get all open positions" },
      { path: "/positions/{symbol}", method: "GET", description: "Get position for specific asset" },
      { path: "/balance", method: "GET", description: "Get portfolio balance" },
      { path: "/performance", method: "GET", description: "Get performance metrics" },
      { path: "/snapshot", method: "GET", description: "Get complete portfolio snapshot" }
    ],
    dependencies: [
      "Execution Service (trade updates)",
      "Data Ingestion (price data for P&L)",
      "Config Service (portfolio settings)",
      "PostgreSQL (position storage)",
      "Redis (real-time price cache)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "Execution", description: "Trade fill notifications" },
        { service: "Risk", description: "Portfolio state queries" },
        { service: "Analytics", description: "Performance data requests" },
        { service: "Data Ingestion", description: "Price updates for P&L" }
      ],
      outbound: [
        { service: "Risk", description: "Current positions and exposure" },
        { service: "Analytics", description: "Historical trade data" },
        { service: "Data Ingestion", description: "Request price data" },
        { service: "Config", description: "Fetch portfolio settings" }
      ]
    },
    dataFlow: {
      inputs: [
        "Trade fills from Execution service",
        "Real-time price updates from Data Ingestion",
        "Deposits/withdrawals",
        "Fee and commission data"
      ],
      outputs: [
        "Current positions with P&L",
        "Portfolio balance and available capital",
        "Performance metrics (returns, Sharpe, drawdown)",
        "Allocation breakdown by asset/strategy",
        "Transaction history"
      ]
    },
    configuration: [
      { key: "BASE_CURRENCY", description: "Portfolio base currency", default: "USD" },
      { key: "COST_BASIS_METHOD", description: "Cost basis calculation", default: "FIFO" },
      { key: "INCLUDE_FEES_IN_PL", description: "Include fees in P&L", default: "true" },
      { key: "SNAPSHOT_INTERVAL", description: "Performance snapshot frequency", default: "1h" }
    ],
    performance: {
      avgResponseTime: "30-100ms for position queries",
      throughput: "1000+ position updates per second"
    }
  },

  analytics: {
    overview: "The Analytics service processes trading data to generate insights, reports, and visualizations. It performs advanced analysis on strategies, trades, and market conditions to help optimize trading performance.",
    responsibilities: [
      "Generate performance reports and dashboards",
      "Analyze strategy effectiveness and profitability",
      "Calculate advanced metrics (alpha, beta, information ratio)",
      "Identify patterns and anomalies in trading data",
      "Perform attribution analysis (strategy vs market)",
      "Generate risk reports and stress test results",
      "Export data for external analysis tools"
    ],
    keyFeatures: [
      "Real-time analytics dashboard",
      "Strategy comparison and ranking",
      "Trade analysis with drill-down capabilities",
      "Market correlation analysis",
      "Performance attribution",
      "Customizable reports and alerts",
      "Integration with ClickHouse for high-performance queries"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and analytics status" },
      { path: "/reports/performance", method: "GET", description: "Generate performance report" },
      { path: "/reports/strategy", method: "GET", description: "Strategy analysis report" },
      { path: "/metrics", method: "GET", description: "Get key performance metrics" },
      { path: "/charts/equity", method: "GET", description: "Get equity curve data" },
      { path: "/analysis/attribution", method: "POST", description: "Run attribution analysis" }
    ],
    dependencies: [
      "Portfolio Service (position data)",
      "Strategy Service (strategy performance)",
      "Data Ingestion (market data)",
      "PostgreSQL (trade history)",
      "ClickHouse (high-speed analytics)",
      "Redis (cache for computed metrics)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "User/Frontend", description: "Report generation requests" },
        { service: "Portfolio", description: "Trade history for analysis" },
        { service: "Strategy", description: "Strategy performance data" }
      ],
      outbound: [
        { service: "Portfolio", description: "Request trade history" },
        { service: "Strategy", description: "Request strategy metrics" },
        { service: "Data Ingestion", description: "Request benchmark data" },
        { service: "Config", description: "Fetch analytics configuration" }
      ]
    },
    dataFlow: {
      inputs: [
        "Trade history from Portfolio",
        "Strategy signals and performance",
        "Market data and benchmarks",
        "Risk metrics from Risk service"
      ],
      outputs: [
        "Performance dashboards and charts",
        "Strategy rankings and recommendations",
        "Risk-adjusted metrics",
        "Anomaly detection alerts",
        "Exported reports (PDF, CSV, JSON)"
      ]
    },
    configuration: [
      { key: "BENCHMARK_SYMBOL", description: "Benchmark for comparison", default: "SPY" },
      { key: "RISK_FREE_RATE", description: "Risk-free rate for Sharpe", default: "0.04" },
      { key: "ANALYSIS_PERIOD", description: "Default analysis period", default: "30d" },
      { key: "ENABLE_CLICKHOUSE", description: "Use ClickHouse for analytics", default: "false" }
    ],
    performance: {
      avgResponseTime: "200-1000ms for complex reports",
      throughput: "100+ report generations per second"
    }
  },

  config: {
    overview: "The Config service provides centralized configuration management for all services. It acts as the single source of truth for system settings, allowing dynamic configuration changes without service restarts.",
    responsibilities: [
      "Store and serve configuration for all services",
      "Manage environment-specific settings (dev, staging, prod)",
      "Provide configuration versioning and rollback",
      "Validate configuration changes",
      "Notify services of configuration updates",
      "Encrypt sensitive configuration values",
      "Audit configuration changes"
    ],
    keyFeatures: [
      "Centralized configuration store in PostgreSQL",
      "Hot-reload support (no service restart needed)",
      "Configuration inheritance and overrides",
      "Schema validation for config changes",
      "Change history and rollback capability",
      "Service-specific and global configurations",
      "API for CRUD operations on configs"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health check" },
      { path: "/config/{service}", method: "GET", description: "Get config for specific service" },
      { path: "/config/{service}", method: "PUT", description: "Update service configuration" },
      { path: "/config/global", method: "GET", description: "Get global system config" },
      { path: "/config/validate", method: "POST", description: "Validate configuration" },
      { path: "/config/history", method: "GET", description: "Get configuration history" }
    ],
    dependencies: [
      "PostgreSQL (configuration storage)",
      "Redis (config cache and pub/sub)",
      "Vault (for credential management)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "All Services", description: "Configuration fetch requests" },
        { service: "User/Frontend", description: "Configuration update requests" }
      ],
      outbound: [
        { service: "All Services", description: "Configuration push notifications" },
        { service: "Redis", description: "Pub/sub for config change events" }
      ]
    },
    dataFlow: {
      inputs: [
        "Configuration update requests",
        "Configuration queries from services",
        "Default configuration templates",
        "Environment variables"
      ],
      outputs: [
        "Service configurations (JSON)",
        "Configuration change notifications",
        "Validation results",
        "Configuration history"
      ]
    },
    configuration: [
      { key: "CONFIG_CACHE_TTL", description: "Config cache duration", default: "300s" },
      { key: "ENABLE_HOT_RELOAD", description: "Allow config hot-reload", default: "true" },
      { key: "VALIDATE_ON_UPDATE", description: "Validate configs before saving", default: "true" },
      { key: "MAX_HISTORY_ENTRIES", description: "Keep N config versions", default: "50" }
    ],
    performance: {
      avgResponseTime: "10-30ms for config reads (cached)",
      throughput: "5000+ config reads per second"
    }
  },

  local_ai: {
    overview: "The Local AI service provides on-device machine learning capabilities for trading analysis. It runs transformer models locally for market regime classification, sentiment analysis, and pattern recognition without relying on external APIs.",
    responsibilities: [
      "Run ML models locally for real-time inference",
      "Classify market regimes (trending, ranging, volatile)",
      "Perform sentiment analysis on news and social media",
      "Detect chart patterns and technical formations",
      "Generate AI-powered trading insights",
      "Fine-tune models on historical trading data",
      "Manage model lifecycle (download, load, unload)"
    ],
    keyFeatures: [
      "Support for HuggingFace transformers",
      "GPU acceleration (CUDA) when available",
      "Multiple model tiers (fast, balanced, quality)",
      "Automatic model download and caching",
      "Batch inference for efficiency",
      "Model versioning and A/B testing",
      "Memory-optimized model loading"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and loaded models" },
      { path: "/models", method: "GET", description: "List available models" },
      { path: "/models/load", method: "POST", description: "Load specific model" },
      { path: "/inference/regime", method: "POST", description: "Classify market regime" },
      { path: "/inference/sentiment", method: "POST", description: "Analyze text sentiment" },
      { path: "/inference/pattern", method: "POST", description: "Detect chart patterns" }
    ],
    dependencies: [
      "Redis (task queue)",
      "File system (model cache)",
      "NVIDIA GPU (optional, for acceleration)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "Orchestrator", description: "Market regime classification requests" },
        { service: "Strategy", description: "Pattern detection requests" },
        { service: "Analytics", description: "Sentiment analysis requests" }
      ],
      outbound: [
        { service: "Orchestrator", description: "Regime classification results" },
        { service: "Strategy", description: "Pattern detection results" },
        { service: "Redis", description: "Cache inference results" }
      ]
    },
    dataFlow: {
      inputs: [
        "Market data (price, volume) for regime classification",
        "News articles and tweets for sentiment",
        "OHLCV candles for pattern detection",
        "Text prompts for generative tasks"
      ],
      outputs: [
        "Market regime classification (trending/ranging/volatile)",
        "Sentiment scores (-1 to +1)",
        "Detected patterns with confidence scores",
        "AI-generated trading insights",
        "Model performance metrics"
      ]
    },
    configuration: [
      { key: "AI_PERFORMANCE_TIER", description: "Model tier: fast/balanced/quality", default: "balanced" },
      { key: "AI_MAX_MEMORY_GB", description: "Max memory for models", default: "8" },
      { key: "AI_PRELOAD_MODELS", description: "Preload models on startup", default: "true" },
      { key: "AI_AUTO_DOWNLOAD", description: "Auto-download missing models", default: "true" },
      { key: "AI_ENABLE_GPU", description: "Use GPU if available", default: "false" }
    ],
    performance: {
      avgResponseTime: "100-500ms per inference (model dependent)",
      throughput: "10-100 inferences per second"
    }
  },

  data_ingestion: {
    overview: "The Data Ingestion service is the gateway to market data. It fetches real-time and historical data from multiple sources (Binance, CoinGecko, Yahoo Finance, Alpha Vantage), manages API credentials securely, and provides a unified interface for data access.",
    responsibilities: [
      "Ingest real-time market data from multiple sources",
      "Fetch historical OHLCV candles for backtesting",
      "Manage API credentials with AES-256 encryption",
      "Rate limit API requests to avoid bans",
      "Store price snapshots and candles in PostgreSQL",
      "Provide database browser for exploring stored data",
      "Handle API errors and implement retry logic"
    ],
    keyFeatures: [
      "Multi-source data aggregation (10+ providers)",
      "Encrypted credential vault with web UI",
      "Configurable rate limiting per data source",
      "Database browser with pagination and search",
      "Support for both free and paid APIs",
      "Automatic data source failover",
      "Data quality validation and cleaning"
    ],
    endpoints: [
      { path: "/health", method: "GET", description: "Service health and connector status" },
      { path: "/credentials", method: "POST", description: "Store encrypted credential" },
      { path: "/credentials", method: "GET", description: "List stored credentials" },
      { path: "/fetch/prices", method: "POST", description: "Fetch live prices" },
      { path: "/fetch/candles", method: "POST", description: "Fetch OHLCV candles" },
      { path: "/database/tables", method: "GET", description: "List database tables" },
      { path: "/database/tables/{name}/data", method: "GET", description: "Browse table data" }
    ],
    dependencies: [
      "PostgreSQL (data and credential storage)",
      "Redis (rate limiting)",
      "External APIs (Binance, CoinGecko, etc.)",
      "Vault (encryption master key)"
    ],
    serviceInteractions: {
      inbound: [
        { service: "All Services", description: "Market data fetch requests" },
        { service: "User/Frontend", description: "Credential management operations" },
        { service: "Portfolio", description: "Price data requests for P&L" },
        { service: "Execution", description: "Credential fetch for exchanges" }
      ],
      outbound: [
        { service: "All Services", description: "Real-time market data" },
        { service: "External APIs", description: "Data fetch from providers" },
        { service: "PostgreSQL", description: "Store market data and credentials" }
      ]
    },
    dataFlow: {
      inputs: [
        "Data fetch requests from services",
        "API credentials from users",
        "Rate limit configurations",
        "Data source priorities"
      ],
      outputs: [
        "Real-time price data",
        "Historical OHLCV candles",
        "Data quality metrics",
        "API usage statistics",
        "Database query results"
      ]
    },
    configuration: [
      { key: "VAULT_MASTER_KEY", description: "Encryption key for credentials", default: "change-me" },
      { key: "DEFAULT_DATA_SOURCE", description: "Primary data source", default: "binance_public" },
      { key: "RATE_LIMIT_REQUESTS", description: "Max requests per minute", default: "1000" },
      { key: "CACHE_PRICE_TTL", description: "Price cache duration", default: "60s" }
    ],
    performance: {
      avgResponseTime: "100-500ms per data fetch (API dependent)",
      throughput: "1000+ data points per second"
    }
  }
};
