# 21-core-utils: Pure Utility Functions

## Purpose

Provide pure utility functions for date formatting, string manipulation, currency formatting, and validation. Zero dependencies outside `@agency/core-types`. No React, no database, no network calls.

## Dependencies

- **Required**: `20-core-types`
- **Required**: `@js-temporal/polyfill` for modern date handling
- **Required**: Zod v4 for validation utilities
- **Followed by**: `22-core-constants`, `23-core-hooks`

## Scope

This package contains:
- Date formatting using Temporal API with Intl fallbacks
- String utilities (slugify, capitalize, truncate with Unicode support)
- Currency formatting using Intl.NumberFormat
- Validation helpers with Zod v4
- Performance-optimized implementations

## Constraints

- **Zero side effects**: All functions must be pure
- **Zero external state**: No environment variable reads
- **Zero React dependencies**: React hooks go in `23-core-hooks`
- **Zero database access**: Database queries go in `@agency/data-db`
- **Zero network calls**: API calls go in app layer

## Success Criteria

- [ ] All utilities are pure functions
- [ ] Temporal API used for date operations
- [ ] Unicode-aware string truncation with Intl.Segmenter
- [ ] <5ms for date operations
- [ ] <50ms for 10k string operations

## Exit Criteria

Package published to workspace with:
- All utilities tested
- Performance benchmarks validated
- Tree-shaking verified
- README documentation complete

## Next Steps

1. Implement `22-core-constants` — Enums and route keys
2. Implement `23-core-hooks` — React hooks with React 19.2
