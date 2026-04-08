# Guide: Writing AI Agent-Compliant Code

## Purpose

Practical guide for implementing code that respects the constraints defined in `AGENTS.md` and related documentation.

---

## Pre-Implementation Checklist

Before writing any code:

- [ ] Read `docs/AGENTS.md` completely
- [ ] Read relevant task folder documents (00-overview, 01-spec)
- [ ] Read target package `README.md` and `CHANGELOG.md`
- [ ] Check `exports` field in target package `package.json`
- [ ] Verify DEPENDENCY.md §13 for allowed dependencies
- [ ] Confirm no 🔒 conditional package rules are being violated

---

## Module Structure Guidelines

### 1. Package Entry Points

Every package must have explicit entry points via `exports`:

```json
{
  "name": "@agency/core-utils",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./formatters": {
      "types": "./dist/formatters/index.d.ts",
      "default": "./dist/formatters/index.js"
    }
  }
}
```

**AI agent rule:** Only import from paths listed in `exports`. Never import from `src/` or internal directories.

### 2. Barrel Files

Use barrel files (`index.ts`) to control public API surface:

```typescript
// packages/core-utils/src/index.ts
// Public API — only export what's intended for consumers
export { formatCurrency } from './formatters/currency';
export { formatDate } from './formatters/date';

// NOT exported — internal implementation detail
// import { helper } from './internal/helper'; ← stays internal
```

### 3. Import Patterns

**Correct patterns:**

```typescript
// Good: From package export
import { formatCurrency } from '@agency/core-utils';

// Good: From subpath export
import { formatCurrency } from '@agency/core-utils/formatters';

// Good: workspace:* for internal deps
// In package.json: "@agency/core-types": "workspace:*"
```

**Forbidden patterns:**

```typescript
// Bad: Deep import into package internals
import { formatCurrency } from '@agency/core-utils/src/formatters/currency';

// Bad: Relative path across packages
import { type } from '../../packages/core-types/src';

// Bad: Importing from apps
import { config } from '../../apps/agency-website/config';
```

---

## Dependency Management

### Adding a Dependency

1. Check if package exists in DEPENDENCY.md §13
2. Verify version pin matches exactly
3. Install in the correct internal package (not app)
4. Update the package's `package.json` exports if needed
5. Document in package README.md

**Example:** Adding date-fns for formatting:

```bash
# Check DEPENDENCY.md — date-fns should be owned by @agency/core-utils
# Version pin: date-fns@3.6.0

pnpm --filter @agency/core-utils add date-fns@3.6.0
```

### Using workspace:*

All internal dependencies use `workspace:*`:

```json
{
  "dependencies": {
    "@agency/core-types": "workspace:*"
  }
}
```

**Benefits:**
- pnpm resolves locally
- Changesets bumps versions correctly
- No version drift between packages

---

## TypeScript Patterns

### Strict Type Safety

```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Zod Schema Validation

```typescript
import { z } from 'zod';

// Define schema
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  clientId: z.string().uuid(), // Required — never optional for client data
  status: z.enum(['draft', 'active', 'archived']),
});

// Export inferred type
export type Project = z.infer<typeof projectSchema>;

// Use for validation
export function validateProject(data: unknown): Project {
  return projectSchema.parse(data);
}
```

---

## React Patterns

### Server Components First

```typescript
// app/page.tsx — Server Component by default
import { getProjects } from '@agency/data-db';

// Data fetching happens on server
const projects = await getProjects(clientId);

export default function ProjectsPage() {
  return <ProjectList projects={projects} />;
}
```

### Client Components When Needed

```typescript
'use client';

import { useState } from 'react';

// Only 'use client' when using browser APIs or React hooks
export function ProjectForm() {
  const [name, setName] = useState('');
  // ...
}
```

### React Compiler Compatibility

```typescript
// React Compiler handles memoization automatically
// Don't add manual useMemo/useCallback unless:
// 1. Complex object equality needed
// 2. External library integration
// 3. Performance-critical path requiring explicit control

