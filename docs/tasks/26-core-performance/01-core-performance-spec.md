# 26-core-performance: Implementation Specification

## Files
```
packages/core/performance/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── bundle-analyzer.ts
│   ├── runtime-monitor.ts
│   └── memory-tracker.ts
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/core-performance",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./bundle-analyzer": "./src/bundle-analyzer.ts",
    "./runtime-monitor": "./src/runtime-monitor.ts",
    "./memory-tracker": "./src/memory-tracker.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/bundle-analyzer.ts`
```ts
import { z } from "zod";

export interface BundleAnalysis {
  packageName: string;
  bundleSize: {
    raw: number;
    gzipped: number;
    treeshaken: number;
  };
  dependencies: Array<{
    name: string;
    size: number;
    percentage: number;
  }>;
  recommendations: string[];
}

export interface BundleAnalysisConfig {
  targetBundleSize: number; // Target in bytes
  maxDependencySize: number; // Max size for individual dependencies
  treeshakingThreshold: number; // Minimum % for effective tree-shaking
}

export const createBundleAnalyzer = (config: BundleAnalysisConfig) => {
  return {
    analyze: (packagePath: string): BundleAnalysis => {
      // Implementation would use webpack-bundle-analyzer or similar
      // Returns detailed bundle analysis
    },
    generateReport: (analysis: BundleAnalysis): string => {
      return JSON.stringify(analysis, null, 2);
    },
    checkThresholds: (analysis: BundleAnalysis): boolean => {
      return analysis.bundleSize.gzipped <= config.targetBundleSize &&
             analysis.bundleSize.treeshaken <= config.treeshakingThreshold;
    }
  };
};
```

### `src/runtime-monitor.ts`
```ts
export interface PerformanceMetrics {
  functionName: string;
  executionTime: number;
  memoryUsage: number;
  callCount: number;
  averageTime: number;
}

export interface PerformanceConfig {
  sampleSize: number;
  thresholdMs: number;
  enableMemoryTracking: boolean;
}

export const createPerformanceMonitor = (config: PerformanceConfig) => {
  const metrics = new Map<string, PerformanceMetrics>();
  
  return {
    measure: <T extends (...args: any[]) => any>(
      fn: T,
      name: string
    ): T => {
      const start = performance.now();
      const result = fn(...args);
      const end = performance.now();
      
      const executionTime = end - start;
      const memoryUsage = config.enableMemoryTracking ? 
        (performance as any).memory?.usedJSHeapSize || 0 : 0;
      
      const existing = metrics.get(name) || {
        functionName: name,
        executionTime: 0,
        memoryUsage: 0,
        callCount: 0,
        averageTime: 0
      };
      
      const newMetrics: PerformanceMetrics = {
        functionName: name,
        executionTime,
        memoryUsage,
        callCount: existing.callCount + 1,
        averageTime: (existing.averageTime * existing.callCount + executionTime) / (existing.callCount + 1)
      };
      
      metrics.set(name, newMetrics);
      
      if (executionTime > config.thresholdMs) {
        console.warn(`Performance warning: ${name} took ${executionTime}ms (threshold: ${config.thresholdMs}ms)`);
      }
      
      return result;
    },
    
    getMetrics: (): PerformanceMetrics[] => {
      return Array.from(metrics.values());
    },
    
    reset: (): void => {
      metrics.clear();
    }
  };
};
```

### `src/memory-tracker.ts`
```ts
export interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface MemoryLeakDetection {
  baselineMemory: number;
  leakThreshold: number;
  sampleInterval: number;
}

export const createMemoryTracker = (config: MemoryLeakDetection) => {
  let snapshots: MemorySnapshot[] = [];
  
  return {
    takeSnapshot: (): MemorySnapshot => {
      return {
        timestamp: Date.now(),
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0
      };
    },
    
    trackMemory: (): MemorySnapshot => {
      const snapshot = {
        timestamp: Date.now(),
        usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
        totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
        jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0
      };
      
      snapshots.push(snapshot);
      
      // Keep only last N snapshots for analysis
      if (snapshots.length > 100) {
        snapshots = snapshots.slice(-100);
      }
      
      return snapshot;
    },
    
    detectLeaks: (): boolean => {
      if (snapshots.length < 2) return false;
      
      const recent = snapshots.slice(-10); // Last 10 snapshots
      const memoryGrowth = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
      
      return memoryGrowth > config.leakThreshold;
    },
    
    getMemoryTrend: (): { increasing: boolean; rate: number } => {
      if (snapshots.length < 2) return { increasing: false, rate: 0 };
      
      const recent = snapshots.slice(-10);
      const firstMemory = recent[0].usedJSHeapSize;
      const latestMemory = recent[recent.length - 1].usedJSHeapSize;
      
      const growth = latestMemory - firstMemory;
      const rate = growth / (latestMemory / 100); // Percentage growth
      
      return { increasing: growth > 0, rate };
    }
  };
};
```

### `src/index.ts`
```ts
export { createBundleAnalyzer } from "./bundle-analyzer";
export { createPerformanceMonitor } from "./runtime-monitor";
export { createMemoryTracker } from "./memory-tracker";

// Re-export types
export type { BundleAnalysis, BundleAnalysisConfig } from "./bundle-analyzer";
export type { PerformanceMetrics, PerformanceConfig } from "./runtime-monitor";
export type { MemorySnapshot, MemoryLeakDetection } from "./memory-tracker";
```

## Usage Examples

```ts
import { createBundleAnalyzer, createPerformanceMonitor, createMemoryTracker } from "@agency/core-performance";

// Bundle analysis
const bundleAnalyzer = createBundleAnalyzer({
  targetBundleSize: 1024 * 1024, // 1MB target
  maxDependencySize: 100 * 1024, // 100KB per dependency
  treeshakingThreshold: 0.8 // 80% tree-shaking effectiveness
});

// Performance monitoring
const perfMonitor = createPerformanceMonitor({
  sampleSize: 1000,
  thresholdMs: 50, // Warn on operations > 50ms
  enableMemoryTracking: true
});

// Memory tracking
const memoryTracker = createMemoryTracker({
  baselineMemory: 10 * 1024 * 1024, // 10MB baseline
  leakThreshold: 1024 * 1024, // 1MB leak threshold
  sampleInterval: 5000 // Sample every 5 seconds
});
```

## Verification

```bash
# Type check
pnpm --filter @agency/core-performance typecheck

# Run tests
pnpm --filter @agency/core-performance test

# Verify exports
pnpm --filter @agency/core-performance build
```

## Performance Targets

### Bundle Analysis
- **Target bundle size**: <1MB for core packages
- **Tree-shaking effectiveness**: >80% unused code elimination
- **Dependency size limits**: <100KB per individual dependency

### Runtime Performance
- **Function execution time**: <50ms for critical utilities
- **Memory leak detection**: <1MB growth over 10 samples
- **Performance regression**: <10% degradation from baseline

## Implementation Rules

1. **SSR Compatibility**: All performance monitoring must work in server and client environments
2. **Zero External Dependencies**: Only depends on `@agency/core-types` and workspace configs
3. **Tree Shaking**: Individual exports with `sideEffects: false`
4. **TypeScript First**: Full type safety with proper interfaces and generics
5. **Performance Overhead**: Monitoring tools must add <5% performance overhead
