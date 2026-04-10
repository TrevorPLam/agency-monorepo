# 42-monitoring: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | 2+ production apps require error tracking and performance monitoring |
| **Minimum Consumers** | 2+ apps needing monitoring |
| **Dependencies** | Sentry SDK 10.x OR PostHog, React 19.2.5 |
| **Exit Criteria** | Monitoring utilities exported and integrated in at least 2 apps |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit app opt-in |
| **Version Authority** | `DEPENDENCY.md` §2, §10 — React 19.2.5, Sentry 10.x |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Monitoring `open` (vendor TBD during Task 42)
- Version pins: `DEPENDENCY.md` §2, §10
- Architecture: `ARCHITECTURE.md` — Observability layer
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md`
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Note: Conditional; start with app-local or platform-native monitoring before extracting shared helpers

## Rationale (Package vs App)

This is a **shared package** (not an app) because:
- Multiple production apps may eventually need the same error boundary and health-check primitives
- Consistent error boundary patterns across reused surfaces improve reliability
- Shared helpers are only justified once app-level monitoring setup starts duplicating
- Health check patterns should be standardized across services
- Centralized monitoring configuration reduces drift once more than one app uses it


## Files

```
packages/monitoring/
├── package.json
├── tsconfig.json
├── README.md
├── CHANGELOG.md
└── src/
    ├── index.ts
    ├── providers/
    │   ├── index.ts
    │   ├── base.ts
    │   ├── sentry.ts
    │   └── newrelic.ts
    ├── boundaries/
    │   ├── index.ts
    │   ├── error-boundary.tsx
    │   └── boundary-utils.ts
    ├── vitals/
    │   ├── index.ts
    │   ├── core-web-vitals.ts
    │   └── custom-marks.ts
    ├── health/
    │   ├── index.ts
    │   ├── checks.ts
    │   └── endpoint.ts
    └── utils/
        ├── index.ts
        └── diagnostic.ts
```


### `package.json`

```json
{
  "name": "@agency/monitoring",
  "version": "0.1.0",
  "private": true,
  "description": "Performance monitoring, error tracking, and health check utilities",
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./providers": "./src/providers/index.ts",
    "./boundaries": "./src/boundaries/index.ts",
    "./vitals": "./src/vitals/index.ts",
    "./health": "./src/health/index.ts",
    "./utils": "./src/utils/index.ts"
  },
  "scripts": {
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@agency/core-utils": "workspace:*"
  },
  "optionalDependencies": {
    "@sentry/nextjs": "10.47.0",
    "newrelic": "^12.x"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@agency/test-setup": "workspace:*",
    "@types/node": "25.5.2",
    "next": "16.2.3",
    "react": "19.2.5",
    "typescript": "6.0.0"
  },
  "peerDependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0"
  },
  "publishConfig": {
    "access": "restricted"
  }
}
```


### `src/providers/base.ts`

```typescript
export interface MonitoringProvider {
  name: string;
  init(config: ProviderConfig): void;
  captureError(error: Error, context?: ErrorContext): void;
  captureMessage(message: string, level?: LogLevel): void;
  setUser(user: UserContext | null): void;
  addBreadcrumb(breadcrumb: Breadcrumb): void;
  startTransaction(name: string, op?: string): Transaction;
  startSpan(transaction: Transaction, name: string, op?: string): Span;
  finishSpan(span: Span): void;
  finishTransaction(transaction: Transaction): void;
  getCurrentTransaction(): Transaction | null;
}

export interface ProviderConfig {
  dsn?: string;
  environment: string;
  release?: string;
  debug?: boolean;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  beforeSend?: (event: MonitoringEvent) => MonitoringEvent | null;
}

export interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: UserContext;
}

export interface UserContext {
  id?: string;
  email?: string;
  username?: string;
  ip_address?: string;
}

export interface Breadcrumb {
  type?: string;
  category?: string;
  message: string;
  data?: Record<string, unknown>;
  level?: LogLevel;
}

export type LogLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface MonitoringEvent {
  message?: string;
  exception?: { values: Array<{ type: string; value: string; stacktrace?: unknown }> };
  level?: LogLevel;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: UserContext;
  breadcrumbs?: Breadcrumb[];
}

