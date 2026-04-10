# Test Fixtures: Constraints & Boundaries

## Purpose
Technical constraints and architectural boundaries for the `@agency/test-fixtures` package to ensure factories remain test-data-only with clear separation from other testing utilities.

## Critical Constraints

### Data-Only Rule
- **No Test Configuration**: Test runner configs belong in `@agency/test-setup` (90)
- **No Custom Matchers**: Assertion helpers belong in `@agency/core-testing` (25)
- **No Mock Utilities**: Mocks for browser APIs belong in `@agency/core-testing` (25)
- **Only Data Factories**: This package contains ONLY data generation using Faker.js

### When to Use Each Testing Package

| Need | Use Package | Reason |
|------|-------------|----------|
| Realistic test data (names, addresses, emails) | `@agency/test-fixtures` | Faker.js integration |
| Basic fixtures with simple IDs | `@agency/core-testing` | No external deps, uses crypto.randomUUID() |
| Test runner configuration | `@agency/test-setup` | Vitest/Playwright configs |
| Custom assertions, matchers | `@agency/core-testing` | Framework-agnostic utilities |
| Browser API mocks (fetch, localStorage) | `@agency/core-testing` | Reusable mocks |

### Dependency Constraints
- **Only `@agency/core-types`**: For type definitions
- **Only `@faker-js/faker`**: For data generation
- **No test runner dependencies**: No Vitest, Testing Library, or Playwright imports in factories
- **Zero business logic coupling**: Factories generate data, nothing else

## Factory Pattern Requirements

### Structure
Every factory must follow this pattern:
```typescript
export interface FixtureFactory<T> {
  create: (overrides?: Partial<T>) => T;
  createMany: (count: number, overrides?: Partial<T>) => T[];
}
```

### Rules
1. **Always provide defaults**: Every required field must have a sensible default
2. **Accept partial overrides**: Allow customization via `Partial<T>`
3. **Generate unique IDs**: Use `faker.string.uuid()` not hardcoded values
4. **Type-safe**: Return values must match TypeScript types from `@agency/core-types`
5. **No side effects**: Factories must be pure functions

## Faker.js Version Requirements

### ESM-Only Constraint
Faker.js v10+ is ESM-only. Requirements:
- **Node.js**: 20.19+, 22.13+, or 24.x
- **TypeScript**: 5.9+ with `moduleResolution: "Node20"` or `"Bundler"`
- **Import style**: Use `import { faker } from "@faker-js/faker"`

### Verification
```bash
node --version  # Must be 20.19+, 22.13+, or 24.x
```

## Allowed Factory Categories

### Domain Entities
| Entity | Factory File | Dependencies |
|--------|--------------|--------------|
| Client | `client.ts` | `@agency/core-types/client` |
| Project | `project.ts` | `@agency/core-types/project` |
| User | `user.ts` | `@agency/core-types/user` |
| Invoice | `invoice.ts` | `@agency/core-types/invoice` |

### Factory Data Types
| Data Type | Faker.js Method | Use Case |
|-----------|-----------------|----------|
| Names | `faker.person.fullName()` | User names, contact names |
| Companies | `faker.company.name()` | Client names |
| Emails | `faker.internet.email()` | User emails |
| URLs/Slugs | `faker.helpers.slugify()` | URL-friendly strings |
| Dates | `faker.date.past()` | Created/updated timestamps |
| UUIDs | `faker.string.uuid()` | Entity IDs |
| Numbers | `faker.number.int()` | Quantities, amounts |
| Currencies | `faker.finance.amount()` | Monetary values |

## Forbidden Patterns

### ❌ Using Wrong Package for Fixtures
```typescript
// WRONG: Test fixtures package doing too much
import { describe, it } from 'vitest';  // ❌ No test runner imports
import { expect } from 'vitest';         // ❌ No assertion imports

// WRONG: Mock logic in fixtures
export function createMockFetch() {      // ❌ Belongs in core-testing
  return vi.fn();
}
```

### ✅ Correct Fixture Pattern
```typescript
// CORRECT: Pure data generation
import { faker } from '@faker-js/faker';
import type { Client } from '@agency/core-types/client';

export function createMockClient(overrides?: Partial<Client>): Client {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  };
}
```

## Relationship to core-types

### Build Order
1. `@agency/core-types` must be built first (contains type definitions)
2. `@agency/test-fixtures` depends on core-types
3. Apps/tests can import fixtures

### Type Safety
All factories must use types from `@agency/core-types`:
```typescript
import type { Client } from '@agency/core-types/client';
// NOT: interface Client { ... }  ❌ Don't redefine types
```

## Compliance Requirements

### Version Pins
| Package | Required Version | Notes |
|---------|-----------------|-------|
| `@faker-js/faker` | 10.4.0 | ESM-only, Node 20.19+ required |
| `@agency/core-types` | workspace:* | For type definitions |

### TypeScript Configuration
```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "target": "ES2022"
  }
}
```

## Enforcement

```bash
# Verify no test runner imports
grep -r "from 'vitest'" src/ && echo "❌ Found vitest imports" || echo "✓ No vitest imports"
grep -r "from '@testing-library'" src/ && echo "❌ Found testing-library imports" || echo "✓ No testing-library imports"

# Verify Faker.js version
pnpm list @faker-js/faker | grep "10.4.0"

# Type check
pnpm --filter @agency/test-fixtures typecheck
```

## Exit Criteria

- [ ] All factories use Faker.js 10.4.0
- [ ] No test runner imports in factory files
- [ ] All factories follow the `create`/`createMany` pattern
- [ ] All return types use `@agency/core-types`
- [ ] Node version requirement documented (20.19+)
- [ ] README explains relationship to core-testing

## References

- `91-test-fixtures-30-adr-faker-esm.md` - ESM migration rationale
- `04-test-fixtures-guide-extending.md` - How to add new factories
- `@agency/core-testing` (25) - For basic fixtures and mocks
- `@agency/test-setup` (90) - For test configuration
