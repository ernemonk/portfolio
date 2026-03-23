# Trading System - Visual Reference & Quick Start

## 🎯 What You Have Now

A complete enterprise trading system monitoring platform with real-time health checks and integrated testing for all 8 microservices.

## 📱 User Interface Flow

### Main Dashboard `/portal/trading`

```
┌─────────────────────────────────────────────────────────┐
│ TRADING   [► Run Pipeline] [↻ Refresh]                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ SYSTEM STATUS                            [Healthy ✓]    │
│                                                         │
│ 🎯 Orchestrator        🔴 Healthy                      │
│ ├─ Status: Healthy         📈 Analytics   🔴 Healthy   │
│ ├─ Uptime: 2d 14h          ├─ Status: Healthy          │
│ └─ Redis: ok               └─ Memory: 34.2%            │
│                                                         │
│ 📈 Strategy            🔴 Healthy         ⚙️ Config     │
│ ├─ Status: Healthy         🔴 Healthy                  │
│ ├─ Uptime: 1d 8h          └─ Port: 3007                │
│ └─ DB: ok                                              │
│                                                         │
│ ⚠️ Risk                🔴 Healthy         🤖 Local AI    │
│ ├─ Status: Healthy         🔴 Healthy                  │
│ ├─ Uptime: 3h 22m         ├─ Models: 3                 │
│ └─ Redis: ok               └─ Memory: 65.1%            │
│                                                         │
│ ⚡ Execution          🔴 Healthy                        │
│ ├─ Status: Healthy        [...more cards]              │
│ ├─ Queue: 0                                            │
│ └─ Memory: 12.5%                                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ STRATEGIES                                              │
│ ├─ DCA (Dollar-Cost Averaging)    [ENABLED]           │
│ ├─ Grid Trading                   [ENABLED]           │
│ ├─ Momentum (RSI)                 [DISABLED]          │
│ └─ MA Crossover                   [ENABLED]           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ EXECUTION QUEUE                                        │
│ Pending Orders: 0                          📦          │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Last updated: 10:42:33 AM                              │
└─────────────────────────────────────────────────────────┘
```

### Service Detail Page `/portal/trading/orchestrator`

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Trading                                       │
│                                                         │
│ 🎯 ORCHESTRATOR                                         │
│ Coordinates the full trade pipeline and agent voting   │
│ Running on: localhost:3005                             │
│                                                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ STATUS                    │ RESOURCES               │ │
│ ├─ Status: Healthy         │ Memory: 12.5%           │ │
│ ├─ Version: 1.0.0          │ ████░░░░░░░            │ │
│ ├─ Uptime: 2d 14h          │ 1024MB / 8192MB         │ │
│ ├─ Last Check: 2s ago      │                         │ │
│ │                          │ CPU: 34.5%              │ │
│ │                          │ ████░░░░░░░            │ │
│ └────────────────────────────────────────────────────┘ │
│                                                         │
│ DEPENDENCIES                                            │
│ ├─ PostgreSQL ✓ ok                                     │
│ ├─ Redis ✓ ok                                          │
│ └─ Config Service ✓ ok                                 │
│                                                         │
│ SERVICE TESTS        [Run Tests]  [Auto] [Manual] [↻]  │
│                                                         │
│ ├─ /test/regime-classification                         │
│   [PASS] 145ms                                         │
│   Data: {"regime": "TRENDING_UP", "confidence": 0.87} │
│                                                         │
│ ├─ /test/pipeline-trigger                              │
│   [PASS] 89ms                                          │
│   Data: {"status": "ready", "agents": 4}              │
│                                                         │
│ SYSTEM CHECKS                                           │
│ ├─ Database Connection: ✓ ok                           │
│ ├─ Redis Connection: ✓ ok                              │
│ ├─ Agent Pool: ✓ ready                                 │
│ └─ Pipeline Status: ✓ active                           │
│                                                         │
│ [Last updated: 10:42:33 AM]                            │
└─────────────────────────────────────────────────────────┘
```

## 🏗️ Component Architecture

```
App Router
  │
  ├─ /portal/trading
  │  └─ TradingPage
  │     ├─ SystemHealthOverview
  │     │  ├─ ServiceStatusCard (Orchestrator)
  │     │  ├─ ServiceStatusCard (Strategy)
  │     │  ├─ ServiceStatusCard (Risk)
  │     │  ├─ ServiceStatusCard (Execution)
  │     │  ├─ ServiceStatusCard (Portfolio)
  │     │  ├─ ServiceStatusCard (Analytics)
  │     │  ├─ ServiceStatusCard (Config)
  │     │  └─ ServiceStatusCard (Local AI)
  │     ├─ StrategySection
  │     └─ ExecutionQueueSection
  │
  └─ /portal/trading/[serviceId]
     └─ ServicePage
        └─ ServiceDetailView
           ├─ HealthMetricsDisplay
           ├─ ResourceMonitor
           ├─ TestRunner
           └─ SystemChecksDisplay
