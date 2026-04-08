# 14-config-biome: Biome Configuration

## Purpose
Provide high-performance linting and formatting for the monorepo using Biome as a modern replacement for ESLint + Prettier combination.

## Dependencies
- None (uses external Biome packages only)
- Consumed by: All packages and apps (replaces ESLint + Prettier)

## Scope
This package provides:
- Shared Biome configuration for monorepo
- Performance-focused linting and formatting
- ESLint compatibility layer for legacy rules
- Import boundary enforcement
- TypeScript integration

## Critical Features
- **56x faster linting** than ESLint according to 2026 benchmarks
- **Single tool** for linting, formatting, and import sorting
- **Rust-based performance** with minimal overhead
- **ESLint compatibility** layer for gradual migration
- **Workspace-aware** configuration for monorepo boundaries

## Migration Strategy
Biome will be introduced alongside existing ESLint configuration to allow gradual migration:
1. **Phase 1**: Biome for new projects, ESLint for existing
2. **Phase 2**: Complete migration to Biome-only
3. **Phase 3**: Remove ESLint dependencies

## Next Steps
1. All new packages use Biome configuration by default
2. Existing packages can opt into Biome migration when ready
3. ESLint configuration remains available for legacy support during transition
