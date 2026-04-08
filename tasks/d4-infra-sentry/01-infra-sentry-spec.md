# d4-infra-sentry: Implementation Specification

## Files

```
packages/observability/sentry/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts
│   ├── client.ts              # Browser/client SDK setup
│   ├── server.ts              # Server/Node.js SDK setup
│   ├── nextjs.ts              # Next.js specific integration
│   ├── error-boundary.tsx     # React error boundary
│   ├── performance.ts         # Performance monitoring
│   ├── feedback.ts            # User feedback widget
│   └── types.ts               # TypeScript types
├── templates/
│   ├── error-page.tsx         # Error fallback UI
│   └── feedback-modal.tsx     # User feedback modal
└── bin/
    └── create-release.ts      # CLI for release tracking
```

### `package.json`

```json
{
  "name": "@agency/observability-sentry",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./server": "./src/server.ts",
    "./nextjs": "./src/nextjs.ts",
    "./react": "./src/error-boundary.tsx",
    "./performance": "./src/performance.ts",
    "./feedback": "./src/feedback.ts"
  },
  "dependencies": {
    "@sentry/nextjs": "^9.0.0",
    "@sentry/react": "^9.0.0",
    "@sentry/node": "^9.0.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "@types/react": "^19.0.0",
    "react": "^19.0.0"
  },
  "peerDependencies": {
    "next": ">=16.0.0",
    "react": ">=19.0.0"
  },
  "scripts": {
    "release": "tsx bin/create-release.ts"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/client.ts`

```typescript
// Sentry browser/client SDK initialization

import * as Sentry from '@sentry/nextjs';

export interface ClientSentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
}

export function initClientSentry(config: ClientSentryConfig): void {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    
    // Performance monitoring
    tracesSampleRate: config.tracesSampleRate ?? 
      (config.environment === 'production' ? 0.1 : 1.0),
    
    // Session replay
    replaysSessionSampleRate: config.replaysSessionSampleRate ?? 
      (config.environment === 'production' ? 0.01 : 0.1),
    replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        maskAllInputs: true,
        blockAllMedia: false,
      }),
      Sentry.feedbackIntegration({
        colorScheme: 'system',
      }),
    ],
    
    // Sanitize sensitive data
    beforeSend: (event) => {
      // Remove sensitive query params
      if (event.request?.url) {
        const url = new URL(event.request.url);
        ['token', 'password', 'secret', 'api_key'].forEach(param => {
          url.searchParams.delete(param);
        });
        event.request.url = url.toString();
      }
      
      // Custom filtering
      if (config.beforeSend) {
        return config.beforeSend(event);
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error exception captured',
      'NetworkError when attempting to fetch resource.',
    ],
  });
}

export function captureError(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function captureMessage(message: string, level?: Sentry.SeverityLevel): void {
  Sentry.captureMessage(message, level);
}

export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user);
}

export function addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
  Sentry.addBreadcrumb(breadcrumb);
}

export function startTransaction(name: string, op: string): Sentry.Transaction {
  return Sentry.startTransaction({ name, op });
}

export { Sentry };
```

### `src/server.ts`

