# Core Testing Implementation Prompt

## Package Context

You are implementing `@agency/core-testing`, an experimental testing utilities package. This package provides framework-agnostic test fixtures, mocks, and performance utilities using Vitest 4.x.

**⚠️ Experimental Status**: This package is condition-gated per ARCHITECTURE.md §14. Standardized testing packages are tasks 90-91 (`test-setup`, `test-fixtures`). This directory is for experimental/research purposes.

## Critical Constraints

- **Framework Agnostic**: Utilities work with any test framework (Vitest, Jest)
- **Single Internal Dependency**: Only `@agency/core-types`
- **No Business Logic**: Fixtures provide data, not rules
- **Tree Shakable**: Individual exports, `sideEffects: false`
- **SSR Compatible**: All utilities work in server and client contexts

## Implementation Requirements

### 1. Fixture Factories

Create factories using `crypto.randomUUID()`:

```ts
export const createClientFixture: FixtureFactory<Client> = {
  create: (overrides = {}) => ({
    id: crypto.randomUUID(),
    name: overrides.name ?? "Test Client",
    slug: overrides.slug ?? "test-client",
    createdAt: overrides.createdAt ?? new Date(),
    updatedAt: overrides.updatedAt ?? new Date()
  }),
  createMany: (count, overrides = {}) => 
    Array.from({ length: count }, () => createFixture(overrides))
};
```

### 2. Discriminated Union Support (Zod v4)

For types using `z.discriminatedUnion()`, create type-specific factories:

```ts
export const createLeadProject = (overrides = {}) => ({
  id: crypto.randomUUID(),
  status: "lead" as const, // Discriminant must be literal
  // ... other fields
});

export const createActiveProject = (overrides = {}) => ({
  id: crypto.randomUUID(),
  status: "active" as const,
  // ... other fields
});
```

### 3. Mock Utilities

Create framework-agnostic mocks:

```ts
// Mock fetch
export function createMockFetch(config: MockConfig) {
  return () => Promise.resolve({
    ok: true,
    json: () => Promise.resolve(config.response)
  });
}

// Mock localStorage
export function createMockLocalStorage() {
  const store = new Map();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    clear: () => store.clear()
  };
}
```

### 4. Performance Testing (Vitest 4.x)

Use built-in benchmark mode:

```ts
import { bench, describe } from "vitest";

describe.bench("formatDate", () => {
  bench("current implementation", () => {
    formatDate(new Date(), "short");
  });
});
```

### 5. Custom Matchers

Extend Vitest with Zod v4-aware matchers:

```ts
expect.extend({
  toBeValidSchema(received, schema) {
    const result = schema.safeParse(received);
    return {
      pass: result.success,
      message: () => result.success 
        ? "expected invalid schema" 
        : result.error?.message ?? "validation failed"
    };
  }
});
```

### 6. Export Structure

```json
{
  "exports": {
    ".": "./src/index.ts",
    "./matchers": "./src/matchers.ts",
    "./fixtures": "./src/fixtures.ts",
    "./mocks": "./src/mocks.ts",
    "./performance": "./src/performance.ts"
  },
  "sideEffects": false
}
```

### 7. Dependencies

```json
{
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*",
    "vitest": "^4.1.3"
  }
}
```

## Quality Standards

- All fixtures use `crypto.randomUUID()` for IDs
- All exports are individually tree-shakable
- No circular dependencies with other packages
- All utilities are framework-agnostic
- Comprehensive JSDoc documentation
- Test coverage >90%

## Common Pitfalls to Avoid

- Do not import test runner APIs in base utilities
- Do not create business logic in fixtures
- Do not import from `@agency/ui-*` or `@agency/data-*`
- Do not use `any` types in public API
- Do not create side effects in utilities

## Success Criteria

- [ ] All fixtures use `crypto.randomUUID()` for IDs
- [ ] Discriminated union factories correctly typed
- [ ] Mock utilities isolated (no cross-test state)
- [ ] Vitest 4.x benchmark mode utilized
- [ ] Custom matchers implemented
- [ ] 100% test coverage for utilities
- [ ] Zero circular dependencies
- [ ] Framework-agnostic design verified

## Experimental Note

This implementation is experimental. When the condition trigger is met (per ARCHITECTURE.md §14), these utilities should be migrated to:
- Task 90: `@agency/test-setup` (configuration)
- Task 91: `@agency/test-fixtures` (factories and mocks)
