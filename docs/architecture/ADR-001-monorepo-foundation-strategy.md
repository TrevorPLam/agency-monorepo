# ADR-001 — Monorepo Foundation Strategy

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is intended to be a production-grade agency monorepo with:

- pnpm workspaces
- Turborepo
- Next.js App Router
- domain-grouped packages
- strict dependency boundaries
- phased package activation
- AI-assisted implementation with strong anti-drift controls

The repository already distinguishes between:

- **target-state architecture** in `ARCHITECTURE.md`
- **implementation approval** in `REPO-STATE.md`
- **decision lock state** in `DECISION-STATUS.md`
- **dependency authority** in `DEPENDENCY.md`

The core Topic 1 question is no longer whether a monorepo is viable. That is already settled.

The real decision is:

> What is the correct monorepo foundation to use now, and what exact threshold would justify escalating beyond it later?

---

## Decision

The repository will use this monorepo foundation now:

- **pnpm workspaces** as the package manager and workspace model
- **Turborepo** as the task orchestrator
- **domain-grouped packages** as the package taxonomy
- **explicit package `exports`** as package API boundaries
- **ESLint boundary enforcement** as the launch-stage module-boundary guardrail
- **Changesets** as shared-package version-intent tooling
- **CODEOWNERS + CI + AGENTS** as governance controls starting early
- **`workspace:*`** for all internal package dependencies

### Nx policy
Nx is **deferred**.

The repository will **not** adopt Nx at launch, and will **not** begin speculative Nx migration work before the explicit trigger is met.

---

## Why this decision was made

### 1) Turborepo is sufficient now
The repository’s early needs are:
- workspace orchestration
- filtered task execution
- caching
- good fit with Next.js/Vercel workflows
- low operational overhead

Turborepo satisfies those needs without adding governance complexity that the repository does not yet need.

### 2) Governance, not orchestration, is the bigger launch risk
At launch, the main risks are:
- AI drift
- boundary violations
- speculative package creation
- dependency drift
- package API sprawl
- target-state docs being mistaken for implementation authority

Those problems are solved first through:
- document precedence
- approval-state controls
- ESLint boundaries
- explicit exports
- CODEOWNERS
- AGENTS rules
- Changesets

They are **not** solved primarily by adding Nx early.

### 3) The repo should stay structurally Nx-compatible
The repository will still preserve a structure that keeps later Nx adoption low-friction:
- domain-grouped folders
- clear package ownership
- strict dependency flow
- explicit public APIs
- no app-to-package reverse imports
- no circular dependencies

This preserves the option to add Nx later without prematurely paying the cost now.

### 4) Scale-stage tooling should follow scale-stage problems
The repo should not adopt:
- Nx
- distributed execution
- private registry complexity
- enterprise-scale graph governance

…until there is clear evidence that current controls are insufficient.

---

## Approved now

The following are approved as the monorepo foundation:

- pnpm workspaces
- Turborepo
- domain-grouped package structure
- explicit `exports`
- ESLint flat config with boundary enforcement
- Changesets
- CODEOWNERS
- `docs/AGENTS.md`
- `workspace:*` for internal deps
- root lockfile governance
- filtered Turborepo execution
- governance-first repo setup

---

## Deferred

The following are intentionally deferred:

- Nx
- Nx migration work
- Nx tags/config/plugins
- distributed task execution
- private registry publishing
- enterprise-scale repo graph tooling
- repo-specific MCP server
- any scale-stage governance tooling not yet justified by real repo complexity

---

## Rejected

The following are explicitly rejected at this phase:

- adopting Nx at launch
- “future-proofing” the repo by installing Nx before the trigger is met
- adding scale-stage tooling because it may be useful later
- using target-state architecture as justification for heavier launch tooling
- migrating governance responsibilities into tooling before the simpler controls are fully in place

---

## Foundation rules

### Rule 1 — Turborepo is the active orchestrator
Use Turborepo as the active task orchestration layer above pnpm workspaces.

### Rule 2 — `tasks`, not `pipeline`
All `turbo.json` configuration must use the `tasks` key.

### Rule 3 — Internal dependencies use `workspace:*`
No internal package may use:
- relative path versioning
- hardcoded internal semver ranges
- registry-style resolution for workspace packages

### Rule 4 — Boundary enforcement starts early
Do not wait for later tooling to enforce package discipline.
Launch-stage enforcement must come from:
- exports
- lint boundaries
- CODEOWNERS
- AGENTS
- review discipline
- approval-state governance

### Rule 5 — Keep the repo Nx-compatible without adding Nx
Preserve future migration options, but do not add Nx infrastructure early.

---

## Nx evaluation trigger

Nx should be **evaluated** only when at least 2 of the following are true for a sustained period:

- the repo reaches **30+ apps** or equivalent surface complexity
- **8+ active developers** are regularly changing the repo
- cross-domain boundary violations recur despite lint rules
- AI tools repeatedly violate package boundaries despite AGENTS, exports, and approval-state controls
- repo graph complexity materially slows planning, review, or safe change analysis
- manual governance is no longer reliably containing drift

### Important note
Evaluation is not adoption.

Meeting this threshold means:
- review whether current controls are still enough
- compare actual governance pain to Nx value
- decide whether lighter controls have already been exhausted

---

## Nx adoption trigger

Nx may be **approved** only when all of the following are true:

1. the Nx evaluation trigger has already been met
2. at least one trigger is a **governance-control failure**, not just inconvenience
3. the lower-cost controls are already in place and still insufficient:
   - `REPO-STATE.md`
   - `DECISION-STATUS.md`
   - `DEPENDENCY.md`
   - `docs/AGENTS.md`
   - explicit package exports
   - ESLint boundary rules
   - CODEOWNERS
   - Changesets
   - filtered Turborepo commands
   - CI enforcement
4. the migration can be done without violating current package/domain structure

If those conditions are not all true, Nx remains deferred.

---

## Consequences

### Positive consequences
- lower launch complexity
- faster time to a valid first slice
- fewer speculative infra decisions
- better fit with phased package activation
- cleaner AI implementation boundaries
- preserved future migration path

### Negative consequences
- some governance work remains manual longer
- repo graph reasoning will rely more heavily on docs, linting, and review until later scale
- boundary enforcement will be strong but not yet maximal

### Accepted tradeoff
This repository is choosing:
- **smaller now**
- **stricter process now**
- **heavier tooling only when earned**

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes and reinforces:

- pnpm + Turborepo as the current foundation
- domain-grouped package organization
- early governance enforcement
- explicit exports discipline
- no Nx-related scaffolding or migration activity

This ADR does **not** approve:
- new packages by itself
- milestone sequencing by itself
- dependency additions by itself

Those continue to be governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `ARCHITECTURE.md`
- `docs/AGENTS.md`

---

## Change conditions

Reopen this ADR only if one of the following happens:

- the Nx evaluation trigger is met
- repo governance is failing despite current controls
- the package/domain structure changes materially
- the task orchestration model can no longer safely support repo scale
- there is a structural conflict between current foundation choices and locked later decisions