// Good: Let compiler optimize
export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card>
      <h3>{project.name}</h3>
      <p>{project.description}</p>
    </Card>
  );
}

// Only manual memoization when necessary
export function ExpensiveComputation({ data }: { data: ComplexType }) {
  // Compiler can't optimize this complex equality check
  const processed = useMemo(() => {
    return heavyProcessing(data);
  }, [data.id, data.version]); // Custom equality
  
  return <Result value={processed} />;
}
```

---

## Database Patterns

### Mandatory Client Scoping

```typescript
// packages/data-db/src/queries/projects.ts
import { eq } from 'drizzle-orm';
import { projects } from '../schema';

// ❌ Wrong: Optional clientId
export async function getProjects(clientId?: string) {
  // Returns all projects if clientId not provided!
}

// ✅ Correct: Required clientId
export async function getProjects(clientId: string) {
  if (!clientId) {
    throw new Error('clientId is required for data isolation');
  }
  
  return db.query.projects.findMany({
    where: eq(projects.clientId, clientId),
  });
}

// ✅ Correct: Also apply to single record queries
export async function getProject(clientId: string, projectId: string) {
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.clientId, clientId),
      eq(projects.id, projectId)
    ),
  });
  
  if (!project) {
    throw new Error(`Project ${projectId} not found for client ${clientId}`);
  }
  
  return project;
}
```

### Schema Definition

```typescript
// packages/data-db/src/schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  clientId: uuid('client_id').notNull(), // Never nullable!
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

---

## Testing Patterns

### Unit Test Structure

```typescript
// packages/core-utils/src/formatters/currency.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });
  
  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
  
  it('throws on invalid currency code', () => {
    expect(() => formatCurrency(100, 'INVALID')).toThrow();
  });
});
```

### Component Testing

```typescript
// packages/ui-design-system/src/components/button.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('handles click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

---

## Change Management

### Determining Version Bump

Ask these questions:

1. **Is this a bug fix?** → Patch
2. **Does this add a new export?** → Minor
3. **Does this change an existing signature?** → Major
4. **Does this remove anything?** → Major

### Changeset Required For

- Any change to exported API
- Any version bump
- Any breaking change (requires migration note)

### Changeset Format

```markdown
---
"@agency/core-utils": minor
---

Add formatPercentage utility

- New function: formatPercentage(value, options)
- Options: decimals, locale, includeSymbol
```

---

## Documentation Requirements

Every package must have:

1. **README.md** — Purpose, installation, usage examples
2. **CHANGELOG.md** — Version history with changes
3. **package.json exports** — Explicit public API

### README Template

```markdown
# @agency/package-name

One-sentence description.

## Purpose

What problem this solves and who consumes it.

## Installation

In consuming app/package:
```bash
pnpm add @agency/package-name
```

## Usage

```typescript
import { something } from '@agency/package-name';
```

## API Reference

### Function/Component Name
Description and parameters.

## Ownership

@username — see CODEOWNERS
```

---

## Common Pitfalls to Avoid

1. **Adding dependencies to apps instead of packages** — Always install in the internal package that owns that dependency type
2. **Creating exports for one-off needs** — If only one app needs it, don't put it in a shared package
3. **Bypassing the public API** — Never import from `src/` or internal paths
4. **Skipping tests for "simple" changes** — All behavior changes need test updates
5. **Forgetting changesets** — Required for all version bumps
6. **Making client scoping optional** — Never allow cross-client data access
7. **Mixing server and client code incorrectly** — Use 'use client' only when necessary

---

## Quick Reference

| Need to... | Look at... |
|------------|------------|
| Check if I can add a dependency | DEPENDENCY.md §13 |
| Check import rules | AGENTS.md §Dependency Flow |
| Check if package should exist | DEPENDENCY.md §14 |
| Check version to use | DEPENDENCY.md §1-12 |
| Check high-risk areas | AGENTS.md §High-Risk Areas |
| Check testing requirements | This guide §Testing Patterns |
| Check documentation requirements | This guide §Documentation Requirements |

---

*Part of a0-docs-agents task — created April 2026.*