```

## 🔄 Data Flow Diagram

```
                    ┌──────────────────────┐
                    │   User Browser       │
                    └──────────┬───────────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         ┌──────▼──────┐           ┌─────────▼────────┐
         │ Main Page   │           │ Service Detail   │
         │ /portal/... │           │ /portal/.../[id] │
         └──────┬──────┘           └─────────┬────────┘
                │                            │
      ┌─────────┴────────┐         ┌─────────┴────────┐
      │                  │         │                  │
   ┌──▼───┐       ┌──────▼──┐  ┌──▼────┐      ┌──────▼──┐
   │System│       │Service  │  │Check  │      │Run      │
   │Health│       │Health   │  │Tests  │      │Tests    │
   │Over- │       │API      │  │Btn    │      │Btn      │
   │view  │       │Layer    │  │       │      │         │
   └──┬───┘       └──────┬──┘  └──┬────┘      └──────┬──┘
      │                  │         │                  │
      │                  └──┬──────┴──────────────────┘
      │                     │
      ├─────────────────────┤
      │                     │
   ┌──▼──────────────────────▼──────┐
   │  Service Health API             │
   │  (service-health.ts)            │
   │                                 │
   │  • checkServiceHealth()          │
   │  • getSystemHealthStatus()       │
   │  • runServiceTest()              │
   │  • runAllServiceTests()          │
   └──┬──────────────────────────────┘
      │
   ┌──▼──────────────────────────────┐
   │  Service Registry               │
   │  (service-registry.ts)          │
   │                                 │
   │  • SERVICES[] (config)          │
   │  • SERVICE_ORDER[]              │
   │  • Port mappings                │
   │  • Test endpoints               │
   └──┬──────────────────────────────┘
      │
      ├─────────┬─────────┬────────┬────────┬────────┬────────┬────────┬────────┐
      │         │         │        │        │        │        │        │        │
   ┌──▼──┐  ┌───▼──┐  ┌───▼──┐ ┌──▼──┐ ┌──▼──┐ ┌───▼──┐ ┌───▼──┐ ┌───▼──┐
   │3005 │  │3002  │  │3003  │ │3004 │ │3005 │ │3006  │ │3007  │ │3008  │
   │Orch.│  │Strat.│  │Risk  │ │Exec.│ │Port.│ │Ana.  │ │Conf. │ │A.I.  │
   └─────┘  └──────┘  └──────┘ └─────┘ └─────┘ └──────┘ └──────┘ └──────┘
