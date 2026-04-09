# ADR-002 — AI Governance and Anti-Drift Controls

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository is intended for heavy AI-assisted planning and implementation.

That creates a specific structural risk:

> AI coding tools can produce changes that look locally reasonable but are globally invalid for this repository.

The repository already has strong architecture goals:
- phased implementation
- conditional package activation
- strict package boundaries
- explicit dependency ownership
- domain-grouped packages
- strong client-data isolation expectations
- AI-assisted implementation as a first-class workflow

The repository also already distinguishes between:
- target-state architecture
- implementation approval
- dependency governance
- decision lock state

The Topic 2 problem is therefore not whether AI governance is needed.

It is:

> What minimum control plane must exist so AI tools do not overbuild, violate boundaries, or treat target-state architecture as implementation permission?

---

## Decision

The repository will use a formal **AI governance control plane**.

That control plane consists of:

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- package-level README files
- package-level `exports`
- `.github/CODEOWNERS`
- CI enforcement
- ESLint boundary rules
- Changesets for shared-package public API intent

### Core rule
AI tools must follow **document precedence**, not inference.

### Core rule
Prompt text, model intuition, and target-state documentation are **not sufficient** by themselves to authorize changes.

### Core rule
When approval, dependency, or boundary state is unclear, AI tools must **stop and escalate** rather than improvising.

---

## Why this decision was made

### 1) The main repo risk is drift, not lack of capability
The stack itself is viable.
The higher risk is:
- premature scaffolding
- wrong-package installs
- package-boundary violations
- speculative abstraction
- dependency drift
- target-state architecture being mistaken for approval

### 2) AI tools need explicit implementation authority
Without a formal precedence model, AI tools will tend to treat:
- target-state package listings
- detailed build order
- future-state architecture sections

…as permission to scaffold.

That is incompatible with this repository’s condition-gated, phased-build philosophy.

### 3) Prose alone is not enough
The repository needs both:
- human-readable governance
- mechanical enforcement

This means:
- docs must define the rules
- linting, exports, CI, and ownership must back them up

### 4) Governance must start early
If guardrails are delayed until the repo is larger:
- wrong patterns will already exist
- AI-generated code will already encode bad assumptions
- later cleanup becomes expensive and ambiguous

---

## Approved now

The following are approved as part of the AI governance control plane:

