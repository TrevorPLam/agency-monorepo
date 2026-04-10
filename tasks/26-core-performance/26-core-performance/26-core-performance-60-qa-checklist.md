# Core Performance: Quality Assurance Checklist

## Implementation Verification

### Core Web Vitals Measurement
- [ ] INP (Interaction to Next Paint) properly measured with web-vitals library
- [ ] LCP (Largest Contentful Paint) tracking implemented
- [ ] CLS (Cumulative Layout Shift) monitoring in place
- [ ] TTFB (Time to First Byte) measurement configured
- [ ] Performance thresholds aligned with 2026 standards

### Zero Overhead Requirements
- [ ] <5% runtime overhead in production
- [ ] Lazy initialization of monitoring
- [ ] Configurable sampling rates implemented
- [ ] All monitoring operations are non-blocking
- [ ] No heavy dependencies in production bundle

### Framework Agnostic Design
- [ ] Uses native Performance API only
- [ ] No React/Next.js specific imports in core utilities
- [ ] Edge runtime compatible
- [ ] SSR-safe with `typeof window` checks
- [ ] Web Vitals library is the only external dependency

### Bundle Analysis
- [ ] Bundle size analysis tools implemented
- [ ] Tree-shaking verified for all exports
- [ ] Performance budgets defined and enforced
- [ ] Build-time analysis separate from runtime

### Memory Management
- [ ] Memory leak detection utilities present
- [ ] Heap size monitoring configurable
- [ ] Snapshots limited to prevent unbounded growth
- [ ] Cleanup functions provided for all listeners

### Type Safety
- [ ] All metrics properly typed
- [ ] PerformanceBudgets const assertion correct
- [ ] No `any` types in public API
- [ ] Return types correctly inferred

### Testing Coverage
- [ ] Unit tests for all utilities
- [ ] Performance tests using Vitest 4.x bench mode
- [ ] Bundle analysis tests at build time
- [ ] Memory tracking tests verify leak detection

### Documentation
- [ ] INP optimization guide complete
- [ ] Web Vitals integration documented
- [ ] Performance budgets explained
- [ ] ADR documents 2026 monitoring strategy

### Governance Compliance
- [ ] Dependencies limited to `@agency/core-types`
- [ ] No circular dependencies
- [ ] Export structure supports tree-shaking
- [ ] Experimental status clearly documented

## Release Readiness

### Critical Path Items
- [ ] INP measurement prioritized (2026 standard)
- [ ] Web Vitals library integrated
- [ ] Performance budgets defined
- [ ] Memory tracking utilities tested
- [ ] Documentation complete

### Blocking Issues
**None** - Package is experimental per architecture condition-gating

## Sign-off

*Lead Developer*: _________________________
*Date*: _________________________
*Quality Gate*: EXPERIMENTAL

## Notes

This package (`26-core-performance`) is marked as **experimental** and off-spec per ARCHITECTURE.md:
- Core Web Vitals monitoring belongs in `@agency/monitoring` (task 42)
- RUM belongs in `@agency/monitoring-rum` (task 42a)
- This directory exists for experimental performance utilities

Per April 2026 research:
- INP has replaced FID as the responsiveness metric
- Chrome 144+ and Firefox 139+ support is baseline
- INP threshold is 200ms (harder to meet than FID's 100ms)
