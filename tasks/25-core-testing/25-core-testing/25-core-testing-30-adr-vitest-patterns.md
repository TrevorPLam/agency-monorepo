# ADR: Vitest 4.x as Primary Test Framework

## Status
**Accepted** - Adopt Vitest 4.x as the standard test framework with migration path from Jest.

## Context
As of April 2026, Vitest 4.x is the current stable release. Vitest provides significant advantages over Jest for modern JavaScript/TypeScript projects: native ESM support, faster execution, better TypeScript integration, and Vite ecosystem compatibility.

## Decision
We will use Vitest 4.x as the primary test framework across all packages in the monorepo.

## Consequences
- **Positive**: Faster test execution, native ESM support, better DX
- **Positive**: Single configuration for unit, integration, and E2E tests
- **Positive**: Native TypeScript support without ts-jest
- **Negative**: Migration effort from existing Jest setups
- **Negative**: Some Jest plugins may not have Vitest equivalents

## Implementation

### Version Pin (April 2026)
```json
{
  "devDependencies": {
    "vitest": "^4.1.3",
    "@vitest/ui": "^4.1.3",
    "@testing-library/react": "^16.3.2",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^26.0.0"
  }
}
```

### Key Vitest 4.x Features
- **Benchmark Mode**: Built-in benchmarking with `describe.bench()`
- **Browser Mode**: Native browser testing without Playwright
- **Workspace Support**: Monorepo-native configuration
- **TypeScript**: Native support, no separate configuration needed

### Migration from Jest
```ts
// Jest pattern
jest.mock("./module", () => ({
  ...jest.requireActual("./module"),
  myFunction: jest.fn()
}));

// Vitest equivalent
vi.mock("./module", async () => {
  const actual = await vi.importActual("./module");
  return {
    ...actual,
    myFunction: vi.fn()
  };
});
```

### Custom Matchers
```ts
// Vitest-compatible custom matchers
import { expect } from "vitest";

expect.extend({
  toBeValidSchema(received, schema) {
    const result = schema.safeParse(received);
    return {
      pass: result.success,
      message: () => result.success 
        ? "expected schema to be invalid" 
        : `schema validation failed: ${result.error?.message}`
    };
  }
});
```

## References
- [Vitest 4.x Documentation](https://vitest.dev/)
- [Migration Guide from Jest](https://vitest.dev/guide/migration.html)
- [Vitest 4.0 Release Notes](https://github.com/vitest-dev/vitest/releases)