### Governance documents
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`

### Repo enforcement
- `.github/CODEOWNERS`
- protected-branch or equivalent required-review policy
- CI status checks
- ESLint boundary enforcement
- explicit package `exports`
- Changesets for shared-package public API changes

### Operating behaviors
- document precedence
- stop/escalate rules
- milestone-aware scaffolding
- app-local-first default
- dependency-first update flow
- package approval before shared extraction

---

## Deferred

The following are intentionally deferred:

- repo-specific MCP server
- advanced AI-specific infrastructure beyond docs + lint + CI + review + generators
- generator-only scaffolding enforcement before generators exist
- custom repo AI tooling that duplicates what strong docs + linting + CI already solve

---

## Rejected

The following are explicitly rejected:

- prompt-only governance
- allowing AI tools to infer approval from `ARCHITECTURE.md`
- allowing AI tools to resolve open decisions by improvisation
- allowing target-state package listings to function as build approval
- relying on human review alone without mechanical reinforcement
- treating “likely future reuse” as permission to extract packages early

---

## Document precedence

For implementation decisions, follow this order:

1. `REPO-STATE.md`
2. `DECISION-STATUS.md`
3. `DEPENDENCY.md`
4. package README + `package.json` `exports`
5. `ARCHITECTURE.md`

### Meaning of this order

#### `REPO-STATE.md`
Answers:
- what is approved now
- what milestone is active
- what may be scaffolded now

#### `DECISION-STATUS.md`
Answers:
- what is locked
- what is open
- what is deferred
- what is rejected

#### `DEPENDENCY.md`
Answers:
- what may be installed
- where it may be installed
- which version policy applies
- what is conditional

#### Package docs + `exports`
Answer:
- how a specific package is meant to be used
- what its public API surface is

#### `ARCHITECTURE.md`
Answers:
- where the repository is designed to end up
- why the structure exists

It does **not** authorize implementation by itself.

---

## Required AI behavior

AI tools must:

- read the control-plane documents first
- work only within approved milestone scope
- keep code app-local unless extraction criteria are satisfied
- follow package `exports`
- use `workspace:*` for internal dependencies
- begin dependency changes in `DEPENDENCY.md`
- stop when approvals or boundaries are ambiguous
- treat shared-package APIs as deliberate, versioned surfaces
- prefer the smallest correct change

---

## Stop and escalate rules

AI tools must stop and escalate when:

### Approval ambiguity
- something exists in `ARCHITECTURE.md` but is not approved in `REPO-STATE.md`
- a relevant decision is still open in `DECISION-STATUS.md`
- a conditional package trigger is not clearly satisfied

### Dependency ambiguity
- a needed dependency is not listed in `DEPENDENCY.md`
- exact version references disagree across files
- a root `overrides` or `packageExtensions` entry seems necessary
- a dependency row is not normalized enough to be safe for implementation

### Package-boundary ambiguity
- another package’s internal `src/` path would need to be imported
- a higher-level domain would need to be imported by a lower-level domain
- a new shared package seems useful but second-consumer evidence is uncertain
- a shared abstraction only works with app-specific flags or consumer forks

### Repo-shape ambiguity
- the change seems to require Nx
- the change seems to require `apps/api`
- the change seems to require repo-specific MCP tooling
- the change seems to require bypassing launch-slice scope

---

## Mechanical enforcement model

The repository will not rely on docs alone.

### Mechanical controls required
- explicit package `exports`
- ESLint boundary enforcement
- CODEOWNERS review routing
- CI status checks
- Changesets for shared-package public API intent
- frozen lockfile installs in CI
- drift checks for dependency/version consistency

### Why mechanical controls matter
A good rule that is not mechanically enforced becomes optional under pressure.
This repository does not allow governance to become optional.

---

## Package-boundary operating policy

### App-local first
Keep logic inside the app unless shared-package criteria are satisfied.

### New shared package rule
A new shared package may be created only when:
- two real consumers exist
- there is no distortion
- the domain home is clear
- the dependency flow is valid
- explicit `exports` can define the public API
- owner + README + tests exist
- `REPO-STATE.md` approves it

### Direct-internal import rule
Never import from another package’s internal `src/`.

### New export rule
A new export is a public API decision, not a convenience edit.

---

## Dependency operating policy

### Dependency authority
`DEPENDENCY.md` is the only authoritative human source for exact dependency versions.

### Dependency-change workflow
Before adding or upgrading a dependency:
1. update `DEPENDENCY.md`
2. update the owning manifest or workspace config
3. update the lockfile
4. run the relevant checks/tests
5. update docs if dependency references changed

### Never do
- install unlisted dependencies
- use `latest` in repo manifests
- install a dependency in the wrong package
- mix auth providers in the same app
- hard-code provider names where provider abstraction is required
- activate locked packages early

---

## Milestone operating policy

### Current launch posture
The repository is milestone-scoped.

### Milestone 1
The first validating app is `apps/agency-website/`.

During Milestone 1:
- build only approved governance/config/core/ui plus the website
- keep first-slice SEO/analytics/monitoring app-local if needed
- do not activate data/auth/email/CMS/shared analytics/monitoring packages unless explicitly approved

### Milestone 2
The first authenticated/persistent app is expected to be `apps/internal-tools/crm/`.

Only then may the repo activate:
- `@agency/data-db`
- `@agency/auth-internal`
- other packages explicitly approved for that milestone

---

## High-risk areas

Changes in the following areas are high risk:
- `packages/config/`
- `packages/data/`
- `packages/auth/`
- `.github/workflows/`
- `DEPENDENCY.md`
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- package `exports`
- shared-package public APIs

### High-risk handling rule
For high-risk areas:
- read first
- minimize the change
- do not mix unrelated edits
- escalate on ambiguity

---

## Consequences

### Positive consequences
- lower AI-assisted architectural drift
- fewer premature packages
- fewer invalid installs
- stronger milestone discipline
- clearer handoff to coding tools
- more reliable package-boundary enforcement

### Negative consequences
- AI tools will stop more often instead of “helpfully” improvising
- some changes will require explicit decision/state updates before work continues
- governance work must be maintained actively

### Accepted tradeoff
This repository prefers:
- slower incorrect changes
over
- faster structurally invalid changes

That is the correct tradeoff for an AI-assisted monorepo.

---

## Implementation impact

This ADR requires:
- the governance spine to exist and stay current
- AI tools to follow precedence, not architecture prose
- milestone-aware implementation behavior
- stop/escalate behavior on ambiguity
- mechanical enforcement where possible

This ADR does **not** by itself approve:
- new packages
- new milestones
- new dependencies
- new tools

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

- AI tools repeatedly fail despite the current control plane
- document precedence proves insufficient
- a new class of drift appears that current controls do not address
- generators become mature enough to change required scaffolding behavior
- repo-specific MCP tooling becomes justified by measured friction
- a future topic materially changes milestone or extraction governance