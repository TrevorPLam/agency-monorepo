# ADR-006 — Tenant Isolation and Client-Data Safety

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is intended to support:
- internal tools
- future client portals
- shared data infrastructure
- strong client-data separation
- AI-assisted implementation

The repository already establishes that:
- `ARCHITECTURE.md` is target-state guidance, not implementation approval
- `@agency/data-db` is not approved until Milestone 2
- client-owned operational data must be scoped by `client_id`
- Neon branching is a development workflow, not a tenant-security boundary
- a defense-in-depth model is required for tenant isolation

The Topic 6 problem is therefore not whether tenant isolation matters.

It is:

> What repository-wide tenant isolation standard should govern future data and auth implementation without overbuilding the default lane?

---

## Decision

The repository adopts a **default pooled multi-tenant isolation model** with mandatory row-level client scoping and database-enforced defense-in-depth.

### Default isolation standard
Use:
- shared application instances
- shared PostgreSQL database
- mandatory row-level tenant scoping for client-owned operational data

### Required schema rule
Every client-owned table must include:
- non-nullable `client_id`

Optional audit and lifecycle fields may be required by app/domain needs, but Topic 6 does not require every client-owned table to carry extra tenant metadata by default.

### Required query rule
Every query module operating on client-owned data must:
- require explicit tenant scope
- apply tenant scope in every read/write path
- avoid tenant-optional helpers for client-owned entities

### Required database defense layer
When `@agency/data-db` becomes active:
- Row-Level Security (RLS) must be applied to client-owned tables as defense-in-depth
- application-level scoping remains required
- RLS does not replace application authorization

### Cross-tenant exception rule
Cross-tenant access is forbidden by default.

It is allowed only through explicitly approved exception paths such as:
- administrative operations
- approved aggregated reporting
- controlled data migration
- time-limited incident response

All exception paths must be narrow, reviewable, and testable.

### Escalation path
Escalate to stronger isolation only when requirements justify it.

#### Escalation 1 — Schema-per-tenant
Use schema-per-tenant when:
- regulatory or contractual requirements require stronger logical isolation
- tenant-specific restore or migration behavior is needed
- customization pressure makes pooled schema awkward or risky

#### Escalation 2 — Dedicated database / deployment stamp
Use dedicated database or deployment stamp when:
- contractual isolation guarantees require it
- data residency or compliance requirements demand stronger separation
- tenant-specific operational scaling, backup, or restore needs justify it
- customization or noisy-neighbor risk makes pooled tenancy unsuitable

### Development rule
Neon branching is a development and testing workflow only.

It must not be treated as a tenant-security control.

---

## Why this decision was made

### 1) Row-level scoping is the correct default for this repo phase
The repository needs a strong isolation baseline without prematurely adopting the operational cost of schema-per-tenant or database-per-tenant everywhere.

### 2) Defense-in-depth is better than application-only discipline
Application-level scoping is necessary but not sufficient.
RLS adds database-level protection if a query bug, direct connection, or unexpected code path bypasses application assumptions.

### 3) Stronger isolation should be earned, not assumed
Schema-per-tenant and database-per-tenant both add migration, ops, and testing complexity.
They should remain escalation paths, not repo-wide defaults.

### 4) Tenant isolation is distinct from auth
Authentication does not itself guarantee tenant safety.
Tenant boundary enforcement must exist separately in data access, query design, and database policy.

### 5) Development branching is not security isolation
Neon branching is useful for previews, tests, and migration validation, but it does not define runtime tenant boundaries.

---

## Approved now

The following are approved as Topic 6 policy:

- row-level tenant scoping as the default model
- mandatory `client_id` on client-owned tables
- explicit tenant scope in client-owned query modules
- RLS as defense-in-depth for client-owned tables
- dual-tenant leakage tests for client-owned query surfaces
- explicit exception paths for cross-tenant access
- high-risk review for schema, migration, and auth-to-tenant mapping changes

---

## Conditional

