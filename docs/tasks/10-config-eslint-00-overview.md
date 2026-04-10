# 10-config-eslint: Shared ESLint Configuration

## Purpose
Provide shared ESLint configuration to enforce monorepo dependency flow and provide reusable TypeScript/Next.js linting setup.

## Dependencies
- **Required**: `11-config-typescript` for TypeScript-aware linting
- **Required when enabled**: `13-config-react-compiler` for React Compiler ESLint rules
- **Related evaluation tracks**: `14-config-biome`, `01-config-biome-migration`
- **Consumed by**: All packages and apps

## Scope
This task establishes:
- Base ESLint configuration with TypeScript support
- Next.js-specific configuration with React Hooks and performance rules
- Monorepo dependency boundary enforcement
- Import/export validation rules
- The canonical lint lane for the current repo phase

## Critical Context

ESLint 9 flat config is the canonical lint lane for this repository. The old `.eslintrc.js` configuration system is deprecated. All shared configurations must export flat config objects directly for use in `eslint.config.js`. Use the approved ranges and exact pins from `DEPENDENCY.md` rather than minor-version claims in task prose.

The `@agency/config-eslint` package enforces the monorepo's critical dependency flow rules using `no-restricted-paths` and `no-restricted-imports`. This prevents packages from importing from apps and ensures proper domain boundaries are respected.

## Tooling Lane

The current default is intentionally simple:
- **ESLint** remains the canonical linter
- **Prettier** remains the canonical formatter
- **Biome** remains evaluation-only until a decision update explicitly changes the lane

See `14-config-biome` and `01-config-biome-migration` only as evaluation tracks, not as parallel defaults.
