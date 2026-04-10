# Test Fixtures: Implementation Prompt

## Context
You are implementing the `@agency/test-fixtures` package for the agency monorepo. This is a **condition-gated** package that should only be built when 2+ test suites need the same domain factories with realistic data.

## Package Purpose
Provide rich, realistic test data factories using Faker.js for:
- Client entities
- Project entities  
- User entities
- Invoice entities

**Critical Rules**:
- This package contains ONLY data factories
- No test configuration (that's `@agency/test-setup`)
- No custom matchers (that's `@agency/core-testing`)
- Uses Faker.js v10 (ESM-only, requires Node 20.19+)

## Prerequisites

Before implementing, verify:
- [ ] Node.js 20.19+ is installed
- [ ] `@agency/core-types` is already built
- [ ] Faker.js v10 ESM requirements are understood

## File Structure

```
packages/testing/fixtures/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
└── src/
    ├── index.ts
    ├── client.ts
    ├── project.ts
    ├── user.ts
    └── invoice.ts
```

## Implementation Steps

### 1. Create Package Structure

```bash
mkdir -p packages/testing/fixtures/src
```

### 2. Package Configuration

Create `package.json`:
```json
{
  "name": "@agency/test-fixtures",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./client": "./src/client.ts",
    "./project": "./src/project.ts",
    "./invoice": "./src/invoice.ts",
    "./user": "./src/user.ts"
  },
  "dependencies": {
    "@agency/core-types": "workspace:*",
    "@faker-js/faker": "10.4.0"
  },
  "devDependencies": {
    "@agency/config-eslint": "workspace:*",
    "@agency/config-typescript": "workspace:*",
    "vitest": "4.1.3"
  },
  "publishConfig": { "access": "restricted" }
}
```

### 3. TypeScript Configuration

Create `tsconfig.json`:
```json
{
  "extends": "@agency/config-typescript/library.json",
  "compilerOptions": {
    "moduleResolution": "Bundler",
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### 4. Client Factory

Create `src/client.ts`:
```typescript
import { faker } from '@faker-js/faker';
import type { Client } from '@agency/core-types/client';

export function createMockClient(overrides?: Partial<Client>): Client {
  const name = faker.company.name();
  const now = new Date().toISOString();
  
  return {
    id: faker.string.uuid(),
    name,
    slug: faker.helpers.slugify(name).toLowerCase(),
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function createMockClients(
  count: number, 
  overrides?: Partial<Client>
): Client[] {
  return Array.from({ length: count }, () => createMockClient(overrides));
}
```

### 5. Project Factory

Create `src/project.ts`:
```typescript
import { faker } from '@faker-js/faker';
import type { Project, ProjectStatus } from '@agency/core-types/project';

const statuses: ProjectStatus[] = ['lead', 'scoping', 'active', 'on-hold', 'completed', 'archived'];

export function createMockProject(overrides?: Partial<Project>): Project {
  const now = new Date().toISOString();
  
  return {
    id: faker.string.uuid(),
    clientId: overrides?.clientId ?? faker.string.uuid(),
    name: faker.commerce.productName(),
    status: faker.helpers.arrayElement(statuses),
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function createMockProjects(
  clientId: string, 
  count: number
): Project[] {
  return Array.from({ length: count }, () => 
    createMockProject({ clientId })
  );
}
```

### 6. User Factory

Create `src/user.ts`:
```typescript
import { faker } from '@faker-js/faker';
import type { User, UserRole } from '@agency/core-types/user';

const roles: UserRole[] = ['owner', 'admin', 'operator', 'account-manager', 'client'];

export function createMockUser(overrides?: Partial<User>): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    name: faker.person.fullName({ firstName, lastName }),
    role: faker.helpers.arrayElement(roles),
    avatarUrl: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.8 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  };
}

export function createMockUsers(
  count: number, 
  overrides?: Partial<User>
): User[] {
  return Array.from({ length: count }, () => createMockUser(overrides));
}
```

### 7. Invoice Factory

Create `src/invoice.ts`:
```typescript
import { faker } from '@faker-js/faker';
import type { Invoice, InvoiceState } from '@agency/core-types/invoice';

const states: InvoiceState[] = ['draft', 'sent', 'paid', 'overdue', 'void'];
const currencies = ['USD', 'EUR', 'GBP', 'CAD'] as const;

export function createMockInvoice(overrides?: Partial<Invoice>): Invoice {
  const now = new Date();
  const issuedAt = faker.date.past({ years: 1 });
  const dueAt = new Date(issuedAt);
  dueAt.setDate(dueAt.getDate() + 30);
  
  return {
    id: faker.string.uuid(),
    clientId: overrides?.clientId ?? faker.string.uuid(),
    projectId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    number: `INV-${issuedAt.getFullYear()}-${faker.number.int(9999).toString().padStart(4, '0')}`,
    state: faker.helpers.arrayElement(states),
    amountCents: faker.number.int({ min: 1000, max: 500000 }),
    currency: faker.helpers.arrayElement(currencies),
    issuedAt: issuedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    ...overrides
  };
}

export function createMockInvoices(
  clientId: string, 
  count: number
): Invoice[] {
  return Array.from({ length: count }, () => 
    createMockInvoice({ clientId })
  );
}
```

### 8. Index Export

Create `src/index.ts`:
```typescript
// Client factories
export { createMockClient, createMockClients } from './client';

// Project factories
export { createMockProject, createMockProjects } from './project';

// User factories
export { createMockUser, createMockUsers } from './user';

// Invoice factories
export { createMockInvoice, createMockInvoices } from './invoice';
```

### 9. README

Create `01-config-biome-migration-50-ref-quickstart.md`:
```markdown
# @agency/test-fixtures

Rich, realistic test data factories using Faker.js.

## Requirements

- Node.js 20.19+, 22.13+, or 24.x (Faker.js v10 is ESM-only)

## Usage

```typescript
import { createMockClient, createMockProjects } from '@agency/test-fixtures';

const client = createMockClient({ name: 'Acme Corp' });
const projects = createMockProjects(client.id, 3);
```

## Related Packages

- `@agency/core-testing` - Basic fixtures and mocks (no Faker.js)
- `@agency/test-setup` - Test configuration

## When to Use

Use this package when you need **realistic data** (names, addresses, emails).
Use `@agency/core-testing` for simple fixtures with IDs only.
```

## Verification Commands

After implementation, run:

```bash
# Install dependencies
pnpm install

# Check Node version (must be 20.19+)
node --version

# Type check
pnpm --filter @agency/test-fixtures typecheck

# Test factories
pnpm --filter @agency/test-fixtures test

# Verify ESM imports
node --input-type=module -e "
  import('./packages/testing/fixtures/src/client.ts')
    .then(m => console.log('✓ ESM imports work'))
    .catch(e => console.error('✗', e.message));
"
```

## Constraints Check

Before completing, verify:
- [ ] No imports from `vitest` in factory files
- [ ] No imports from `@testing-library` in factory files
- [ ] No imports from `@playwright/test` in factory files
- [ ] All types imported from `@agency/core-types`
- [ ] Faker.js pinned to 10.4.0
- [ ] `type: "module"` in package.json

## References

- `91-test-fixtures-20-constraints.md` - Detailed boundaries
- `91-test-fixtures-30-adr-faker-esm.md` - ESM requirements
- `91-test-fixtures-40-guide-domain-factories.md` - Factory patterns
- `@agency/core-testing` (25) - Alternative basic fixtures
- `@agency/test-setup` (90) - Test configuration
