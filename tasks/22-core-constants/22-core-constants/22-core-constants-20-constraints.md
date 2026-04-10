# 22-core-constants: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the constants package to ensure type safety and prevent scope creep.

## Critical Constraints

### Const Enum Rules
- **No Regular Enums**: Only use `as const` enums for better tree-shaking and runtime performance
- **No Computed Values**: Const enums cannot have computed members, only constant values
- **Type Safety**: Always provide both const enum and inferred types
- **Export Strategy**: Export const enums with individual member exports for optimal tree-shaking

### Type Safety Rules
- **Exhaustive Checking**: Provide helper functions for type-safe enum usage
- **No Magic Strings**: All constants must be typed, never use string literals directly
- **Union Type Preference**: Use union types for fixed string values instead of enums when possible

### Dependency Constraints
- **Zero Dependencies**: Only depends on TypeScript configuration
- **No Circular Dependencies**: Cannot depend on other packages that import this package
- **Import Direction**: Only UI, data, auth, and communication packages may import core-constants

## Forbidden Patterns

### ❌ Dynamic Constants
```ts
// WRONG: Dynamic constant generation
export const API_ENDPOINTS = {
  production: process.env.API_PROD_URL,
  development: process.env.API_DEV_URL
} as const;
```

### ✅ Static Constants with Types
```ts
// CORRECT: Static constants with proper typing
export const API_ENDPOINTS = {
  production: "https://api.agency.com",
  development: "http://localhost:3000"
} as const;

export type Environment = keyof typeof API_ENDPOINTS;
export type ApiEndpoint = typeof API_ENDPOINTS[Environment];
```

## Architectural Boundaries

### Domain Separation
Constants package should only contain these constant categories:

| Category | Belongs | Notes |
|-----------|----------|-------|
| Routes | Core | Internal app routing constants |
| Error Codes | Core | Standardized error handling |
| Invoice States | Core | Invoice workflow constants |
| ❌ API Keys | Auth | Environment-specific, belongs in auth package |
| ❌ Feature Flags | Analytics | Dynamic configuration, belongs in analytics package |

## Compliance Requirements

- **TypeScript**: Use strict mode with all type checks enabled
- **ESLint**: Import boundary enforcement via `@agency/config-eslint`
- **Tree Shaking**: Structure for individual import elimination
- **Documentation**: All constants must have JSDoc comments

## Enforcement Mechanisms

### ESLint Rules
- Import boundary enforcement via `@agency/config-eslint`
- No dynamic property access in constants
- Type safety enforcement for all exports

### Build Verification
```bash
# Verify const enum usage
pnpm --filter @agency/core-constants lint --rule="const-enum"

# Check dependency compliance
pnpm --filter @agency/core-constants build --dry-run

# Validate exports
pnpm --filter @agency/core-constants build --report=exports
```

## Review Checklist

- [ ] All constants use const enums with `as const`
- [ ] No magic strings or dynamic values
- [ ] Type-safe exports with individual member access
- [ ] No circular dependencies with other packages
- [ ] All changes documented in README
