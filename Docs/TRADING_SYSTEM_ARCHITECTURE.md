# Trading System Module - Architecture & Implementation

## Overview

This is a comprehensive, modular trading system monitoring and testing platform built for high-end trading platforms. It provides real-time health monitoring, detailed service diagnostics, and integrated testing capabilities for all backend services.

## Architecture

### Core Components

#### 1. **Service Registry** (`lib/service-registry.ts`)
Centralized configuration for all 8 microservices:
- **Orchestrator** (3005) - Trade pipeline coordination
- **Strategy** (3002) - Strategy generation & management
- **Risk** (3003) - Risk assessment
- **Execution** (3004) - Order execution
- **Portfolio** (3005) - Portfolio management
- **Analytics** (3006) - Data analytics & reporting
- **Config** (3007) - Service configuration
- **Local AI** (3008) - Local AI models

Each service includes:
- Port, base URL, description
- Category (core, execution, analysis, ai)
- Health endpoint
- Test endpoints
- Color scheme & icon for UI

#### 2. **Service Health API** (`lib/service-health.ts`)
Utilities for monitoring and testing services:

**Health Check Functions:**
- `checkServiceHealth()` - Check individual service health
- `checkMultipleServices()` - Check multiple services in parallel
- `getSystemHealthStatus()` - Aggregated system health
- `streamServiceMetrics()` - Stream health metrics over time

**Testing Functions:**
- `runServiceTest()` - Run single test endpoint
- `runAllServiceTests()` - Run all tests for a service
- `computeHealthStats()` - Calculate health statistics

#### 3. **UI Components**

##### ServiceStatusCard (`components/portal/ServiceStatusCard.tsx`)
Individual service card display:
- Service name, icon, description
- Real-time health status indicator
- Resource metrics (uptime, memory, CPU)
- Dependency status
- Clickable navigation to service detail page

##### SystemHealthOverview (`components/portal/SystemHealthOverview.tsx`)
Dashboard grid of all services:
- Overall system health status
- 8-column responsive grid
- Auto-refresh capability (configurable interval)
- Error handling and loading states
- Real-time status aggregation

##### ServiceDetailView (`components/portal/ServiceDetailView.tsx`)
Detailed service diagnostics page:
- Comprehensive health information
- Resource usage (memory, CPU)
- Dependency monitoring
- Integrated test runner
- System checks display
- Manual/auto refresh toggle

#### 4. **Main Trading Page** (`app/portal/trading/page.tsx`)
- System health overview (new)
- Strategy management
- Execution queue monitoring
- Pipeline trigger
- Auto-refresh every 30 seconds

#### 5. **Service Detail Pages** (`app/portal/trading/[serviceId]/page.tsx`)
Individual service pages:
- Health status & metrics
- Resource usage
- Available tests
- System checks
- Historical information

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│         Trading Platform Frontend (Next.js)             │
└──────────────────┬──────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐         ┌─────▼──────┐
   │ Trading  │         │ Service    │
   │ Page     │         │ Detail     │
   │(Main)    │         │ Page       │
   └────┬─────┘         └─────┬──────┘
        │                     │
        └──────────┬──────────┘
                   │
        ┌──────────▼──────────────┐
        │ Service Health API      │
        │ (service-health.ts)     │
        └──────────┬──────────────┘
                   │
        ┌──────────▼──────────────┐
        │ Service Registry        │
        │ (service-registry.ts)   │
        └──────────┬──────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼───┐    ┌─────▼──────┐    ┌──▼───┐
│Health │    │ Test       │    │Port  │
│Check  │    │Endpoints   │    │Info  │
│Points │    │            │    │      │
└────────┘    └────────────┘    └───┬──┘
                                     │
    ┌────────────────────────────────┘
    │
    │ (8 Backend Services)
    │
    ├─► :3005 Orchestrator (/health)
    ├─► :3002 Strategy (/health)
    ├─► :3003 Risk (/health)
    ├─► :3004 Execution (/health)
    ├─► :3005 Portfolio (/health)
    ├─► :3006 Analytics (/health)
    ├─► :3007 Config (/health)
    └─► :3008 Local AI (/health)
