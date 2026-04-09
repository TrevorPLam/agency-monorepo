# ADR-003 — Package Boundaries and Extraction Rules

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository uses a domain-grouped monorepo structure with:

- strict dependency flow
- phased package activation
- AI-assisted implementation
- explicit public APIs
- condition-gated package creation

The repository already defines a target package taxonomy in `ARCHITECTURE.md`, but that taxonomy is **not** implementation approval. The repo also already states a core principle:

> A package should exist only when two or more consumers truly share the same code without distortion.

The Topic 3 problem is therefore not whether shared packages are useful.

It is:

> What exact rules determine when code stays app-local, when it may be extracted, and how shared packages are kept narrow, intentional, and safe for AI-assisted implementation?

---

## Decision

The repository adopts an **app-local-first extraction policy**.

### Core rule
New logic stays inside the app by default.

### Core rule
A new shared package may be created only when:
1. it has **two real consumers**
2. both consumers can use the **same API without distortion**
3. it has a **clear domain home**
4. its dependencies fit the allowed repo dependency flow
5. its public API can be expressed through explicit `exports`
6. it has an owner, README, and tests
7. it is approved in `REPO-STATE.md`

### Core rule
A package appearing in `ARCHITECTURE.md` does **not** authorize scaffolding by itself.

---

## Why this decision was made

### 1) Shared packages are a long-term asset only when they are real products
A shared package should behave like a real internal product:
- clear purpose
- real consumers
- bounded dependencies
- public API
- tests
- docs
- ownership

Without that discipline, “shared code” becomes a dumping ground.

### 2) Premature extraction is more damaging than temporary duplication
Small amounts of duplication are cheaper than:
- forced abstractions
- app-specific switches hidden inside packages
- provider-branching logic inside “shared” code
- brittle public APIs created too early

### 3) AI tools over-extract by default unless the rule is explicit
AI tools tend to see repeated code and extract it early, even when:
- the second consumer is hypothetical
- the abstractions are not stable
- the consumers actually need different behavior
- the domain ownership is unclear

That behavior is structurally wrong for this repository.

### 4) Public API discipline matters as much as package count
A shared package is not safe just because it exists for a good reason.
It also needs a narrow and intentional public surface.

That is why explicit `exports` are part of the extraction rule, not an afterthought.

---

## Approved now

The following are approved as package-boundary policy:

- app-local-first extraction
- two-real-consumers threshold
- distortion test
- strict package `exports`
- domain-grouped package placement
- explicit package proposal/approval workflow
- `REPO-STATE.md` approval before scaffolding new shared packages
- package ownership, README, and tests as creation requirements

---

## Deferred

The following are intentionally deferred unless justified later:

- convenience extraction based on likely future reuse
- centralization of one-app logic into shared packages
- broad content/platform packages before multiple real consumers exist
- extraction motivated only by directory neatness or code deduplication optics

---

## Rejected

The following are explicitly rejected:

- anticipatory extraction
- creating a shared package because the folder exists in `ARCHITECTURE.md`
- creating “shared” packages with one real consumer
- preserving a package abstraction through app-specific flags or consumer-specific branches
- broad wildcard exports that expose internals for convenience
- using tests, stories, or multiple files in one app as evidence of multiple consumers

---

## Two real consumers rule

### Definition
A package has **two real consumers** only when either:
- two approved apps/packages already need the same capability, or
- one implemented consumer and one second approved consumer in the **current milestone** need the same capability and can use the same API cleanly

### Does not count
The following do **not** count as two real consumers:
- one real consumer plus one hypothetical future consumer
- multiple files inside one app
- one app plus its stories/tests
- repeated use of the same helper inside one app
- two consumers that only work if the package grows consumer-specific options

### Meaning
If the second consumer is speculative, the code stays local.

---

## Distortion test

Before extracting a package, ask:

> Can both consumers use one clean API without app-specific flags, brand forks, provider branches, workflow branches, or consumer-specific exceptions?

If the answer is **no**, do not extract.

### Distortion examples
Keep code app-local when sharing would require:
- marketing-site-only flags
- internal-tool-only conditionals
- different auth/session assumptions
- provider-specific branches that mainly exist to preserve the package
- client-brand logic embedded into a “shared” component package

---

## App-local-first rule

Keep logic inside the app when it is:

