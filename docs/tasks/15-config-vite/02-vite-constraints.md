# 15-config-vite: Implementation Constraints

## Purpose
Define hard boundaries and constraints for Vite configuration to prevent configuration drift and ensure consistency across the monorepo.

## Hard Constraints

### Version Management
- **Vite Version Lock**: All packages must use exact Vite 8.0.8 from workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override Vite version in their own package.json
- **Catalog-Only Dependencies**: Use `catalog:vite` reference instead of direct version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Packages must extend from base configuration, never configure Vite from scratch
- **No Extending Extends Chains**: Maximum of one level of extension (base → specific overrides)
- **Shared vite.config.ts**: All packages must use `vite.config.ts` filename, not project-specific names

### Build Performance Constraints
- **Native ESM Support**: Must leverage Vite's native ESM bundling for optimal performance
- **HMR Optimization**: Hot Module Replacement must be configured for instant development feedback
- **Tree Shaking**: Enable dead code elimination through proper ES module configuration

### Integration Requirements
- **Next.js Integration**: Vite must work seamlessly with Next.js 16+ Turbopack
- **TypeScript Integration**: Full TypeScript support with strict type checking
- **Plugin Ecosystem**: Use Vite's rich plugin system for custom optimizations

## Forbidden Patterns

### ❌ Never Use These
```typescript
// In vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015',  // Use ES2022 for modern features
    lib: ['es2015'],      // Use modern lib array
    format: 'iife'         // Use ES modules
  }
})
```

### ❌ Avoid These Anti-Patterns
- **Multiple vite.config.ts files**: Don't create `vite.dev.config.ts`, `vite.build.config.ts` - use single `vite.config.ts`
- **Per-package vite.config.ts**: Don't extend from other packages, only from `@agency/config-vite`
- **Ignoring Vite errors**: Never use `// @vite-ignore` without filing a Vite issue or ADR
- **Performance Overrides**: Don't disable HMR or tree shaking for convenience

## Compliance Requirements

### Build Performance
- **10x Performance**: Must leverage Vite's performance advantages over webpack
- **Native ESM**: Use Vite's native ES module support for optimal bundling
- **HMR Speed**: Hot Module Replacement must be instant (<100ms)
- **Tree Shaking**: Dead code elimination must be enabled and effective

### Integration Requirements
- **Next.js 16+**: Vite must integrate with Turbopack and App Router seamlessly
- **TypeScript**: Full TypeScript support with strict type checking
- **Plugin System**: Rich plugin ecosystem for custom build optimizations

### Testing Requirements
- **TypeScript Testing**: Use Vite's integrated test runner
- **Type Coverage**: Maintain 90%+ type coverage for all shared packages
- **Build Validation**: All build artifacts must be optimized and functional

## Exit Criteria

A Vite configuration is complete when:
1. All packages extend from catalog-based base configuration
2. Vite performance optimizations are enabled and working
3. Next.js integration is seamless and functional
4. TypeScript integration provides full type safety
5. Documentation is comprehensive and tested
6. Performance meets or exceeds baseline measurements

## Review Process

1. **Architecture Review**: Verify configuration follows ARCHITECTURE.md dependency flow rules
2. **Version Audit**: Confirm all packages use catalog Vite 8.0.8
3. **Performance Testing**: Validate Vite's 10x performance advantage
4. **Integration Validation**: Test Next.js 16+ Vite integration in complex scenarios
5. **Security Review**: Ensure no security vulnerabilities in Vite configuration

## Consequences

This decision enables significant performance improvements and modern build tooling while maintaining strict type safety and code quality standards. The migration path allows gradual adoption while preserving existing build configurations during transition.