export interface Transaction {
  name: string;
  op?: string;
  startTimestamp: number;
  spans: Span[];
  status?: 'ok' | 'error' | 'cancelled';
}

export interface Span {
  name: string;
  op?: string;
  startTimestamp: number;
  endTimestamp?: number;
  parentSpanId?: string;
  status?: 'ok' | 'error';
}
```


### `src/providers/sentry.ts`

```typescript
import * as Sentry from '@sentry/nextjs';
import type {
  MonitoringProvider,
  ProviderConfig,
  ErrorContext,
  UserContext,
  Breadcrumb,
  Transaction,
  Span,
  LogLevel
} from './base';

export class SentryProvider implements MonitoringProvider {
  name = 'sentry';

  init(config: ProviderConfig): void {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      debug: config.debug ?? false,
      tracesSampleRate: config.tracesSampleRate ?? 0.1,
      profilesSampleRate: config.profilesSampleRate ?? 0.1,
      beforeSend: config.beforeSend,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          maskAllText: false,
          maskAllInputs: true,
        }),
      ],
    });
  }

  captureError(error: Error, context?: ErrorContext): void {
    Sentry.withScope((scope) => {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        scope.setExtras(context.extra);
      }
      if (context?.user) {
        scope.setUser(context.user);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: LogLevel = 'info'): void {
    Sentry.captureMessage(message, level);
  }

  setUser(user: UserContext | null): void {
    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    Sentry.addBreadcrumb(breadcrumb);
  }

  startTransaction(name: string, op?: string): Transaction {
    const sentryTx = Sentry.startTransaction({ name, op });
    return {
      name,
      op,
      startTimestamp: Date.now(),
      spans: [],
    };
  }

  startSpan(transaction: Transaction, name: string, op?: string): Span {
    return {
      name,
      op,
      startTimestamp: Date.now(),
    };
  }

  finishSpan(span: Span): void {
    span.endTimestamp = Date.now();
  }

  finishTransaction(transaction: Transaction): void {
    transaction.status = 'ok';
  }

  getCurrentTransaction(): Transaction | null {
    return null;
  }
}
```


### `src/boundaries/error-boundary.tsx`

```typescript
'use client';

import React, { Component, type ReactNode } from 'react';
import { getMonitoringProvider } from '../providers';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const provider = getMonitoringProvider();
    
    if (provider) {
      provider.captureError(error, {
        extra: {
          componentStack: errorInfo.componentStack,
          digest: (error as Error & { digest?: string }).digest,
        },
        tags: {
          errorBoundary: 'react',
        },
      });
    }

    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div role="alert" className="p-4 border border-red-500 rounded">
          <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600 mt-2">
            Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```


### `src/vitals/core-web-vitals.ts`

```typescript
import type { Metric } from 'web-vitals';

export interface WebVitalsMetrics {
  LCP?: Metric;  // Largest Contentful Paint
  FID?: Metric;  // First Input Delay (deprecated, kept for compatibility)
  INP?: Metric;  // Interaction to Next Paint (replaces FID in 2026)
  CLS?: Metric;  // Cumulative Layout Shift
  FCP?: Metric;  // First Contentful Paint
  TTFB?: Metric; // Time to First Byte
}

export interface VitalsReporter {
  onLCP?: (metric: Metric) => void;
  onFID?: (metric: Metric) => void;
  onINP?: (metric: Metric) => void;
  onCLS?: (metric: Metric) => void;
  onFCP?: (metric: Metric) => void;
  onTTFB?: (metric: Metric) => void;
}

// Report thresholds per Google's Core Web Vitals
export const VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 },      // ms
  FID: { good: 100, poor: 300 },       // ms (deprecated)
  INP: { good: 200, poor: 500 },       // ms (2026 critical)
  CLS: { good: 0.1, poor: 0.25 },      // unitless
  FCP: { good: 1800, poor: 3000 },     // ms
  TTFB: { good: 800, poor: 1800 },    // ms
} as const;

