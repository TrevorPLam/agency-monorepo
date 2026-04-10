# Guide: Performance Optimization Patterns

## Purpose
Practical patterns for measuring and optimizing application performance in the agency monorepo.

## Core Web Vitals Implementation

### INP (Interaction to Next Paint) - 2026 Priority
```ts
import { onINP } from "web-vitals";

// Initialize INP monitoring
export function monitorINP() {
  onINP((metric) => {
    const { id, value, rating, entries } = metric;
    
    // Rating: 'good' | 'needs-improvement' | 'poor'
    if (rating === 'poor') {
      console.warn(`Slow interaction detected: ${value}ms`, entries);
      // Send to analytics
      reportToAnalytics('inp_poor', { id, value });
    }
  }, { reportAllChanges: true });
}

// Long task attribution
export function identifySlowInteractions() {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration > 50) { // Long task threshold
        console.warn('Long task detected:', entry.duration, entry);
      }
    }
  });
  
  observer.observe({ entryTypes: ['longtask'] });
}
```

### LCP (Largest Contentful Paint)
```ts
import { onLCP } from "web-vitals";

export function monitorLCP() {
  onLCP((metric) => {
    const { element, value } = metric;
    
    if (value > 2500) {
      console.warn('Slow LCP:', element, value);
      
      // Common fixes:
      // 1. Preload hero image
      // 2. Use next/image with priority
      // 3. Reduce server response time
    }
  });
}
```

### CLS (Cumulative Layout Shift)
```ts
import { onCLS } from "web-vitals";

export function monitorCLS() {
  onCLS((metric) => {
    if (metric.value > 0.1) {
      console.warn('High CLS:', metric);
      
      // Common fixes:
      // 1. Set explicit width/height on images
      // 2. Reserve space for dynamic content
      // 3. Avoid inserting content above existing content
    }
  });
}
```

## Custom Performance Measurement

### Utility Function Timing
```ts
export function measureFunction<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args) => {
    const start = performance.now();
    const result = fn(...args);
    const duration = performance.now() - start;
    
    // Log if slow
    if (duration > 50) {
      console.warn(`Slow function: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return result;
  }) as T;
}

// Usage
const slowFunction = measureFunction('heavyCompute', (n: number) => {
  // expensive operation
  return n * n;
});
```

### Component Render Timing (React 19)
```tsx
// With React 19's useTransition for non-urgent updates
import { useTransition, useDeferredValue } from "react";

function SearchResults({ query }: { query: string }) {
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);
  
  return (
    <div>
      {isPending && <Spinner />}
      <Results query={deferredQuery} />
    </div>
  );
}
```

## Bundle Optimization

### Tree Shaking Verification
```ts
// Ensure tree-shaking works
export { createBundleAnalyzer } from "./bundle-analyzer";
export { createPerformanceMonitor } from "./runtime-monitor";
export { createMemoryTracker } from "./memory-tracker";

// Consumer only imports what they need
import { createBundleAnalyzer } from "@agency/core-performance/bundle-analyzer";
```

### Dynamic Imports
```ts
// Lazy load heavy components
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <ChartSkeleton />,
  ssr: false // If not needed for initial render
});

// Lazy load monitoring (only in production)
const initMonitoring = async () => {
  if (process.env.NODE_ENV === "production") {
    const { initializeCoreWebVitals } = await import("./monitoring");
    initializeCoreWebVitals();
  }
};
```

## Memory Management

### Memory Leak Detection
```ts
export function createMemoryTracker() {
  const snapshots: MemoryInfo[] = [];
  
  return {
    snapshot: () => {
      const info = (performance as any).memory;
      snapshots.push({
        timestamp: Date.now(),
        usedJSHeapSize: info?.usedJSHeapSize ?? 0,
        totalJSHeapSize: info?.totalJSHeapSize ?? 0
      });
      
      // Keep only last 50 snapshots
      if (snapshots.length > 50) snapshots.shift();
    },
    
    detectLeak: () => {
      if (snapshots.length < 10) return false;
      
      const recent = snapshots.slice(-10);
      const growth = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
      
      // >10MB growth suggests leak
      return growth > 10 * 1024 * 1024;
    }
  };
}
```

## Performance Budgets

### Bundle Size Monitoring
```ts
export const BUDGETS = {
  entry: 250 * 1024,      // 250KB
  chunk: 100 * 1024,      // 100KB
  image: 100 * 1024,      // 100KB
  font: 50 * 1024         // 50KB
};

export function checkBudget(name: string, size: number) {
  if (size > BUDGETS.chunk) {
    console.warn(`Budget exceeded: ${name} is ${(size / 1024).toFixed(1)}KB`);
  }
}
```

## Best Practices

1. **Measure before optimizing** - Use Web Vitals to identify real issues
2. **Focus on INP first** - It's the hardest metric to meet
3. **Use React 19 features** - `useTransition`, `useDeferredValue`
4. **Lazy load everything possible** - Components, libraries, monitoring
5. **Set performance budgets** - Prevent regression at build time
6. **Test on real devices** - Lab data differs from field data

## Testing Performance

```ts
import { describe, bench } from "vitest";

describe.bench("formatDate", () => {
  const date = new Date();
  
  bench("Intl API", () => {
    new Intl.DateTimeFormat("en-US").format(date);
  });
  
  bench("toLocaleString", () => {
    date.toLocaleString("en-US");
  });
});
```
