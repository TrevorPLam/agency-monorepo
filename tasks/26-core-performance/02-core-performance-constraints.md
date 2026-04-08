# 26-core-performance: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the performance package to ensure framework-agnostic monitoring, minimal overhead, and accurate performance measurement.

## Critical Constraints

### Zero Overhead Rule
- **Measurement Cost**: Performance monitoring must add <5% overhead
- **No Production Impact**: Utilities must be tree-shakeable in production
- **Lazy Evaluation**: Expensive calculations only when explicitly requested
- **Conditional Execution**: Skip monitoring in production unless explicitly enabled

### Framework Agnostic Rules
- **No Framework Dependencies**: Works with React, Vue, vanilla JS, or Node.js
- **No Browser API Coupling**: Graceful degradation for missing APIs
- **SSR Safety**: All utilities must work in server and client environments
- **Universal Compatibility**: Works in browsers, Node.js, and edge runtimes

### Pure Function Rules
- **No Side Effects**: Utilities must not modify global state
- **No External State**: All state must be passed as parameters
- **Deterministic Results**: Same input always produces same output
- **Immutable Patterns**: Never mutate input parameters

### TypeScript Constraints
- **Strict Mode**: All utilities must compile with strict TypeScript settings
- **Generic Types**: Proper use of generics for reusable utilities
- **No Any Types**: Avoid `any` types; use proper type definitions
- **Return Type Inference**: Functions should have explicit return types

## Functional Boundaries

### Utility Categories
Core performance package should only contain these utility categories:

| Category | Belongs | Notes |
|----------|---------|-------|
| Bundle Analysis | ✅ Performance | Size analysis and tree-shaking verification |
| Runtime Monitoring | ✅ Performance | Function execution time tracking |
| Memory Tracking | ✅ Performance | Memory usage and leak detection |
| Performance Regression | ✅ Performance | Benchmark comparison utilities |
| APM Integration | ❌ Performance | Belongs in @agency/monitoring package |
| Error Tracking | ❌ Performance | Belongs in @agency/monitoring package |
| User Analytics | ❌ Performance | Belongs in @agency/analytics package |

## Forbidden Patterns

### ❌ Expensive Monitoring
```ts
// WRONG: Expensive operations on every call
export function measureFunction<T>(fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  // Expensive logging on every call
  console.log(`Function took ${end - start}ms`);
  saveToDatabase({ time: end - start }); // Blocking I/O
  
  return result;
}

// CORRECT: Minimal overhead, optional reporting
export function measureFunction<T>(
  fn: () => T, 
  onComplete?: (time: number) => void
): T {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  
  // Optional callback, no blocking operations
  onComplete?.(end - start);
  
  return result;
}
```

### ❌ Framework-Specific Coupling
```ts
// WRONG: React-specific performance tracking
import { useEffect } from "react";

export function usePerformanceTracking() {
  useEffect(() => {
    // React-specific, breaks in other frameworks
  }, []);
}

// CORRECT: Framework-agnostic
export function createPerformanceTracker() {
  return {
    start: () => performance.now(),
    end: (start: number) => performance.now() - start
  };
}
```

### ❌ Global State
```ts
// WRONG: Global state pollution
const globalMetrics: PerformanceMetrics[] = [];

export function trackMetric(metric: PerformanceMetrics) {
  globalMetrics.push(metric); // Global state mutation
}

// CORRECT: Local state management
export function createMetricsCollector() {
  const metrics: PerformanceMetrics[] = [];
  
  return {
    add: (metric: PerformanceMetrics) => metrics.push(metric),
    getAll: () => [...metrics], // Return copy, not reference
    clear: () => metrics.length = 0
  };
}
```

### ✅ Allowed Patterns
```ts
// CORRECT: Optional monitoring with minimal overhead
export function createPerformanceMonitor(config: PerformanceConfig) {
  const enabled = config.enabled ?? process.env.NODE_ENV === "development";
  
  return {
    measure: <T>(fn: () => T, name: string): T => {
      if (!enabled) return fn(); // Zero overhead when disabled
      
      const start = performance.now();
      const result = fn();
      const duration = performance.now() - start;
      
      // Non-blocking report
      if (config.onMeasure) {
        Promise.resolve().then(() => config.onMeasure?.({ name, duration }));
      }
      
      return result;
    }
  };
}
```

## Architectural Boundaries

### Package Dependencies
Allowed dependencies:
- `@agency/core-types` (workspace:*)
- `@agency/config-typescript` (workspace:*)

Forbidden dependencies:
- Any UI framework (React, Vue, etc.)
- External performance monitoring libraries
- Database or storage libraries
- Network request libraries

### Import Direction
- Core performance package can only be imported by:
  - Any package for performance monitoring
  - Apps for performance optimization
  - Never creates circular dependencies

## Performance Targets

### Monitoring Overhead
- **Function wrapping**: <1ms overhead per call
- **Memory tracking**: <5% memory overhead
- **Bundle analysis**: Run only at build time, not runtime
- **Reporting**: Non-blocking, async operations only

### Measurement Accuracy
- **Time precision**: Sub-millisecond precision where available
- **Memory tracking**: Accurate to within 1MB
- **Bundle analysis**: Exact byte counts with gzip simulation

## Compliance Requirements

- **TypeScript**: Strict mode with all type checks enabled
- **ESLint**: Import boundary enforcement via `@agency/config-eslint`
- **Testing**: All utilities must have comprehensive test coverage
- **Documentation**: Every utility must have JSDoc comments
- **Zero Production Impact**: Must be completely tree-shakeable

## Enforcement Mechanisms

### ESLint Rules
- Import boundary enforcement via `@agency/config-eslint`
- No restricted imports from UI frameworks
- No performance-heavy operations in synchronous code

### Build Verification
```bash
# Verify tree-shaking effectiveness
pnpm --filter @agency/core-performance build --report=tree-shaking

# Check bundle size (should be minimal)
pnpm --filter @agency/core-performance build --report=bundle-size

# Verify zero production dependencies
pnpm --filter @agency/core-performance build --dry-run
```

## Review Checklist

- [ ] All utilities add <5% performance overhead
- [ ] Zero runtime dependencies outside workspace configs
- [ ] Framework-agnostic implementation
- [ ] SSR-safe with proper fallbacks
- [ ] Tree-shakeable with `sideEffects: false`
- [ ] Non-blocking reporting mechanisms
- [ ] TypeScript strict mode compliance
- [ ] No global state or side effects
