# Trading System Setup & Implementation Guide

## Quick Start

The new trading module is already integrated! Here's what was created:

### Frontend Components Created

1. **Service Registry** (`lib/service-registry.ts`)
   - Centralized config for 8 microservices
   - Service categories, ports, endpoints, colors, icons

2. **Health API Layer** (`lib/service-health.ts`)
   - Service health checking
   - Parallel health status queries
   - Test execution framework
   - Metric streaming

3. **UI Components**
   - `ServiceStatusCard` - Individual service cards
   - `SystemHealthOverview` - Dashboard grid
   - `ServiceDetailView` - Detailed service page

4. **Pages**
   - `/portal/trading` - Main dashboard with system overview
   - `/portal/trading/[serviceId]` - Service-specific details & testing

## How It Works

### Main Trading Dashboard
When you navigate to `/portal/trading`:

1. ✅ **System Health Grid** displays 8 service cards
2. ✅ Each card shows:
   - Service name & icon
   - Health status (healthy/degraded/unhealthy)
   - Real-time metrics
   - Clickable for detailed view
3. ✅ Cards auto-refresh every 30 seconds
4. ✅ Click any card → Navigate to service detail page

### Service Detail Page
When you click a service card:

1. ✅ Detailed health information
2. ✅ Resource usage (memory, CPU)
3. ✅ Dependency status
4. ✅ **Run Tests button** to execute service tests
5. ✅ System checks display
6. ✅ Toggle auto/manual refresh

## Architecture

```
Frontend:
  /portal/trading              (Main dashboard)
    ├─ SystemHealthOverview    (8 service cards grid)
    │   └─ ServiceStatusCard x8 (clickable cards)
    └─ Strategies section
    └─ Execution queue

  /portal/trading/[serviceId]  (Service detail)
    └─ ServiceDetailView       (Health + tests + metrics)

APIs:
  lib/service-health.ts
    ├─ checkServiceHealth()    (Single service)
    ├─ getSystemHealthStatus() (All services)
    ├─ runServiceTest()        (Individual test)
    └─ runAllServiceTests()    (All tests)

  lib/service-registry.ts
    ├─ SERVICES[]              (8 microservices config)
    └─ SERVICE_ORDER[]         (Order for display)

Backend:
  :3005 Orchestrator
  :3002 Strategy
  :3003 Risk
  :3004 Execution
  :3005 Portfolio
  :3006 Analytics
  :3007 Config
  :3008 Local AI
```

## Backend Requirements

### 1. Health Endpoint
Each service must provide `/health` endpoint:

```python
# Example: FastAPI endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",  # or "degraded" or "error"
        "service": "strategy",
        "version": "1.0.0",
        "uptime": 3600,
        "timestamp": int(time.time()),
        "checks": {
            "database": "ok",
            "redis": "ok",
            "strategies_loaded": "4"
        },
        "dependencies": {
            "postgres": "ok",
            "redis": "ok"
        },
        "memory": {
            "used": 1024000,
            "total": 8192000,
            "percent": 12.5
        },
        "cpu": 45.2
    }
```

### 2. Test Endpoints (Optional)
Services can provide test endpoints:

```python
@app.get("/test/strategies")
async def test_strategies():
    return {
        "status": "pass",
        "data": {"count": 4, "enabled": 3}
    }

@app.get("/test/database")
async def test_database():
    return {"status": "pass"}
```

Update `service-registry.ts` with your test endpoints:

```typescript
strategy: {
    // ...
    testEndpoints: [
        "/strategies",
        "/test/evaluate-strategy",
        "/test/database"
    ]
}
```

## Integration Checklist

- [ ] All 8 services have `/health` endpoints
- [ ] Health endpoints return required JSON structure
- [ ] Services accessible on configured ports
- [ ] Test endpoints implemented (optional)
- [ ] Frontend started (`npm run dev`)
- [ ] Verify `/portal/trading` displays cards
- [ ] Click a card → navigates to detail page
- [ ] Detail page shows health metrics
- [ ] "Run Tests" button works (if endpoints defined)
- [ ] Auto-refresh working (watch timestamps)

## Customization Guide

### Add/Remove Services

Edit `lib/service-registry.ts`:

```typescript
export const SERVICES: Record<string, ServiceConfig> = {
  new_service: {
    id: "new_service",
    name: "New Service",
    port: 3009,
    baseUrl: "http://localhost:3009",
    description: "My new service",
    category: "core",
    icon: "📋",
    color: "from-green-500 to-emerald-600",
    healthEndpoint: "/health",
    testEndpoints: ["/test/status"],
  },
  // ... other services
};

// Update SERVICE_ORDER
export const SERVICE_ORDER = [
  "orchestrator",
  "strategy",
  // ... add "new_service"
];
```

### Customize Colors & Icons

Update service configs:

```typescript
{
    // Change icon (any emoji)
    icon: "🚀",
    
    // Change color gradient (Tailwind colors)
    color: "from-blue-500 to-cyan-600",
    
    // Change category (used for filtering)
    category: "core" | "execution" | "analysis" | "ai"
}
```

### Modify Refresh Interval

In `/app/portal/trading/page.tsx`:

```tsx
<SystemHealthOverview 
    autoRefresh={true} 
    refreshInterval={15000}  // 15 seconds instead of 30
/>
```

### Add Custom Tests

In service detail page, tests run from `testEndpoints`:

```typescript
// Add to registry
testEndpoints: [
    "/health",
    "/test/ping",
    "/test/database",
    "/test/redis",
    "/test/integration"
]

// Implement in backend
@app.get("/test/integration")
async def test_integration():
    # Test all dependencies together
    return {"status": "pass", "duration_ms": 142}
```

## Troubleshooting

### "Service Not Found"
- Service URL not accessible
- Wrong port in registry
- Service not running
- **Fix:** Start backend services with `docker-compose up -d`

### "Failed to load system health"
- Backend services not responding
- Network connectivity issue
- Timeout (15 seconds)
- **Fix:** Check service is running on correct port

### Tests not running
- Test endpoints not defined in registry
- Endpoint returns error
- Wrong endpoint path
- **Fix:** Verify endpoint exists and returns proper JSON

### Cards not updating
- Auto-refresh disabled
- Component unmounted
- API errors (check browser console)
- **Fix:** Click "Refresh" button manually or check network

## Monitoring in Production

```typescript
// Set longer refresh interval for production
<SystemHealthOverview 
    autoRefresh={true} 
    refreshInterval={60000}  // 60 seconds
/>

// Add error logging
onHealthUpdate={(services) => {
    const unhealthy = services.filter(s => s.status !== "healthy");
    if (unhealthy.length > 0) {
        console.error("Unhealthy services:", unhealthy);
        // Send alert to monitoring service
    }
}}
```

## Files Overview

```
Frontend Structure:
├── lib/
│   ├── service-registry.ts     (Service configuration)
│   ├── service-health.ts       (Health/testing APIs)
│   └── trading-api.ts          (Existing trading API)
│
├── components/portal/
│   ├── ServiceStatusCard.tsx   (Service card UI)
│   ├── SystemHealthOverview.tsx (Dashboard grid)
│   ├── ServiceDetailView.tsx   (Detail page)
│   └── PortalShell.tsx         (Existing layout)
│
├── app/portal/trading/
│   ├── page.tsx                (Main dashboard - UPDATED)
│   └── [serviceId]/
│       └── page.tsx            (Service detail page)
│
└── TRADING_SYSTEM_ARCHITECTURE.md (This guide)
```

## Real Example - Full Flow

### 1. User Navigates to Trading
```
User clicks "Trading" → /portal/trading loads
```

### 2. System Health Loads
```
SystemHealthOverview mounts
→ Calls getSystemHealthStatus()
→ Calls checkServiceHealth() for each service in parallel
→ Each service calls http://localhost:PORT/health
→ Results mapped to ServiceStatusCard components
→ Grid displays 8 cards with real-time status
```

### 3. User Clicks "Orchestrator" Card
```
ServiceStatusCard detects click
→ Navigates to /portal/trading/orchestrator
→ ServiceDetailView mounts with serviceId="orchestrator"
→ Loads detailed health via checkServiceHealth()
→ Displays health metrics, resources, dependencies
```

### 4. User Clicks "Run Tests"
```
"Run Tests" button clicked
→ Calls runAllServiceTests("orchestrator")
→ Iterates testEndpoints from registry
→ Makes requests to http://localhost:3005/test/regime-classification etc.
→ Collects results (pass/fail/error)
→ Displays in test results section
→ Shows duration, data, and error messages
```

### 5. Auto-Refresh Updates
```
Every 30 seconds:
→ loadHealth() called automatically
→ checkServiceHealth() re-fetches all services
→ Components re-render with new data
→ User sees updated metrics & status
```

## Performance Tips

1. **Increase refresh interval** for production (60s+)
2. **Cache health data** if multiple components need it
3. **Use React.memo** for components to avoid unnecessary re-renders
4. **Lazy load** test result details
5. **Implement pagination** if adding more than 8 services

## Next Steps

1. ✅ Verify all backend services have `/health` endpoints
2. ✅ Test `/portal/trading` page
3. ✅ Click cards to navigate to detail pages
4. ✅ Run tests from detail pages
5. ✅ Customize refresh intervals for your needs
6. ✅ Add monitoring/alerting as needed
7. ✅ Implement historical metrics tracking
8. ✅ Add email/Slack notifications for alerts

## Support & Questions

- Check `TRADING_SYSTEM_ARCHITECTURE.md` for detailed design
- Review `lib/service-health.ts` for API documentation
- Check `lib/service-registry.ts` for configuration options
- Browser console for error messages and debugging

Happy trading! 🚀
