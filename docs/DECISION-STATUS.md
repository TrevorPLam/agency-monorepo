# DECISION-STATUS.md

> **Purpose of this document**  
> This is the repository’s decision registry.  
> It answers one question: **which decisions are locked, which are still open, and which are deferred?**
>
> This document does **not** approve implementation by itself.  
> Implementation approval lives in `REPO-STATE.md`.
>
> **Implementation precedence**
> 1. `REPO-STATE.md`
> 2. `DECISION-STATUS.md`
> 3. `DEPENDENCY.md`
> 4. package-level README.md + `package.json` `exports`
> 5. `ARCHITECTURE.md` (target-state reference only)

---

## Status model

Use these status labels consistently.

| Status | Meaning |
|---|---|
| **Locked** | Decided and approved. Do not reopen during implementation unless a real conflict, failure, or new requirement emerges. |
| **Approved** | Accepted for use or adoption. |
| **Deferred** | Intentionally not being done now. Not rejected forever, but not approved for current implementation. |
| **Conditional** | May be approved later if specific trigger conditions are satisfied. |
| **Open** | Still needs decision work. Do not let AI tools fill in the gap by inference. |
| **Rejected** | Not approved. Do not implement unless the decision is explicitly changed. |
| **Superseded** | Previously valid, now replaced by a newer decision. |

---

## Repository-wide decision rules

### Rule 1 — Locked means stable
A **Locked** decision should be treated as stable planning authority.  
Do not reopen locked topics casually during implementation.

### Rule 2 — Open means stop
If a relevant decision is **Open**, AI tools must stop and escalate rather than improvise.

### Rule 3 — Deferred is not soft approval
A **Deferred** item is not “okay to scaffold lightly.”  
It is intentionally out of scope for the current repo phase.

### Rule 4 — Conditional decisions require explicit trigger review
If a decision is **Conditional**, the trigger must be satisfied and reflected in `REPO-STATE.md` before implementation begins.

### Rule 5 — Rejected means do not build
If something is marked **Rejected**, do not implement it unless this document is updated.

---

## Topic decision summary

## Topic 1 — Monorepo foundation strategy

### Status
**Locked**

### Core decision
Use:
- pnpm workspaces
- Turborepo
- domain-grouped packages
- strict boundary governance
- explicit package exports
- `workspace:*` for internal dependencies
- Changesets
- AI-agent guardrails

### Approved
- Turborepo as the repo task orchestrator now
- domain-grouped package structure
- future compatibility with later Nx-style boundary enforcement
- governance-first monorepo setup

### Deferred
- Nx adoption
- Nx migration work
- distributed task execution
- private registry publishing
- enterprise-scale repo controls

### Rejected
- adopting Nx at launch
- “future-proofing” migration work before the trigger is met
- adding scale-stage tooling before scale-stage problems exist

### Nx evaluation trigger
Evaluate Nx only when at least 2 are true for a sustained period:
- 30+ apps or equivalent repo surface complexity
- 8+ active developers regularly modifying the repo
- repeated cross-domain import violations despite lint rules
- repeated AI boundary failures despite AGENTS, exports, and approval-state controls
- repo graph complexity is materially slowing review, planning, or safe change analysis
- manual governance is no longer reliably containing dependency and boundary drift

### Nx adoption trigger
Nx may be approved only when:
- the evaluation trigger has already been met
- at least one trigger is a governance-control failure, not just inconvenience
- lower-cost controls are already in place and still insufficient

---

## Topic 2 — AI-governed planning and anti-drift controls

### Status
**Locked**

### Core decision
The repository requires a formal AI governance control plane before broad AI-assisted implementation.

### Approved
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- `.github/CODEOWNERS`
- CI enforcement
- ESLint boundary enforcement
- Changesets for shared-package public API intent
- document precedence and stop/escalate behavior

### Deferred
- repo-specific MCP server
- advanced AI tooling beyond docs, linting, review ownership, CI, and generators
- generator-enforced scaffolding as a universal requirement before generators exist

### Rejected
- prompt-only governance
- letting target-state docs authorize implementation by implication
- letting AI tools resolve open architectural choices by inference

### Operating rule
If repo state, dependency rules, and target-state architecture disagree:
- implementation follows `REPO-STATE.md`
- then `DECISION-STATUS.md`
- then `DEPENDENCY.md`
- and does **not** proceed by inference from `ARCHITECTURE.md`

---

## Topic 3 — Domain-grouped package boundaries and extraction rules

### Status
**Locked**

### Core decision
The repository uses an **app-local-first extraction policy**.

### Approved
- domain-grouped package taxonomy
- two-real-consumers rule
- distortion test
- strict `exports`
- package proposal/approval workflow
- package creation only when it satisfies extraction criteria and approval state

