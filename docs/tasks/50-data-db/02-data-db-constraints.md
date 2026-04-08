# 50-data-db: Constraints & Critical Rules

## Purpose

This document defines the hard constraints, performance boundaries, and critical rules that govern the `@agency/data-db` package. These constraints are non-negotiable and must be enforced in all implementations.

## Client Isolation (Non-Negotiable)

### Rule 1: Every Client-Owned Table Must Have `client_id`

```typescript
// CORRECT
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull(),  // Required
  name: text('name').notNull(),
});

// INCORRECT - Missing client_id
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});
```

### Rule 2: Every Query Must Filter by `client_id`

```typescript
// CORRECT
export async function getProjects(clientId: string) {
  return db.query.projects.findMany({
    where: eq(projects.clientId, clientId),  // Required filter
  });
}

// INCORRECT - No client filter
export async function getAllProjects() {
  return db.query.projects.findMany();  // NEVER DO THIS
}
```

### Rule 3: Query Functions Must Accept `client_id` as Parameter

```typescript
// CORRECT - client_id is required parameter
export async function updateProject(
  clientId: string,  // First parameter
  projectId: string,
  data: UpdateProjectInput
) { }

// INCORRECT - client_id from session/context only
export async function updateProject(
  projectId: string,
  data: UpdateProjectInput
) {
  const clientId = await getClientFromSession();  // Risky - context may be wrong
}
```

## Query Performance Constraints

### Maximum Query Complexity

| Constraint | Limit | Rationale |
|------------|-------|-----------|
| Max joined tables | 5 | Prevents N+1 query explosions |
| Max rows returned (list queries) | 100 | Pagination required beyond this |
| Max rows returned (export queries) | 10,000 | Streaming required beyond this |
| Query timeout | 5 seconds | Fail fast, don't hang connections |
| Max query result size | 10 MB | Prevents memory exhaustion |

### Pagination Requirements

```typescript
// REQUIRED: All list queries must support pagination
export interface ListOptions {
  clientId: string;
  limit?: number;      // Max 100, default 20
  offset?: number;    // Use cursor for large datasets
  cursor?: string;     // Preferred over offset
}

export async function listProjects(options: ListOptions) {
  const limit = Math.min(options.limit ?? 20, 100);
  return db.query.projects.findMany({
    where: eq(projects.clientId, options.clientId),
    limit,
    offset: options.offset,
  });
}
```

## Migration Safety Constraints

### Destructive Change Rules

| Change Type | Allowed | Requirements |
|-------------|---------|--------------|
| Add column | ✅ Yes | Always nullable or with default |
| Rename column | ⚠️ Phased | Add new, migrate data, drop old |
| Drop column | ⚠️ Phased | Deprecation period required |
| Change type | ❌ No | Create new column, migrate, drop old |
| Add index | ✅ Yes | Concurrent index creation |
| Drop index | ✅ Yes | Verify not used by query planner |
| Add constraint | ⚠️ Careful | Check existing data compliance |
| Drop table | ❌ No | Archive first, soft delete period |

### Migration Rollback Plan

Every migration must include:
1. **Pre-migration check**: Verify data state
2. **Migration script**: Reversible operations only
3. **Post-migration verification**: Data integrity checks
4. **Rollback procedure**: Tested and documented

## Database Connection Constraints

### Neon-Specific Limits

| Resource | Free Tier | Launch Tier | Scale Tier |
|----------|-----------|-------------|------------|
| Compute hours | 100/month | Unlimited | Unlimited |
| Storage | 0.5 GB | Pay per GB | Pay per GB |
| Max connections | 200 | 500 | 1000+ |
| Branch count | Unlimited | Unlimited | Unlimited |
| Max branch size | 2 CU | 16 CU | 56 CU |

### Connection Pool Configuration

```typescript
// drizzle.config.ts
export default defineConfig({
  schema: './src/schema',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Connection pool settings
  poolSize: 10,           // Max connections per instance
  maxUses: 1000,          // Recycle connections after 1000 uses
  idleTimeout: 30,        // Close idle connections after 30s
});
```

## Data Type Constraints

### String Fields

| Use Case | Type | Max Length | Notes |
|----------|------|------------|-------|
| Short identifiers | `varchar` | 50 | Slugs, codes |
| Names, titles | `varchar` | 255 | User-facing text |
| Descriptions | `text` | unlimited | Markdown, HTML |
| URLs | `varchar` | 2048 | Standard URL max |
| Emails | `varchar` | 254 | RFC 5321 limit |

### Numeric Fields

