# 26-core-performance: Performance Monitoring & Optimization

## Purpose
Performance monitoring, bundle analysis, and optimization utilities for the entire monorepo. Provides runtime performance tracking, bundle size analysis, and regression detection.

## Dependencies
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Bundle size analysis tools
- Runtime performance monitoring
- Memory usage tracking  
- Performance regression detection
- Optimization recommendations

## Critical Rules
- Framework-agnostic performance monitoring
- Zero dependencies on other `@agency/*` packages
- Tree-shakable utilities
- SSR-compatible monitoring

## Position in Dependency Flow
Foundation utility that can be imported by any package for performance monitoring and optimization.

## Next Steps
1. Implement bundle size analysis tools
2. Add runtime performance monitoring
3. Create memory usage tracking utilities
4. Implement performance regression detection
5. Ensure all utilities are SSR-safe