### Deferred
- extraction of packages whose second consumer is only expected later
- convenience packages created “in advance” of real reuse

### Rejected
- anticipatory extraction
- “shared” packages with one real consumer
- broad convenience exports that expose internals
- treating package presence in `ARCHITECTURE.md` as approval to scaffold

### Locked extraction rule
A new shared package may be approved only when all are true:
1. it has two real consumers
2. both consumers can use the same API without distortion
3. it has a clear domain home
4. its dependencies fit allowed repo flow
5. its public API can be expressed through explicit `exports`
6. it has an owner, README, and tests
7. it is approved in `REPO-STATE.md`

### Two-real-consumers definition
Counts only when:
- two approved apps/packages need the same capability, or
- one implemented consumer and one second approved consumer in the current milestone need the same capability and can use the same API cleanly

Does **not** count:
- hypothetical future reuse
- multiple files in one app
- one app plus tests/stories
- one consumer with multiple variants
- abstractions preserved only by app-specific switches

---

## Topic 4 — Launch-slice strategy

### Status
**Locked**

### Core decision
Use a two-step launch-slice strategy:
- **Milestone 1:** `apps/agency-website/`
- **Milestone 2:** first internal tool shell, expected `apps/internal-tools/crm/`

### Approved
- agency website as the first validating app
- internal CRM shell as the second validating app
- Route Handlers first
- app-local-first treatment for first-slice SEO, analytics, and monitoring if shared-package triggers are not met

### Deferred
- `apps/api`
- shared analytics package in Milestone 1
- shared monitoring packages in Milestone 1
- shared CMS package in Milestone 1 unless the first site is explicitly Sanity-backed from day one

### Rejected
- internal tool as the first validating app
- dedicated API app in the launch slice
- activating data/auth/email stack in Milestone 1 by default
- activating shared SEO/analytics/monitoring packages in Milestone 1 merely because they exist in target-state architecture

### Milestone rule
If target-state build order would force conditional packages too early, implementation follows:
- `DEPENDENCY.md` activation rules
- `REPO-STATE.md` milestone approval
- not aspirational sequencing from `ARCHITECTURE.md`

---

## Topic 5 — Dependency truth and version governance

### Status
**Locked**

### Core decision
The repository uses a two-layer dependency governance model:

#### Human authority
- `DEPENDENCY.md`

#### Machine authority
- root `package.json`
- `pnpm-workspace.yaml`
- root `pnpm-lock.yaml`
- CI workflows
- `workspace:*` for internal dependencies

### Approved
- `DEPENDENCY.md` as the only authoritative human source for exact dependency versions
- one shared root lockfile
- `workspace:*` for internal dependencies
- dependency drift checks in CI
- selective pnpm catalogs
- root-only exception handling for `overrides` / `packageExtensions`

### Deferred
- `catalogMode: strict` at launch
- broad catalog enforcement for every dependency immediately
- Corepack as a hard enforcement dependency in CI

### Rejected
- exact version authority duplicated across documents
- raw `latest` in repo manifests
- internal dependencies using relative paths or hardcoded versions
- dependency upgrades that begin in manifests instead of `DEPENDENCY.md`

### Dependency authority rule
If exact version references disagree across documents:
- `DEPENDENCY.md` wins
- conflicting references elsewhere must be corrected or de-authorized

---

## Topic 6 — Tenant isolation and client-data safety

### Status
**Locked**

### Core decision
The repository adopts a default pooled multi-tenant isolation model with:
- mandatory row-level `client_id` scoping for client-owned data
- explicit tenant scope in client-owned query modules
- RLS as defense-in-depth for client-owned tables
- stronger isolation only by explicit trigger

### Approved
- row-level `client_id` scoping as the repository default
- explicit tenant scope in all client-owned query helpers
- RLS for client-owned tables once `@agency/data-db` is active
- dual-tenant leakage testing for client-owned query paths
- explicit exception paths for admin/reporting/migration/incident access

### Conditional
- schema-per-tenant isolation
- dedicated database per tenant
- dedicated deployment stamp per tenant class
- stronger audit/compliance controls when a tenant or app requires them

### Deferred
- implementation of Topic 6 controls before Milestone 2 activation of `@agency/data-db`
- portal-specific tenant-isolation implementation before `@agency/auth-portal` is approved

### Rejected
- auth/session alone as the isolation boundary
- Neon branching as a tenant-security control
- blanket “all client portals must be schema-per-tenant”
- database-per-tenant as the repo-wide default
- unscoped client-owned queries

### Operating rule
If a feature touches client-owned operational data:
- tenant scope is mandatory
- cross-tenant access is exceptional
- stronger isolation requires explicit trigger review rather than default adoption

