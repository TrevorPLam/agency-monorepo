# 14-config-biome: ADR - Performance-Focused Tooling

## Status
**Accepted** - Adopt Biome as the primary linting and formatting tool for new projects.

## Context
All new projects in the monorepo will use Biome by default for linting and formatting. Existing ESLint configurations will remain for gradual migration compatibility.

## Decision
We will standardize on Biome as the primary tooling solution for performance and maintainability.

### Rationale
1. **56x Performance**: Biome's Rust-based architecture delivers 56x faster linting than ESLint according to 2026 benchmarks
2. **Single Tool**: Biome handles both linting and formatting, eliminating toolchain complexity
3. **Modern Architecture**: Built for modern JavaScript/TypeScript with first-class TypeScript support
4. **Gradual Migration**: Biome provides ESLint compatibility layer for smooth transition from existing ESLint setups
5. **Workspace Awareness**: Native understanding of monorepo boundaries and workspace protocols

### Implementation Details
- All new packages will use `@agency/config-biome` by default
- Existing packages can opt into Biome migration when ready
- ESLint compatibility layer available during transition period
- Performance improvements immediate upon Biome adoption

## Migration Strategy
1. **Phase 1**: Biome for all new projects, ESLint for existing
2. **Phase 2**: Gradual migration of existing packages to Biome-only
3. **Phase 3**: Complete ESLint removal once all packages migrated

## Consequences
This decision delivers significant performance improvements while maintaining tooling flexibility during the migration period. Long-term, this simplifies the developer experience and reduces maintenance overhead.