```typescript
// Sentry server/Node.js SDK initialization

import * as Sentry from '@sentry/nextjs';

export interface ServerSentryConfig {
  dsn: string;
  environment: 'development' | 'staging' | 'production';
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
}

export function initServerSentry(config: ServerSentryConfig): void {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    
    // Performance monitoring
    tracesSampleRate: config.tracesSampleRate ?? 
      (config.environment === 'production' ? 0.1 : 1.0),
    
    // Profiling (CPU usage)
    profilesSampleRate: config.profilesSampleRate ??
      (config.environment === 'production' ? 0.01 : 0.1),
    
    // Server integrations
    integrations: [
      Sentry.prismaIntegration(), // If using Prisma
      Sentry.httpIntegration({ breadcrumbs: true }),
    ],
    
    // Sanitize sensitive data
    beforeSend: (event) => {
      // Filter out PII
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }
      
      // Remove auth headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      if (config.beforeSend) {
        return config.beforeSend(event);
      }
      
      return event;
    },
    
    // Server-specific filtering
    beforeBreadcrumb(breadcrumb) {
      // Don't log health checks
      if (breadcrumb.category === 'http' && 
          breadcrumb.data?.url?.includes('/api/health')) {
        return null;
      }
      return breadcrumb;
    },
  });
}

// Server-specific helpers
export function withErrorTracking<T extends (...args: any[]) => any>(
  fn: T,
  operationName: string
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const transaction = Sentry.startTransaction({
      name: operationName,
      op: 'function',
    });

    try {
      const result = await fn(...args);
      transaction.setStatus('ok');
      return result;
    } catch (error) {
      transaction.setStatus('internal_error');
      Sentry.captureException(error, {
        contexts: {
          operation: { name: operationName },
        },
      });
      throw error;
    } finally {
      transaction.finish();
    }
  }) as T;
}

// Database query tracking
export function trackQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const span = Sentry.startInactiveSpan({
    name: queryName,
    op: 'db.query',
  });

  return queryFn().finally(() => {
    span.end();
  });
}

export { Sentry };
```

### `src/nextjs.ts`

```typescript
// Next.js specific Sentry integration

import { initClientSentry, initServerSentry } from './index';
import type { ClientSentryConfig, ServerSentryConfig } from './index';

export interface NextjsSentryConfig {
  dsn: string;
  clientConfig?: Partial<ClientSentryConfig>;
  serverConfig?: Partial<ServerSentryConfig>;
}

// Initialize based on environment
export function initNextjsSentry(config: NextjsSentryConfig): void {
  const isServer = typeof window === 'undefined';
  
  const environment = (process.env.NODE_ENV as any) || 'development';
  const release = process.env.SENTRY_RELEASE || 
                  process.env.VERCEL_GIT_COMMIT_SHA ||
                  'unknown';
  
  if (isServer) {
    initServerSentry({
      dsn: config.dsn,
      environment,
      release,
      ...config.serverConfig,
    });
  } else {
    initClientSentry({
      dsn: config.dsn,
      environment,
      release,
      ...config.clientConfig,
    });
  }
}

// API route wrapper
export function withSentryAPIHandler(handler: Function) {
  return async function(req: Request, ...args: any[]) {
    try {
      return await handler(req, ...args);
    } catch (error) {
      // Error will be caught by Senty's error boundary
      throw error;
    }
  };
}

// Server Action wrapper
export function withSentryServerAction<T extends (...args: any[]) => any>(
  actionName: string,
  action: T
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const { Sentry } = await import('@sentry/nextjs');
    
    return Sentry.withScope(async (scope) => {
      scope.setTag('server-action', actionName);
      scope.setContext('args', { count: args.length });
      
      try {
        return await action(...args);
      } catch (error) {
        Sentry.captureException(error);
        throw error;
      }
    });
  }) as T;
}
```

### `src/error-boundary.tsx`

```tsx
// React Error Boundary with Sentry integration

'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SentryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Report to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Call optional handler
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                We've been notified and are working to fix the issue.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Reload page
              </button>
              <button
                onClick={() => {
                  Sentry.showReportDialog({
                    eventId: Sentry.lastEventId(),
                  });
                }}
                className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Send feedback
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components
export function useSentryErrorHandler() {
  return (error: Error, context?: Record<string, any>) => {
    Sentry.captureException(error, { extra: context });
  };
}
```

### `src/performance.ts`

```typescript
// Performance monitoring utilities

import * as Sentry from '@sentry/nextjs';

export interface WebVitalMetric {
  name: 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Track Core Web Vitals
export function trackWebVital(metric: WebVitalMetric): void {
  Sentry.captureMessage(`Web Vital: ${metric.name}`, {
    level: metric.rating === 'poor' ? 'warning' : 'info',
    extra: {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    },
  });
}

// Track custom performance metric
export function trackPerformance(
  name: string,
  duration: number,
  metadata?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${name}: ${duration}ms`,
    data: { duration, ...metadata },
  });
}