---

## Topic 7 — Marketing-site architecture in a shared monorepo

### Status
**Locked**

### Core decision
Public-facing sites live as separate apps in the shared monorepo.

They share:
- config
- core
- UI

They do not centralize branded, page-specific, or campaign-specific logic by default.

Marketing-domain packages remain thin, conditional infrastructure packages rather than an early shared website platform.

### Approved
- `apps/agency-website/` as the first validating public-site app
- separate-app model for future public-facing sites
- app-local-first handling of branded/page-specific/campaign-specific logic
- trigger-based extraction of reusable marketing infrastructure

### Conditional
- `@agency/seo`
- `@agency/compliance`
- `@agency/compliance-security-headers`
- `@agency/monitoring`
- `@agency/monitoring-rum`
- `@agency/data-cms`
- `@agency/content-blocks`
- client-specific brand-foundation packages

### Deferred
- full client-sites family standards
- generalized multi-client website platform
- early shared content-block architecture
- client-site family conventions before a real client site is approved

### Rejected
- turning the agency website into a generalized public-site platform too early
- extracting branded sections into shared packages early
- using target-state package listings as approval for public-site package scaffolding
- centralizing client-specific branding in shared packages

### Operating rule
If a public-facing site can work with app-local marketing logic in the current milestone:
- keep it app-local
- do not create shared marketing packages early

---

## Topic 8 — Next.js 16 as the repo-wide application platform

### Status
**Locked**

### Core decision
The repository adopts Next.js 16 App Router as the default framework for approved app surfaces.

Route Handlers inside `app/` are the default early server model.

A dedicated `apps/api` remains a later extraction path rather than a launch-default app.

### Approved
- Next.js 16 App Router as the default app platform
- Route Handlers as the default early server interface
- Vercel as the primary hosting target
- adapter-aware portability as a design guardrail

### Conditional
- `apps/api`
- separate worker/service processes
- non-Vercel adapter work tied to a real approved app deployment

### Deferred
- `apps/api` in Milestone 1
- separate backend framework adoption by default
- early portability infrastructure
- worker/service infrastructure before a real workload requires it

### Rejected
- creating `apps/api` in the launch slice
- introducing a separate backend framework by default
- treating target-state `apps/api` presence as implementation approval
- treating “Next.js for all apps” as “all backend work must live inside Next.js forever”

### Operating rule
If an approved app needs server behavior:
- use Route Handlers first
- do not extract `apps/api` unless a real boundary and trigger exist

---

## Topic 9 — React 19 and React Compiler adoption policy

### Status
**Locked**

### Core decision
The repository is compiler-ready, but React Compiler remains off by default.

The first approved enablement path is:
- lint-first preparation
- annotation-mode pilot in one approved app
- broader enablement only after real pilot experience

### Approved
- `@agency/config-react-compiler` as the shared config lane
- compiler-off-by-default posture
- lint-first preparation
- annotation mode as the first approved enablement mode
- preserving manual memoization unless real cleanup is justified

### Conditional
- annotation-mode pilot in an approved app
- later app-wide `infer` mode
- shared-package compiler-related refactors under normal package-governance rules

### Deferred
- repo-wide default enablement in Milestone 1
- infer-mode rollout by default
- compiler-driven broad memoization cleanup

### Rejected
- blind compiler enablement at launch
- `compilationMode: 'all'`
- ad hoc per-app compiler policy outside the shared config lane
- mass removing `useMemo` / `useCallback` by assumption

### Operating rule
If an app wants React Compiler:
- prepare lint first
- pilot annotation mode first
- do not infer broader approval from framework support alone

---

## Topic 10 — Tailwind v4 and source-owned design system strategy

### Status
**Locked**

### Core decision
The repository adopts Tailwind v4’s CSS-first model with a source-owned shared design system.

Package ownership is split as follows:
- `@agency/config-tailwind` = Tailwind setup lane
- `@agency/ui-theme` = semantic token lane
- `@agency/ui-icons` = icon lane
- `@agency/ui-design-system` = shared primitive/component lane

### Approved
- CSS-first Tailwind v4 architecture
- explicit source-detection handling for shared UI packages
- shadcn monorepo-aware shared design-system workflow by default
- primitive-focused shared UI boundaries

### Conditional
- shared content blocks
- client-specific brand-foundation packages
- Storybook/Ladle activation
- additional UI package splits

### Deferred
- branded/page-level shared compositions
- client-brand token packages before real approval
- content-block architecture before multiple real consumers exist

### Rejected
- JS preset-first Tailwind architecture as the default
- token ownership spread across multiple packages
- design-system use as a dumping ground for branded/page-specific code
- early extraction of marketing sections into shared UI packages

