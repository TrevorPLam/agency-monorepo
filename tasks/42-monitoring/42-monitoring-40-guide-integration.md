# Monitoring Integration Guide


## Quick Start

### 1. Install Package

```bash
pnpm add @agency/monitoring
```

### 2. Configure Environment

```env
# .env.local
MONITORING_PROVIDER=sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 3. Initialize in Layout

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@agency/monitoring/boundaries';
import { setMonitoringProvider, SentryProvider } from '@agency/monitoring/providers';

// Initialize once
if (typeof window !== 'undefined') {
  const sentry = new SentryProvider();
  sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.NEXT_PUBLIC_APP_VERSION,
    tracesSampleRate: 0.1,
  });
  setMonitoringProvider(sentry);
}

export default function RootLayout({ children }) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
```


## Provider Setup

### Sentry

```env
SENTRY_DSN=https://public@o0.ingest.sentry.io/0
SENTRY_ENVIRONMENT=production
```

Features:
- Error tracking with stack traces
- Performance monitoring
- Session replay (configurable)
- Release health

### New Relic

```env
MONITORING_PROVIDER=newrelic
NEW_RELIC_LICENSE_KEY=xxx
NEW_RELIC_APP_NAME=my-app
```

Features:
- Full observability
- Infrastructure monitoring
- Log management
- Browser monitoring

**Note:** New Relic does not support Edge Runtime. Use Sentry for middleware/edge functions.


## Error Tracking

### Automatic Error Capturing

Error boundaries catch React errors automatically:

```typescript
import { ErrorBoundary } from '@agency/monitoring/boundaries';

<ErrorBoundary fallback={<CustomErrorPage />}>
  <App />
</ErrorBoundary>
```

### Manual Error Reporting

```typescript
import { getMonitoringProvider } from '@agency/monitoring/providers';

const provider = getMonitoringProvider();

try {
  await riskyOperation();
} catch (error) {
  provider?.captureError(error, {
    tags: { feature: 'checkout' },
    extra: { userId: user.id },
  });
}
```

### Error Context

Attach metadata to errors:

```typescript
provider.captureError(error, {
  tags: {
    section: 'payment',
    severity: 'critical',
  },
  extra: {
    orderId: order.id,
    paymentMethod: 'stripe',
  },
  user: {
    id: user.id,
    email: user.email,
  },
});
```


## Performance Monitoring

### Core Web Vitals

```typescript
import { initWebVitals } from '@agency/monitoring/vitals';

initWebVitals({
  onReport: (metric) => {
    // Send to your analytics endpoint
    fetch('/api/vitals', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  },
});
```

### Custom Performance Marks

```typescript
import { performance } from '@agency/monitoring/vitals';

// Mark start
performance.mark('data-fetch-start');

// Fetch data
const data = await fetchData();

// Mark end
performance.mark('data-fetch-end');

// Measure
performance.measure('data-fetch', 'data-fetch-start', 'data-fetch-end');
```


## Health Checks

### Register Checks

```typescript
// lib/health-checks.ts
import { healthChecker } from '@agency/monitoring/health';

healthChecker.register('database', {
  name: 'Database',
  check: async () => {
    // Your DB check
    return { status: 'healthy' };
  },
  timeout: 3000,
});

healthChecker.register('api', {
  name: 'External API',
  check: async () => {
    const response = await fetch('https://api.example.com/health');
    return {
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime: Date.now() - start,
    };
  },
});
```

### Health Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { healthChecker } from '@agency/monitoring/health';
import '@/lib/health-checks'; // Register checks

export async function GET() {
  const health = await healthChecker.runAllChecks();
  
  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}
```


## Testing

### Mock Provider in Tests

```typescript
// test/setup.ts
import { setMonitoringProvider, ConsoleProvider } from '@agency/monitoring/providers';

const consoleProvider = new ConsoleProvider();
consoleProvider.init({ environment: 'test' });
setMonitoringProvider(consoleProvider);
```

### Testing Error Boundaries

```typescript
import { render } from '@testing-library/react';
import { ErrorBoundary } from '@agency/monitoring/boundaries';

const ThrowError = () => {
  throw new Error('Test error');
};

it('catches errors and renders fallback', () => {
  const { getByText } = render(
    <ErrorBoundary fallback={<div>Error!</div>}>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(getByText('Error!')).toBeInTheDocument();
});
```


## Advanced Configuration

### Sampling Rates

```typescript
sentry.init({
  tracesSampleRate: 0.1,      // 10% of transactions
  profilesSampleRate: 0.1,    // 10% of profiles
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Before Send Hooks

```typescript
sentry.init({
  beforeSend: (event) => {
    // Filter out specific errors
    if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
      return null;
    }
    return event;
  },
});
```

### PII Scrubbing

```typescript
sentry.init({
  beforeSend: (event) => {
    // Remove PII from error messages
    if (event.message) {
      event.message = event.message.replace(/[\w.-]+@[\w.-]+\.\w+/g, '[email]');
    }
    
    // Remove sensitive headers
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    
    return event;
  },
});
```


## Troubleshooting

### Errors not appearing

1. Check `MONITORING_PROVIDER` env var is set
2. Verify DSN/license key is correct
3. Check browser console for initialization errors
4. Verify sample rate isn't filtering events

### High event volume

1. Reduce `tracesSampleRate` (default 0.1 = 10%)
2. Use `beforeSend` to filter noise
3. Enable client-side throttling
4. Check for infinite error loops

### Edge Runtime errors

1. Use Sentry for edge (New Relic not supported)
2. Or disable monitoring for edge routes
3. Check provider runtime compatibility


## Migration from Direct SDK

### Before (direct Sentry)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({ dsn: 'xxx' });

// In component
Sentry.captureException(error);
```

### After (via abstraction)

```typescript
import { getMonitoringProvider, SentryProvider } from '@agency/monitoring/providers';

const sentry = new SentryProvider();
sentry.init({ dsn: 'xxx' });
setMonitoringProvider(sentry);

// In component
const provider = getMonitoringProvider();
provider?.captureError(error);
```


## Related Documentation

- `@agency/monitoring-rum` - Real User Monitoring with CrUX
- `DEPENDENCY.md:307-337` - Provider selection matrix
- `AGENTS.md` - Package boundary rules
