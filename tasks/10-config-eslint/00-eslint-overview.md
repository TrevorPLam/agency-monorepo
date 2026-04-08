# 10-config-eslint: Shared ESLint Configuration

## Purpose
Enforce one-way dependency flow (`config/core → data/auth/communication/ui → apps`) via `no-restricted-paths` zones. Provide a reusable, sharable ESLint configuration.

## Dependencies
- None (uses external ESLint packages only)
- Followed by: All packages (they consume this config)

## Scope
This package provides:
- Base ESLint flat config for all packages
- Next.js-specific configuration for apps
- Import restriction rules enforcing dependency boundaries
- TypeScript-aware linting rules

## Critical Rules Enforced
- Packages must not import from apps
- Lower-level domains must not import from higher-level domains
- Consumers must use public package exports, not internal `src` paths

## Next Steps
1. All subsequent packages depend on this configuration
2. Import boundary violations are caught at lint time
