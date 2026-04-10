# 15-config-vite: Implementation Constraints

## Purpose
Define hard boundaries for conditional Vite usage so it can support approved non-Next consumers without drifting into a repo-wide default bundler.

## Hard Constraints

### Version Management
- **Vite Version Lock**: All approved consumers must use exact Vite 8.0.8 from the workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override the approved Vite version in their own `package.json`
- **Catalog-Only Dependencies**: Use `catalog:vite` references instead of direct version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Approved consumers must extend the shared base configuration rather than defining Vite from scratch
- **No Extending Extends Chains**: Maximum of one level of extension (base → consumer overrides)
- **Shared `vite.config.ts`**: Use `vite.config.ts` consistently when Vite is approved for a consumer

### Build Performance Constraints
- **Native ESM Support**: Use Vite's native ESM bundling for approved consumers
- **HMR Optimization**: Enable Vite HMR where it materially improves non-Next development workflows
- **Tree Shaking**: Preserve dead-code elimination through proper ES module configuration

### Integration Requirements
- **Non-Next Scope Only**: Vite may only be wired into approved non-Next packages, apps, or tools
- **Next.js Default Preserved**: Standard Next.js applications stay on Turbopack; do not add Vite as their default build lane
- **TypeScript Integration**: Maintain full TypeScript support with strict type checking
- **Plugin Ecosystem**: Use Vite plugins only when they are justified by the approved consumer's needs

## Forbidden Patterns

### ❌ Never Use These
```typescript
// In vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',
    lib: ['es2015'],
    format: 'iife'
  }
})
```

### ❌ Avoid These Anti-Patterns
- **Multiple `vite.config.ts` files**: Don't create `vite.dev.config.ts` or `vite.build.config.ts`; use a single `vite.config.ts`
- **Unauthorized Consumer Spread**: Don't add Vite to packages or apps that were not approved for it
- **Ignoring Vite errors**: Never use `// @vite-ignore` without filing a Vite issue or ADR
- **Performance Overrides**: Don't disable HMR or tree shaking for convenience
- **Next.js Drift**: Don't treat Vite as a replacement for Turbopack in standard Next.js apps

## Compliance Requirements

### Build Performance
- **Measured Benefit**: Vite adoption must show a real development or build benefit for the approved consumer
- **Native ESM**: Use Vite's ES module support for optimal bundling
- **HMR Speed**: Validate that HMR meaningfully improves developer feedback where dev-server workflows apply
- **Tree Shaking**: Confirm build output remains optimized

### Integration Requirements
- **Approved Consumer Only**: Each Vite integration must name the non-Next consumer it exists for
- **TypeScript**: Full TypeScript support with strict type checking
- **Plugin System**: Keep plugin usage minimal and consumer-specific

### Testing Requirements
- **Consumer Validation**: The approved consumer must build and run successfully with Vite
- **Type Coverage**: Preserve existing type-safety expectations for the affected package or app
- **Build Validation**: Build artifacts must be optimized and functional for the approved consumer

## Exit Criteria

A Vite configuration is complete when:
1. At least one approved non-Next consumer extends the shared Vite base configuration
2. Vite performance optimizations are enabled and validated for that consumer
3. Next.js applications remain on Turbopack by default
4. TypeScript integration provides full type safety
5. Documentation is comprehensive and scoped to conditional usage
6. Performance meets or exceeds the target consumer's baseline measurements

## Review Process

1. **Architecture Review**: Verify the change stays within `ARCHITECTURE.md` dependency flow rules
2. **Version Audit**: Confirm approved consumers use catalog Vite 8.0.8
3. **Consumer Validation**: Confirm the named non-Next consumer actually needs and successfully uses Vite
4. **Performance Testing**: Validate that Vite provides a measurable benefit for the approved consumer
5. **Security Review**: Ensure the chosen Vite plugins and configuration do not add unnecessary risk

## Consequences

This decision supports Vite as a conditional tool for approved non-Next consumers while preserving Turbopack as the default Next.js build lane.
