# ADR-008 — Next.js 16 as the Repo-Wide Application Platform

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is intended to support:
- public marketing sites
- internal tools
- future client portals
- shared UI/config/core packages
- phased package and app activation
- AI-assisted implementation with strong anti-drift controls

The repository already establishes that:
- Next.js 16 App Router is the default stack direction
- `apps/agency-website/` is the first validating app
- Route Handlers are the early-server default
- `apps/api` is deferred from the launch slice
- implementation follows `REPO-STATE.md`, `DECISION-STATUS.md`, and `DEPENDENCY.md`, not target-state architecture alone

The Topic 8 problem is therefore not whether Next.js is viable.

It is:

> What exact platform policy should govern app development so Next.js is the default application framework without causing premature API extraction, platform sprawl, or confusion about what work belongs inside versus outside the framework?

---

## Decision

The repository adopts **Next.js 16 App Router as the default application platform** for approved app surfaces.

### App categories covered by this decision
By default, use Next.js 16 App Router for:
- public marketing sites
- internal tools
- client portals
- docs/publishable app surfaces when later approved

### Early server model
Use **Route Handlers inside `app/`** as the default server interface for early and medium-complexity needs.

### Dedicated API policy
A separate `apps/api` is **not** part of the default repo shape during launch and early growth.

It may be approved only when a real extraction trigger is met.

### Hosting/portability policy
Vercel remains the primary hosting target.

However, the repo should avoid architecture decisions that assume Vercel-only deployment forever.
Adapter-based portability is a design consideration, not a Milestone 1 build requirement.

### Adapter rule
Treat the Next.js Adapter API as a stable public platform capability.

Do **not** treat that as approval to build portability scaffolding now.
If adapter-specific deployment work is needed later, follow the then-current documented Next.js config surface and deployment guidance.

### Worker/service boundary policy
Next.js is the default platform for application surfaces.

It is not a requirement that every future background worker, long-running process, or separate service be implemented as a Next.js app.

---

## Why this decision was made

### 1) One app framework reduces repo complexity
Using one application framework across app surfaces:
- reduces contributor context switching
- keeps shared packages from targeting multiple app runtimes
- aligns with the repo’s governance-first posture

### 2) Route Handlers are sufficient for early server needs
The launch slice already uses Route Handlers as the early-server model.

This keeps the first app smaller and avoids introducing a second app lane before a real need exists.

### 3) A separate API app is a later extraction, not a default
A dedicated API app introduces:
- another deployable
- more routing and environment complexity
- more package pressure
- earlier cross-app API design decisions

That should happen only when the boundary is real.

### 4) Platform portability should be preserved without overbuilding
The modern Next.js platform supports portability better than before.

That supports avoiding hard platform coupling, but it does not justify building portability infrastructure before a real non-Vercel deployment need exists.

### 5) Next.js default does not mean universal runtime
Some future workloads may require:
- long-running jobs
- persistent workers
- separately scaled services

Those remain conditional and should not distort the default application-platform decision.

---

## Approved now

The following are approved as Topic 8 policy:

- Next.js 16 App Router as the default framework for approved app surfaces
- Route Handlers inside `app/` as the default early server model
- Vercel as the primary hosting target
- adapter-aware portability as a design constraint
- keeping application-platform policy separate from worker/service policy

---

## Conditional

The following are conditional and require explicit trigger review:

### `apps/api`
Approve only when:
- 2+ apps genuinely need the same server API surface, or
- the API needs separate scale/security/deployment behavior, or
- non-UI consumers require the same API contract, or
- Route Handlers are no longer a clean fit for the workload

### Separate workers/services
Approve only when:
- workloads exceed serverless/runtime limits
- background processing or persistent processes become real
- a dedicated operational lane is justified

### Non-Vercel adapter work
Approve only when:
- a specific app has an approved non-Vercel deployment target
- the adapter/runtime work is tied to that app’s real deployment need

---

## Deferred

The following are intentionally deferred:

- `apps/api` in Milestone 1
- dedicated backend framework adoption by default
- early worker/service infrastructure
- platform-portability scaffolding beyond what active approved apps need

---

## Rejected

The following are explicitly rejected:

- creating `apps/api` in the launch slice
- introducing a separate backend framework by default
- treating target-state `apps/api` presence as implementation permission
- interpreting “Next.js for all apps” as “all backend work must stay inside Next.js forever”
- building multi-platform infrastructure before a real cross-platform deployment need exists

---

## Core rules

### Rule 1 — Next.js is the default app platform
Use Next.js 16 App Router for approved application surfaces unless a later decision explicitly creates an exception.

### Rule 2 — Route Handlers first
If an app needs server endpoints early, use Route Handlers before introducing a dedicated API app.

### Rule 3 — Dedicated API is an extraction
`apps/api` is a later extraction path, not a default starting shape.

### Rule 4 — App platform is not worker platform
Do not force long-running workers, persistent jobs, or separate service processes into the Next.js app-platform decision.

### Rule 5 — Portability is a guardrail, not a Milestone 1 scope expansion
Avoid platform-coupled architecture, but do not build portability abstractions before they are needed.

---

## Dedicated API extraction triggers

A dedicated `apps/api` may be approved only when at least one strong trigger is present and lighter options are insufficient.

### Strong triggers
- 2+ apps require the same server API surface
- the API needs independent deployment, scale, or security posture
- non-UI consumers need the same contract
- protocol/runtime needs do not fit cleanly in Route Handlers
- organizational ownership requires a separate service boundary

### Not valid triggers
- “it feels cleaner”
- “the architecture already includes it”
- “we might need it later”
- “most serious systems have a separate backend”

---

## Consequences

### Positive consequences
- simpler early app model
- lower launch complexity
- fewer premature backend abstractions
- cleaner fit with launch-slice governance
- preserved future portability

### Negative consequences
- some later API extraction work is deferred rather than front-loaded
- Route Handler logic may stay app-local longer
- non-UI service boundaries remain future design work until justified

### Accepted tradeoff
This repository prefers:
- a unified app platform with deferred API extraction now
over
- a more “platform-complete” but structurally premature multi-app backend model now

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- Next.js 16 App Router as the default app framework
- Route Handlers as the default early server model
- keeping `apps/api` deferred unless extraction triggers are met
- preserving deployment portability without adding early infrastructure

This ADR does **not** by itself approve:
- `apps/api`
- worker/service infrastructure
- a second app framework
- background-job infrastructure
- non-Vercel deployment work

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
- Route Handlers prove insufficient for approved app needs
- a dedicated API boundary becomes real across multiple consumers
- a worker/service lane becomes active
- a non-Vercel deployment target requires real adapter/runtime work
- a later locked topic changes app-family or backend-boundary policy