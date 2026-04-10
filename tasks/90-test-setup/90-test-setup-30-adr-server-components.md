# ADR: Server Components Testing Strategy (Next.js 16)

## Status
**Accepted**

## Context
Next.js 16 App Router introduces **async Server Components** that run exclusively on the server. These components:
- Can be async functions
- Execute during server-side rendering
- Cannot use browser APIs or React hooks
- Present unique testing challenges

Per Next.js official documentation (April 2026):
> "Since async Server Components are new to the React ecosystem, some tools do not fully support them. In the meantime, we recommend using End-to-End Testing over Unit Testing for async components."

## Decision

### Testing Pyramid for Next.js 16

| Component Type | Unit Test | Integration Test | E2E Test |
|----------------|-----------|------------------|----------|
| **Server Components (async)** | ❌ Not supported | ⚠️ Limited | ✅ Recommended |
| **Server Components (sync)** | ✅ Supported | ✅ Supported | ✅ Supported |
| **Client Components** | ✅ Supported | ✅ Supported | ✅ Supported |
| **Server Actions** | ✅ Test as functions | ✅ Route handlers | ✅ E2E flows |

### Specific Rules

1. **Async Server Components**: Must be tested via Playwright E2E tests
2. **Sync Server Components**: Can use React Testing Library with mocked data
3. **Server Actions**: Test as pure functions OR via E2E user flows
4. **Client Components**: Full testing-library support available

## Implementation

### E2E Testing for Server Components

```typescript
// e2e/server-components.spec.ts
import { test, expect } from '@playwright/test';

test('async Server Component renders correctly', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Verify server-rendered content
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  
  // Verify async data is rendered
  await expect(page.getByTestId('user-data')).toContainText('John Doe');
});
```

### Testing Server Actions

Option 1: Unit test as functions
```typescript
// app/actions/update-user.ts
export async function updateUser(formData: FormData) {
  'use server';
  // ... implementation
}

// __tests__/update-user.test.ts
import { updateUser } from './update-user';

test('updateUser validates input', async () => {
  const formData = new FormData();
  formData.set('email', 'invalid');
  
  const result = await updateUser(formData);
  expect(result.error).toBeDefined();
});
```

Option 2: E2E through UI
```typescript
// e2e/user-update.spec.ts
test('user can update profile via Server Action', async ({ page }) => {
  await page.goto('/profile');
  await page.fill('[name="email"]', 'new@example.com');
  await page.click('button[type="submit"]');
  
  await expect(page.getByText('Profile updated')).toBeVisible();
});
```

## Testing Patterns

### Pattern 1: Extract Logic from Server Components

Move data fetching to separate functions:

```typescript
// lib/data/get-user.ts
export async function getUser(id: string) {
  // Database/API call
  return db.query('SELECT * FROM users WHERE id = ?', [id]);
}

// app/user/[id]/page.tsx
import { getUser } from '@/lib/data/get-user';

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  return <UserProfile user={user} />;
}

// __tests__/get-user.test.ts - Test logic separately
import { getUser } from './get-user';

test('getUser returns user data', async () => {
  const user = await getUser('123');
  expect(user.id).toBe('123');
});
```

### Pattern 2: Mock Server Components in Parent Tests

When testing parent Client Components:

```typescript
// components/user-card.tsx (Client Component)
'use client';

export function UserCard({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// __tests__/user-card.test.ts
import { render, screen } from '@testing-library/react';
import { UserCard } from './user-card';

test('UserCard displays user name', () => {
  render(<UserCard user={{ name: 'John', id: '1' }} />);
  expect(screen.getByText('John')).toBeInTheDocument();
});
```

## CI Configuration

### Separate E2E Job

`.github/workflows/ci.yml`:
```yaml
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm test  # Unit/integration tests only

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test:e2e  # Server Component tests via Playwright
```

## Recommended Testing Split

### Phase 1: Foundation (Always)
- Unit tests for utilities, pure functions, hooks
- Component tests for Client Components
- Server Action function tests

### Phase 2: Integration (When Needed)
- API route testing
- Database integration testing
- Cross-package integration

### Phase 3: E2E (Required for Server Components)
- Critical user flows
- Server Component rendering
- Cross-browser verification

## Exit Criteria

- [ ] E2E tests cover all async Server Component routes
- [ ] Server Actions have either unit or E2E coverage
- [ ] CI separates unit and E2E jobs appropriately
- [ ] Documentation explains testing approach to developers

## References

- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Testing Async Server Components - Next.js](https://nextjs.org/docs/app/guides/testing/jest)
- React Server Components RFC
