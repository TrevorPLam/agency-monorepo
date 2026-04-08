# 14-config-biome: Implementation Constraints

## Purpose
Define hard boundaries and constraints for Biome configuration to prevent configuration drift and ensure consistency across the monorepo.

## Hard Constraints

### Version Management
- **Biome Version Lock**: All packages must use exact Biome 1.9.0 from workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override Biome version in their own package.json
- **Catalog-Only Dependencies**: Use `catalog:biome` reference instead of direct version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Packages must extend from base configuration, never configure Biome from scratch
- **No Extending Extends Chains**: Maximum of one level of extension (base → specific overrides)
- **Shared biome.json**: All packages must use `biome.json` filename, not project-specific names

### Performance Constraints
- **56x Performance**: Must leverage Biome's Rust-based performance advantages
- **Single Tool**: Biome must handle both linting and formatting, no separate formatter needed
- **Workspace-Aware**: Configuration must respect monorepo boundaries and workspace protocol

### Integration Requirements
- **ESLint Compatibility**: Biome must provide ESLint compatibility layer for gradual migration
- **TypeScript Integration**: Full TypeScript support with strict type checking
- **IDE Integration**: VS Code Biome extension must work across workspace

## Forbidden Patterns

### ❌ Never Use These
```json
{
  "linter": {
    "rules": {
      "style": "off"  // Use Biome formatter instead
    }
  },
  "formatter": {
    "enabled": false  // Use Biome formatter
  }
}
```

### ❌ Avoid These Anti-Patterns
- **Multiple biome.json files**: Don't create `biome.dev.json`, `biome.build.json` - use single `biome.json`
- **Per-package biome.json**: Don't extend from other packages, only from `@agency/config-biome`
- **Ignoring Biome errors**: Never use `// biome-ignore` without filing a Biome issue or ADR
- **Performance Overrides**: Don't disable performance optimizations for convenience

## Compliance Requirements

### Linting Rules
- **Type Safety**: All type errors must be caught at lint time, not just build time
- **Import Boundaries**: Enforce proper import boundaries via Biome rules
- **Code Quality**: Maintain 90%+ code quality score across workspace

### Testing Requirements
- **TypeScript Testing**: Use Biome's integrated test runner
- **Type Coverage**: Maintain 90%+ type coverage for all shared packages

## Exit Criteria

A Biome configuration is complete when:
1. All packages extend from catalog-based base configuration
2. Biome performance optimizations are enabled and working
3. Linting catches type errors without configuration conflicts
4. IDE integration provides full IntelliSense across workspace
5. Documentation is comprehensive and tested
6. Performance meets or exceeds baseline measurements

## Review Process

1. **Architecture Review**: Verify configuration follows ARCHITECTURE.md dependency flow rules
2. **Version Audit**: Confirm all packages use catalog Biome 1.9.0
3. **Performance Testing**: Validate Biome's 56x performance advantage
4. **IDE Validation**: Test VS Code Biome extension in complex package scenarios
5. **Security Review**: Ensure no security vulnerabilities in Biome configuration

## Consequences

This decision enables significant performance improvements while maintaining strict type safety and code quality standards. The migration path allows gradual adoption while preserving existing ESLint setups during transition.