// Measure function execution time
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  thresholdMs: number = 1000
): Promise<T> {
  const start = performance.now();
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (duration > thresholdMs) {
      Sentry.captureMessage(`Slow operation: ${name}`, {
        level: 'warning',
        extra: { duration, threshold: thresholdMs },
      });
    }
    
    trackPerformance(name, duration);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackPerformance(`${name} (failed)`, duration);
    throw error;
  }
}

// API endpoint performance tracking
export function createAPIPerformanceSpan(
  route: string,
  method: string
) {
  return Sentry.startInactiveSpan({
    name: `${method} ${route}`,
    op: 'http.server',
    attributes: {
      'http.method': method,
      'http.route': route,
    },
  });
}
```

### `bin/create-release.ts`

```typescript
#!/usr/bin/env tsx
// CLI tool for creating Sentry releases

import { execSync } from 'child_process';
import https from 'https';

interface ReleaseConfig {
  authToken: string;
  org: string;
  project: string;
  version: string;
  environment: string;
  commits?: boolean;
}

async function createSentryRelease(config: ReleaseConfig): Promise<void> {
  const data = JSON.stringify({
    version: config.version,
    projects: [config.project],
    refs: config.commits ? [{
      repository: 'agency-monorepo',
      commit: config.version,
    }] : undefined,
  });

  const options = {
    hostname: 'sentry.io',
    port: 443,
    path: `/api/0/organizations/${config.org}/releases/`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.authToken}`,
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          console.log('✅ Sentry release created:', config.version);
          resolve();
        } else {
          reject(new Error(`Sentry API error: ${res.statusCode} ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const authToken = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG || 'agency';
  const project = process.env.SENTRY_PROJECT || 'agency-monorepo';
  const environment = process.env.NODE_ENV || 'production';
  
  if (!authToken) {
    console.error('❌ SENTRY_AUTH_TOKEN environment variable required');
    process.exit(1);
  }

  // Get version from git or environment
  let version = process.env.SENTRY_RELEASE;
  if (!version) {
    try {
      version = execSync('git rev-parse HEAD').toString().trim();
    } catch {
      console.error('❌ Could not determine release version');
      process.exit(1);
    }
  }

  console.log(`Creating Sentry release: ${version}`);
  console.log(`Environment: ${environment}`);

  try {
    await createSentryRelease({
      authToken,
      org,
      project,
      version,
      environment,
      commits: true,
    });

    console.log('\nNext steps:');
    console.log('1. Upload source maps: pnpm sentry:sourcemaps');
    console.log('2. Deploy application');
    console.log('3. Monitor dashboard: https://sentry.io/organizations/' + org);
  } catch (error) {
    console.error('❌ Failed to create release:', error);
    process.exit(1);
  }
}

main();
```

### README

```markdown
# @agency/observability-sentry

Error tracking and performance monitoring with Sentry.

## Quick Start

### 1. Install

```bash
pnpm add @agency/observability-sentry
```

### 2. Initialize in your Next.js app

```typescript
// instrumentation.ts (root of Next.js app)
import { initNextjsSentry } from '@agency/observability-sentry/nextjs';

initNextjsSentry({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
});
```

### 3. Add environment variables

```bash
# .env.local
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=your-project
SENTRY_AUTH_TOKEN=xxx  # For CI releases
```

### 4. Wrap with Error Boundary

```tsx
// app/layout.tsx
import { SentryErrorBoundary } from '@agency/observability-sentry/react';

export default function RootLayout({ children }) {
  return (
    <SentryErrorBoundary>
      {children}
    </SentryErrorBoundary>
  );
}
```

## Features

