# 91-test-fixtures: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `conditional` — Package-controlled, opt-in only |
| **Trigger** | Multiple tests require shared mock data |
| **Minimum Consumers** | 2+ packages/apps using shared fixtures |
| **Dependencies** | TypeScript 6.0, `@agency/core-types`, `@agency/test-setup` |
| **Exit Criteria** | Fixtures exported and used by at least 2 consumers |
| **Implementation Authority** | `REPO-STATE.md` — Conditional; requires explicit consumer opt-in |
| **Version Authority** | `DEPENDENCY.md` §1, §12 — TypeScript 6.0 |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Test fixtures `approved`
- Version pins: `DEPENDENCY.md` §1, §12
- Architecture: `ARCHITECTURE.md` — Testing layer section
- Note: Shared mock data for consistent testing across packages

## Files
```
packages/testing/fixtures/
├── package.json
├── tsconfig.json
├── 01-config-biome-migration-50-ref-quickstart.md
└── src/
    ├── index.ts
    ├── client.ts
    ├── project.ts
    ├── invoice.ts
    └── user.ts
```

### `package.json`
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
    "@agency/config-typescript": "workspace:*"
  },
  "publishConfig": { "access": "restricted" }
}
```

### `src/client.ts`
```ts
import { faker } from "@faker-js/faker";
import type { Client } from "@agency/core-types/client";

export function createMockClient(overrides?: Partial<Client>): Client {
  const now = new Date().toISOString();
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function createMockClients(count: number): Client[] {
  return Array.from({ length: count }, () => createMockClient());
}
```

### `src/project.ts`
```ts
import { faker } from "@faker-js/faker";
import type { Project, ProjectStatus } from "@agency/core-types/project";

const statuses: ProjectStatus[] = ["lead", "scoping", "active", "on-hold", "completed", "archived"];

export function createMockProject(overrides?: Partial<Project>): Project {
  const now = new Date().toISOString();
  return {
    id: faker.string.uuid(),
    clientId: faker.string.uuid(),
    name: faker.commerce.productName(),
    status: faker.helpers.arrayElement(statuses),
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

export function createMockProjectsForClient(clientId: string, count: number): Project[] {
  return Array.from({ length: count }, () => createMockProject({ clientId }));
}
```

### `src/invoice.ts`
```ts
import { faker } from "@faker-js/faker";
import type { Invoice, InvoiceState } from "@agency/core-types/invoice";

const states: InvoiceState[] = ["draft", "sent", "paid", "overdue", "void"];
const currencies = ["USD", "EUR", "GBP", "CAD"];

export function createMockInvoice(overrides?: Partial<Invoice>): Invoice {
  const now = new Date();
  const issuedAt = new Date(now.getTime() - faker.number.int({ min: 1, max: 30 }) * 24 * 60 * 60 * 1000);
  const dueAt = new Date(issuedAt.getTime() + 30 * 24 * 60 * 60 * 1000);

  return {
    id: faker.string.uuid(),
    clientId: faker.string.uuid(),
    projectId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }) ?? undefined,
    state: faker.helpers.arrayElement(states),
    amountCents: faker.number.int({ min: 1000, max: 500000 }),
    currency: faker.helpers.arrayElement(currencies),
    issuedAt: issuedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    ...overrides
  };
}

export function createMockInvoicesForClient(clientId: string, count: number): Invoice[] {
  return Array.from({ length: count }, () => createMockInvoice({ clientId }));
}
```

### `src/user.ts`
```ts
import { faker } from "@faker-js/faker";
import type { UserRole } from "@agency/core-types/user-role";

const roles: UserRole[] = ["owner", "admin", "operator", "account-manager", "client"];

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(roles),
    avatarUrl: faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.8 }),
    ...overrides
  };
}

export function createMockUsers(count: number): MockUser[] {
  return Array.from({ length: count }, () => createMockUser());
}
```

### `src/index.ts`
```ts
export { createMockClient, createMockClients } from "./client";
export { createMockProject, createMockProjectsForClient } from "./project";
export { createMockInvoice, createMockInvoicesForClient } from "./invoice";
export { createMockUser, createMockUsers, type MockUser } from "./user";
```

### README
```md
# @agency/test-fixtures
Mock factories and seed builders for test suites.
## Usage
```ts
import { createMockClient, createMockProjectsForClient } from "@agency/test-fixtures";

const client = createMockClient({ name: "Acme Corp" });
const projects = createMockProjectsForClient(client.id, 3);
```
## When to Add
Only create this package when you notice test suites in two or more packages building the same mock objects.
```