### Operating rule
If a UI concern is:
- branded,
- page-specific,
- campaign-specific, or
- only used by one app,

keep it app-local instead of moving it into `@agency/ui-design-system`.

---

## Active repository decisions

These are currently active and should govern implementation.

| Area | Decision | Status |
|---|---|---|
| Repo foundation | pnpm + Turborepo now | Approved |
| Scale-stage tooling | Nx later by trigger | Deferred |
| AI governance | formal control plane required | Approved |
| Package extraction | app-local first | Approved |
| Shared-package threshold | two real consumers without distortion | Approved |
| First validating app | agency website | Approved |
| First authenticated/persistent app | internal CRM shell | Approved |
| Dedicated API app at launch | not allowed | Rejected |
| Dependency truth | `DEPENDENCY.md` only | Approved |
| Internal dependency specifier | `workspace:*` only | Approved |
| Exact-version duplication outside `DEPENDENCY.md` | not allowed | Rejected |
| Tenant default | pooled row-level isolation + RLS defense-in-depth | Approved |
| Public-site model | separate apps, app-local branded logic | Approved |
| App platform | Next.js App Router by default | Approved |
| Early server model | Route Handlers first | Approved |
| React Compiler rollout posture | off by default, annotation-first pilot | Approved |
| UI architecture | Tailwind v4 CSS-first, primitive-focused shared design system | Approved |
| MCP server at current phase | not approved | Deferred |

---

## Open decisions

These remain open and must not be auto-resolved by AI tools.

| Decision | Status | Notes |
|---|---|---|
| Biome adoption | Open | Explicitly pending evaluation in current repo docs |
| Exact future generator requirements | Open | Generators are directionally approved later, but enforcement policy is not yet locked |
| Rulesets vs classic branch protection implementation choice | Open | Governance intent is locked; GitHub mechanism detail may still be chosen |
| Final pnpm catalog scope | Open | Selective catalog strategy is locked, exact initial catalog set is not yet finalized |
| Detailed client-sites family architecture | Open | Deferred until a real client-facing site activates that lane |
| Dedicated worker/service platform standards | Open | Deferred until a real workload requires it |
| Repo-wide Storybook vs Ladle workbench decision | Open | Remains conditional/deferred until an actual component-workbench need exists |

### Open-decision rule
If implementation touches an open decision:
- stop
- request explicit decision closure
- do not let AI fill in the gap

---

## Superseded / clarified assumptions

### Superseded assumption
“Anything listed in `ARCHITECTURE.md` is safe to scaffold.”

**Replaced by:**  
Target-state package listings and sequencing do not authorize implementation by themselves.

### Superseded assumption
“Shared package extraction is a convenience optimization.”

**Replaced by:**  
Shared package creation is a governance decision and must satisfy extraction tests.

### Superseded assumption
“The first validating app should be the internal CRM because it exercises more of the stack.”

**Replaced by:**  
The first validating app is the smallest correct real milestone: the agency website.

### Superseded assumption
“Exact versions can be listed in multiple docs if generally aligned.”

**Replaced by:**  
Exact version authority belongs in `DEPENDENCY.md` only.

### Superseded assumption
“Client portals should default to schema-per-tenant isolation.”

**Replaced by:**  
Default tenant isolation is pooled row-level scoping with RLS defense-in-depth; stronger isolation is trigger-based.

### Superseded assumption
“The agency website should evolve into a shared website platform immediately.”

**Replaced by:**  
Public-site apps stay separate; branded/public-site composition stays app-local until real reuse proves otherwise.

### Superseded assumption
“Next.js for all apps means every backend concern should live inside Next.js forever.”

**Replaced by:**  
Next.js App Router is the default app platform; dedicated API or worker/service lanes remain later, trigger-based extractions.

### Superseded assumption
“React Compiler support means enable it broadly.”

**Replaced by:**  
Compiler support and compiler rollout are different decisions; rollout is lint-first and annotation-first.

### Superseded assumption
“Shared design system means shared page compositions.”

**Replaced by:**  
The shared design system owns primitive reusable UI, not branded or page-specific compositions.

---

## Change control for this document

Any change to this file must answer:
1. which topic or decision is being updated
2. whether the change is locking, opening, deferring, or rejecting something
3. what other documents must also change
4. whether `REPO-STATE.md` needs approval-state updates
5. whether AI operating rules in `docs/AGENTS.md` must be updated

---

## Review triggers

This document should be reviewed when:
- a topic is newly completed
- a previously deferred item becomes active
- a conditional package trigger is satisfied
- a governance conflict appears between source docs
- an AI implementation failure exposes missing or ambiguous decision logic
- the repo enters a new milestone
- a later QA pass finds factual/tooling drift in a locked topic