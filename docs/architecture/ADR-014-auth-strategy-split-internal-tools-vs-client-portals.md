# ADR-014 — Auth Strategy Split: Internal Tools vs Client Portals

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
- Next.js App Router as the default application platform
- Milestone-based package activation
- one-provider-per-app discipline
- provider-boundary packages in the auth domain

The Topic 14 problem is therefore not whether authentication is viable in the current stack.

That is already settled.

The real decision is:

> Which auth provider should be the default for internal tools vs client portals, how should that map to package boundaries, and what should be deferred or escalated rather than made baseline?

---

## Decision

The repository adopts a **dual-lane auth policy by app category**.

### Core rule
- Internal tools default to **Clerk**
- Client portals default to **Better Auth**

### Package rule
- `@agency/auth-internal` is the provider-boundary package for internal tools
- `@agency/auth-portal` is the provider-boundary package for client portals

### Provider rule
Never mix auth providers within the same app.

### Tenant-safety rule
Authentication is not the tenant-isolation boundary.

For client portals:
- auth identifies the actor
- tenant safety still depends on `@agency/data-db`
- tenant scoping still depends on `client_id` enforcement and query-level isolation discipline

### Enterprise escalation rule
WorkOS is an escalation path for enterprise SSO / SCIM requirements.
It is not the default repo-wide auth lane.

---

## Why this decision was made

### 1) Internal tools and client portals have different constraints
Internal tools optimize for:
- speed of implementation
- low operational overhead
- small, predictable user counts
- willingness to accept vendor-managed identity

Client portals optimize for:
- data ownership
- client-contract sensitivity
- scalability without per-MAU pricing
- deeper account / organization controls

One default auth provider would distort one of these use cases.

### 2) Clerk is the right default for internal tools
Clerk gives internal tools:
- fastest implementation path
- managed sessions
- prebuilt UI components
- minimal backend auth work
- acceptable tradeoffs for low-volume internal users

That makes it the correct default lane for internal apps.

### 3) Better Auth is the right default for client portals
Better Auth gives client portals:
- self-hosted users and sessions
- native Drizzle integration
- no per-MAU pricing
- plugin-based extensibility for organizations, passkeys, 2FA, and RBAC

That makes it the correct default lane for client-facing portals.

### 4) Auth packages are provider-isolation packages, not convenience packages
The auth domain is one of the few places where a package can be justified at first real consumer.

The point is not speculative reuse.
The point is:
- isolate provider-specific SDK imports
- centralize configuration
- contain future migration cost
- preserve one-provider-per-app discipline

### 5) Enterprise auth should remain escalation-only
Enterprise SSO / SCIM should not be treated as baseline repo complexity.

It should be activated only when a real client or procurement requirement exists.

---

## Approved now

The following are approved as Topic 14 policy:

- Clerk as the default auth lane for internal tools
- Better Auth as the default auth lane for client portals
- `@agency/auth-internal` as the internal auth boundary package
- `@agency/auth-portal` as the portal auth boundary package
- Auth.js as a fallback lane when full OSS / self-controlled auth is specifically required
- Supabase Auth as a fallback lane when the project is already intentionally using the Supabase lane
- WorkOS as enterprise SSO / SCIM escalation only

---

## Conditional

The following are conditional and require trigger review:

### `@agency/auth-internal`
Approve when:
- the first internal tool requires authentication
- Milestone 2 has begun
- `REPO-STATE.md` approves activation

### `@agency/auth-portal`
Approve when:
- the first client portal requiring login is approved
- `@agency/data-db` is active or approved as part of the same lane
- `REPO-STATE.md` approves activation

### Better Auth plugin activation
Enable only when justified:
- organizations
- RBAC
- passkeys
- 2FA
- admin / impersonation flows

### WorkOS escalation
Approve only when:
- enterprise SSO / SCIM is a real requirement
- the owning app category is known
- the auth composition is reviewed explicitly

---

## Deferred

