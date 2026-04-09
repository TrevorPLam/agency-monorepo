# 14-config-biome: Handoff Prompt

## Purpose
AI agent instructions for implementing Biome configuration with performance-focused linting and formatting in the agency monorepo.

## Context
You are implementing Biome configuration for a monorepo that uses:
- pnpm 10.33.0 with workspace catalog
- TypeScript 6.0.0 with Project References
- Turborepo 2.9.5 with tasks-based configuration
- ESLint compatibility layer for gradual migration

## Implementation Instructions

### Primary Goal
Create a unified Biome configuration system that enables:
1. 56x faster linting performance than ESLint
2. Single tool for linting and formatting
3. Workspace-aware boundary enforcement
4. Rust-based performance optimizations
5. ESLint compatibility during migration

### Key Requirements

#### 1. Base Configuration (`biome.json`)
- Performance-focused Biome 1.9.0 configuration
- Strict linting rules for type safety
- Modern JavaScript/TypeScript support
- Import boundary enforcement

#### 2. Workspace Integration
- Workspace-aware configuration for monorepo
- Proper handling of node_modules and build artifacts
- TypeScript integration with strict type checking

#### 3. Performance Optimization
- Rust-based performance optimizations enabled
- Memory usage kept under 512MB limit
- Incremental analysis where possible

### Critical Implementation Details

#### Package Configuration
```json
{
  "devDependencies": {
    "@agency/config-biome": "workspace:*"
  },
  "scripts": {
    "lint": "biome check .",
    "format": "biome format .",
    "lint:fix": "biome check . --apply"
  }
}
```

#### Root Integration
```json
{
  "scripts": {
    "lint": "biome check .",
    "format": "biome format .",
    "lint:fix": "biome check . --apply"
  }
}
```

### Performance Targets
- **56x Faster Linting**: Achieve 56x performance improvement over ESLint
- **Single Tool Complexity**: Eliminate dual-tool complexity (ESLint + Prettier)
- **Memory Efficiency**: Keep language server under 512MB limit
- **Build Performance**: Enable incremental analysis and caching

### Migration Strategy
1. **Phase 1**: Biome for new projects, maintain ESLint for existing
2. **Phase 2**: Gradual migration with compatibility layer
3. **Phase 3**: Complete ESLint removal once migration validated

### Quality Gates
- All Biome rules must pass without errors
- Performance improvements must be measurable
- ESLint compatibility layer must work for legacy projects
- TypeScript integration must be fully functional

### Testing Strategy
1. Performance benchmarking against ESLint baseline
2. Type checking across workspace boundaries
3. IDE integration testing with VS Code Biome extension
4. Migration path testing for existing projects

## Success Criteria
Implementation is complete when:
1. All new packages use Biome configuration by default
2. Performance improvements are measurable and significant
3. ESLint compatibility layer enables gradual migration
4. IDE integration provides optimal development experience
5. Documentation is comprehensive and tested

## Common Pitfalls to Avoid

- ❌ **ESLint Dependencies**: Don't add both ESLint and Biome to same package
- ❌ **Performance Overrides**: Don't disable Rust-based optimizations
- ❌ **Workspace Ignorance**: Don't ignore monorepo boundaries in configuration
- ❌ **Migration Blocking**: Don't remove ESLint until Biome migration is validated

## Next Steps After Implementation
1. Update all shared package README files with Biome usage examples
2. Create performance benchmarks for Biome vs ESLint
3. Add Biome-specific migration documentation
4. Update root package.json scripts for unified Biome usage
5. Consider removing ESLint from workspace catalog once migration complete

Remember: Biome provides significant performance advantages while maintaining strict type safety and code quality. Follow the gradual migration strategy to ensure smooth transition for existing projects.
