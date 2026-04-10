# f0-packages-monitoring: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | 2+ apps require observability and monitoring |
| **Minimum Consumers** | 2+ apps needing monitoring |
| **Dependencies** | Sentry 10.x OR PostHog, TypeScript 6.0 |
| **Exit Criteria** | Monitoring package exported and used by at least 2 apps |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` §1, §16 — TypeScript 6.0, Sentry 10.x |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Monitoring package `open`
- Version pins: `DEPENDENCY.md` §1, §16
- Note: Conditional; production apps should have monitoring

## Package Structure

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
└── 01-config-biome-migration-50-ref-quickstart.md
```

## Core Features

### Structured Logging

```typescript
import { createLogger } from '@agency/observability';

const logger = createLogger({ service: 'agency-website' });

logger.info('User signed up', { userId, source: 'landing-page' });
logger.error('Payment failed', { error, userId, amount });
```

### Error Tracking Integration

```typescript
// Sentry integration
import { initErrorTracking } from '@agency/observability';

initErrorTracking({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

### Performance Monitoring

```typescript
import { observeWebVitals } from '@agency/observability';

observeWebVitals((metric) => {
  // Send to analytics/monitoring
  analytics.track('Web Vital', metric);
});
```

### Health Checks

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

## Verification

```bash
# Test logging
pnpm --filter @agency/observability test

# Verify integration
pnpm --filter agency-website test:observability
```
