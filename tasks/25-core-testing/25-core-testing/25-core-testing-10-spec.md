# 25-core-testing: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | First app or package needs shared testing utilities |
| **Minimum Consumers** | 2+ packages needing shared test utilities |
| **Dependencies** | Vitest, React Testing Library, TypeScript 6.0 |
| **Exit Criteria** | Test utilities exported and consumed by at least 2 packages |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | `DEPENDENCY.md` §8 — Vitest, Testing Library |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Core testing package `approved`
- Version pins: `DEPENDENCY.md` §8
- Architecture: `ARCHITECTURE.md` — Core layer section

## Files
```
packages/core/testing/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── matchers.ts
│   ├── fixtures.ts
│   ├── mocks.ts
│   └── performance.ts
└── README.md
```

### `package.json`
```json
{
  "name": "@agency/core-testing",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": "./src/index.ts",
    "./matchers": "./src/matchers.ts",
    "./fixtures": "./src/fixtures.ts",
    "./mocks": "./src/mocks.ts",
    "./performance": "./src/performance.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*"
  },
  "devDependencies": {
    "@agency/config-typescript": "workspace:*",
    "vitest": "^4.1.3"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/matchers.ts`
```ts
import { expect } from "vitest";

export interface ValidationMatcher<T = {
  toBeValidSchema: (schema: any) => (actual: unknown) => void;
  toHaveValidType: (expectedType: string) => (actual: unknown) => void;
  toMatchPerformanceThreshold: (thresholdMs: number) => (actual: number) => void;
}

export const createCustomMatchers = (): ValidationMatcher<any> => {
  return {
    toBeValidSchema: (schema) => (actual) => {
      const result = schema.safeParse(actual);
      if (result.success) {
        expect(result.data).toBeDefined();
      } else {
        expect(result.error).toBeDefined();
        expect(result.error?.message).toContain('validation failed');
      }
    },
    
    toHaveValidType: (expectedType) => (actual) => {
      expect(typeof actual).toBe(expectedType);
    },
    
    toMatchPerformanceThreshold: (thresholdMs) => (actual) => {
      expect(actual).toBeLessThan(thresholdMs);
    }
  };
};

// Extend Vitest matchers
expect.extend(createCustomMatchers());
```

### `src/fixtures.ts`
```ts
import { z } from "zod";
import type { Client, Project, User, Invoice } from "@agency/core-types";

export interface TestFixtureFactory<T> {
  create: (overrides?: Partial<T>) => T;
  createMany: (count: number, overrides?: Partial<T>) => T[];
}

// Client fixtures
export const createClientFixture: TestFixtureFactory<Client> = {
  create: (overrides = {}) => ({
    id: crypto.randomUUID(),
    name: overrides.name || "Test Client",
    slug: overrides.slug || "test-client",
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01")
  }),
  
  createMany: (count, overrides = {}) => 
    Array.from({ length: count }, (_, index) => 
      createClientFixture({
        ...overrides,
        name: `Test Client ${index + 1}`,
        slug: `test-client-${index + 1}`
      })
    )
};

// Project fixtures
export const createProjectFixture: TestFixtureFactory<Project> = {
  create: (overrides = {}) => ({
    id: crypto.randomUUID(),
    clientId: overrides.clientId || crypto.randomUUID(),
    name: overrides.name || "Test Project",
    status: overrides.status || "active",
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01")
  }),
  
  createMany: (count, overrides = {}) => 
    Array.from({ length: count }, (_, index) => 
      createProjectFixture({
        ...overrides,
        name: `Test Project ${index + 1}`
      })
    )
};

// User fixtures
export const createUserFixture: TestFixtureFactory<User> = {
  create: (overrides = {}) => ({
    id: crypto.randomUUID(),
    email: overrides.email || "test@example.com",
    name: overrides.name || "Test User",
    role: overrides.role || "user",
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01")
  }),
  
  createMany: (count, overrides = {}) => 
    Array.from({ length: count }, (_, index) => 
      createUserFixture({
        ...overrides,
        name: `Test User ${index + 1}`,
        email: `test${index + 1}@example.com`
      })
    )
};

// Invoice fixtures
export const createInvoiceFixture: TestFixtureFactory<Invoice> = {
  create: (overrides = {}) => ({
    id: crypto.randomUUID(),
    clientId: overrides.clientId || crypto.randomUUID(),
    number: overrides.number || `INV-${Date.now().toString(36).slice(-6).toUpperCase()}`,
    status: overrides.status || "draft",
    amount: overrides.amount || 1000,
    createdAt: overrides.createdAt || new Date("2024-01-01"),
    updatedAt: overrides.updatedAt || new Date("2024-01-01")
  }),
  
  createMany: (count, overrides = {}) => 
    Array.from({ length: count }, (_, index) => 
      createInvoiceFixture({
        ...overrides,
        number: `INV-${(index + 1).toString(36).slice(-6).toUpperCase()}`
      })
    )
};
```