```

## Features

### 1. **System-wide Health Monitoring**
- Real-time status of all 8 services
- Overall system health aggregation
- Dependency chain validation
- Color-coded status indicators

### 2. **Service-specific Diagnostics**
- Detailed health metrics per service
- Resource usage (memory, CPU)
- Uptime tracking
- Dependency status
- Version information

### 3. **Integrated Testing**
- Service-specific test endpoints
- Test result tracking
- Duration timing
- Error handling & reporting
- Test data visualization

### 4. **Real-time Updates**
- Auto-refresh configurable intervals
- Manual refresh capability
- Streaming metrics support
- Historical stat computation

### 5. **Enterprise UI/UX**
- Professional dark theme
- Responsive grid layouts
- Color-coded status system
- Intuitive navigation
- Clear data hierarchy

## Usage Guide

### Main Trading Page
1. Navigate to `/portal/trading`
2. View system-wide health in card grid
3. Click any service card for details
4. Use "Run Pipeline" to trigger orchestrator
5. Monitor execution queue

### Service Detail Page
1. Click any service card from main page
2. View comprehensive health metrics
3. Check resource usage graphs
4. Monitor dependencies
5. Click "Run Tests" to execute service tests
6. Toggle auto/manual refresh

### API Usage

```typescript
// Check single service health
import { checkServiceHealth } from "@/lib/service-health";
import { getService } from "@/lib/service-registry";

const orchestrator = getService("orchestrator");
const health = await checkServiceHealth(orchestrator);

// Check all services
import { getSystemHealthStatus } from "@/lib/service-health";
const systemHealth = await getSystemHealthStatus();

// Run tests
import { runAllServiceTests } from "@/lib/service-health";
const tests = await runAllServiceTests("strategy");

// Stream metrics
import { streamServiceMetrics } from "@/lib/service-health";
for await (const metric of streamServiceMetrics("risk", 5000, 30000)) {
  console.log(metric);
}
```

## Configuration

### Service Registry
Edit `lib/service-registry.ts` to:
- Add/remove services
- Change ports or URLs
- Modify test endpoints
- Update descriptions & icons
- Adjust categories

### Health Check Intervals
In `SystemHealthOverview`:
```tsx
<SystemHealthOverview 
  autoRefresh={true} 
  refreshInterval={30000}  // 30 seconds
/>
```

### Service Detail Refresh
In `ServiceDetailView`, toggle between:
- Auto refresh (30 seconds)
- Manual refresh (on-demand)

## Backend Integration

### Required Health Endpoints
Each service must provide `/health` endpoint returning:

```json
{
  "status": "ok|degraded|error",
  "version": "1.0.0",
  "uptime": 3600,
  "timestamp": 1626000000,
  "checks": {
    "database": "ok",
    "redis": "ok"
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

### Optional Test Endpoints
Services can provide test endpoints like:
- `/test/health-check`
- `/test/database-connection`
- `/test/redis-connection`
- `/test/integration`

## Performance Considerations

1. **Parallel Health Checks**: All services checked in parallel
2. **Timeout Protection**: 15-second timeout per check
3. **Error Resilience**: Continues even if individual service fails
4. **Efficient Streaming**: Async generators for metric streaming
5. **UI Optimization**: Component memoization & lazy loading

## Security Notes

- All communication via HTTP (localhost development)
- In production, secure with:
  - HTTPS/TLS
  - API authentication
  - Rate limiting
  - Request validation

## Testing Checklist

- [ ] All 8 services appear in grid
- [ ] Health indicators update correctly
- [ ] Click card navigates to detail page
- [ ] Service detail page shows health metrics
- [ ] Tests can be run from detail page
- [ ] Auto-refresh works (watch timestamp)
- [ ] Manual refresh works
- [ ] Error handling displays correctly
- [ ] Loading states show properly
- [ ] Dependency monitoring works

## Future Enhancements

1. **Historical Charts**
   - Health trends over time
   - Resource usage graphs
   - Performance metrics

2. **Alerts & Notifications**
   - Service status notifications
   - Threshold-based alerts
   - Email/Slack integration

3. **Advanced Testing**
   - Custom test scenarios
   - Load testing
   - Chaos engineering

4. **Analytics Dashboard**
   - Service SLA tracking
   - Performance metrics
   - Incident history

5. **Configuration UI**
   - Service settings editor
   - Test management
   - Alert configuration

## Files Created

- `lib/service-registry.ts` - Service configuration
- `lib/service-health.ts` - Health/testing APIs
- `components/portal/ServiceStatusCard.tsx` - Service card component
- `components/portal/SystemHealthOverview.tsx` - System overview
- `components/portal/ServiceDetailView.tsx` - Service details
- `app/portal/trading/page.tsx` - Main trading page (updated)
- `app/portal/trading/[serviceId]/page.tsx` - Service detail page

## Architecture Benefits

✅ **Modularity** - Easy to add/remove services
✅ **Scalability** - Supports any number of services
✅ **Maintainability** - Clean separation of concerns
✅ **Reusability** - Components usable in other pages
✅ **Testability** - Easy to unit/integration test
✅ **Performance** - Parallel operations, efficient rendering
✅ **UX** - Professional, intuitive interface
✅ **Extensibility** - Easy to add new features
