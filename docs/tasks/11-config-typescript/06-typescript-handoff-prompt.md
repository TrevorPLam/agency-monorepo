# 11-config-typescript: Handoff Prompt

## Purpose
AI agent instructions for implementing TypeScript configuration with Project References in the agency monorepo.

## Context
You are implementing TypeScript configuration for a monorepo that uses:
- pnpm 10.44.0 with workspace catalog
- TypeScript 6.0.0 with Project References
- Turborepo 2.9.4 with tasks-based configuration
- ESLint with TypeScript plugin v8.57.0+

## Implementation Instructions

### Primary Goal
Create a unified TypeScript configuration system that enables:
1. Type safety across package boundaries
2. Incremental compilation for performance
3. Clear dependency relationships
4. IDE support across the entire workspace

### Key Requirements

#### 1. Base Configuration (`base.json`)
- Strict TypeScript settings for all packages
- ES2022 target with modern lib support
- Module resolution optimized for monorepo

#### 2. Next.js Configuration (`nextjs.json`)
- React 19.3+ compatible settings
- JSX preserve for Next.js apps
- Incremental compilation enabled
- Path aliases for clean imports

#### 3. Library Configuration (`library.json`)
- Composite project setup for shared packages
- Build artifacts generation
- Type declaration outputs

### Critical Implementation Details

#### Workspace Protocol Usage
```typescript
// In shared package tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".", // Use workspace protocol instead
    "paths": {
      "@agency/core-types": ["../../../packages/core-types/src"], // Use workspace: protocol
      "@agency/ui-theme": ["../../../packages/ui-theme/src"]
    }
  }
}
```

#### Project References Setup
```json
// In root tsconfig.json
{
  "files": ["packages/*/tsconfig.json"],
  "references": [
    { "path": "./packages/core-types" },
    { "path": "./packages/core-utils" },
    { "path": "./packages/core-constants" },
    { "path": "./packages/core-hooks" },
    { "path": "./packages/ui-theme" },
    { "path": "./packages/ui-icons" },
    { "path": "./packages/ui-design-system" }
  ]
}
```

### Build Integration
Configure Turborepo to use `tsc --build` for type checking across the workspace:
```json
{
  "tasks": {
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": [".tsbuildinfo"]
    }
  }
}
```

### Quality Gates
- All shared packages must build without TypeScript errors
- Project references must form a valid DAG
- Incremental compilation must be working correctly
- ESLint integration must catch type errors at lint time

### Testing Strategy
1. Test type boundaries by importing across packages
2. Verify incremental compilation works
3. Test IDE IntelliSense across workspace
4. Validate error messages are clear and actionable

## Success Criteria
Implementation is complete when:
1. All shared packages extend from workspace catalog configurations
2. Project references build successfully across workspace
3. Type checking catches errors at build/lint time
4. IDE provides full IntelliSense support
5. Build performance meets or exceeds baseline

## Common Pitfalls to Avoid

- ❌ **Manual Path Mapping**: Never use `baseUrl` + `paths` for cross-package imports
- ❌ **Version Conflicts**: Don't allow packages to override TypeScript version from catalog
- ❌ **Circular Dependencies**: Project references must not reference each other
- ❌ **Missing Exports**: Ensure every package has proper exports field configured
- ❌ **Build Order**: Don't ignore project reference dependency ordering

## Next Steps After Implementation
1. Update all shared package README files with Project Reference examples
2. Create migration guide for existing manual configurations
3. Add TypeScript performance benchmarks to documentation
4. Update root package.json build scripts to use Project References

Remember: This configuration enables type-safe development across the entire monorepo while maintaining excellent build performance. Follow the ARCHITECTURE.md dependency flow rules strictly.