### `src/mocks.ts`
```ts
export interface MockConfig {
  timeout?: number;
  response?: any;
  error?: Error;
}

export const createMockFetch = (config: MockConfig = {}) => {
  return vi.fn().mockImplementation(() => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (config.error) {
          reject(config.error);
        } else {
          resolve(config.response || { success: true });
        }
      }, config.timeout || 100);
    })
  );
};

export const createMockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => Promise.resolve(store[key] || null)),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
      return Promise.resolve();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
      return Promise.resolve();
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
      return Promise.resolve();
    })
  };
};
```

### `src/performance.ts`
```ts
export interface PerformanceTestConfig {
  iterations: number;
  thresholdMs: number;
  warmupIterations?: number;
}

export const createPerformanceTest = (config: PerformanceTestConfig) => {
  return {
    measure: <T>(
      testName: string,
      fn: () => T,
      warmupFn?: () => void
    ): { result: T; averageTime: number; minTime: number; maxTime: number } => {
      const times: number[] = [];
      
      // Warmup iterations
      if (warmupFn) {
        for (let i = 0; i < (config.warmupIterations || 10); i++) {
          warmupFn();
        }
      }
      
      // Actual measurements
      for (let i = 0; i < config.iterations; i++) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        times.push(end - start);
      }
      
      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);
      
      return {
        result: fn(),
        averageTime,
        minTime,
        maxTime
      };
    },
    
    benchmark: <T>(
      testName: string,
      fn: () => T,
      baseline?: number
    ): { improvement: number; faster: boolean } => {
      const { averageTime } = measure(testName, fn);
      
      if (!baseline) {
        return { improvement: 0, faster: false };
      }
      
      const improvement = ((baseline - averageTime) / baseline) * 100;
      const faster = averageTime < baseline;
      
      return { improvement, faster };
    }
  };
};
```

### `src/index.ts`
```ts
export { createCustomMatchers } from "./matchers";
export { createClientFixture, createProjectFixture, createUserFixture, createInvoiceFixture } from "./fixtures";
export { createMockFetch, createMockLocalStorage } from "./mocks";
export { createPerformanceTest } from "./performance";

// Re-export types
export type { TestFixtureFactory } from "./fixtures";
export type { ValidationMatcher } from "./matchers";
export type { MockConfig } from "./mocks";
export type { PerformanceTestConfig } from "./performance";
```

## Usage Examples

```ts
import { 
  createClientFixture, 
  createPerformanceTest,
  createCustomMatchers,
  createMockFetch 
} from "@agency/core-testing";

// Test fixtures
const client = createClientFixture({ name: "Custom Client" });
const clients = createClientFixture.createMany(5);

// Performance testing
const perfTest = createPerformanceTest({
  iterations: 1000,
  thresholdMs: 10
});

const { averageTime } = perfTest.measure("database query", () => {
  // Database query logic
});

// Custom matchers
expect(someData).toBeValidSchema(clientSchema);
expect(performanceResult).toMatchPerformanceThreshold(50);

// Mocks
const mockFetch = createMockFetch({
  response: { data: "success" },
  timeout: 1000
});
```

## Verification

```bash
# Type check
pnpm --filter @agency/core-testing typecheck

# Run tests
pnpm --filter @agency/core-testing test

# Verify exports
pnpm --filter @agency/core-testing build
```

## Performance Targets

### Testing Performance
- **Test execution time**: <100ms for typical test suites
- **Fixture creation**: <10ms for complex objects
- **Mock overhead**: <5% performance impact
- **Bundle size**: <50KB for testing utilities

## Implementation Rules

1. **Framework Agnostic**: Works with Vitest, Jest, or any testing framework
2. **Type Safety**: Full TypeScript support with proper generics
3. **Zero External Dependencies**: Only depends on `@agency/core-types` and workspace configs
4. **Tree Shaking**: Individual exports with `sideEffects: false`
5. **SSR Compatibility**: All utilities work in server and client environments
