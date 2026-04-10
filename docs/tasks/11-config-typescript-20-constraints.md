# 11-config-typescript: Implementation Constraints

## Purpose
Define hard boundaries and constraints for TypeScript configuration to prevent configuration drift and ensure consistency across the monorepo.

## Hard Constraints

### Version Management
- **TypeScript Version Lock**: All packages must use exact TypeScript 6.0.0 from workspace catalog
- **No Manual Version Overrides**: Individual packages cannot override TypeScript version in their own package.json
- **Catalog-Only Dependencies**: Use `catalog:typescript` reference instead of direct version specifiers

### Configuration Extensibility
- **Base Configuration Only**: Packages must extend from base.json, never configure TypeScript from scratch
- **No Extending Extends Chains**: Maximum of one level of extension (base → nextjs/library)
- **Shared tsconfig.json**: All packages must use `tsconfig.json` filename, not project-specific names

### Project References Requirements
- **Mandatory for Packages**: All shared packages must use TypeScript Project References
- **Composite Projects**: Library packages must set `"composite": true` and use `tsBuildInfoFile`
- **No Circular References**: Project references must form a DAG, no circular dependencies allowed

### Build Performance Constraints
- **Incremental Compilation**: All packages must leverage incremental compilation where possible
- **Type Checking Only**: Use `tsc --noEmit` for type checking without emitting files
- **Build Output**: Build artifacts must use `.tsbuildinfo` files for dependency tracking

### IDE Integration
- **VS Code Integration**: All TypeScript configurations must work with VS Code TypeScript extension
- **Language Server**: TypeScript language server must not exceed 512MB memory usage
- **IntelliSense**: Full IntelliSense support required for all workspace packages

## Forbidden Patterns

### ❌ Never Use These
```json
{
  "compilerOptions": {
    "baseUrl": "./src",  // Use workspace: protocol instead
    "paths": {              // Use exports field instead
      "@/*": ["./src/*"]  // Use workspace: protocol
    }
  }
}
```

### ❌ Avoid These Anti-Patterns
- **Multiple tsconfig files**: Don't create `tsconfig.dev.json`, `tsconfig.build.json` - use single `tsconfig.json`
- **Per-package tsconfig extends**: Don't extend from other packages, only from `@agency/config-typescript`
- **TypeScript compilation in packages**: Use `tsc --build` for project references, not individual compilation
- **Ignoring type errors**: Never use `// @ts-ignore` without filing a TypeScript issue or ADR

## Compliance Requirements

### ESLint Integration
- **TypeScript ESLint Rules**: Must use `@typescript-eslint/eslint-plugin` v8.57.0+
- **Type Checking**: All type errors must be caught at lint time, not just build time
- **Import Restrictions**: Enforce proper import boundaries via ESLint rules

### Testing Requirements
- **TypeScript Testing**: Use `@testing-library/jest-dom` for component testing patterns
- **Type Coverage**: Maintain 90%+ type coverage for all shared packages
- **Mock Typing**: All test mocks must be fully typed

## Exit Criteria

A TypeScript configuration is complete when:
1. All packages extend from catalog-based base configurations
2. Project references are properly configured and build successfully
3. ESLint integration catches type errors without configuration conflicts
4. IDE integration provides full IntelliSense across workspace
5. Build performance meets incremental compilation targets
6. No circular dependencies exist in project reference graph
7. All forbidden patterns are avoided in codebase

## Review Process

1. **Architecture Review**: Verify configuration follows ARCHITECTURE.md dependency flow rules
2. **Version Audit**: Confirm all packages use catalog TypeScript 6.0.0
3. **Build Testing**: Validate `tsc --build` works across workspace
4. **IDE Validation**: Test VS Code IntelliSense in complex package scenarios
5. **Performance Benchmark**: Measure incremental compilation improvements
6. **Security Review**: Ensure no type bypassing or unsafe configurations exist
