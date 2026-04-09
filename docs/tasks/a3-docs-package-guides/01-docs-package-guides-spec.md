# a3-docs-package-guides: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `planned` — Documented target; implementation not yet authorized |
| **Trigger** | Shared packages require usage documentation |
| **Minimum Consumers** | All package consumers |
| **Dependencies** | None (meta documentation) |
| **Exit Criteria** | Package guides published for all shared packages |
| **Implementation Authority** | `REPO-STATE.md` — Phase: Planning, Build status: Not started |
| **Version Authority** | Repository governance |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Package guides `approved`
- Location: `docs/package-guides/`
- Note: Each shared package should have a guide

## Files

```
docs/
└── package-guides/
    ├── README.md
    ├── _template.md
    ├── config-eslint.md
    ├── config-typescript.md
    ├── config-tailwind.md
    ├── config-prettier.md
    ├── core-types.md
    ├── core-utils.md
    ├── core-constants.md
    ├── core-hooks.md
    ├── ui-design-system.md
    ├── ui-icons.md
    ├── ui-theme.md
    ├── data-db.md
    ├── data-cms.md
    ├── data-api-client.md
    ├── auth-internal.md
    ├── auth-portal.md
    ├── email-templates.md
    ├── email-service.md
    ├── notifications.md
    └── test-setup.md
```

### Index README (`docs/package-guides/README.md`)
```markdown
# Package Guides

Detailed documentation for every shared package in the monorepo.

## Quick Links

### Config Packages
- [ESLint Config](./config-eslint.md) - Code linting rules
- [TypeScript Config](./config-typescript.md) - Compiler settings
- [Tailwind Config](./config-tailwind.md) - Design tokens
- [Prettier Config](./config-prettier.md) - Code formatting

### Core Packages
- [Core Types](./core-types.md) - Shared TypeScript types
- [Core Utils](./core-utils.md) - Pure utility functions
- [Core Constants](./core-constants.md) - Enums and constants
- [Core Hooks](./core-hooks.md) - Reusable React hooks

### UI Packages
- [Design System](./ui-design-system.md) - UI components
- [Icons](./ui-icons.md) - Icon components
- [Theme](./ui-theme.md) - Design tokens and theming

### Data Packages
- [Database](./data-db.md) - Drizzle ORM and queries
- [CMS Schemas](./data-cms.md) - Sanity schemas
- [API Client](./data-api-client.md) - API utilities

### Auth Packages
- [Internal Auth](./auth-internal.md) - Clerk configuration
- [Portal Auth](./auth-portal.md) - Better Auth configuration

### Communication Packages
- [Email Templates](./email-templates.md) - React Email templates
- [Email Service](./email-service.md) - Email sending abstraction
- [Notifications](./notifications.md) - Notification helpers

### Testing Packages
- [Test Setup](./test-setup.md) - Testing configuration

## For AI Agents

When working with a package, always:
1. Read its package guide here first
2. Read the package's own README.md
3. Check the package.json exports field
4. Review recent CHANGELOG.md entries

See [AGENTS.md](../AGENTS.md) for complete agent rules.
```

### Template (`docs/package-guides/_template.md`)
```markdown
# @agency/[package-name]

**Domain:** [config/core/ui/data/auth/communication/testing]  
**Purpose:** One-sentence description of what this package does.  
**Consumers:** List of apps/packages that use this.

## Overview

Paragraph explaining the package's role in the architecture and why it exists.

## Installation

```bash
# For apps
pnpm add @agency/[package-name]

# The package is already available via workspace:* in internal packages
```

## Quick Start

### Basic Usage

```typescript
// Most common use case - 3-5 lines showing the happy path
import { something } from "@agency/[package-name]";

const result = something("example");
```

### Common Patterns

#### Pattern 1: [Name]

When to use this pattern and why.

```typescript
// Code example
```

#### Pattern 2: [Name]

When to use this pattern and why.

```typescript
// Code example
```

## API Reference

### Functions/Components

#### `functionName(param: Type): ReturnType`

Description of what it does.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| param | string | Yes | Description |

**Example:**
```typescript
// Usage example
```

### Types/Interfaces

#### `TypeName`

```typescript
interface TypeName {
  field: string;
  optional?: number;
}
```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `VAR_NAME` | What it's for |

### Optional Configuration

```typescript
// How to configure if needed
```

## Best Practices

### DO
- ✅ Do this thing
- ✅ Do another thing

### DON'T
- ❌ Don't do this thing
- ❌ Don't do another thing

## Common Issues

### Issue: [Common Problem]

**Symptom:** What you see  
**Cause:** Why it happens  
**Solution:** How to fix it

## Related Packages

- [@agency/related-package](./related-package.md) - How they relate

## Change History

See [CHANGELOG.md](../../packages/[domain]/[package]/CHANGELOG.md) for version history.

## Ownership

**Owner:** @agency/[team-name]  
**Review Required For:** All changes (see CODEOWNERS)
```

