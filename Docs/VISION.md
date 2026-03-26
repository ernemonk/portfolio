# 🔭 Trading OS — Vision & Roadmap

> *Building an institutional-grade, AI-powered autonomous trading platform*

---

## 🌟 What Trading OS Is

Trading OS is a **self-hosted, modular trading platform** built with 9 microservices that work together to autonomously analyze markets, generate trade signals, evaluate risk, and execute trades across crypto and equities.

It's designed for a **single operator** who wants full control over their trading infrastructure — no black-box SaaS, no vendor lock-in. Every component is inspectable, configurable, and replaceable.

---

## 🏗️ Architecture Philosophy

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 14.2)              │
│  Trading Portal · React Flow DAG · Tasks/Vision Pages   │
│         Config UI · Credentials · Analytics             │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│            ORCHESTRATOR (Port 3001/3005)                │
│         Pipeline Coordinator · Multi-Agent Voting       │
│         Regime Classification · Trade Routing           │
└───┬──────┬──────┬──────┬──────┬──────┬──────┬───────────┘
    │      │      │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼      ▼      ▼
 Strategy Risk  Exec  Portfolio Analytics Config  AI
  3002   3003  3004    3005     3006    3007  3008
    │                                          │
    └──────────── Data Ingestion ──────────────┘
                    3009
                     │
        ┌────────────┼────────────┐
        │            │            │
    PostgreSQL    Redis      9+ Data APIs
    (84 candles)  (state)    (Binance, Yahoo, etc.)
