# ADR-009 — React Compiler Adoption Policy

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is built on:
- Next.js 16 App Router
- React 19
- phased implementation
- strict package boundaries
- AI-assisted implementation with strong anti-drift controls

The repository already establishes that:
- `@agency/config-react-compiler` is an approved config package in Milestone 1
- React Compiler support is allowed in the stack
- React Compiler is not enabled by default
- the detailed launch enablement policy for React Compiler needed to be explicitly locked

The Topic 9 problem is therefore not whether React Compiler is viable.

It is:

> What adoption policy lets the repository benefit from React Compiler later without turning the launch slice into a speculative compiler migration?

---

## Decision

The repository adopts a **compiler-ready, lint-first, opt-in React Compiler policy**.

### Default posture
React Compiler support is allowed in the repo, but the compiler remains **disabled by default**.

### First enablement model
The first approved enablement path is **annotation mode**, not repo-wide or blind app-wide enablement.

### First pilot scope
If React Compiler is enabled during early phases, it should be piloted in one approved app first, expected to be `apps/agency-website/`.

### Linting posture
Compiler diagnostics should be surfaced through the repository ESLint workflow before broad enablement.

The default lint surface for compiler-related diagnostics is the standard React hooks lint path.

### Shared-package posture
Compiler adoption must not become a reason to:
- refactor shared-package APIs casually
- remove memoization broadly by assumption
- widen exports
- change package boundaries by inference

---

## Why this decision was made

### 1) The repo is in a stability-first phase
The current phase values:
- milestone discipline
- package-boundary discipline
- predictable implementation
- low overbuild risk

Blind compiler enablement works against that posture.

### 2) The compiler supports gradual adoption
The platform supports both broad enablement and annotation-mode enablement.

The repository should choose the more conservative path first.

### 3) Lint-first adoption lowers risk
Compiler diagnostics can be surfaced before broad enablement.

That makes it possible to improve compatibility gradually instead of turning enablement into a large speculative migration.

### 4) Shared packages need stronger discipline than app-local code
A compiler experiment in a single app is lower risk than compiler-driven changes across shared packages.

### 5) Approved config package is not the same as approved global enablement
The existence of `@agency/config-react-compiler` authorizes the config lane.
It does not authorize repo-wide enablement by implication.

---

## Approved now

The following are approved as Topic 9 policy:

- `@agency/config-react-compiler` as the shared config lane
- compiler-off-by-default repo posture
- lint-first preparation for compiler adoption
- annotation mode as the first approved enablement mode
- `"use no memo"` as an allowed escape hatch
- preserving manual memoization unless a real cleanup is justified

---

## Conditional

The following are conditional and require explicit trigger review:

### Annotation-mode pilot
Approve when:
- the owning app is already approved
- lint baseline is in place
- critical flows pass normal tests
- the pilot is intentionally limited in scope

### App-wide `infer` mode
Approve only when:
- the first compiler pilot is stable
- the repo has real experience with diagnostics and escape hatches
- the app benefit is real enough to justify broader enablement

### Shared-package compiler refactors
Approve only when:
- normal package-governance rules are satisfied
- public API changes are intentional
- changes are not being driven merely by compiler enthusiasm

---

## Deferred

The following are intentionally deferred:

- repo-wide default enablement in Milestone 1
- infer-mode enablement by default in the first shipped app
- shared-package cleanup driven primarily by compiler adoption
- any repo-wide memoization removal effort

---

## Rejected

The following are explicitly rejected:

- enabling React Compiler everywhere at launch
- using `compilationMode: 'all'`
- letting each app invent its own compiler policy outside the shared config lane
- mass deleting `useMemo` / `useCallback` because the compiler exists
- treating compiler support as permission to refactor package boundaries

---

## Core rules

### Rule 1 — Compiler support is not compiler default
The repo may support React Compiler without enabling it by default.

### Rule 2 — Lint before broad enablement
Establish compiler-related diagnostics in the ESLint workflow before enabling the compiler broadly.

### Rule 3 — Annotation mode first
The first approved enablement mode is annotation mode.

### Rule 4 — Shared-package discipline still applies
Compiler-related changes to shared packages remain subject to README, tests, exports, and versioning discipline.

### Rule 5 — Preserve manual memoization unless there is evidence
Do not remove existing memoization patterns speculatively.

### Rule 6 — Escape hatches are allowed
Use `"use no memo"` when a component or hook needs explicit opt-out.

---

## First pilot standard

If the compiler is enabled in the first approved app:

### Allowed pilot approach
- annotation mode only
- small, intentional scope
- normal smoke-test coverage
- explicit rollback path

### Not allowed
- whole-repo enablement
- uncontrolled directive spread
- shared-package public API churn
- performance claims without measurement

---

## Dependency and linting policy impact

The repository should standardize one compiler-lint path.

### Default lint path
Use the repo ESLint setup to surface compiler diagnostics through the standard React hooks lint path.

### Compiler integration path
Use the documented compiler integration dependency path in the shared config lane and normalize it in `DEPENDENCY.md`.

### Dependency cleanup required
Update `DEPENDENCY.md` and related drafts so the compiler integration and lint guidance are explicit and consistent.

If any separate compiler-specific ESLint plugin is used later, it must be an explicit documented choice rather than an assumed default.

---

## Consequences

### Positive consequences
- lower launch risk
- cleaner distinction between support and enablement
- safer gradual adoption
- less chance of compiler-driven architecture drift
- clearer AI operating rules

### Negative consequences
- compiler benefits may arrive later than in a more aggressive rollout
- some memoization patterns will remain in place longer
- the repo will carry compiler readiness before compiler default

### Accepted tradeoff
This repository prefers:
- cautious, explicit compiler adoption
over
- broad enablement by assumption

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- `@agency/config-react-compiler` as a supported config lane
- lint-first compiler preparation
- annotation-mode pilot enablement later
- keeping compiler default disabled for now

This ADR does **not** by itself approve:
- annotation-mode pilot execution
- infer-mode enablement
- repo-wide compiler rollout
- shared-package compiler-driven refactors

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
- the first compiler pilot proves clearly safe and valuable
- lint-first preparation proves insufficient
- React or Next guidance changes materially
- compiler adoption starts affecting shared-package boundaries
- a later locked topic changes the UI/config/package strategy materially