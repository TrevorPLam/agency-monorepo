# Core Constants Implementation Prompt

## Package Context
You are implementing `@agency/core-constants`, providing type-safe constants and enums for the entire agency monorepo. This package eliminates magic strings and provides centralized, tree-shakable configuration values.

## Critical Constraints
- **Const Assertions Only**: Use `as const` for all constants, never regular enums
- **Type Safety First**: All constants must provide TypeScript inference and type narrowing
- **Tree Shakable**: Structure exports for optimal bundle elimination
- **Zero Dependencies**: Only `@agency/config-typescript` (workspace:*)
- **Runtime Validation**: Provide validation helpers for critical constants when needed

## Implementation Requirements

### 1. Const Assertion Patterns
Use `as const` for all constant definitions:

```ts
// Before (Legacy enum)
export enum ProjectStatus {
  LEAD = "lead",
  ACTIVE = "active",
  COMPLETED = "completed"
}

// After (Const assertion)
export const PROJECT_STATUSES = {
  LEAD: "lead",
  ACTIVE: "active", 
  COMPLETED: "completed"
} as const;

export type ProjectStatus = typeof PROJECT_STATUSES[keyof typeof PROJECT_STATUSES];
```

### 2. Union Types from Constants
Create union types automatically from const assertions:

```ts
// Route constants with const assertion
export const INTERNAL_ROUTES = {
  dashboard: "/dashboard",
  crm: "/crm",
  projects: "/projects",
  invoices: "/invoices",
  reporting: "/reporting",
  settings: "/settings"
} as const;

// Automatic union type inference
export type InternalRoute = keyof typeof INTERNAL_ROUTES;
export type RoutePath = typeof INTERNAL_ROUTES[InternalRoute];
```

### 3. Runtime Validation Strategy
Implement validation helpers for critical constants:

```ts
// src/validation.ts
export const validateRoute = (route: string): InternalRoute => {
  const validRoutes = Object.values(INTERNAL_ROUTES);
  if (!validRoutes.includes(route as any)) {
    throw new Error(`Invalid route: ${route}. Valid routes: ${validRoutes.join(', ')}`);
  }
  return route;
};

// Performance-optimized validation
export const validateRouteOptimized = (() => {
  const routeSet = new Set(Object.values(INTERNAL_ROUTES));
  
  return (route: string): string => {
    if (!routeSet.has(route)) {
      const validRoutes = Array.from(routeSet);
      throw new Error(`Invalid route: ${route}. Valid routes: ${validRoutes.join(', ')}`);
    }
    return route;
  };
})();
```

### 4. Export Structure
Follow individual export pattern for tree-shaking:

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./routes": "./src/routes.ts",
    "./errors": "./src/errors.ts", 
    "./invoice": "./src/invoice.ts",
    "./constants": "./src/constants.ts"
  },
  "sideEffects": false
}
```

### 5. Dependencies
Only depend on:
- `@agency/config-typescript` (workspace:*)

### 6. Testing Requirements
- Unit tests for all constant validation scenarios
- Integration tests verify type safety
- Performance tests for constant access patterns
- Bundle analysis confirms tree-shaking effectiveness

## Quality Standards
- All constants use `as const` assertions
- All exports are individually tree-shakable
- No circular dependencies with other packages
- Union types automatically derived from const assertions
- Runtime validation performance meets requirements (<1ms for constant lookups)

## Common Pitfalls to Avoid
- Do not use regular enums (use const assertions instead)
- Do not embed business logic in constants
- Do not import from other `@agency/*` packages
- Do not use `any` types without explicit justification
- Do not bypass export structure

## Success Criteria
- [ ] All constants use const assertions with `as const`
- [ ] All exports work individually for tree-shaking
- [ ] Union types derived from const assertions
- [ ] Runtime validation helpers implemented where needed
- [ ] 100% test coverage for constant validation
- [ ] Comprehensive JSDoc documentation
- [ ] Zero circular dependencies
- [ ] Bundle size impact documented

Implement this package as the single source of truth for all shared constants in the monorepo. Type safety and tree-shaking here prevent runtime errors and bundle bloat across the entire system.
