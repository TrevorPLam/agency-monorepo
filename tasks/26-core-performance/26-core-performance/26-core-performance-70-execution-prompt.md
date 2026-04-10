# Core Performance Implementation Prompt

## Package Context

You are implementing `@agency/core-performance`, an experimental performance monitoring utilities package. This package provides Core Web Vitals measurement, bundle analysis, and performance optimization utilities.

**⚠️ Experimental Status**: This package is off-spec per ARCHITECTURE.md §14. The standardized monitoring packages are:
- Task 42: `@agency/monitoring` - Core Web Vitals, Vercel Speed Insights
- Task 42a: `@agency/monitoring-rum` - Real User Monitoring, CrUX data

This directory exists for experimental/research purposes and may inform the standardized packages.

## Critical Constraints

- **<5% Runtime Overhead**: Monitoring must not impact application performance
- **Framework Agnostic**: Uses only native Performance API
- **Lazy Initialization**: Metrics collection starts only when enabled
- **Single Internal Dependency**: Only `@agency/core-types`
- **SSR Safe**: All utilities check for browser environment

## 2026 Core Web Vitals Priority

Per April 2026 standards, INP (Interaction to Next Paint) is the priority metric:

```ts
// INP is measured across all user interactions
import { onINP } from "web-vitals";

export function initializeMonitoring() {
  onINP((metric) => {
    // Rating: 'good' | 'needs-improvement' | 'poor'
    // Threshold: 200ms (stricter than FID's 100ms)
    if (metric.rating === 'poor') {
      reportSlowInteraction(metric);
    }
  }, { reportAllChanges: true });
}
```

## Implementation Requirements

### 1. Core Web Vitals Integration

```ts
import { onINP, onLCP, onCLS, onTTFB } from "web-vitals";

export function initializeCoreWebVitals(reportFn: (metric: Metric) => void) {
  // INP - highest priority for 2026
  onINP(reportFn, { reportAllChanges: true });
  
  // Other metrics
  onLCP(reportFn);
  onCLS(reportFn);
  onTTFB(reportFn);
}
```

### 2. Performance Budgets

```ts
export const PERFORMANCE_BUDGETS = {
  // 2026 Core Web Vitals thresholds
  LCP: 2500,    // ms
  INP: 200,     // ms (new standard)
  CLS: 0.1,     // unitless
  TTFB: 800,    // ms
  
  // Bundle budgets
  JS_BUNDLE: 300 * 1024,   // 300KB
  CSS_BUNDLE: 50 * 1024,   // 50KB
  IMAGE_MAX: 100 * 1024    // 100KB
} as const;

export function checkBudget(name: string, value: number, budget: number) {
  if (value > budget) {
    console.warn(`Performance budget exceeded: ${name}`);
    return false;
  }
  return true;
}
```

### 3. Bundle Analysis (Build Time)

```ts
export interface BundleAnalysisConfig {
  targetSize: number;
  maxChunkSize: number;
}

export function createBundleAnalyzer(config: BundleAnalysisConfig) {
  return {
    analyze: (stats: BuildStats) => {
      const totalSize = stats.assets.reduce((sum, a) => sum + a.size, 0);
      const violations: string[] = [];
      
      if (totalSize > config.targetSize) {
        violations.push(`Total size ${totalSize} exceeds ${config.targetSize}`);
      }
      
      return { totalSize, violations };
    }
  };
}
```

### 4. Memory Leak Detection

```ts
export function createMemoryTracker(maxSnapshots = 50) {
  const snapshots: MemorySnapshot[] = [];
  
  return {
    snapshot: () => {
      const info = (performance as any).memory;
      snapshots.push({
        timestamp: Date.now(),
        usedJSHeapSize: info?.usedJSHeapSize ?? 0
      });
      
      // Limit snapshots
      if (snapshots.length > maxSnapshots) {
        snapshots.shift();
      }
    },
    
    detectLeak: (thresholdBytes = 10 * 1024 * 1024) => {
      if (snapshots.length < 10) return false;
      
      const recent = snapshots.slice(-10);
      const growth = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
      
      return growth > thresholdBytes;
    }
  };
}
```

### 5. Custom Performance Marks

```ts
export function measureOperation<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  // Report asynchronously
  queueMicrotask(() => {
    reportMetric(name, duration);
  });
  
  return result;
}
```

### 6. Export Structure

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./bundle-analyzer": "./src/bundle-analyzer.ts",
    "./runtime-monitor": "./src/runtime-monitor.ts",
    "./memory-tracker": "./src/memory-tracker.ts"
  },
  "sideEffects": false
}
```

### 7. Dependencies

```json
{
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "web-vitals": "^4.2.4"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  }
}
```

## Quality Standards

- All monitoring adds <5% overhead
- Framework-agnostic (native APIs only)
- Lazy initialization by default
- Comprehensive JSDoc documentation
- Test coverage >90%
- Zero circular dependencies

## Common Pitfalls to Avoid

- Do not import React or Next.js APIs
- Do not add heavy analytics libraries
- Do not block the main thread
- Do not collect metrics without sampling
- Do not forget SSR safety checks

## Success Criteria

- [ ] INP measurement prioritized and implemented
- [ ] Web Vitals 4.x integrated correctly
- [ ] Performance budgets defined
- [ ] Bundle analysis tools working
- [ ] Memory leak detection functional
- [ ] Zero blocking operations
- [ ] <5% runtime overhead verified
- [ ] Comprehensive JSDoc documentation

## Experimental Note

This implementation is experimental and off-spec. When condition triggers are met (per ARCHITECTURE.md §14), utilities should migrate to:
- Task 42: `@agency/monitoring` (Core Web Vitals, Speed Insights)
- Task 42a: `@agency/monitoring-rum` (CrUX, field data)

The standardized packages should be built when the agency has multiple apps needing monitoring, not before.
