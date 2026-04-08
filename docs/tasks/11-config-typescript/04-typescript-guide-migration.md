# 11-config-typescript: Migration Guide

## Purpose
Guide developers through migrating from manual path mapping to TypeScript Project References within the monorepo.

## Migration Overview

This guide covers the transition from individual package TypeScript configurations to a unified workspace approach using Project References.

## Prerequisites
- Complete `@agency/config-typescript` package installation
- All packages updated to TypeScript 6.0.0
- pnpm workspace configured with catalog dependencies

## Step-by-Step Migration

### 1. Update Package tsconfig.json Files
For each shared package, update the tsconfig.json to extend from workspace configurations:

```json
{
  "extends": "@agency/config-typescript/base.json",
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./.tsbuildinfo"
  }
}
```

### 2. Configure Root Build System
Update root package.json scripts to use Project References:

```json
{
  "scripts": {
    "typecheck": "tsc --build",
    "build: "tsc --build && echo 'Build complete'"
  }
}
```

### 3. Update ESLint Configuration
Ensure ESLint understands Project References:

```js
// @agency/config-eslint/base.mjs
{
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parserOptions: {
      project: true // Enable project references
    }
  }
}
```

### 4. Verify Migration
```bash
# Test Project References work
pnpm --filter @agency/core-types exec tsc --build --dry

# Verify type checking across workspace
pnpm turbo typecheck

# Check for circular dependencies
npx tsc --showConfig
```

## Troubleshooting

### Common Issues
- **Circular Dependencies**: tsc will error if packages reference each other
- **Missing Exports**: Ensure all packages have proper exports field configured
- **Path Resolution**: Use workspace: protocol for cross-package imports

### Validation Checklist
- [ ] All packages extend from @agency/config-typescript
- [ ] Project references build without errors
- [ ] ESLint project references enabled
- [ ] No circular dependencies exist
- [ ] IntelliSense works across package boundaries

## Benefits
- **Type Safety**: Compile-time type checking across package boundaries
- **Build Performance**: Incremental compilation with proper dependency ordering
- **IDE Experience**: Better IntelliSense and navigation in VS Code
- **Maintainability**: Clear dependency graph and type relationships