- ✅ **Error Tracking** - Automatic error capture with context
- ✅ **Performance Monitoring** - Transaction tracing and profiling
- ✅ **Session Replay** - Video-like reproduction of user sessions
- ✅ **User Feedback** - Built-in feedback widget
- ✅ **Source Maps** - TypeScript error unminification
- ✅ **Release Tracking** - Associate errors with deployments

## Configuration

### Client-side (Browser)

```typescript
import { initClientSentry } from '@agency/observability-sentry/client';

initClientSentry({
  dsn: '...',
  environment: 'production',
  tracesSampleRate: 0.1,  // 10% of transactions
  replaysSessionSampleRate: 0.01,  // 1% sessions
  replaysOnErrorSampleRate: 1.0,  // 100% of error sessions
});
```

### Server-side (API routes)

```typescript
import { initServerSentry } from '@agency/observability-sentry/server';

initServerSentry({
  dsn: '...',
  profilesSampleRate: 0.01,  // CPU profiling
});
```

### Server Actions

```typescript
import { withSentryServerAction } from '@agency/observability-sentry/nextjs';

const submitForm = withSentryServerAction('submitForm', async (data) => {
  // Your action logic
});
```

## CI/CD Integration

### Create release on deploy

```yaml
# .github/workflows/deploy.yml
- name: Create Sentry release
  run: pnpm --filter @agency/observability-sentry release
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_RELEASE: ${{ github.sha }}
```

### Upload source maps

```json
// package.json scripts
{
  "sentry:sourcemaps": "sentry-cli sourcemaps upload --release=$(git rev-parse HEAD) .next/"
}
```

## Alerting

Configure alerts in Sentry dashboard:

1. **New issues** → Slack #alerts
2. **Regression** → PagerDuty (critical)
3. **Performance degradation** → Email
4. **User feedback** → Zendesk

## Privacy & Compliance

Sensitive data is automatically filtered:
- Authorization headers
- Cookies
- Passwords, tokens, secrets (from URLs)
- User emails and IP addresses

Custom filtering:

```typescript
initClientSentry({
  dsn: '...',
  beforeSend: (event) => {
    // Remove custom sensitive data
    if (event.extra?.privateData) {
      delete event.extra.privateData;
    }
    return event;
  },
});
```

## Troubleshooting

### Source maps not working

1. Verify `SENTRY_RELEASE` matches between build and runtime
2. Check source maps uploaded to Sentry
3. Ensure `.next/` is in `.gitignore` but uploaded to Sentry

### Too many errors

Adjust sampling:

```typescript
tracesSampleRate: 0.01,  // Reduce from 0.1 to 0.01
ignoreErrors: [
  'SpecificErrorToIgnore',
  /^RegexPattern/,
],
```

### Session replay not capturing

- Check `replaysSessionSampleRate` > 0
- Verify not in `development` (often disabled)
- Check ad blockers aren't blocking Sentry

## Resources

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Performance Monitoring](https://docs.sentry.io/platforms/javascript/guides/nextjs/performance/)
- [Session Replay](https://docs.sentry.io/platforms/javascript/guides/nextjs/session-replay/)
```

## Implementation Checklist

- [ ] Sentry project created for each app
- [ ] DSN configured in environment variables
- [ ] Source maps configured in build
- [ ] Error boundaries added to apps
- [ ] Performance monitoring enabled
- [ ] Session replay configured (low sampling rate)
- [ ] CI release tracking set up
- [ ] Alert routing configured
- [ ] Privacy filtering verified
- [ ] Team trained on Sentry dashboard

## Verification

```bash
# Create test release
SENTRY_AUTH_TOKEN=xxx pnpm --filter @agency/observability-sentry release

# Trigger test error
# Add to any page: throw new Error('Test error');
# Visit page, verify error appears in Sentry
```

## Related Tasks

- `42-monitoring` - Complementary performance monitoring
- `42a-monitoring-rum` - Real User Monitoring
- `72-notifications` - Alert routing
- `c4-infra-release-workflow` - Deployment tracking