- route-specific
- page-specific
- client-brand-specific
- tightly coupled to one app’s auth/session/state/routing model
- likely to evolve differently across consumers
- only needed in the current milestone by one app
- easier to understand locally than through a shared abstraction

### Important note
App-local does not mean low quality.
It means the logic has not yet earned package status.

---

## Shared-package acceptance rule

A new shared package may be approved only when all answers are **yes**:

### Consumer test
- does it have two real consumers?
- is the second consumer real and approved, not hypothetical?
- are the consumers separate apps/packages?

### Distortion test
- can both consumers use the same API without app-specific flags?
- can both consumers use the same API without brand forks?
- can both consumers use the same API without provider branches?

### Boundary test
- does it have a clear domain home?
- do its dependencies fit the repo dependency flow?
- can it avoid importing from higher-level domains?

### API test
- does it have a narrow, intentional `exports` surface?
- are all exports meant to be public API?

### Ownership test
- is there a named owner?
- is there a README?
- are there tests?
- is the package approved in `REPO-STATE.md`?

If any answer is **no**, the package is not approved.

---

## Exports policy

### Core rule
All shared packages must use explicit `exports`.

### Why
`exports` defines the intended public API and prevents consumers from reaching into internal files.

### Required behavior
- expose only intentional entry points
- keep the public surface narrow
- treat every new export as a public API decision
- keep internal implementation paths private

### Forbidden behavior
- direct imports from another package’s internal `src/`
- convenience exports that expose large internal surfaces
- wildcard export patterns that make the package harder to govern
- path-based imports that bypass the public API

### Change rule
Adding a new export may require:
- tests
- docs
- changeset review
- decision review if the surface meaningfully broadens

---

## Domain placement rule

Every shared package must have a clear domain home.

### Approved domain model
Packages must live in one of the approved repository domains, such as:
- config
- core
- ui
- marketing
- data
- auth
- communication
- analytics
- experimentation
- lead-capture
- testing

### Domain-placement test
Before creating a package, answer:
- what domain owns this responsibility?
- why does it belong there instead of inside the app?
- does its dependency profile match that domain?

If the domain home is unclear, the package is not ready.

---

## Dependency flow rule

A package is invalid if it requires illegal imports to function.

### At minimum
- no package may import from an app
- lower-level domains may not import from higher-level domains
- circular dependencies are forbidden
- a package may not be created if its purpose depends on violating the repo flow

### Design consequence
If a useful abstraction only works by crossing forbidden boundaries, it is the wrong abstraction.

---

## Implementation rule

### Package taxonomy is not package approval
The target package map in `ARCHITECTURE.md` is a reference model, not a permission model.

### Conditional package rule
If a package is conditional in `DEPENDENCY.md`, it may not be scaffolded early just because Topic 3 approves shared-package policy in general.

### Approval rule
Shared-package extraction requires both:
- extraction criteria satisfaction
- explicit approval in `REPO-STATE.md`

---

## AI operating impact

AI tools must:

- default to app-local code
- stop when second-consumer evidence is uncertain
- stop when the package seems useful but not yet justified
- avoid introducing shared packages from target-state docs alone
- avoid widening exports casually
- escalate instead of preserving a weak abstraction through conditionals

AI tools must not:

- create packages for speculative reuse
- turn one-app logic into shared packages for neatness
- use “might be used later” as extraction evidence
- expose internals broadly to make package use easier

---

## Consequences

### Positive consequences
- fewer premature packages
- cleaner public APIs
- stronger package ownership
- less AI-assisted abstraction drift
- easier future boundary enforcement
- better long-term package quality

### Negative consequences
- some duplication will remain longer
- early code may stay in apps even if it looks reusable
- new shared packages will require explicit proof and approval

### Accepted tradeoff
This repository prefers:
- small local duplication now
over
- structurally weak shared abstractions now

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- app-local-first extraction discipline
- package proposal/checklist workflow
- strict exports governance
- requiring real consumer evidence before package creation

This ADR does **not** by itself approve:
- creation of any specific conditional package
- milestone progression
- dependency additions
- exceptions to repo dependency flow

Those remain governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `docs/AGENTS.md`
- `DEPENDENCY.md`
- `ARCHITECTURE.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- the extraction rule proves too strict for real approved milestones
- package sprawl or dumping-ground behavior appears despite the rule
- explicit exports discipline proves insufficient
- future locked topics materially change package-domain ownership or dependency flow
- the repository adopts stronger automated boundary tooling that changes how extraction approval is enforced