| Use Case | Type | Notes |
|----------|------|-------|
| Primary keys | `serial` or `bigserial` | Auto-increment |
| Foreign keys | Match referenced table | Type consistency |
| Currency | `decimal(19, 4)` | 4 decimal places |
| Quantities | `integer` | Max 2.1B |
| Large counts | `bigint` | Unlimited |
| Percentages | `decimal(5, 4)` | 0-1 range |

### Date/Time Fields

| Use Case | Type | Timezone |
|----------|------|----------|
| Creation time | `timestamp with time zone` | UTC stored, local displayed |
| Update time | `timestamp with time zone` | UTC stored, local displayed |
| Scheduled events | `timestamp with time zone` | Explicit timezone handling |
| Date only | `date` | No time component |

## Security Constraints

### RLS (Row-Level Security)

RLS policies provide defense-in-depth but do not replace application-level filtering:

```typescript
// Schema definition includes RLS
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  clientId: text('client_id').notNull(),
  name: text('name').notNull(),
}, (table) => [
  crudPolicy({
    role: authenticatedRole,
    read: authUid(table.clientId),
    modify: authUid(table.clientId),
  }),
]);

// Query module STILL filters by client_id
export async function getProjects(clientId: string) {
  return db.query.projects.findMany({
    where: eq(projects.clientId, clientId),  // Application filter
  });
  // RLS provides database-level safety net
}
```

### Query Parameterization

Never concatenate values into SQL:

```typescript
// CORRECT - Parameterized
const result = await db.query.projects.findMany({
  where: eq(projects.clientId, userInput),
});

// INCORRECT - SQL Injection risk
const result = await db.execute(
  `SELECT * FROM projects WHERE client_id = '${userInput}'`
);
```

## Error Handling Constraints

### Query Error Categories

| Error | Handling | Log Level |
|-------|----------|-----------|
| Connection timeout | Retry with backoff | Warning |
| Unique constraint violation | Return 409 Conflict | Info |
| Foreign key violation | Return 400 Bad Request | Info |
| Check constraint violation | Return 400 Bad Request | Info |
| Client isolation violation | Return 403 Forbidden | Error |
| Query timeout | Return 504 Gateway Timeout | Error |
| Database unavailable | Return 503 Service Unavailable | Critical |

### Error Response Format

```typescript
interface QueryError {
  code: string;           // Error code enum
  message: string;        // Human-readable message
  clientId?: string;      // Context (logged, not returned)
  queryName: string;      // For debugging
  retryable: boolean;     // Can client retry?
}
```

## Testing Constraints

### Required Test Coverage

| Component | Coverage | Test Types |
|-----------|----------|------------|
| Schema definitions | 100% | Unit |
| Query modules | 100% | Integration |
| Client isolation | 100% | Integration |
| Migrations | N/A | Migration tests |

### Test Database Requirements

- Tests must use isolated database (branch or schema)
- Each test file gets fresh database state
- Client isolation tests verify cross-client access blocked
- Migration tests verify rollback procedures

## Performance Monitoring Constraints

### Required Metrics

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Query duration p95 | < 100ms | Warning |
| Query duration p99 | < 500ms | Error |
| Connection pool utilization | < 80% | Warning |
| Cache hit rate | > 70% | Warning if < 50% |
| Migration duration | < 30s | Error |

### Slow Query Logging

All queries > 100ms must be logged:

```typescript
const startTime = Date.now();
const result = await db.query.projects.findMany({ ... });
const duration = Date.now() - startTime;

if (duration > 100) {
  logger.warn('Slow query detected', {
    query: 'projects.findMany',
    duration,
    clientId,  // For analysis
  });
}
```

## Compliance Constraints

### Data Retention

| Data Type | Retention | Purge Schedule |
|-----------|-----------|----------------|
| Audit logs | 7 years | Annual review |
| Session data | 30 days | Daily cleanup |
| Soft-deleted records | 90 days | Weekly purge |
| Error logs | 90 days | Weekly purge |
| Analytics events | 1 year | Monthly rollup |

### GDPR / CCPA

- Right to erasure: Hard delete after 30-day grace
- Right to access: Export all client-scoped data
- Data portability: JSON export format
- Consent tracking: Separate consent table

## Violation Response

Any code violating these constraints must be:
1. Flagged in code review (blocking)
2. Documented in PR with risk assessment
3. Escalated to package owner if dispute
4. Fixed before merge

## References

- `docs/architecture/ADRs/003-data-db-adr-rls-strategy.md`
- `docs/AGENTS.md` Data Isolation Rules
- `docs/DEPENDENCY.md` §4 Database Layer
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Neon Limits](https://neon.com/pricing)
