# ADR: Core Web Vitals 2026 Monitoring Strategy

## Status
**Accepted** - Adopt INP-centric monitoring approach for 2026 Core Web Vitals standards.

## Context
As of 2026, Core Web Vitals has evolved:
- **INP** (Interaction to Next Paint) has fully replaced FID
- INP is the metric most sites fail and requires deepest technical changes
- LCP and CLS have established optimization patterns
- Chrome User Experience Report (CrUX) is the standard field data source

## Decision
We will implement a three-tier monitoring strategy:
1. **Lab Data**: Lighthouse CI, local performance testing
2. **Field Data**: Web Vitals library + CrUX API
3. **RUM**: Real User Monitoring via `@agency/monitoring-rum`

## INP-Focused Approach

### Why INP Matters
Per web.dev research (April 2026):
- INP measures responsiveness to all user interactions
- 200ms threshold is harder to meet than FID's 100ms
- Requires fundamental shift in JavaScript execution patterns

### INP Optimization Patterns
```ts
// Before: Blocking main thread
function handleClick() {
  heavyComputation(); // Blocks for 300ms
  updateUI();
}

// After: Yield to main thread
async function handleClick() {
  await scheduler.yield(); // Allow paint
  heavyComputation();
  await scheduler.yield();
  updateUI();
}
```

## Implementation

### Web Vitals Library Integration
```ts
import { onINP, onLCP, onCLS, onTTFB } from "web-vitals";

export function initializeCoreWebVitals() {
  // INP - highest priority for 2026
  onINP((metric) => {
    console.log(`INP: ${metric.value}ms`);
    // Report to analytics if > 200ms threshold
    if (metric.value > 200) {
      reportSlowInteraction(metric);
    }
  });
  
  onLCP(console.log);
  onCLS(console.log);
  onTTFB(console.log);
}
```

### Performance Budgets (April 2026)
```ts
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals thresholds
  LCP: 2500,    // Largest Contentful Paint (ms)
  INP: 200,     // Interaction to Next Paint (ms)
  CLS: 0.1,     // Cumulative Layout Shift (unitless)
  TTFB: 800,    // Time to First Byte (ms)
  
  // Custom metrics
  FCP: 1800,    // First Contentful Paint (ms)
  TTI: 3500,    // Time to Interactive (ms)
  
  // Bundle budgets
  JS_BUNDLE: 300 * 1024,  // 300KB
  CSS_BUNDLE: 50 * 1024   // 50KB
} as const;
```

### Bundle Analysis Strategy
```ts
// Build-time bundle analysis
export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  treeshakenSize: number;
  chunks: Array<{
    name: string;
    size: number;
    imports: string[];
  }>;
  violations: string[];
}

export function analyzeBundle(stats: BuildStats): BundleAnalysis {
  return {
    totalSize: stats.assets.reduce((sum, a) => sum + a.size, 0),
    // ... analysis logic
  };
}
```

## References
- [Web Vitals 2026 Documentation](https://web.dev/articles/vitals)
- [INP Optimization Guide](https://web.dev/articles/inp)
- [CrUX API Documentation](https://developer.chrome.com/docs/crux/)
