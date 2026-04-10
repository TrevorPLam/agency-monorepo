# Core Utils Implementation Prompt

## Package Context
You are implementing `@agency/core-utils`, a collection of pure utility functions consumed by every package in the monorepo. This package must maintain zero side effects while providing essential utilities for date, string, currency, and validation operations.

## Critical Constraints
- **Pure Functions Only**: No side effects, no external state, no database access, no network calls
- **Zero External Dependencies**: Only `@agency/core-types` and workspace configs
- **Framework Agnostic**: Works across Next.js, React, and Node.js without assumptions
- **Performance First**: Utilities must be optimized for frequent use across the monorepo
- **Tree Shakable**: Individual exports for optimal bundle elimination

## Implementation Requirements

### 1. Pure Function Implementation
All functions must be pure (no side effects):
- No date mutation (always create new Date objects)
- No string mutation (always return new strings)
- No external state reads (no environment variables without parameters)
- No network access (no fetch, no API calls)
- No database queries (direct import only)

### 2. Performance Optimization
Implement performance-first approach as defined in ADR:
- Benchmark critical utilities (debounce, formatting)
- Use efficient algorithms (O(1) string operations)
- Implement tree-shaking verification
- Measure bundle size impact

### 3. Modern Intl API Patterns
Use modern Intl API patterns with proper fallbacks:
- Locale-aware formatting with sensible defaults
- Graceful degradation for older browsers
- Unicode-aware string manipulation
- Performance-optimized number formatting

### 4. Type Safety
All functions must have comprehensive TypeScript types:
- Generic type parameters for flexibility
- Proper return type inference
- No `any` types without explicit justification
- Zod schemas imported from `@agency/core-types` for validation

### 5. Export Structure
Follow individual export pattern for tree-shaking:
```json
{
  "exports": {
    ".": "./src/index.ts",
    "./date": "./src/date.ts",
    "./string": "./src/string.ts",
    "./currency": "./src/currency.ts",
    "./validation": "./src/validation.ts"
  },
  "sideEffects": false
}
```

### 6. Dependencies
Only depend on:
- `@agency/core-types` (workspace:*)
- `@agency/config-typescript` (workspace:*)

## Quality Standards
- All functions must have comprehensive JSDoc comments
- All functions must be pure (verified by tests)
- Performance characteristics documented
- Modern Intl API usage with fallbacks
- Proper error handling for edge cases

## Common Pitfalls to Avoid
- Do not create side effects in utility functions
- Do not read environment variables without explicit parameters
- Do not import from other `@agency/*` packages except `@agency/core-types`
- Do not use legacy Intl patterns without fallbacks
- Do not mutate input parameters

## Success Criteria
- [ ] All functions are pure (no side effects)
- [ ] Performance benchmarks implemented and documented
- [ ] Modern Intl API patterns adopted
- [ ] Tree-shaking verified with bundle analysis
- [ ] 100% test coverage for utility functions
- [ ] Comprehensive JSDoc documentation
- [ ] Zero circular dependencies
- [ ] Bundle size impact documented

Implement this package with performance as a primary concern since utilities are used frequently across the entire monorepo.
