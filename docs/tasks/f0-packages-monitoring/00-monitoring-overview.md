# f0-packages-monitoring: Observability and Monitoring Package

## Purpose
Create a shared monitoring/observability package as referenced in Vercel's production monorepo patterns. Provides shared logging, error capture, and uptime/alert wiring when more than one app needs these capabilities.

## Dependencies
- `00-foundation` - Root scaffolding
- `20-core-types` - Shared types
- `20-core-utils` - Utility functions

## Scope

### Package Structure
```
packages/observability/
├── src/
│   ├── index.ts
│   ├── logger.ts             # Structured logging
│   ├── error-tracking.ts     # Error capture & reporting
│   ├── performance.ts        # Web Vitals, custom metrics
│   ├── health-check.ts       # Health check endpoints
│   └── middleware/
│       ├── request-logging.ts
│       └── error-handling.ts
├── package.json
└── README.md
```

### Core Features

1. **Structured Logging**
```typescript
import { createLogger } from '@agency/observability';

const logger = createLogger({ service: 'agency-website' });

logger.info('User signed up', { userId, source: 'landing-page' });
logger.error('Payment failed', { error, userId, amount });
```

2. **Error Tracking Integration**
```typescript
// Sentry integration
import { initErrorTracking } from '@agency/observability';

initErrorTracking({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

3. **Performance Monitoring**
```typescript
import { observeWebVitals } from '@agency/observability';

observeWebVitals((metric) => {
  // Send to analytics/monitoring
  analytics.track('Web Vital', metric);
});
```

4. **Health Checks**
```typescript
// app/api/health/route.ts
import { createHealthCheck } from '@agency/observability';

const healthCheck = createHealthCheck({
  checks: {
    database: () => db.query('SELECT 1'),
    redis: () => redis.ping(),
  },
});

export async function GET() {
  return healthCheck.run();
}
```

## Build Condition

**Build conditionally** - Add this package when:
- More than one app needs shared logging
- Error tracking needs centralized configuration
- Uptime monitoring/alerting becomes a requirement
- Web Vitals tracking needed across multiple apps

**Don't build when:**
- Single app with simple console logging
- Apps use provider SDKs directly (Sentry, LogRocket)
- No need for cross-app observability correlation

## Verification

```bash
# Test logging
pnpm --filter @agency/observability test

# Verify integration
pnpm --filter agency-website test:observability
```
