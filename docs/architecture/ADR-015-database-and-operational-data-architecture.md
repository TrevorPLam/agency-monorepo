# ADR-015 — Database and Operational Data Architecture

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository already has a locked posture for:

- tenant isolation as an architecture-level concern
- Route Handlers as the early server model
- no early `apps/api`
- provider-lane governance in `DEPENDENCY.md`
- `@agency/data-db` as the owned data-access package
- app/package activation by milestone and trigger

The Topic 15 problem is therefore not whether the repository can support operational data.

That is already settled.

The real decision is:

> What is the default database lane, how should preview databases work, what migration discipline should apply, and what strict query-scoping rules should govern operational data access?

---

## Decision

The repository adopts a **PostgreSQL operational-data policy** with **Neon + Drizzle** as the default lane and `@agency/data-db` as the required data-access boundary.

### Core rule
All database access flows through `@agency/data-db`.

Apps do not install or use database drivers directly.

### Default provider lane
Use:
- PostgreSQL
- Neon as the default database provider
- Drizzle ORM as the mandatory schema/query/migration abstraction

### Early-server rule
Operational data access in early approved apps stays inside the approved Next.js application surface:
- Route Handlers
- other server-only app code as approved by the platform posture

Topic 15 does not justify creating `apps/api`.

### Tenant-safety rule
For client-owned operational data, Topic 6 remains binding:
- pooled/shared database by default
- mandatory `client_id`
- explicit tenant scope in query modules
- RLS as defense-in-depth once the package is active

### Preview database rule
Preview and staging data workflows use non-production database branches or environments.

Preview database branching is:
- for testing
- for migration validation
- for QA / pre-production review

It is not:
- a tenant-security boundary
- a substitute for runtime isolation
- a reason to widen the architecture early

### Migration rule
The repository adopts a **reviewable migration discipline**:
- schema lives in code
- migrations are generated as SQL files
- migrations are committed
- migrations are applied through a controlled migration step
- destructive changes require rollback planning
- policy/schema changes affecting tenant isolation are high-risk review items

---

## Why this decision was made

### 1) The dependency contract already defines the correct default lane
The repository already identifies:
- Neon as the primary operational DB lane
- Drizzle as the mandatory abstraction layer
- provider switching as a configuration concern
- `@agency/data-db` as the owned boundary for DB dependencies

Topic 15 should lock that posture as operating policy.

### 2) The data layer must reinforce Topic 6, not bypass it
Tenant isolation is already locked as:
- row-level by default
- explicit in query design
- reinforced by RLS

The database architecture should preserve that standard.

### 3) Route Handlers remain the correct early server lane
The repository already chose:
- Route Handlers first
- no early `apps/api`

Topic 15 should not reverse that by treating operational data as automatic justification for a dedicated backend app.

### 4) Preview workflows should remain environment concerns, not architecture expansion
Database branches are useful for:
- previews
- testing
- migration validation

But they do not create a new runtime isolation model and they do not justify early multi-app backend extraction.

### 5) Migrations need reviewable, repo-visible discipline
Operational data changes are among the highest-risk changes in the repository.

The migration workflow must therefore favor:
- reviewed SQL artifacts
- explicit change history
- rollback thinking
- non-production validation before production rollout

---

## Approved now

The following are approved as Topic 15 policy:

- PostgreSQL as the operational data model
- Neon as the default database provider lane
- Drizzle as the mandatory ORM / migration abstraction
- `@agency/data-db` as the required DB boundary package
- Route Handlers / approved server-only app code as the early data-access lane
- preview/staging DB workflows based on non-production branches or environments
- strict query scoping for client-owned data
- reviewable SQL migrations
- rollback planning for destructive changes

---

## Conditional

The following are conditional and require trigger review:

### Supabase lane
Approve when:
- the project is intentionally using the integrated Supabase lane
- the tradeoff is explicit and approved

### Aurora PostgreSQL lane
Approve when:
- enterprise / cloud-procurement requirements justify it

### `pg` driver lane
Approve when:
- a long-running worker or non-edge runtime requires it

### Automated preview-DB provisioning
Approve when:
- preview branching is a repeated operational need and the automation burden is justified

### Stronger isolation lanes
Approve only when Topic 6 escalation triggers are met:
- schema-per-tenant
- dedicated database
- dedicated deployment stamp

---

## Deferred

The following are intentionally deferred:

- `@agency/data-db` implementation in Milestone 1
- automatic preview-DB branch orchestration as launch-default infrastructure
- `apps/api`
- multi-database topology for one app by default
- stronger isolation lanes as the default repository posture

---

## Rejected

The following are explicitly rejected:

- installing DB drivers directly in apps
- treating auth/session as the data-isolation boundary
- treating Neon branching as tenant isolation
- unscoped helpers for client-owned operational data
- casual destructive migration practice without rollback planning
- widening the repo into a dedicated API app because persistence exists

---

## Provider-lane policy

### Default lane
Use Neon when:
- the app is in the default repo lane
- serverless/Postgres fit is desired
- preview/test branching is useful
- no enterprise/cloud mandate overrides the default

### Integrated fallback lane
Use Supabase when:
- a project explicitly chooses the bundled DB/auth/storage tradeoff
- that choice is made intentionally, not by drift

### Enterprise lane
Use Aurora PostgreSQL when:
- procurement, enterprise hosting, or cloud constraints require it

### Optional worker lane
Use `pg` only when:
- a non-edge or long-running worker runtime genuinely needs it

---

## Package boundary rules

### `@agency/data-db` owns
- provider SDK imports
- Drizzle schema
- migration configuration
- query modules
- transaction helpers
- database connection/config logic
- tenant-scope enforcement primitives

### Apps do not own
- raw DB connections
- provider SDK imports
- tenant-scoping logic duplicated across the app
- migration tooling
- cross-cutting DB helper logic outside the package boundary

---

## Query-scoping rules

### Client-owned operational data
For client-owned entities:
- every table includes `client_id`
- every query helper requires explicit tenant scope
- no tenant-optional `getAll()` / `getById()` helpers exist
- admin/reporting exceptions are explicit

### Shared reference data
Truly shared reference data may exist without `client_id`, but it must be clearly classified as shared and must not drift into client-owned operational data silently.

### Cross-tenant operations
Cross-tenant access is exceptional only:
- approved reporting
- approved administrative operations
- controlled migrations
- incident response

It must never be the default access path.

---

## Preview database policy

### Allowed use
Preview branches/environments may be used for:
- PR validation
- QA
- staging-style review
- migration testing
- restore / recovery rehearsal

### Not allowed use
Preview branches/environments must not be treated as:
- tenant-security isolation
- substitute production controls
- proof that stronger runtime isolation is unnecessary

### Promotion rule
Production promotion must remain explicit.
Do not treat preview branch success as permission to skip migration review.

---

## Migration discipline

### Required workflow
- update schema in code
- generate reviewable SQL migrations
- commit migrations
- validate on a non-production branch/environment
- apply through the approved migration step
- verify behavior in a consuming app/workflow

### High-risk changes
Treat these as high-risk:
- destructive schema changes
- RLS policy changes
- `client_id` changes
- tenant-boundary changes
- auth-to-tenant mapping changes
- cross-tenant reporting/access exceptions

### Rollback rule
If a migration can destroy or invalidate important data paths, rollback planning is required before approval.

---

## Activation rule correction

A wording conflict exists if `@agency/data-db` is read as activating only for the first internal tool.

The locked interpretation is:

- the expected first activator is still the internal CRM / Milestone 2 lane
- the true architectural trigger is the first approved operational-data consumer that needs persistent DB-backed state

This avoids blocking future approved portal or data consumers from activating the package appropriately.

---

## Consequences

### Positive consequences
- clear default DB lane
- strong alignment between auth, data, and tenant-safety rules
- lower risk of app-level DB sprawl
- safer migration posture
- clean preview/testing workflow without overbuilding runtime isolation
- no premature `apps/api` extraction

### Negative consequences
- operational data work stays deferred until approved milestone
- query APIs become stricter
- migration workflow is more procedural
- preview DB automation remains a later concern rather than immediate convenience

### Accepted tradeoff
This repository prefers:
- stricter data boundaries and migration discipline
over
- faster but looser data access patterns

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- Neon + Drizzle as the default operational data lane
- `@agency/data-db` as the required DB boundary
- Route Handlers / approved server-only app code as the early data-access surface
- strict query scoping
- preview DB workflows based on non-production branches/environments
- reviewable SQL migration discipline

This ADR does **not** by itself approve:
- `@agency/data-db` in Milestone 1
- `apps/api`
- automatic preview DB orchestration
- stronger tenant-isolation lanes by default
- provider drift away from approved lanes

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
- `docs/architecture/ADR-006-tenant-isolation-and-client-data-safety.md`
- `docs/architecture/ADR-008-nextjs-16-repo-wide-application-platform.md`
- `docs/architecture/ADR-014-auth-strategy-split-internal-tools-vs-client-portals.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- the first real data consumer reveals Neon is no longer the correct default lane
- preview-DB workflow pressure becomes strong enough to justify automation
- tenant-isolation requirements force a stronger default isolation lane
- Route Handlers prove insufficient and a dedicated API threshold is formally met
- the migration workflow proves unsafe or too manual in real use
- provider capability or procurement constraints materially change the default DB lane