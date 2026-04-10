# 25-core-testing: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the testing utilities package to ensure framework-agnostic, tree-shakable test infrastructure.

## Critical Constraints

### Framework Agnostic Rules
- **No Framework Lock-in**: Utilities must work with Vitest, Jest, or any test framework
- **No Test Runner Dependencies**: Never import test runner APIs directly (use vitest's `expect` only for matchers)
- **Standard APIs Only**: Use standard JavaScript/TypeScript APIs for maximum portability

### Dependency Constraints
- **Only `@agency/core-types`**: Single internal dependency for type definitions
- **No UI Dependencies**: Cannot import from `@agency/ui-*` packages
- **No Database Dependencies**: Cannot import from `@agency/data-*` packages for base utilities
- **Zero External Dependencies**: Only workspace packages for base testing utilities

### Tree Shaking Rules
- **Individual Exports**: Every utility must be individually exportable
- **Side Effects**: Package must have `sideEffects: false` in package.json
- **Conditional Imports**: Large test utilities should be conditionally imported

## Functional Boundaries

### Allowed Categories
| Category | Belongs | Notes |
|----------|---------|-------|
| Custom Matchers | Core | Framework-agnostic assertion helpers |
| Test Fixtures | Core | Data generators using `@agency/core-types` |
| Mock Utilities | Core | Browser API mocks (fetch, localStorage, etc.) |
| Performance Tests | Core | Timing and benchmark utilities |
| ❌ Component Tests | UI | Belongs in `@agency/test-setup` |
| ❌ Database Mocks | Data | Belongs in `@agency/data-db` test utils |

## Forbidden Patterns

### ❌ Framework-Specific Tests
```ts
// WRONG: Vitest-specific code without abstraction
import { describe, it, expect } from "vitest";

describe("test", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});
```

### ✅ Framework-Agnostic Utilities
```ts
// CORRECT: Utility that works with any test framework
export function createMockFetch(config: MockConfig) {
  return () => Promise.resolve(config.response);
}

// Consumer uses their test framework of choice
import { describe, it, expect } from "vitest"; // or "jest"
describe("feature", () => {
  it("uses mock", () => {
    const mock = createMockFetch({ response: { data: "test" } });
    // test implementation
  });
});
```

## Compliance Requirements

- **Vitest Version**: Use `^4.0.0` (current as of April 2026)
- **TypeScript**: Strict mode with all type checks enabled
- **Testing Library**: `@testing-library/react@^16.3.0` for React 19 compatibility
- **Playwright**: `@playwright/test@^1.59.0` for E2E testing

## Testing Domain Separation

Per ARCHITECTURE.md, testing packages are condition-gated:
- `@agency/test-setup` (task 90): Build when duplication observed
- `@agency/test-fixtures` (task 91): Build when multiple suites need same factories

This `25-core-testing` directory represents experimental foundation utilities that may migrate to phase 90+ when standardized.

## Enforcement

```bash
# Verify framework agnostic design
pnpm --filter @agency/core-testing lint --rule="no-framework-lock"

# Check dependency compliance
pnpm --filter @agency/core-testing build --dry-run

# Validate tree-shaking
pnpm --filter @agency/core-testing build --report=exports
```
