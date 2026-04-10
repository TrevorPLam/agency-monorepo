# 25-core-testing: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the testing package to ensure framework-agnostic testing, zero external dependencies, and maintainable test utilities.

## Critical Constraints

### Framework Agnostic Rules
- **No Testing Framework Coupling**: Utilities must work with Vitest, Jest, or any testing framework
- **No Framework-Specific APIs**: Avoid Vitest-specific APIs that break Jest compatibility
- **Generic Matchers**: Custom matchers must use standard assertion patterns
- **Portable Fixtures**: Test data generators work across all testing environments

### Zero External Dependencies Rule
- **No @agency/* Dependencies**: Only workspace config packages allowed
- **No Runtime Dependencies**: All dependencies must be devDependencies
- **No Testing Framework Imports**: Avoid importing from 'vitest' or 'jest' in source files
- **Type-Only Imports**: Use `import type` for testing framework types

### Tree Shaking Rules
- **Individual Exports**: Every utility must be individually exportable
- **Side Effects**: Package must have `sideEffects: false` in package.json
- **No Internal State**: Utilities cannot store state between test runs
- **Pure Functions**: All utilities should be pure functions where possible

### TypeScript Constraints
- **Strict Mode**: All utilities must compile with strict TypeScript settings
- **Generic Types**: Proper use of generics for reusable utilities
- **No Any Types**: Avoid `any` types; use `unknown` with type guards instead
- **Return Type Inference**: Functions should have explicit return types

## Functional Boundaries

### Utility Categories
Core testing package should only contain these utility categories:

| Category | Belongs | Notes |
|----------|---------|-------|
| Custom Matchers | ✅ Testing | Framework-agnostic assertion helpers |
| Test Fixtures | ✅ Testing | Data generators and mock factories |
| Mock Utilities | ✅ Testing | Mock implementations for common patterns |
| Performance Testing | ✅ Testing | Benchmark and timing utilities |
| Test Setup | ❌ Testing | Belongs in @agency/test-setup package |
| E2E Testing | ❌ Testing | Belongs in specific app test suites |
| Browser Testing | ❌ Testing | Use Playwright or similar directly |

## Forbidden Patterns

### ❌ Framework-Specific Coupling
```ts
// WRONG: Vitest-specific import
import { expect, vi } from "vitest";

export function createMock() {
  return vi.fn(); // Breaks Jest compatibility
}

// CORRECT: Framework-agnostic
export function createMock<T extends (...args: any[]) => any>(): T {
  return (() => {}) as T; // Works with any testing framework
}
```

### ❌ External Dependencies in Source
```ts
// WRONG: Importing from other @agency packages
import { Client } from "@agency/core-types";

export function createClientFixture(): Client {
  // Creates dependency on core-types
}

// CORRECT: Generic type parameter
export function createFixture<T>(factory: () => T): T {
  return factory(); // Framework-agnostic
}
```

### ❌ Stateful Utilities
```ts
// WRONG: Storing state between calls
let callCount = 0;

export function incrementCounter() {
  return ++callCount; // Side effect, not pure
}

// CORRECT: Pure function
export function incrementCounter(current: number): number {
  return current + 1; // No side effects
}
```

### ✅ Allowed Patterns
```ts
// CORRECT: Generic test fixture factory
export interface FixtureFactory<T> {
  create: (overrides?: Partial<T>) => T;
  createMany: (count: number, overrides?: Partial<T>) => T[];
}

export function createFixtureFactory<T>(
  defaultFactory: () => T
): FixtureFactory<T> {
  return {
    create: (overrides = {}) => ({ ...defaultFactory(), ...overrides }),
    createMany: (count, overrides = {}) => 
      Array.from({ length: count }, () => 
        createFixtureFactory({ ...defaultFactory(), ...overrides })
      )
  };
}
```

## Architectural Boundaries

### Package Dependencies
Allowed dependencies:
- `@agency/config-typescript` (workspace:*)
- Type-only imports from testing frameworks

Forbidden dependencies:
- Any `@agency/*` packages (except config)
- Runtime testing framework imports
- External utility libraries

### Import Direction
- Core testing package can only be imported by:
  - Test files in any package
  - Dev dependencies in other packages
  - Never imported in production code

## Compliance Requirements

- **TypeScript**: Strict mode with all type checks enabled
- **ESLint**: Import boundary enforcement via `@agency/config-eslint`
- **Testing**: All utilities must have comprehensive test coverage
- **Documentation**: Every utility must have JSDoc comments
- **Zero Production Impact**: Testing utilities must never be bundled in production

## Enforcement Mechanisms

### ESLint Rules
- Import boundary enforcement via `@agency/config-eslint`
- No restricted imports from production packages
- No testing framework imports in source files

### Build Verification
```bash
# Verify no production dependencies
pnpm --filter @agency/core-testing build --dry-run

# Check bundle size (should be minimal)
pnpm --filter @agency/core-testing build --report=bundle-size

# Verify tree-shaking
pnpm --filter @agency/core-testing build --report=tree-shaking
```

## Review Checklist

- [ ] All utilities are framework-agnostic
- [ ] Zero runtime dependencies outside workspace configs
- [ ] Individual exports work for tree-shaking
- [ ] No stateful utilities or side effects
- [ ] TypeScript strict mode compliance
- [ ] No `any` types without justification
- [ ] JSDoc documentation complete
- [ ] Testing utilities never import from production packages
