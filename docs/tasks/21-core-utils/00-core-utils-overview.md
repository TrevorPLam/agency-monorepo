# 21-core-utils: Pure Utility Functions

## Purpose
Pure functions only: date formatting, string helpers, currency formatting, input validation, slug generation. No React, no database, no environment access.

## Dependencies
- `@agency/core-types` — Domain types
- `@agency/config-typescript` — TypeScript configuration

## Scope
This package provides:
- Date formatting utilities
- String manipulation helpers
- Currency/calculation functions
- Validation helpers
- Pure functions with zero side effects

## Critical Rule
Pure means no React, no database access, no network calls, no environment variable reads. Same arguments always return same results.

## Next Steps
1. Implement date formatting utilities
2. Add string helpers (slugify, capitalize)
3. Add validation functions
4. Ensure 100% test coverage
