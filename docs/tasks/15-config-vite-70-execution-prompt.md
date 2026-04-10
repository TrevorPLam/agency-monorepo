# 15-config-vite: Handoff Prompt

## Purpose
AI agent instructions for implementing shared Vite configuration for approved non-Next consumers without turning Vite into the repo's default build lane.

## Context
You are implementing Vite configuration in a monorepo that uses:
- pnpm 10.33.0 with workspace catalog
- TypeScript 6.0.0 with Project References
- Turborepo 2.9.5 with tasks-based configuration
- Next.js 16+ with Turbopack as the default Next.js build lane
- ESLint as the canonical linting lane and Vite only where an approved non-Next consumer needs it

## Implementation Instructions

### Primary Goal
Create a shared Vite configuration system that enables:
1. Faster dev/build workflows for an approved non-Next consumer
2. Native ESM support with good tree shaking
3. Fast HMR where a dev server is part of that consumer's workflow
4. Consumer-specific plugin support without widening scope
5. Preservation of Turbopack as the default lane for standard Next.js apps

### Key Requirements

#### 1. Base Configuration (`vite.config.ts`)
- Use the approved Vite 8.0.8 configuration from `DEPENDENCY.md`
- Provide native ESM bundling with strict module resolution
- Target modern runtimes appropriately for the approved consumer
- Maintain strict TypeScript integration

#### 2. Consumer Scope
- Wire Vite only into the named non-Next package, app, or tool that justifies it
- Do not add Vite as the default dev/build tool for standard Next.js apps
- Document the consumer rationale and keep the blast radius explicit

#### 3. Workspace Integration
- Keep configuration workspace-aware for the approved consumer
- Handle `node_modules` and build artifacts correctly
- Ensure other workspace build lanes remain unaffected

#### 4. Performance Optimization
- Enable native ESM bundling
- Use tree shaking and build optimization where they help the approved consumer
- Tune dev-server performance only where that workflow exists

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
    "dev:<approved-consumer>": "pnpm --filter <approved-consumer> dev",
    "build:<approved-consumer>": "pnpm --filter <approved-consumer> build"
  }
}
```

### Performance Targets
- **Faster Builds**: Improve the approved consumer's baseline build performance
- **Fast HMR**: Provide responsive dev-server feedback where applicable
- **Native ESM**: Preserve ES module output and tree shaking
- **Scoped Optimization**: Improve the target consumer without changing repo-wide defaults

### Migration Strategy
1. **Phase 1**: Add Vite for the approved non-Next consumer only
2. **Phase 2**: Validate performance, DX, and operational impact
3. **Phase 3**: Consider additional approved non-Next consumers only if the current migration succeeds

### Quality Gates
- All Vite builds for the approved consumer must pass without errors
- Performance improvements must be measurable for that consumer
- Standard Next.js applications must remain on Turbopack
- TypeScript integration must be fully functional

### Testing Strategy
1. Benchmark the approved consumer against its previous build/dev baseline
2. Run type checking across affected workspace boundaries
3. Test IDE integration for the approved consumer with Vite tooling
4. Confirm that unrelated Next.js apps and packages are unaffected

## Success Criteria
Implementation is complete when:
1. At least one approved non-Next consumer uses the shared Vite configuration
2. Performance improvements are measurable and significant for that consumer
3. Turbopack remains the default build lane for standard Next.js apps
4. IDE integration provides a good development experience for the target consumer
5. Documentation is comprehensive and scoped correctly
6. The path for additional approved non-Next consumers is clear without implying repo-wide adoption

## Common Pitfalls to Avoid

- ❌ **Next.js Drift**: Don't add Vite to standard Next.js apps as a default build lane
- ❌ **Scope Expansion**: Don't spread Vite across the workspace without a documented consumer need
- ❌ **Performance Overrides**: Don't disable HMR or tree shaking for convenience
- ❌ **Migration Blocking**: Don't remove the prior build lane until the approved consumer is validated

## Next Steps After Implementation
1. Update docs for the approved consumer with Vite usage examples
2. Record performance findings against the prior baseline
3. Add scoped migration notes for similar non-Next consumers if needed
4. Keep Turbopack as the standard Next.js lane unless decision docs change

Remember: Vite is conditional in this repo. Use it where a non-Next consumer clearly benefits, not as a silent replacement for the default Next.js build path.
