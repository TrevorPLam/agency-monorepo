# 13-config-react-compiler: React Compiler Configuration

## Purpose
Configuration package for React Compiler - the automatic optimization compiler now stable in Next.js 16 (as of April 2026). Eliminates manual memoization with automatic re-render optimization.

## Dependencies
- **Required**: `11-config-typescript` (TS configuration)
- **Required**: `10-config-eslint` (for React Compiler ESLint rules)
- **Required**: `42-monitoring` (for performance metrics and error tracking)

## Scope
This task establishes:
- React Compiler configuration for Next.js 16
- ESLint plugin for React Compiler rules
- Babel configuration (legacy projects only)
- Migration guide from manual `useMemo`/`useCallback`
- Performance monitoring integration

### Performance Monitoring
- **Metrics**: Track render performance, re-render frequency, memory usage
- **Alerts**: Detect over-optimization or performance regressions
- **Integration**: Uses `@agency/monitoring` package for metrics collection

### Over-Optimization Detection
- **Debug Mode**: React Compiler provides debug mode to analyze decisions
- **Manual Override**: Flag components that need manual memoization
- **Performance Profiling**: Tools to measure before/after optimization impact

## Why React Compiler (2026)

### Stable in Next.js 16
- React Compiler graduated from experimental to **stable**
- Enabled by simple config flag (no Babel required in Next.js)
- Automatic memoization without code changes

### Benefits
- **No manual memoization** - `useMemo`, `useCallback` often unnecessary
- **Automatic re-render prevention** - Compiler analyzes dependencies
- **Zero bundle size impact** - Optimizations happen at build time
- **Works with Server Components** - Compatible with Next.js App Router

### When to Still Use Manual Memoization
- Complex object/array dependencies
- Custom comparison logic
- External library integration
- Performance-critical paths requiring explicit control

## Next Steps
1. Create React Compiler config package
2. Update Next.js config template to enable compiler
3. Add React Compiler ESLint rules
4. Create migration guide for manual memoization
5. Document known limitations

## Related Tasks
- `11-config-typescript` - TS config for React 19
- `32-ui-design-system` - Component optimization
- `42-monitoring` - Performance metrics
- `d4-infra-sentry` - Error tracking for compiler issues
