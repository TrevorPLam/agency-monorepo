# Monitoring Constraints


## Technical Constraints

### Provider SDK Compatibility

| Provider | Minimum Version | Runtime Support | Edge Compatible |
|----------|-----------------|-----------------|-----------------|
| Sentry | 9.x | Node.js, Browser | Partial (no native SDK) |
| New Relic | 12.x | Node.js only | No |
| Grafana Faro | 1.x | Browser only | Yes |

**Constraint:** New Relic Node agent cannot run in Edge Runtime. Use browser-only provider for middleware/edge functions.

### Bundle Size Impact

| Feature | Estimated Size (gzipped) |
|---------|-------------------------|
| Provider abstraction only | ~2 KB |
| + Sentry SDK | ~35 KB |
| + Error boundaries | ~1 KB |
| + Web Vitals utilities | ~3 KB |

**Constraint:** Total monitoring bundle must not exceed 50 KB gzipped per app.

### Sampling Limits

```typescript
const MAX_EVENTS_PER_MINUTE = 100; // Per user session
const MAX_TRANSACTIONS_PER_PAGE = 10; // Per page load
const MAX_ERRORS_PER_MINUTE = 50;   // Global rate limit
```

**Constraint:** Monitoring must implement client-side throttling to prevent rate limit violations.


## Budget Constraints

### Free Tier Limits

| Provider | Free Tier | Paid Threshold |
|----------|-----------|----------------|
| Sentry | 5k errors/mo, 10M spans/mo | $26/mo base |
| New Relic | 100 GB ingest/mo | $0.30/GB overage |
| Grafana Cloud | 50 GB logs, 10k metrics | Usage-based |

**Constraint:** Agency must not exceed 3 monitoring providers in active use simultaneously (cost governance).

### Client Billing Pass-Through

When client-specific monitoring is enabled:
- Client pays for their Sentry/New Relic seat
- Agency covers shared infrastructure
- No markup on monitoring services


## Regulatory Constraints

### Data Residency

| Client Type | Required Region | Provider Support |
|-------------|-----------------|------------------|
| EU clients | EU data centers | Sentry (EU), New Relic (EU) |
| US Government | US-only | New Relic FedRAMP |
| Healthcare | HIPAA-compliant | Sentry BAA, New Relic BAA |

**Constraint:** Monitoring provider must support data residency requirements for compliance-sensitive clients.

### PII Handling

- User IP addresses must be hashed before transmission (GDPR)
- User emails in error reports require explicit consent
- Session replay must mask all form inputs by default

**Constraint:** All monitoring events pass through PII scrubber before transmission.


## Runtime Constraints

### Next.js Runtime Compatibility

```typescript
// Supported runtimes
const SUPPORTED_RUNTIMES = ['nodejs', 'edge'] as const;

// Provider runtime mapping
const PROVIDER_RUNTIME_SUPPORT = {
  sentry: ['nodejs', 'edge'],
  newrelic: ['nodejs'], // No edge support
} as const;
```

**Constraint:** Provider selection must validate runtime compatibility at build time.

### Memory Limits

- Error stack traces truncated at 50 frames
- Breadcrumb buffer limited to 100 entries
- Transaction spans limited to 1,000 per transaction

**Constraint:** Monitoring must not cause memory pressure in serverless environments.


## Environmental Constraints

### Environment Variable Requirements

```env
# Required
MONITORING_PROVIDER=sentry|newrelic|none
NODE_ENV=production|development

# Provider-specific
SENTRY_DSN=          # If using Sentry
NEW_RELIC_LICENSE_KEY= # If using New Relic

# Optional
MONITORING_SAMPLE_RATE=0.1      # Default: 10%
MONITORING_DEBUG=false          # Default: false
NEXT_PUBLIC_APP_VERSION=1.0.0   # For release tracking
```

**Constraint:** Package fails gracefully with console warning if required env vars missing.

### Feature Flag Dependencies

| Feature | Requires |
|---------|----------|
| Performance monitoring | `@agency/experimentation` (optional) |
| Session replay | User consent via `@agency/compliance` |
| Distributed tracing | `@agency/data-api-client` (optional) |


## Build Constraints

### Tree Shaking Requirements

Provider SDKs must be dynamically imported:

```typescript
// Correct - dynamically imported
const sentry = await import('@sentry/nextjs');

// Incorrect - static import causes bundle bloat
import * as Sentry from '@sentry/nextjs';
```

**Constraint:** Static imports of provider SDKs are forbidden.

### Type Safety

All monitoring types must be exported from `@agency/core-types`:

```typescript
// Allowed
import type { MonitoringEvent } from '@agency/core-types';

// Forbidden - creates circular dependency
import type { MonitoringEvent } from '@agency/monitoring';
```


## Operational Constraints

### Alert Thresholds

| Metric | Warning | Critical |
|--------|-----------|----------|
| Error rate | > 1% | > 5% |
| P95 response time | > 500ms | > 1000ms |
| Failed health checks | 1 check | 3+ checks |

**Constraint:** Alerting configuration must be documented per deployment.

### Retention Policies

- Error events: 90 days
- Performance spans: 30 days
- Health check results: 7 days
- Debug logs: 24 hours

**Constraint:** Data retention must not exceed provider free tier limits without approval.


## Conditional Activation

Per `DEPENDENCY.md:456`, this package is 🔒 condition-gated:

**Build when:**
- CrUX data needed for ranking-critical site
- Error tracking requirements emerge
- SLI/SLO tracking is needed

**Do NOT build when:**
- Lighthouse/lab scores sufficient
- No production traffic yet
- Third-party monitoring handles all needs

Minimum consumers: 1


## Validation Checklist

- [ ] Bundle size verified under 50 KB gzipped
- [ ] PII scrubbing implemented and tested
- [ ] Runtime compatibility validated for all providers
- [ ] Environment variables documented in `.env.example`
- [ ] Free tier limits documented per provider
- [ ] Data residency requirements validated
- [ ] Alert thresholds configured
- [ ] Retention policies documented
