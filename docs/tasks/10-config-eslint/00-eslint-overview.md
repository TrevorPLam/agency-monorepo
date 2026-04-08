# 10-config-eslint: Shared ESLint Configuration

## Purpose
Provide shared ESLint configuration to enforce monorepo dependency flow and provide reusable TypeScript/Next.js linting setup.

## Dependencies
- **Required**: `11-config-typescript` for TypeScript parser
- **Required**: `13-config-react-compiler` for React Compiler ESLint rules
- **Required**: `01-config-biome-migration` for migration strategy
- **Consumed by**: All packages and apps

## Scope
This task establishes:
- Base ESLint configuration with TypeScript support
- Next.js-specific configuration with React Hooks and performance rules
- Monorepo dependency boundary enforcement
- Import/export validation rules
- Hybrid ESLint + Biome migration strategy

## Critical Context

ESLint 9 flat config is the current standard. The old `.eslintrc.js` configuration system is deprecated. All shared configurations must export flat config objects directly for use in `eslint.config.js`. `@typescript-eslint` v8.57.0 (latest minor versions ~8.57.1) includes all TypeScript linting rules and ESLint parser. `eslint-config-next` v16.2.2 is the latest official Next.js configuration and includes Next-specific rules plus React and React Hooks recommendations.

The `@agency/config-eslint` package enforces the monorepo's critical dependency flow rules using `no-restricted-paths` and `no-restricted-imports`. This prevents packages from importing from apps and ensures proper domain boundaries are respected.

## Migration Strategy

This configuration supports a hybrid approach with Biome migration:
- **ESLint**: Retained for specialized rules (React Hooks, Unicorn, custom agency plugins)
- **Biome**: Handles formatting and core linting (25-56x faster performance)
- **Transition**: Gradual migration over 4 weeks with rollback safety

See `01-config-biome-migration` task for complete migration guidance.