export function assessVitalScore(
  metricName: keyof typeof VITALS_THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = VITALS_THRESHOLDS[metricName];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

// Vercel Speed Insights integration
export function reportToVercelSpeedInsights(metric: Metric): void {
  // @ts-expect-error - Vercel injects this globally when Speed Insights enabled
  if (window?.webVitals?.report) {
    // @ts-expect-error
    window.webVitals.report(metric);
  }
}
```


### `src/health/checks.ts`

```typescript
export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult> | HealthCheckResult;
  timeout?: number;
}

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  message?: string;
  responseTime?: number;
  metadata?: Record<string, unknown>;
}

export interface SystemHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  version: string;
  checks: Record<string, HealthCheckResult>;
}

export class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();

  register(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }

  async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      return {
        status: 'unhealthy',
        message: `Health check '${name}' not registered`,
      };
    }

    const startTime = Date.now();
    try {
      const timeout = check.timeout ?? 5000;
      const result = await Promise.race([
        check.check(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), timeout)
        ),
      ]);
      
      return {
        ...result,
        responseTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime: Date.now() - startTime,
      };
    }
  }

  async runAllChecks(): Promise<SystemHealth> {
    const results: Record<string, HealthCheckResult> = {};
    
    for (const [name, check] of this.checks) {
      results[name] = await this.runCheck(name);
    }

    const statuses = Object.values(results).map((r) => r.status);
    const overallStatus = statuses.includes('unhealthy')
      ? 'unhealthy'
      : statuses.includes('degraded')
      ? 'degraded'
      : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
      checks: results,
    };
  }
}

export const healthChecker = new HealthChecker();
```


### `src/index.ts`

```typescript
// Providers
export { getMonitoringProvider, setMonitoringProvider } from './providers';
export type {
  MonitoringProvider,
  ProviderConfig,
  ErrorContext,
  UserContext,
  Breadcrumb,
  LogLevel,
  Transaction,
  Span,
} from './providers/base';
export { SentryProvider } from './providers/sentry';

// Error Boundaries
export { ErrorBoundary } from './boundaries/error-boundary';

// Web Vitals
export {
  VITALS_THRESHOLDS,
  assessVitalScore,
  reportToVercelSpeedInsights,
} from './vitals/core-web-vitals';
export type { WebVitalsMetrics, VitalsReporter } from './vitals/core-web-vitals';

// Health Checks
export { HealthChecker, healthChecker } from './health/checks';
export type {
  HealthCheck,
  HealthCheckResult,
  SystemHealth,
} from './health/checks';

// Utils
export { withMonitoring } from './utils/diagnostic';
```


## Usage Example

```typescript
// In app/layout.tsx
import { ErrorBoundary } from '@agency/monitoring/boundaries';
import { setMonitoringProvider, SentryProvider } from '@agency/monitoring/providers';

// Initialize monitoring provider
const sentry = new SentryProvider();
sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  tracesSampleRate: 0.1,
});
setMonitoringProvider(sentry);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary fallback={<ErrorFallback />}>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```


```typescript
// Health check endpoint
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { healthChecker } from '@agency/monitoring/health';
import { getMonitoringProvider } from '@agency/monitoring/providers';

// Register checks
healthChecker.register('database', {
  name: 'Database Connection',
  check: async () => {
    // Database health check implementation
    return { status: 'healthy' };
  },
  timeout: 3000,
});

export async function GET() {
  const health = await healthChecker.runAllChecks();
  
  // Report to monitoring provider
  const provider = getMonitoringProvider();
  if (health.status !== 'healthy' && provider) {
    provider.captureMessage(`Health check failed: ${health.status}`, 'warning');
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503,
  });
}
```


## Provider Configuration

Select monitoring provider via environment variable:

```env
# .env.local
MONITORING_PROVIDER=sentry  # or 'newrelic'
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEW_RELIC_LICENSE_KEY=xxx
```

Provider selection is automatic based on environment configuration. Apps never hardcode provider names.


## Verification Steps

```bash
# Test provider initialization
pnpm --filter @agency/monitoring test

# Verify type exports
pnpm --filter @agency/monitoring typecheck

# Test error boundary
pnpm --filter @agency/monitoring test:boundaries

# Check health endpoint
pnpm --filter @agency/agency-website build
```


## Related Tasks

- `42a-monitoring-rum` - Real User Monitoring with CrUX data
- `d4-infra-sentry` - Sentry infrastructure setup (separate task)
- `f0-packages-observability` - Extended observability package (future)

