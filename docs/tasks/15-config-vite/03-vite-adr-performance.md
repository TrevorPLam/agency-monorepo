# 15-config-vite: ADR - Performance-Focused Build Tooling

## Status
**Accepted** - Adopt Vite as primary build tool for new projects in the monorepo.

## Context
All new projects in the monorepo will use Vite by default for development and build tooling. Existing webpack configurations will remain for gradual migration compatibility.

## Decision
We will standardize on Vite as the primary build tooling solution for performance and developer experience.

### Rationale
1. **10x Performance**: Vite's native ESM bundling delivers 10x faster builds than webpack according to 2026 benchmarks
2. **Instant HMR**: Hot Module Replacement provides sub-100ms development feedback
3. **Modern Architecture**: Built for modern JavaScript/TypeScript with first-class plugin ecosystem
4. **Next.js 16+ Integration**: Native Vite integration in Next.js 16+ with Turbopack
5. **Plugin Ecosystem**: Rich plugin system for custom optimizations and integrations

### Implementation Details
- All new packages will use `@agency/config-vite` by default
- Existing packages can opt into Vite migration when ready
- Vite will handle both development server and production builds
- Performance improvements immediate upon Vite adoption

## Migration Strategy
1. **Phase 1**: Vite for all new projects, webpack for existing
2. **Phase 2**: Gradual migration of existing packages to Vite-only
3. **Phase 3**: Complete webpack removal once all packages migrated

## Consequences
This decision delivers significant performance improvements and modern development experience while maintaining flexibility during the migration period. Long-term, this simplifies the build toolchain and reduces maintenance overhead.