The following are conditional and require explicit trigger review:

- schema-per-tenant isolation
- dedicated database per tenant
- dedicated deployment stamp per tenant/client class
- stronger audit/compliance controls beyond the repo default baseline

---

## Deferred

The following are intentionally deferred from current implementation:

- activation of `@agency/data-db` before Milestone 2
- portal-specific tenant isolation implementation before `@agency/auth-portal` is approved
- broad audit/compliance automation beyond what active apps actually require

---

## Rejected

The following are explicitly rejected:

- auth/session alone as the tenant-isolation boundary
- Neon branching as a runtime tenant-isolation boundary
- blanket “all client portals must be schema-per-tenant”
- database-per-tenant as the default repository model
- tenant-optional query helpers for client-owned entities
- unscoped reads or writes on client-owned tables

---

## Core rules

### Rule 1 — Client-owned data is scoped by default
No client-owned query may exist without explicit tenant scope.

### Rule 2 — Application and database enforcement both matter
Application-layer tenant scoping is required.
Database RLS is required beneath it for client-owned tables once the data package is active.

### Rule 3 — Shared reference data is different
Truly shared reference data may exist without `client_id`, but it must be clearly classified as shared and must not silently evolve into client-owned operational data.

### Rule 4 — Cross-tenant access is exceptional
Cross-tenant operations must be explicit, narrow, and reviewable.
They are never the default path.

### Rule 5 — Stronger isolation is trigger-based
Do not adopt schema-per-tenant or database-per-tenant broadly unless specific requirements justify the added cost and complexity.

### Rule 6 — Branching is not security isolation
Neon branches are for development, preview, migration testing, and recovery workflows.
They do not replace runtime tenant-isolation controls.

---

## Implementation standard

When Topic 6 becomes active in implementation:

### Schema
- every client-owned table includes `client_id`
- client-owned foreign key relationships preserve tenant boundaries
- destructive migration changes require rollback planning

### Queries
- client-owned query helpers require tenant scope
- no `getAll()` or `getById()` helper for client-owned entities without scope
- admin/reporting overrides must be explicit, not hidden in default helpers

### Auth/session integration
- trusted server-side session/context must map the caller to allowed tenant scope
- tenant scope must not be taken directly from untrusted client input

### RLS
- policies must cover reads and writes
- policy changes are high-risk review items
- migrations that change policies must be tested explicitly

### Testing
- unit tests verify query scoping
- integration tests verify cross-tenant leakage is impossible under normal flows
- exception paths are tested separately
- CI should include at least one dual-tenant leakage scenario

### Caching and search
- cache keys for client-owned data must include tenant scope
- search indexes or search filters for client-owned data must preserve tenant scope

---

## Consequences

### Positive consequences
- clearer default data model
- stronger protection against cross-client leakage
- lower overbuild risk than schema-per-tenant or database-per-tenant by default
- clean escalation path for higher-isolation clients
- better alignment between auth, data, and query-module design

### Negative consequences
- query APIs become stricter
- RLS adds testing and migration review overhead
- stronger isolation lanes still require future design work when activated

### Accepted tradeoff
This repository prefers:
- strict pooled-tenant defaults now
over
- prematurely adopting heavier isolation for every future tenant

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- row-level tenant scoping as the default repository standard
- RLS as the required defense layer for client-owned tables
- stricter query-module rules for client-owned data
- escalation to stronger isolation only by trigger

This ADR does **not** by itself approve:
- Milestone 2 activation
- `@agency/data-db` implementation before approved milestone
- `@agency/auth-portal`
- database-per-tenant infrastructure
- portal-specific auth/session implementation

Those remain governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- `ARCHITECTURE.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:
- pooled row-level isolation proves insufficient for an approved tenant class
- regulatory/compliance requirements force stronger default isolation
- auth/session design introduces a different tenant-context model
- query-module enforcement proves impractical in real consumers
- database provider or policy tooling changes materially alter the implementation model