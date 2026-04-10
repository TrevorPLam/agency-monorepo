# 11-config-typescript: ADR - Project References Implementation

## Status
**Accepted** - TypeScript Project References are the recommended approach for monorepo type boundaries and build performance.

## Context
All shared packages in this monorepo must use TypeScript Project References to establish clear type boundaries and enable incremental compilation. This decision follows ARCHITECTURE.md guidance and 2026 best practices.

## Decision
We will use TypeScript Project References instead of manual path mapping for all shared packages.

### Rationale
1. **Type Safety**: Project references provide compile-time type checking across package boundaries
2. **Build Performance**: Enables incremental compilation and proper dependency ordering
3. **IDE Support**: Better IntelliSense and navigation across package boundaries
4. **Monorepo Best Practice**: Aligns with pnpm workspace + TypeScript Project References pattern recommended for 2026

### Implementation Details
- All shared packages will set `"composite": true` in their tsconfig.json
- Build system will use `tsc --build` for incremental compilation
- No manual `baseUrl` or `paths` configuration - use workspace: protocol and exports field
- Type errors will be caught at build time, not just in individual packages

## Migration Strategy
1. Update all shared package tsconfig.json files to use project references
2. Configure root build script to use `tsc --build` across workspace
3. Update ESLint configuration to handle project reference linting
4. Update VS Code settings for optimal project reference support

## Consequences
This decision simplifies cross-package type management while maintaining strict type safety and build performance boundaries recommended for modern TypeScript monorepos.
