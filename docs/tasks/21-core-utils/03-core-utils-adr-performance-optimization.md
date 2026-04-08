# ADR: Performance Optimization Strategy for Core Utils

## Status
**Accepted** - Adopt performance-first approach for utility functions with benchmarking requirements and tree-shaking optimization.

## Context
Core utilities are consumed by every package in the monorepo, making performance characteristics critical. Individual utility performance impacts overall application performance, especially when utilities are used frequently in hot paths.

## Decision
We will implement comprehensive performance optimization for `@agency/core-utils` with benchmarking, tree-shaking verification, and bundle size monitoring.

## Consequences
- **Positive**: Predictable performance characteristics, optimized bundle sizes, performance regression detection
- **Positive**: Clear performance contracts for consuming packages
- **Negative**: Additional complexity in utility implementation, benchmarking overhead
- **Negative**: More complex package structure due to performance testing setup

## Implementation

### Performance Benchmarking
Add automated performance testing for critical utilities:

```ts
// src/performance.ts
export interface BenchmarkResult {
  functionName: string;
  iterations: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  bundleSize: number;
}

export function createBenchmark<T extends (...args: any[]) => (
  fn: (...args: any[]) => any,
  iterations: number = 1000
): BenchmarkResult {
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    fn(...args);
  }
  
  const end = performance.now();
  const averageTime = (end - start) / iterations;
  
  return {
    functionName: fn.name,
    iterations,
    averageTime,
    minTime: Math.min(...Array.from({ length: iterations }, () => {
      let min = Infinity;
      for (let j = 0; j < iterations; j++) {
        const start = performance.now();
        fn(...args);
        const end = performance.now();
        min = Math.min(min, end - start);
      }
      return min;
    })),
    maxTime: Math.max(...Array.from({ length: iterations }, () => {
      let max = 0;
      for (let j = 0; j < iterations; j++) {
        const start = performance.now();
        fn(...args);
        const end = performance.now();
        max = Math.max(max, end - start);
      }
      return max;
    })),
    bundleSize: 0 // To be calculated during build
  };
}
```

### Tree Shaking Verification
Implement build-time verification for optimal tree-shaking:

```json
// package.json
{
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./date": "./src/date.ts",
    "./string": "./src/string.ts",
    "./currency": "./src/currency.ts",
    "./validation": "./src/validation.ts"
  }
}
```

### Bundle Size Monitoring
Add bundle analysis to build process:

```ts
// scripts/build-analysis.ts
import { createBenchmark } from './performance';

export function analyzeBundleSize(packageName: string): void {
  // Bundle size analysis implementation
  console.log(`Analyzing bundle size for ${packageName}...`);
  // Implementation would use webpack-bundle-analyzer or similar
}
```

## Migration Strategy
1. Add performance testing setup to CI pipeline
2. Implement benchmarking for existing utilities
3. Add bundle size monitoring to build process
4. Update utility implementations based on benchmark results
5. Document performance characteristics for each utility

## References
- [Webpack Bundle Analyzer](https://github.com/webpack/webpack-bundle-analyzer)
- [Performance Benchmarking Best Practices](https://web.dev/performance/)
- [Tree Shaking Guide](https://webpack.js.org/guides/tree-shaking/)
