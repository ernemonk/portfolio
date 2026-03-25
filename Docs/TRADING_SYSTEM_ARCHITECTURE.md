# Trading System — Architecture & Guide

> Consolidated reference for the trading system monitoring platform.
> Covers architecture, setup, backend integration, UI, customization, and troubleshooting.

---

## Overview

A modular, enterprise-grade monitoring and testing platform for 9 FastAPI microservices. The frontend (Next.js 14 / React / TypeScript / Tailwind) provides real-time health dashboards, per-service diagnostics, and an integrated test runner — all behind a professional dark-themed trading UI.

---

## Services

| Icon | Service | Port | Category | Purpose |
|------|---------|------|----------|---------|
| 🎯 | Orchestrator | 3001 | Core | Trade pipeline coordination & agent voting |
| 📈 | Strategy | 3002 | Core | Strategy generation & evaluation |
| ⚠️ | Risk | 3003 | Analysis | Risk assessment & position limits |
| ⚡ | Execution | 3004 | Execution | Order routing & exchange adapters |
| 💼 | Portfolio | 3005 | Analysis | Portfolio tracking & P&L |
| 📊 | Analytics | 3006 | Analysis | Reports, metrics & dashboards |
| ⚙️ | Config | 3007 | Core | Settings, credential vault & DB browser |
| 🤖 | Local AI | 3008 | AI | On-device ML inference |
| 📡 | Data Ingestion | 3009 | Data | Market data fetching & connectors |

---

## Architecture

### Component Map

```
Frontend (Next.js 14 / React / TypeScript)
│
├── Pages
│   ├── /portal/trading              Main dashboard
│   │   └── SystemHealthOverview     9-service card grid
│   │       └── ServiceStatusCard ×9 Clickable, live status
│   │
│   ├── /portal/trading/[serviceId]  Per-service detail
│   │   └── ServiceDetailView        Health, resources, tests
│   │
│   └── /portal/config               Settings, credentials, DB browser
│
├── API Layer  (lib/)
│   ├── service-registry.ts          Ports, endpoints, colors, icons
│   ├── service-health.ts            Health checks, test runner, streaming
│   ├── service-info.ts              Rich descriptions & endpoint docs
│   └── trading-api.ts               Trading-specific helpers
│
├── Components  (components/portal/)
│   ├── ServiceStatusCard.tsx        Individual service card
│   ├── SystemHealthOverview.tsx     Dashboard grid + auto-refresh
│   ├── ServiceDetailView.tsx        Detail page (metrics + tests)
│   ├── CredentialManager.tsx        Credential vault UI → Config 3007
│   └── DatabaseBrowser.tsx          PostgreSQL table browser → Config 3007
│
└── Shared
    ├── PortalShell.tsx              Sidebar layout & navigation
    └── context/AuthContext.tsx       Firebase Auth wrapper
```

### Data Flow

```
User navigates to /portal/trading
    ↓
SystemHealthOverview mounts
    ↓
getSystemHealthStatus()  →  parallel fetch to all 9 /health endpoints
    ↓
Results rendered in ServiceStatusCard grid
    ↓
User clicks a card  →  /portal/trading/[serviceId]
    ↓
ServiceDetailView loads detailed health, resources, dependencies
    ↓
"Run Tests" → runAllServiceTests(serviceId) → hits /test/* endpoints
    ↓
Auto-refresh every 30 s (configurable)
```

---

## Backend Integration

### Health Endpoint (required)

Every service **must** expose `GET /health` returning:

```json
{
  "status": "ok | degraded | error",
  "service": "strategy",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": 1626000000,
  "checks": { "database": "ok", "redis": "ok" },
  "dependencies": { "postgres": "ok", "redis": "ok" },
  "memory": { "used": 1024000, "total": 8192000, "percent": 12.5 },
  "cpu": 45.2
}
```

Minimum viable response (everything except `status` is optional):

```json
{ "status": "ok", "service": "config", "timestamp": 1626000000 }
```

### Test Endpoints (optional)

Services can expose any `/test/*` routes. Register them in `service-registry.ts`:

```python
# FastAPI example
@app.get("/test/database")
async def test_database():
    return {"status": "pass", "data": {"latency_ms": 4}}
```

```typescript
// service-registry.ts
strategy: {
  testEndpoints: ["/strategies", "/test/evaluate-strategy", "/test/database"]
}
```

---

## UI Reference

### Main Dashboard  `/portal/trading`

