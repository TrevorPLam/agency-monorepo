# 15-config-vite: Handoff Prompt

## Purpose
AI agent instructions for implementing Vite configuration with modern build tooling for the agency monorepo.

## Context
You are implementing Vite configuration for a monorepo that uses:
- pnpm 10.44.0 with workspace catalog
- TypeScript 6.0.0 with Project References
- Turborepo 2.9.4 with tasks-based configuration
- Next.js 16+ with Turbopack integration
- ESLint compatibility layer for gradual migration from webpack

## Implementation Instructions

### Primary Goal
Create a unified Vite configuration system that enables:
1. 10x faster builds than webpack-based configurations
2. Native ESM support with optimal tree shaking
3. Instant HMR for sub-100ms development feedback
4. Seamless Next.js 16+ integration with Turbopack
5. Modern plugin ecosystem for custom optimizations

### Key Requirements

#### 1. Base Configuration (`vite.config.ts`)
- Performance-focused Vite 6.0.0 configuration
- Native ESM bundling with strict module resolution
- Modern ES2022 target with broad browser support
- TypeScript integration with strict type checking

#### 2. Next.js Integration
- Turbopack integration for Next.js 16+ App Router
- App bundle target for optimal Next.js builds
- Static asset optimization for production builds
- Development server configuration for HMR

#### 3. Workspace Integration
- Workspace-aware configuration for monorepo
- Proper handling of node_modules and build artifacts
- TypeScript integration with strict type checking

#### 4. Performance Optimization
- Native ESM bundling enabled
- Tree shaking for dead code elimination
- Build artifact optimization for production
- Development server performance tuning

### Critical Implementation Details

#### Package Configuration
```json
{
  "devDependencies": {
    "@agency/config-vite": "workspace:*"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### Root Integration
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### Performance Targets
- **10x Faster Builds**: Achieve 10x performance improvement over webpack baseline
- **Instant HMR**: Sub-100ms hot module replacement latency
- **Native ESM**: Full ES module support with optimal tree shaking
- **Bundle Optimization**: 30%+ smaller bundles through modern optimizations

### Migration Strategy
1. **Phase 1**: Vite for new projects, webpack for existing
2. **Phase 2**: Gradual migration of existing packages to Vite-only
3. **Phase 3**: Complete webpack removal once all packages migrated

### Quality Gates
- All Vite builds must pass without errors
- Performance improvements must be measurable
- ESLint compatibility layer must work for legacy projects
- TypeScript integration must be fully functional

### Testing Strategy
1. Performance benchmarking against webpack baseline
2. Type checking across workspace boundaries
3. IDE integration testing with VS Code Vite extension
4. Migration path testing for existing projects

## Success Criteria
Implementation is complete when:
1. All packages use unified Vite configuration from workspace catalog
2. Performance improvements are measurable and significant
3. ESLint compatibility layer enables gradual migration
4. IDE integration provides optimal development experience
5. Documentation is comprehensive and tested
6. Migration path is clear and functional

## Common Pitfalls to Avoid

- ❌ **Webpack Dependencies**: Don't add both webpack and Vite to same package
- ❌ **Performance Overrides**: Don't disable HMR or tree shaking for convenience
- ❌ **Workspace Ignorance**: Don't ignore monorepo boundaries in configuration
- ❌ **Migration Blocking**: Don't remove webpack until Vite migration is validated

## Next Steps After Implementation
1. Update all shared package README files with Vite usage examples
2. Create performance benchmarks for Vite vs webpack
3. Add Vite-specific migration documentation
4. Update root package.json scripts for unified Vite usage
5. Consider removing webpack from workspace catalog once migration complete

Remember: Vite provides significant performance advantages while maintaining strict type safety and code quality. Follow the gradual migration strategy to ensure smooth transition for existing projects.
