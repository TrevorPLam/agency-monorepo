# Guide: Test Fixtures and Data Generation

## Purpose
Comprehensive patterns for creating test fixtures and mock data generators using `@agency/core-types` and Zod v4 schemas.

## Fixture Factory Pattern

### Basic Factory
```ts
import type { Client, Project, User, Invoice } from "@agency/core-types";

export interface FixtureFactory<T> {
  create: (overrides?: Partial<T>) => T;
  createMany: (count: number, overrides?: Partial<T>) => T[];
}

// Client fixtures with crypto.randomUUID()
export const createClientFixture: FixtureFactory<Client> = {
  create: (overrides = {}) => ({
    id: crypto.randomUUID(),
    name: overrides.name ?? "Test Client",
    slug: overrides.slug ?? "test-client",
    createdAt: overrides.createdAt ?? new Date("2024-01-01"),
    updatedAt: overrides.updatedAt ?? new Date("2024-01-01")
  }),
  
  createMany: (count, overrides = {}) => 
    Array.from({ length: count }, (_, index) => 
      createClientFixture.create({
        ...overrides,
        id: crypto.randomUUID(),
        name: `Test Client ${index + 1}`,
        slug: `test-client-${index + 1}`
      })
    )
};
```

### Project Fixtures with Discriminated Unions (Zod v4)
```ts
import type { Project } from "@agency/core-types";

// For discriminated unions, create type-specific factories
export const createLeadProject = (overrides = {}) => ({
  id: crypto.randomUUID(),
  clientId: overrides.clientId ?? crypto.randomUUID(),
  name: overrides.name ?? "Lead Project",
  status: "lead" as const,
  budget: overrides.budget ?? 10000,
  expectedCloseDate: overrides.expectedCloseDate ?? new Date("2024-12-31"),
  createdAt: overrides.createdAt ?? new Date("2024-01-01"),
  updatedAt: overrides.updatedAt ?? new Date("2024-01-01")
});

export const createActiveProject = (overrides = {}) => ({
  id: crypto.randomUUID(),
  clientId: overrides.clientId ?? crypto.randomUUID(),
  name: overrides.name ?? "Active Project",
  status: "active" as const,
  teamAssignee: overrides.teamAssignee ?? crypto.randomUUID(),
  progress: overrides.progress ?? 50,
  createdAt: overrides.createdAt ?? new Date("2024-01-01"),
  updatedAt: overrides.updatedAt ?? new Date("2024-01-01")
});

// Union type helper
export function createProject(
  status: "lead" | "active" | "completed",
  overrides = {}
): Project {
  switch (status) {
    case "lead":
      return createLeadProject(overrides);
    case "active":
      return createActiveProject(overrides);
    // ... other cases
  }
}
```

## Mock Utilities

### Fetch Mock
```ts
import { vi } from "vitest";

export interface MockFetchConfig {
  response?: unknown;
  error?: Error;
  delay?: number;
  status?: number;
}

export function createMockFetch(config: MockFetchConfig = {}) {
  const { 
    response = { success: true }, 
    error, 
    delay = 0,
    status = 200 
  } = config;
  
  return vi.fn().mockImplementation(() => 
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (error) {
          reject(error);
        } else {
          resolve({
            ok: status >= 200 && status < 300,
            status,
            json: () => Promise.resolve(response)
          });
        }
      }, delay);
    })
  );
}
```

### localStorage Mock
```ts
export function createMockLocalStorage() {
  const store = new Map<string, string>();
  
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    clear: vi.fn(() => {
      store.clear();
    }),
    // Test helper
    _getStore: () => Object.fromEntries(store)
  };
}
```

## Performance Testing

### Benchmark Utilities (Vitest 4.x)
```ts
import { bench, describe } from "vitest";

export function createBenchmarkSuite<T>(
  name: string,
  implementations: Record<string, () => T>
) {
  describe.bench(name, () => {
    for (const [implName, fn] of Object.entries(implementations)) {
      bench(implName, fn);
    }
  });
}

// Usage
import { formatDate } from "@agency/core-utils/date";

createBenchmarkSuite("date formatting", {
  "Intl API": () => formatDate(new Date(), "short", "en-US"),
  "Native toLocale": () => new Date().toLocaleDateString("en-US")
});
```

## Testing Patterns

### Async Testing
```ts
import { describe, it, expect } from "vitest";

describe("async fixtures", () => {
  it("should create client with async ID generation", async () => {
    const client = await createAsyncClientFixture({
      name: "Async Client"
    });
    
    expect(client.id).toBeDefined();
    expect(client.name).toBe("Async Client");
  });
});
```

### Schema Validation Tests (Zod v4)
```ts
import { describe, it, expect } from "vitest";
import { clientSchema } from "@agency/core-types";

describe("client schema validation", () => {
  it("should validate with Zod v4 strict mode", () => {
    const validData = {
      id: crypto.randomUUID(),
      name: "Test",
      slug: "test",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = clientSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
  
  it("should reject extra properties in strict mode", () => {
    const dataWithExtra = {
      id: crypto.randomUUID(),
      name: "Test",
      slug: "test",
      createdAt: new Date(),
      updatedAt: new Date(),
      extraField: "not allowed" // Zod v4 .strict() rejects this
    };
    
    const result = clientSchema.safeParse(dataWithExtra);
    expect(result.success).toBe(false);
  });
});
```

## Best Practices

1. **Use crypto.randomUUID()** for IDs to avoid collisions
2. **Provide sensible defaults** for all required fields
3. **Accept partial overrides** for customization
4. **Create type-specific factories** for discriminated unions
5. **Export both single and array creators** for convenience
6. **Mock at the right level** - browser APIs, not business logic