```

## 📊 Service Status Colors

```
🟢 Healthy    = Service running perfectly
   • Color: Emerald green (#10b981)
   • Icon: ✓ checkmark
   • Uptime: Normal
   • Latency: <500ms

🟡 Degraded   = Service running but issues
   • Color: Yellow (#eab308)
   • Icon: ⚠ warning
   • Uptime: Reduced
   • Latency: 500-2000ms

🔴 Unhealthy  = Service not responding
   • Color: Red (#ef4444)
   • Icon: ✗ error
   • Uptime: None
   • Latency: Timeout
```

## 🎨 UI Customization Reference

### Colors (Tailwind)
```tsx
// Existing examples in registry
"from-purple-500 to-purple-600"   // Orchestrator
"from-blue-500 to-blue-600"       // Strategy
"from-amber-500 to-orange-600"    // Risk
"from-green-500 to-emerald-600"   // Execution
"from-cyan-500 to-blue-600"       // Portfolio
"from-pink-500 to-rose-600"       // Analytics
"from-slate-500 to-gray-600"      // Config
"from-indigo-500 to-purple-600"   // Local AI
```

### Icons (Emoji)
```
🎯 Orchestrator
📈 Strategy
⚠️  Risk
⚡ Execution
💼 Portfolio
📊 Analytics
⚙️  Config
🤖 Local AI
```

## 🚀 Quick Start Checklist

- [ ] All 8 services have `/health` endpoints
- [ ] Services running on correct ports (3002-3008)
- [ ] Frontend started with `npm run dev`
- [ ] Navigate to `/portal/trading`
- [ ] Verify 8 service cards display
- [ ] Click a card → detail page loads
- [ ] "Run Tests" button works (if endpoints defined)
- [ ] Auto-refresh updates timestamps
- [ ] Status indicators change correctly

## 📝 API Endpoint Reference

### Health Endpoints (Required)
```
GET http://localhost:3005/health    (Orchestrator)
GET http://localhost:3002/health    (Strategy)
GET http://localhost:3003/health    (Risk)
GET http://localhost:3004/health    (Execution)
GET http://localhost:3005/health    (Portfolio)
GET http://localhost:3006/health    (Analytics)
GET http://localhost:3007/health    (Config)
GET http://localhost:3008/health    (Local AI)
```

### Test Endpoints (Optional, customizable)
```
GET http://localhost:3005/test/regime-classification
GET http://localhost:3005/test/pipeline-trigger
GET http://localhost:3002/strategies
GET http://localhost:3002/test/evaluate-strategy
...
```

## 💡 Common Tasks

### Add a New Service
1. Add to `SERVICES` in `service-registry.ts`
2. Update `SERVICE_ORDER` array
3. Define `/health` endpoint in backend
4. Cards appear automatically

### Change Refresh Interval
```tsx
// In /portal/trading/page.tsx
<SystemHealthOverview 
    autoRefresh={true} 
    refreshInterval={60000}  // Change this (ms)
/>
```

### Add Test Endpoint
```typescript
// In service-registry.ts
testEndpoints: [
    "/health",
    "/test/new-endpoint"  // Add new
]
```

### Customize Card Colors
```typescript
// In service-registry.ts
color: "from-blue-500 to-cyan-600"  // Change this
```

## 🔍 Debugging

### Check Console for Errors
```javascript
// Browser DevTools → Console
// Look for fetch errors or component warnings
```

### Verify Backend Endpoints
```bash
# Test service is accessible
curl http://localhost:3005/health

# Check response format
# Should return JSON with status, service, timestamp
```

### Component State
- React DevTools → Check component props
- Check network tab → Health check requests
- Look for 404/500 errors in responses

## 📚 Documentation Files

```
Portfolio/
├── TRADING_SYSTEM_IMPLEMENTATION.md    (This file - overview)
├── TRADING_SYSTEM_ARCHITECTURE.md      (Detailed design)
├── TRADING_SYSTEM_SETUP.md             (Setup guide)
│
├── lib/
│   ├── service-registry.ts             (Config & types)
│   └── service-health.ts               (API layer)
│
├── components/portal/
│   ├── ServiceStatusCard.tsx           (Card component)
│   ├── SystemHealthOverview.tsx        (Dashboard)
│   └── ServiceDetailView.tsx           (Detail page)
│
└── app/portal/trading/
    ├── page.tsx                        (Main dashboard)
    └── [serviceId]/page.tsx            (Detail route)
```

## ✨ Key Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| 8 Service Monitoring | ✅ Complete | Dashboard grid |
| Real-time Health Checks | ✅ Complete | Auto-refresh |
| Service Detail Pages | ✅ Complete | Click card |
| Resource Monitoring | ✅ Complete | Memory/CPU |
| Integrated Testing | ✅ Complete | "Run Tests" button |
| Dependency Tracking | ✅ Complete | Service detail |
| Professional UI | ✅ Complete | Dark theme |
| Auto-Refresh | ✅ Complete | 30s default |
| Error Handling | ✅ Complete | All components |
| Documentation | ✅ Complete | 3 MD files |

## 🎯 Next Steps

1. **Verify setup** - Navigate to `/portal/trading`
2. **Check services** - Click cards to see details
3. **Run tests** - Click "Run Tests" on detail page
4. **Monitor metrics** - Watch refresh updates
5. **Customize** - Adjust colors, intervals, endpoints
6. **Deploy** - Push to production when ready

---

**Version**: 1.0.0
**Status**: Production Ready ✅
**Last Updated**: March 20, 2026