```
TRADING SYSTEM STATUS                             [Healthy ✓]

🎯 Orchestrator    📈 Strategy       ⚠️ Risk          ⚡ Execution
├─ Healthy ✓      ├─ Healthy ✓      ├─ Healthy ✓     ├─ Healthy ✓
├─ Uptime: 2d 14h ├─ Uptime: 1d 8h  ├─ Uptime: 3h    └─ Queue: 0
└─ Redis: ✓       └─ DB: ✓          └─ Redis: ✓

💼 Portfolio       📊 Analytics      ⚙️ Config         🤖 Local AI
├─ Healthy ✓      ├─ Healthy ✓      ├─ Healthy ✓     ├─ Healthy ✓
├─ Memory: 34%    ├─ CPU: 28%       ├─ Port: 3007    ├─ Models: 3
└─ CPU: 12%       └─ Memory: 51%    └─ Uptime: 4h    └─ Memory: 65%

📡 Data Ingestion
├─ Healthy ✓
└─ Sources: 4
```

### Service Detail  `/portal/trading/orchestrator`

```
← Back to Trading

🎯 ORCHESTRATOR
Coordinates the full trade pipeline and agent voting
Running on: localhost:3001

STATUS                  RESOURCES              DEPENDENCIES
├─ Healthy              ├─ Memory: 12.5%       ├─ PostgreSQL: ✓
├─ Version: 1.0.0       │  ████░░░░░░          ├─ Redis: ✓
├─ Uptime: 2d 14h       └─ CPU: 34.5%          └─ Config: ✓
└─ Last: 2s ago            ████░░░░░░

SERVICE TESTS          [Run Tests]  [Auto ↻]
├─ /test/regime-classification   [PASS]  145ms
│   {"regime":"TRENDING_UP","confidence":0.87}
└─ /test/pipeline-trigger        [PASS]   89ms
    {"status":"ready","agents":4}
```

### Status Colors

| State | Color | Meaning |
|-------|-------|---------|
| 🟢 Healthy | Emerald `#10b981` | Running perfectly, latency < 500 ms |
| 🟡 Degraded | Yellow `#eab308` | Running with issues, latency 500–2000 ms |
| 🔴 Unhealthy | Red `#ef4444` | Not responding / timeout |

---

## Setup & Customization

### Add a New Service

1. Add entry in `lib/service-registry.ts`:

```typescript
new_service: {
  id: "new_service",
  name: "New Service",
  port: 3010,
  baseUrl: "http://localhost:3010",
  description: "My new service",
  category: "core",
  icon: "🚀",
  color: "from-green-500 to-emerald-600",
  healthEndpoint: "/health",
  testEndpoints: ["/test/status"],
}
```

2. Append to `SERVICE_ORDER` array.
3. Add rich docs in `lib/service-info.ts`.
4. Card appears automatically on next refresh.

### Change Refresh Interval

```tsx
<SystemHealthOverview autoRefresh={true} refreshInterval={60000} />
```

### Customize Card Appearance

```typescript
// In service-registry.ts
icon: "🔥",                                 // any emoji
color: "from-blue-500 to-cyan-600",         // Tailwind gradient
category: "core" | "execution" | "analysis" | "ai"
```

---

## API Layer Reference

```typescript
import { checkServiceHealth } from "@/lib/service-health";
import { getService } from "@/lib/service-registry";

// Single service health
const svc = getService("orchestrator");
const health = await checkServiceHealth(svc);

// All services
import { getSystemHealthStatus } from "@/lib/service-health";
const system = await getSystemHealthStatus();

// Run tests
import { runAllServiceTests } from "@/lib/service-health";
const results = await runAllServiceTests("strategy");

// Stream metrics (async generator)
import { streamServiceMetrics } from "@/lib/service-health";
for await (const m of streamServiceMetrics("risk", 5000, 30000)) {
  console.log(m);
}
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Cards show "Unhealthy" | Service not running | `docker-compose up -d` |
| "Failed to load system health" | All services down or network issue | Check ports, restart containers |
| Tests not running | Endpoints not registered | Add paths to `testEndpoints` in registry |
| Cards not updating | Auto-refresh off or component error | Click manual refresh; check browser console |
| Detail page 404 | Service ID not in registry | Verify `SERVICE_ORDER` includes the service |

---

## Performance Notes

- **Parallel health checks** — all 9 services queried concurrently
- **15 s timeout** per service; system continues if one fails
- **30 s auto-refresh** (configurable per component)
- **Component memoization** — avoids unnecessary re-renders
- **~2 MB memory footprint** for all monitoring state

---

## Security (Production)

- Dev mode uses plain HTTP on localhost
- Production should add: HTTPS/TLS, API authentication, rate limiting, request validation
- Credential vault uses AES-256 Fernet encryption; master key via `VAULT_MASTER_KEY` env var
- The `/credentials/{id}/decrypt` plaintext endpoint has been removed from Data Ingestion

---

## Roadmap

- [ ] Historical health trend charts
- [ ] Threshold-based alerts (email / Slack)
- [ ] SLA tracking dashboard
- [ ] Custom test scenarios & load testing
- [ ] ML-based anomaly detection on service metrics

---

*Last updated: March 25, 2026 — v1.1 (consolidated from 5 docs)*