The following are intentionally deferred:

- `@agency/auth-portal` in Milestone 1
- enterprise auth complexity as default repo infrastructure
- speculative auth package variants
- multi-provider auth inside the same app
- broader auth abstraction beyond the provider-boundary packages

---

## Rejected

The following are explicitly rejected:

- one universal auth provider for every app
- mixing Clerk and Better Auth inside one app
- treating auth/session as the tenant-isolation boundary
- activating `@agency/auth-portal` before a real portal exists
- treating WorkOS as the default auth provider
- moving auth logic back into app-local code for convenience

---

## Package boundary rules

### `@agency/auth-internal`
Owns:
- Clerk SDK integration
- middleware wiring
- session helpers
- provider-specific auth utilities for internal apps

Does not own:
- tenant authorization rules
- app-specific business permissions
- data access rules

### `@agency/auth-portal`
Owns:
- Better Auth configuration
- Drizzle adapter integration
- session helpers
- plugin configuration for approved portal requirements

Does not own:
- tenant authorization rules by itself
- query-level `client_id` enforcement
- portal-specific business workflows

---

## Auth and tenant-isolation relationship

### Internal tools
Internal tool auth confirms:
- who the operator is

It does not by itself define:
- what business records they may access

### Client portals
Portal auth confirms:
- who the external user is
- what account/session context exists

It still does not replace:
- tenant scoping in the data layer
- `client_id` query enforcement
- cross-tenant leakage protections

### Non-negotiable rule
Identity and tenant isolation are related, but they are not the same control.

---

## Provider selection rules

### Use Clerk when
- the app is an internal agency tool
- implementation speed matters most
- user counts are small and predictable
- vendor-managed identity is acceptable

### Use Better Auth when
- the app is a client-facing portal
- data ownership matters
- portal users may scale materially
- DB-backed auth/session control is desirable

### Use Auth.js when
- a fully OSS auth posture is specifically required
- Better Auth is not acceptable for a concrete reason

### Use Supabase Auth when
- the project is already intentionally in the Supabase lane
- managed auth is acceptable
- tighter DB/auth bundling is a positive for that project

### Use WorkOS when
- enterprise SSO / SCIM is a real requirement
- standard internal or portal auth is insufficient

---

## Conflict resolution

A repo-level wording conflict exists between:
- architecture guidance that treats WorkOS as the client-portal enterprise escalation path
- broader client-profile wording that can be read as WorkOS + Clerk by default for enterprise contexts

The locked interpretation is:

- WorkOS is an escalation layer
- Clerk remains the default for internal tools
- Better Auth remains the default for client portals
- enterprise auth composition must be reviewed per app category when triggered

---

## Consequences

### Positive consequences
- clean auth split by app category
- strong provider-boundary containment
- lower risk of mixing auth concerns across app types
- better alignment with data ownership and tenant-safety goals
- clearer path for enterprise escalation without early overbuild

### Negative consequences
- two auth lanes must be documented and maintained
- portal auth depends on database readiness
- enterprise auth edge cases still need explicit future decisions

### Accepted tradeoff
This repository prefers:
- lane-specific auth policy
over
- a false single-provider simplification

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- Clerk as the default internal auth lane
- Better Auth as the default client-portal auth lane
- provider-boundary packages for both auth lanes
- WorkOS as escalation-only

This ADR does **not** by itself approve:
- `@agency/auth-internal` in Milestone 1
- `@agency/auth-portal` before a real portal exists
- enterprise SSO / SCIM setup by default
- multi-provider auth in one app

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
- `60-auth-internal-30-adr-clerk.md`
- `61-auth-portal-30-adr-better-auth.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- the first real client portal is approved and reveals a different auth default is needed
- enterprise SSO / SCIM becomes a real requirement
- provider pricing or platform capability changes materially
- Better Auth or Clerk stops fitting its assigned lane
- a future tenant-isolation or database decision materially changes the auth/data boundary