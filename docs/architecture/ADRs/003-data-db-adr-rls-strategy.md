# ADR 003: Data Database - Row-Level Security Strategy

## Status

Accepted

## Date

2026-04-08

## Context

The agency monorepo uses a multi-tenant data model where multiple clients share the same PostgreSQL database. Each table containing client-specific data includes a `client_id` column, and query modules enforce client scoping at the application level.

However, application-level enforcement relies on code discipline and proper query construction. A bug in a query module or a direct database connection could potentially expose cross-client data. We needed a defense-in-depth strategy that provides database-level guarantees even if application code fails.

PostgreSQL's Row-Level Security (RLS) feature allows defining policies that filter rows at the database level based on the current user context. Drizzle ORM now supports declarative RLS policy definitions through the `crudPolicy` helper (available via `drizzle-orm/neon`).

## Decision

Implement a **defense-in-depth** client isolation strategy with two complementary layers:

1. **Primary Layer: Application-Level Scoping** (existing)
   - Query modules require `client_id` parameter for all client-scoped queries
   - TypeScript enforces parameter presence at compile time
   - All queries filter by `client_id` explicitly

2. **Defense Layer: Database-Level RLS** (new)
   - RLS policies defined in schema using Drizzle's `crudPolicy` helper
   - Policies enforce that authenticated users can only access rows matching their `client_id`
   - Applied to all tables containing client-specific data

## Implementation Pattern

```typescript
import { pgTable, text, bigint, boolean } from 'drizzle-orm/pg-core';
import { crudPolicy, authenticatedRole, authUid } from 'drizzle-orm/neon';
import { sql } from 'drizzle-orm';

export const projects = pgTable(
  'projects',
  {
    id: bigint('id', { mode: 'number' }).primaryKey(),
    clientId: text('client_id')
      .notNull()
      .default(sql`(auth.user_id())`),
    name: text('name').notNull(),
    description: text('description'),
  },
  (table) => [
    // RLS policy for authenticated role
    crudPolicy({
      role: authenticatedRole,
      read: authUid(table.clientId),    // Users can only read their client's data
      modify: authUid(table.clientId),   // Users can only modify their client's data
    }),
  ]
);
```

## Decision Rationale

### Why RLS as defense-in-depth rather than primary isolation?

1. **Performance**: Application-level filters are more efficient for complex queries with joins
2. **Flexibility**: Application logic can handle edge cases (admin access, cross-client reports) more gracefully
3. **Debugging**: Application-level scoping provides clearer error messages and logging
4. **Compatibility**: RLS requires Neon-specific roles; application-level works with any PostgreSQL host

### Why Drizzle's `crudPolicy` helper?

1. **Declarative**: Policies defined alongside schema, not in separate SQL files
2. **Type-safe**: TypeScript ensures policy columns exist and match types
3. **Migration-friendly**: Drizzle Kit handles policy creation/updates in migrations
4. **Readable**: Single-line policy definition vs verbose SQL

## Consequences

### Positive

- Database guarantees client isolation even if application code has bugs
- Failed queries provide clearer error messages than RLS violations
- Gradual adoption possible: add RLS to high-risk tables first
- Zero performance impact when queries already filter by `client_id`

### Negative

- Slight complexity increase in schema definitions
- Neon-specific implementation (though SQL policies are standard PostgreSQL)
- Requires understanding of both application and database isolation layers
- Additional testing surface for policy correctness

### Neutral

- Migrations must be reviewed for policy changes
- Query modules should continue enforcing `client_id` (don't rely solely on RLS)
- RLS policies don't replace the need for proper application authorization

## When to Apply RLS

| Table Type | RLS Required | Reason |
|------------|--------------|--------|
| Client-owned entities (projects, invoices) | ✅ Yes | Core multi-tenant data |
| User profiles within client scope | ✅ Yes | User data linked to client |
| Global reference data (categories, tags) | ❌ No | Shared across all clients |
| Audit logs | ✅ Yes | Sensitive operational data |
| Internal tool data (admin settings) | ⚠️ Optional | Depends on sensitivity |

## Alternatives Considered

### Alternative: RLS as Primary Isolation

**Why rejected**: Would require all queries to use database roles for context, making query modules more complex and reducing flexibility for cross-client operations.

### Alternative: Database-Per-Tenant

**Why rejected**: Significantly higher operational complexity, more expensive at scale, harder to manage schema migrations across hundreds of databases.

### Alternative: No RLS (Application-Only)

**Why rejected**: Provides no safety net for application bugs, direct database connections, or compromised credentials.

## References

- `docs/tasks/50-data-db/01-data-db-spec.md`
- `docs/DEPENDENCY.md` §4 Database Layer
- `docs/ARCHITECTURE.md` Data Domain section
- [Drizzle RLS Documentation](https://orm.drizzle.team/docs/rls)
- [Neon RLS Guide](https://neon.com/docs/guides/rls-drizzle)

## Migration Path

Existing tables without RLS can be updated incrementally:

1. Add RLS policies to schema
2. Generate migration with `drizzle-kit generate`
3. Test policies in staging environment
4. Deploy to production during low-traffic window
5. Monitor for unexpected query failures

## Verification Checklist

- [ ] RLS policies applied to all client-scoped tables
- [ ] Query modules continue to enforce `client_id` filtering
- [ ] Migrations tested in staging with production-like data
- [ ] Admin/override operations tested with policy exceptions
- [ ] Performance benchmarks confirm no regression
