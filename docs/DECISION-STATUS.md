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
| MCP server at current phase | not approved | Deferred |

---

## Open decisions

These remain open and must not be auto-resolved by AI tools.

| Decision | Status | Notes |
|---|---|---|
| Topic 6 — tenant isolation and client-data safety | Open | Not yet taken through the formal topic process |
| Topic 7 — marketing-site architecture in shared monorepo | Open | Not yet taken through the formal topic process |
| React Compiler launch enablement policy details | Open | High-level direction exists, but implementation policy still needs explicit doc if treated as active |
| Biome adoption | Open | Explicitly pending evaluation in current repo docs |
| Exact future generator requirements | Open | Generators are directionally approved later, but enforcement policy is not yet locked |
| Rulesets vs classic branch protection implementation choice | Open | Governance intent is locked; GitHub mechanism detail may still be chosen |
| Final pnpm catalog scope | Open | Selective catalog strategy is locked, exact initial catalog set is not yet finalized |

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