### Example Guide (`docs/package-guides/core-types.md`)
```markdown
# @agency/core-types

**Domain:** Core  
**Purpose:** Canonical TypeScript types and Zod schemas for domain models.  
**Consumers:** All packages and apps.

## Overview

This package sits at the base of the entire dependency graph. It defines what a "Client" looks like, what valid "Project" states exist, and how an "Invoice" is structured. Every other package imports these types, creating a single source of truth.

When types change here, TypeScript propagates the change to every consumer, surfacing every place that needs updating before anything ships to production.

## Installation

Already included via workspace in all internal packages:
```json
{
  "dependencies": {
    "@agency/core-types": "workspace:*"
  }
}
```

## Quick Start

### Import Types

```typescript
// Import specific types
import { Client, Project, Invoice } from "@agency/core-types";

// Import validation schemas
import { clientSchema, projectSchema } from "@agency/core-types";

// Import enums
import { ProjectStatus, InvoiceState } from "@agency/core-types";
```

### Validate Data

```typescript
import { clientSchema } from "@agency/core-types";

const result = clientSchema.safeParse(unknownData);
if (result.success) {
  // Data is valid, result.data is typed
  const client = result.data;
} else {
  // Handle validation errors
  console.error(result.error.issues);
}
```

## API Reference

### Domain Types

#### `Client`

Represents a client in the system.

```typescript
interface Client {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### `Project`

Represents a project belonging to a client.

```typescript
interface Project {
  id: string;
  clientId: string;  // Multi-tenant scoping field
  name: string;
  status: ProjectStatus;
  startDate: Date;
  endDate?: Date;
}
```

### Validation Schemas (Zod)

#### `clientSchema`

Zod schema for validating client data.

```typescript
const clientSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Infer TypeScript type from schema
type Client = z.infer<typeof clientSchema>;
```

### Enums

#### `ProjectStatus`

```typescript
enum ProjectStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}
```

## Best Practices

### DO
- ✅ Keep this package dependency-free (except Zod)
- ✅ Add new types here before using them in other packages
- ✅ Use Zod schemas for runtime validation
- ✅ Export both the schema and the inferred type

### DON'T
- ❌ Add React, database, or I/O dependencies here
- ❌ Put business logic here (use @agency/core-utils)
- ❌ Skip validation when receiving external data

## Multi-Tenant Data Pattern

All types for client-owned data MUST include a `clientId` field:

```typescript
interface ClientOwnedData {
  id: string;
  clientId: string;  // Required for isolation
  // ... other fields
}
```

This enables strict scoping in database queries.

## Change Impact

Changes to this package affect the entire monorepo:

| Change Type | Impact | Version Bump |
|-------------|--------|--------------|
| Add field to type | All consumers get new field | Minor |
| Remove/rename field | All consumers break | Major |
| Change schema validation | Runtime behavior changes | Minor/Major |

Always include a changeset and consider if a codemod is needed.

## Related Packages

- [@agency/core-utils](./core-utils.md) - Functions that operate on these types
- [@agency/data-db](./data-db.md) - Database layer using these types

## Ownership

**Owner:** @agency/senior-backend-lead  
**Review Required For:** All changes (per CODEOWNERS)
```

### Another Example (`docs/package-guides/data-db.md`)
```markdown
# @agency/data-db

**Domain:** Data  
**Purpose:** Drizzle ORM schema, client factory, and typed query modules.  
**Consumers:** All internal tools and client portals.

## Overview

This is the single source of truth for operational data. It contains:
- Drizzle schema definitions
- Database client factory
- Typed query modules
- Migration files

**Critical Rule:** This package enforces strict `client_id` scoping. Every query must filter by `client_id` for multi-tenant isolation.

## Installation

```json
{
  "dependencies": {
    "@agency/data-db": "workspace:*",
    "@agency/core-types": "workspace:*"
  }
}
```

## Quick Start

### Create Database Client

```typescript
import { createDbClient } from "@agency/data-db";

// In apps, use environment variable
const db = createDbClient(process.env.DATABASE_URL);
```

### Run Queries

```typescript
import { clientQueries } from "@agency/data-db/queries";

// List all clients (scoped to requesting user's client_id)
const clients = await clientQueries.getAll({ clientId: "client-uuid" });

// Get single client
const client = await clientQueries.getById(clientId, clientUuid);
```

## API Reference

### Client Factory

#### `createDbClient(connectionString: string)`

Creates a Drizzle database client.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| connectionString | string | Yes | PostgreSQL connection URL |

**Example:**
```typescript
const db = createDbClient("postgresql://user:pass@host/db");
```

### Query Modules

All query modules follow the pattern:

```typescript
// Functions accept clientId as first parameter
function getAll(params: { clientId: string }): Promise<T[]>
function getById(clientId: string, id: string): Promise<T | null>
function create(clientId: string, data: CreateInput): Promise<T>
function update(clientId: string, id: string, data: UpdateInput): Promise<T>
function remove(clientId: string, id: string): Promise<void>
```

## Client Isolation (CRITICAL)

Every query MUST include `client_id` scoping:

```typescript
// ✅ CORRECT - Scoped query
const result = await db
  .select()
  .from(projects)
  .where(eq(projects.clientId, clientId));  // Required!

// ❌ WRONG - Unscoped query returns all clients' data
const result = await db
  .select()
  .from(projects);
```

## Environment Setup

### Local Development

Use `.env.local` in your app:
```bash
DATABASE_URL="postgresql://user:pass@localhost:5432/agency_dev"
```

### Neon Branching (Recommended)

```bash
# Create branch for feature work
neon branches create --name feature-X --parent main

# Get connection string for branch
neon connection-string feature-X
```

## Migrations

See [Database Migration Workflow](../database/migrations.md) for:
- Creating migrations
- Running migrations locally
- CI/CD integration

Quick commands:
```bash
# Generate migration from schema changes
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Check schema consistency
pnpm db:check
```

## Testing with Testcontainers

```typescript
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { createDbClient } from "@agency/data-db";

const container = await new PostgreSqlContainer().start();
const db = createDbClient(container.getConnectionUri());

// Run migrations and tests
```

## Best Practices

### DO
- ✅ Always pass `clientId` to query functions
- ✅ Use transactions for multi-step operations
- ✅ Add indexes in separate migrations from schema changes
- ✅ Test migrations on a copy of production data

### DON'T
- ❌ Write queries without client_id scoping
- ❌ Edit existing migration files after they've run
- ❌ Delete migration files from history
- ❌ Mix schema and data migrations

## Common Issues

### Issue: "relation does not exist"

**Symptom:** Query fails with table not found  
**Cause:** Migrations haven't been run  
**Solution:** Run `pnpm db:migrate`

### Issue: Query returns wrong client's data

**Symptom:** Data isolation breach  
**Cause:** Missing `client_id` in WHERE clause  
**Solution:** Add client_id filtering to query

## Related Packages

- [@agency/core-types](./core-types.md) - Types used in queries
- [@agency/test-fixtures](./test-fixtures.md) - Test data generation

## Ownership

**Owner:** @agency/data-owner  
**Review Required For:** All changes (high blast radius - affects all apps)
```


## Root README Update

Add to root README.md (TASK_32) links section:
```markdown
## Documentation

- [Package Guides](./docs/package-guides/) - Detailed usage for every package
- [Architecture](./docs/architecture/) - ADRs and technical decisions
- [Onboarding](./docs/onboarding/) - New contributor setup
```


## AI Agent Integration

Per TASK_21 (AGENTS.md), agents must:

1. Read package guide before touching any shared package
2. Read package README.md
3. Read package.json exports field
4. Check CHANGELOG.md for recent changes

Package guides provide the "how to use" while READMEs provide the "what this is".


## Verification

```bash
# All package guides exist
ls docs/package-guides/*.md | wc -l  # Should be 20+

# Template is copyable
cat docs/package-guides/_template.md

# Links work from root README
grep -c "package-guides" README.md
```


## Maintenance

When creating a new package:
1. Copy `_template.md`
2. Fill in specific details
3. Add to `README.md` index
4. Link from package's own README

When updating a package:
1. Update its package guide if API changes
2. Update examples if usage patterns change
3. Cross-reference other affected guides
