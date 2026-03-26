# 🚀 Trading OS — MVP Task List

> **Goal:** First paper trade end-to-end with historical market data  
> **Scope:** Local testing only · Historical data · Minimum viable pipeline  
> **Capital:** $5,000 ready (paper trading with Alpaca)

---

## 📋 MILESTONE: First Paper Trade (Local End-to-End)

### Phase 1: Load Historical Data Into DB
- [ ] **[DATA-01]** Create `load_historical_data.py` script to fetch historical OHLCV data
  - Input: symbol (e.g., "BTC", "AAPL"), source (coingecko/yahoo), days (default 90)
  - Output: Insert rows into `market_candles` table
  - Use: CoinGeckoClient for crypto, YahooFinanceClient for stocks
- [ ] **[DATA-02]** Load BTC (90 days) from CoinGecko
- [ ] **[DATA-03]** Load AAPL (90 days) from Yahoo Finance
- [ ] **[DATA-04]** Optional: Load more assets you want to trade (ETH, SPY, MSFT, etc)
- [ ] **[DATA-05]** Verify data: `SELECT COUNT(*) FROM market_candles;` should show rows

### Phase 2: Deploy Services Locally
- [ ] **[SVC-01]** `docker-compose up -d` (all 9 services)
- [ ] **[SVC-02]** Verify data_ingestion service: `GET http://localhost:3009/health`
- [ ] **[SVC-03]** Verify execution service: `GET http://localhost:3004/health`
- [ ] **[SVC-04]** Store Alpaca credentials in Config vault: `POST http://localhost:3007/credentials`

### Phase 3: Test Paper Trading
- [ ] **[PAPER-01]** Initialize trading_system with Alpaca credentials in PAPER mode
- [ ] **[PAPER-02]** Place paper order: `POST /execution/place-trade` (0.01 BTC)
- [ ] **[PAPER-03]** Verify trade in DB: `SELECT * FROM trades WHERE status='filled'`
- [ ] **[PAPER-04]** Verify positions: `GET /execution/positions` shows open position

### Phase 4: Full Pipeline End-to-End
- [ ] **[PIPE-01]** Trigger: Historical Data → Strategy → Risk → Alpaca Order → Portfolio
- [ ] **[PIPE-02]** No errors in service logs
- [ ] **[PIPE-03]** Trade visible in Analytics: `GET /analytics/trades`
- [ ] **[DONE]** 🎉 First paper trade complete

---

## 🛠️ Critical Tasks (Must Do)

| Task | File | Why |
|------|------|-----|
| Load historical data | Create `load_historical_data.py` | Can't test without data |
| Deploy services | `docker-compose up` | Can't run end-to-end without infrastructure |
| Store credentials | POST to Config vault | Alpaca client needs API keys |
| Test paper order | POST /execution/place-trade | Verify trading_system works |

---

## 📊 Symbols to Load (Pick What You Want to Trade)

### Crypto (CoinGecko)
```
BTC, ETH, SOL, ADA
```

### Stocks (Yahoo Finance)
```
AAPL, MSFT, TSLA, SPY
```

Choose 2-3 total and load them in Phase 1.

---

## 🚀 Quick Start

```bash
# 1. Load historical data
python3 load_historical_data.py --symbol BTC --source coingecko --days 90
python3 load_historical_data.py --symbol AAPL --source yahoo --days 90

# 2. Deploy services
docker-compose up -d

# 3. Test paper trading
curl -X POST http://localhost:3004/execution/place-trade \
  -H "Content-Type: application/json" \
  -d '{"symbol": "BTC", "quantity": 0.01, "side": "buy"}'

# 4. Verify trade in DB
psql -U postgres -d trading_db -c "SELECT * FROM trades;"
```

---

## ✅ Success = All of These Work

1. ✅ Historical data in `market_candles` table
2. ✅ All 9 services running (health checks pass)
3. ✅ Alpaca credentials stored in vault
4. ✅ Paper order placed successfully
5. ✅ Trade recorded in `trades` table
6. ✅ Full pipeline runs without errors

**No live deployment. No external servers. Just localhost end-to-end testing.**