```

**Core Principles:**
1. **Modularity** — Each service independently deployable, own data-control interface
2. **Safety First** — 6-level risk protection hierarchy, kill switch always available
3. **Paper Before Live** — Full paper trading pipeline validated before live money
4. **Data Sovereignty** — All data stays on your infrastructure
5. **AI-Augmented** — Local + hosted LLMs for market analysis, not black-box signals
6. **Self-Contained Services** — Each microservice has its own admin UI (no unnecessary frontend tabs)

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (COMPLETE)
> *Infrastructure is built, services are running, modules are scaffolded*

- ✅ 10 microservices running in Docker Compose (postgres, redis, 8 services)
- ✅ PostgreSQL with 11 tables, Redis for caching/queues
- ✅ Shared Pydantic models for type-safe inter-service contracts
- ✅ AES-256 credential vault for API key encryption
- ✅ React Flow DAG for system visualization
- ✅ Frontend portal with auth, config management, Tasks & Vision markdown pages
- ✅ 4 built-in trading strategies (DCA, Grid, Momentum RSI, MA-Crossover)
- ✅ 9+ data source connectors (Binance, CoinGecko, Kraken, Yahoo Finance, Alpha Vantage, Coinpaprika, CoinCap, FMP, IEX Cloud)
- ✅ Paper trade execution engine
- ✅ Data Ingestion service with collapsible control panels per source

### Phase 2: Integration 🔄 (IN PROGRESS — Data Flowing)
> *Connect the dots — make data flow end-to-end*

- ✅ Data Ingestion → PostgreSQL (84 BTC/ETH candles loaded)
- ✅ Data source connector testing (9 sources verified)
- ✅ Multi-API symbol discovery (live dropdown menus for coins & stocks)
- 🔄 Strategy signals → Risk evaluation → Execution pipeline
- 🔄 Trade fills → Portfolio position updates
- 🔄 Analytics metrics refresh from actual trade data
- ⬜ First complete paper trade (crypto) end-to-end
- ⬜ First complete paper trade (equities) end-to-end
- ⬜ Audit log for full pipeline traceability

### Phase 3: Hardening 🔲
> *Make it production-ready*

- ⬜ Backend API authentication (Firebase token verification)
- ⬜ Alembic database migrations
- ⬜ Structured logging (replace print statements)
- ⬜ Risk config persistence (survive restarts)
- ⬜ Config hot-reload to running services
- ⬜ Scheduled data polling (cron-based or background workers)
- ⬜ Candle deduplication in data storage
- ⬜ Portfolio PnL calculation from trade history

### Phase 4: Live Trading 🔲
> *Carefully transition from paper to real money*

- ⬜ Exchange API key setup (Binance, Alpaca)
- ⬜ Live order placement with minimum position sizes
- ⬜ Order status tracking and fill confirmation
- ⬜ Trade reconciliation (exchange vs DB)
- ⬜ Risk alerting for circuit breaker events
- ⬜ 24-hour supervised live test with small capital
- ⬜ Kill switch rapid response testing

### Phase 5: Intelligence 🔲
> *Enhance decision-making with AI*

- ⬜ Local FinBERT for crypto/stock sentiment analysis
- ⬜ LLM-powered trade reasoning and journaling
- ⬜ Strategy auto-tuning from meta-agent recommendations
- ⬜ Market regime-aware strategy selection
- ⬜ Anomaly detection on portfolio metrics
- ⬜ Natural language trade queries ("How did BTC momentum perform last week?")

### Phase 6: Scale 🔲
> *Handle more data, more strategies, more assets*

- ⬜ ClickHouse for high-volume analytics
- ⬜ WebSocket streaming for live prices
- ⬜ Custom strategy upload (dynamic loading)
- ⬜ Multi-exchange execution (arbitrage-ready)
- ⬜ Options and futures support
- ⬜ Prometheus + Grafana observability stack
- ⬜ Mobile-responsive trading dashboard

---

## 💰 Supported Markets

### Currently Active (Phase 1-2)
| Market | Data Sources | Execution | Status |
|--------|-------------|-----------|--------|
| **Crypto** | Binance, CoinGecko (19 coins), Kraken, CoinCap, Coinpaprika | Paper (Binance live ready) | ✅ Data flowing |
| **US Equities** | Yahoo Finance (stocks/ETFs), Alpha Vantage, FMP, IEX Cloud | Paper (Alpaca live ready) | ✅ Data flowing |

### Planned (Phase 4+)
| Market | Data Sources | Execution |
|--------|-------------|-----------|
| **Forex** | CCXT Universal | Via CCXT exchanges |
| **Options** | TBD | TBD |
| **Futures** | Binance Futures, CCXT | Via exchange APIs |

---

## 🤖 AI Model Stack

| Model Type | Use Case | Status |
|------------|----------|--------|
| **GPT4All (GGUF)** | General trading analysis, strategy reasoning | ✅ Integrated |
| **FinBERT** | Financial sentiment analysis | ✅ Available |
| **DialoGPT** | Conversational trade assistant | ✅ Available |
| **SentenceTransformers** | Document embeddings, similarity search | ✅ Available |
| **Claude / GPT-4o** | Multi-agent voting on trade decisions | ✅ Integrated |
| **Custom fine-tuned** | Specialized market prediction | 🔲 Planned |

---

## 🎯 Success Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Services running | 10/10 | 10/10 | ✅ All healthy |
| Data sources connected | 9+ | 9 | ✅ All tested |
| Market candles loaded | 100+ | 84 (BTC + ETH) | ✅ Live |
| Paper trades executed | 100+ | 0 | 🔄 Next phase |
| Live trades executed | 10+ | 0 | 🔲 Phase 4 |
| Strategy win rate (paper) | > 55% | Not measured | 🔲 Pending |
| Max drawdown (paper) | < 10% | Not measured | 🔲 Pending |
| System uptime | > 99% | Running (dev) | ⚠️ Dev stage |
| Pipeline latency | < 5s | Not measured | 🔲 Pending |
| Data freshness | < 5 min | Manual only | 🔄 Next phase |

---

## 🧭 Design Decisions

### Why Microservices?
Each trading concern (data, strategy, risk, execution) has different scaling needs and failure modes. A strategy bug shouldn't take down execution. A data source outage shouldn't stop risk checks. Each service has its own admin UI embedded—no need for unnecessary frontend tabs.

### Why Self-Contained Service UIs?
Data Ingestion, Config, and other services each have their own collapsible control panels accessible from the service detail page. This keeps the architecture clean: the orchestrator is your navigation hub (React Flow DAG), and each service page shows operational controls (load data, trigger ingestion, test connectivity) without cluttering the main sidebar.

### Why Local AI?
Hosted LLMs have latency, cost, and privacy concerns. For trading, having a local FinBERT for sentiment and a local GGUF model for analysis means zero API costs for routine operations. Hosted models (Claude, GPT-4o) are used for high-stakes multi-agent voting where quality matters most.

### Why Paper First?
Every automated trading system should prove itself in paper mode before touching real money. The paper adapter simulates realistic fills with configurable slippage. Only after validating the full pipeline works correctly should live mode be enabled.

### Why PostgreSQL + Redis?
PostgreSQL for durability (trades, risk decisions, audit logs must survive restarts). Redis for speed (portfolio snapshots, strategy state, price cache, queues). The combination handles both OLTP and real-time workloads.

---

## 📝 Notes

- This is a **personal trading platform**, not a multi-tenant SaaS
- All services use dev credentials — production deployment will need proper secrets management
- The platform is designed for **swing trading** and **position trading**, not HFT
- Maximum recommended concurrent strategies: 4-6 (limited by risk allocation)
