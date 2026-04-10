# 26-core-performance: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for performance monitoring utilities to ensure lightweight, non-intrusive instrumentation.

## Critical Constraints

### Zero Runtime Overhead (Production)
- **<5% Performance Impact**: Monitoring must not degrade application performance
- **Lazy Initialization**: Metrics collection starts only when explicitly enabled
- **Sampling**: Support configurable sampling rates for high-frequency operations
- **No Blocking**: All monitoring operations must be non-blocking

### Framework Agnostic Rules
- **Universal Compatibility**: Works with Next.js, React, Node.js, and edge runtimes
- **No Framework Imports**: Cannot import from React, Next.js, or framework-specific APIs
- **Standard APIs Only**: Use Performance API, Web Vitals API, and standard JavaScript

### Dependency Constraints
- **Only `@agency/core-types`**: Single internal dependency for metric type definitions
- **Zero External Runtime Dependencies**: No heavy monitoring libraries in production bundle
- **Dev-Only Dependencies**: Analytics tools (PostHog) loaded conditionally

## Functional Boundaries

### Allowed Categories
| Category | Belongs | Notes |
|----------|---------|-------|
| Core Web Vitals | Core | LCP, INP, CLS measurement |
| Bundle Analysis | Core | Build-time bundle size analysis |
| Runtime Metrics | Core | Custom performance marks |
| Memory Tracking | Core | Heap size monitoring |
| ❌ Error Tracking | Monitoring | Belongs in `@agency/monitoring` |
| ❌ RUM Analytics | Monitoring-RUM | Belongs in `@agency/monitoring-rum` |

## Monitoring vs Performance Separation

Per ARCHITECTURE.md §232-234:
- **Task 42 (`@agency/monitoring`)**: Core Web Vitals instrumentation, Vercel Speed Insights
- **Task 42a (`@agency/monitoring-rum`)**: Real User Monitoring, CrUX data
- **This experimental package**: Foundation utilities that may support both

## Forbidden Patterns

### ❌ Heavy Dependencies
```ts
// WRONG: Heavy monitoring library
import * as Sentry from "@sentry/browser"; // Too heavy for core

export function trackPerformance() {
  Sentry.startTransaction({ name: "operation" });
}
```

### ✅ Lightweight Instrumentation
```ts
// CORRECT: Native Performance API
export function measureOperation<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  // Queue for async reporting
  queueMicrotask(() => {
    reportMetric(name, duration);
  });
  
  return result;
}
```

## Compliance Requirements

- **Performance Observer**: Use native `PerformanceObserver` API
- **Web Vitals**: Use `web-vitals` library for INP, LCP, CLS (Google standard)
- **Bundle Analysis**: Webpack/Vite plugin at build time, not runtime
- **SSR Safety**: All utilities check `typeof window !== "undefined"`

## Experimental Status

This package (`26-core-performance`) is **experimental** and off-spec per ARCHITECTURE.md:
- Core Web Vitals monitoring belongs in `@agency/monitoring` (task 42)
- RUM belongs in `@agency/monitoring-rum` (task 42a)
- This directory exists for experimental performance utilities that may inform standardized packages

## Enforcement

```bash
# Verify performance overhead
pnpm --filter @agency/core-performance test:performance

# Check bundle impact
pnpm --filter @agency/core-performance analyze

# Validate no heavy dependencies
pnpm --filter @agency/core-performance lint --rule="no-heavy-deps"
```
