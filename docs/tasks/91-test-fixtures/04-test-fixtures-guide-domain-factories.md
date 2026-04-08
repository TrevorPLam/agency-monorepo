# Guide: Creating Domain Factories

## Purpose
How to create and extend test factories for domain entities using Faker.js.

## Factory Pattern

### Basic Factory Structure

```typescript
// src/client.ts
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
  return Array.from({ length: count }, () => 
    createMockClient(overrides)
  );
}
```

### Factory for Related Entities

```typescript
// src/project.ts
import { faker } from '@faker-js/faker';
import type { Project } from '@agency/core-types/project';
import { createMockClient } from './client';

export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: faker.string.uuid(),
    clientId: overrides?.clientId ?? faker.string.uuid(),
    name: faker.commerce.productName(),
    status: faker.helpers.arrayElement(['lead', 'active', 'completed']),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  };
}

// Factory that creates related entities
export function createMockProjectWithClient(overrides?: {
  client?: Partial<Client>;
  project?: Partial<Project>;
}) {
  const client = createMockClient(overrides?.client);
  const project = createMockProject({
    clientId: client.id,
    ...overrides?.project
  });
  
  return { client, project };
}
```

## Domain Entity Examples

### User Factory

```typescript
// src/user.ts
import { faker } from '@faker-js/faker';
import type { User } from '@agency/core-types/user';

const roles = ['owner', 'admin', 'operator', 'account-manager', 'client'] as const;

export function createMockUser(overrides?: Partial<User>): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  
  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    name: faker.person.fullName({ firstName, lastName }),
    role: faker.helpers.arrayElement(roles),
    avatarUrl: faker.image.avatar(),
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

// Create users with specific role
export function createMockUsersWithRole(
  count: number, 
  role: User['role']
): User[] {
  return createMockUsers(count, { role });
}
```

### Invoice Factory

```typescript
// src/invoice.ts
import { faker } from '@faker-js/faker';
import type { Invoice } from '@agency/core-types/invoice';

const states = ['draft', 'sent', 'paid', 'overdue', 'void'] as const;
const currencies = ['USD', 'EUR', 'GBP', 'CAD'] as const;

export function createMockInvoice(overrides?: Partial<Invoice>): Invoice {
  const issuedAt = faker.date.past({ years: 1 });
  const dueAt = new Date(issuedAt);
  dueAt.setDate(dueAt.getDate() + 30);
  
  const amountCents = faker.number.int({ min: 1000, max: 500000 });
  
  return {
    id: faker.string.uuid(),
    clientId: overrides?.clientId ?? faker.string.uuid(),
    projectId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    number: `INV-${faker.date.past({ years: 1 }).getFullYear()}-${faker.number.int(9999)}`,
    state: faker.helpers.arrayElement(states),
    amountCents,
    currency: faker.helpers.arrayElement(currencies),
    issuedAt: issuedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    ...overrides
  };
}

export function createMockInvoices(
  count: number, 
  overrides?: Partial<Invoice>
): Invoice[] {
  return Array.from({ length: count }, () => createMockInvoice(overrides));
}

// Create invoices for specific client
export function createMockInvoicesForClient(
  clientId: string, 
  count: number
): Invoice[] {
  return createMockInvoices(count, { clientId });
}
```

## Advanced Patterns

### Conditional Field Generation

```typescript
export function createMockClient(overrides?: Partial<Client>): Client {
  const hasWebsite = faker.datatype.boolean(0.7); // 70% chance
  
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
    website: hasWebsite ? faker.internet.url() : undefined,
    email: faker.internet.email(),
    phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.5 }),
    address: faker.helpers.maybe(() => ({
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: faker.location.country()
    }), { probability: 0.8 }),
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  };
}
```

### Sequences for Unique Values

```typescript
let clientCounter = 0;

export function createMockClient(overrides?: Partial<Client>): Client {
  clientCounter++;
  
  return {
    id: faker.string.uuid(),
    name: `Test Client ${clientCounter}`,
    slug: `test-client-${clientCounter}`,
    email: `client${clientCounter}@example.com`,
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides
  };
}

// Reset counter between test suites
export function resetClientCounter(): void {
  clientCounter = 0;
}
```

### Builder Pattern for Complex Objects

```typescript
class ProjectBuilder {
  private project: Partial<Project> = {};

  withClient(clientId: string): this {
    this.project.clientId = clientId;
    return this;
  }

  withStatus(status: Project['status']): this {
    this.project.status = status;
    return this;
  }

  withBudget(min: number, max: number): this {
    this.project.budget = faker.number.int({ min, max });
    return this;
  }

  build(): Project {
    return createMockProject(this.project);
  }
}

// Usage
const project = new ProjectBuilder()
  .withClient('client-123')
  .withStatus('active')
  .withBudget(10000, 50000)
  .build();
```

## Testing Factories

### Factory Self-Tests

```typescript
// __tests__/client.test.ts
import { describe, it, expect } from 'vitest';
import { createMockClient, createMockClients } from '../src/client';
import { clientSchema } from '@agency/core-types';

describe('createMockClient', () => {
  it('creates valid client data', () => {
    const client = createMockClient();
    const result = clientSchema.safeParse(client);
    expect(result.success).toBe(true);
  });

  it('applies overrides correctly', () => {
    const client = createMockClient({ name: 'Custom Name' });
    expect(client.name).toBe('Custom Name');
  });

  it('generates unique IDs', () => {
    const client1 = createMockClient();
    const client2 = createMockClient();
    expect(client1.id).not.toBe(client2.id);
  });
});

describe('createMockClients', () => {
  it('creates specified count', () => {
    const clients = createMockClients(5);
    expect(clients).toHaveLength(5);
  });

  it('applies overrides to all clients', () => {
    const clients = createMockClients(3, { status: 'active' });
    clients.forEach(client => {
      expect(client.status).toBe('active');
    });
  });
});
```

## Export Patterns

### Index File Organization

```typescript
// src/index.ts
// Client factories
export { createMockClient, createMockClients } from './client';
export type { ClientFactoryOptions } from './client';

// Project factories
export { createMockProject, createMockProjects, createMockProjectWithClient } from './project';

// User factories
export { createMockUser, createMockUsers, createMockUsersWithRole } from './user';

// Invoice factories
export { createMockInvoice, createMockInvoices, createMockInvoicesForClient } from './invoice';
```

## Best Practices

1. **Use `faker.helpers.maybe()`** for optional fields
2. **Provide sensible defaults** for all required fields
3. **Accept `Partial<T>`** for flexible overrides
4. **Generate unique values** for IDs and slugs
5. **Use `faker.helpers.slugify()`** for URL-friendly strings
6. **Export both single and array creators**
7. **Self-test factories** to ensure they generate valid data
8. **Document relationships** between factories

## References

- `@agency/core-types` - Source of truth for type definitions
- `@faker-js/faker` documentation - https://fakerjs.dev/
- `@agency/core-testing` - For basic fixtures without Faker.js
