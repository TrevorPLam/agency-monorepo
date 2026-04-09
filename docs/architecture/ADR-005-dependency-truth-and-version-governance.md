# ADR-005 — Dependency Truth and Version Governance

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository already has a strong dependency-governance direction:

- dependencies belong to specific internal packages
- conditional packages must not be activated early
- runtime dependencies should not use `latest`
- internal dependencies should use `workspace:*`
- stale-pin correction should begin in `DEPENDENCY.md`

However, Topic 5 identified a critical planning risk:

> Dependency truth can still drift if exact version authority is duplicated across docs, if manifests and CI are not treated as machine-truth files, or if AI tools are allowed to change dependencies without following a strict workflow.

The Topic 5 problem is therefore not whether version governance matters.

It is:

> Where does dependency truth live, how is it enforced, and what exact workflow governs adding or upgrading dependencies in an AI-assisted monorepo?

---

## Decision

The repository adopts a **two-layer dependency governance model**:

### Layer 1 — Human authority
`DEPENDENCY.md` is the authoritative human contract for:

- dependency ownership
- exact pins
- approved ranges
- validation-pending placeholders
- activation rules
- provider lanes
- stale-pin correction workflow

### Layer 2 — Machine authority
The machine-enforced dependency truth lives in:

- root `package.json`
- `pnpm-workspace.yaml`
- root `pnpm-lock.yaml`
- CI workflows
- internal dependency specifiers using `workspace:*`

### Exact-version rule
Exact versions belong in `DEPENDENCY.md` only.

Other repository docs may describe:
- stack families
- compatibility assumptions
- dependency policy

…but they must not act as competing exact-version authorities.

---

## Why this decision was made

### 1) The repository needs both human truth and machine truth
A human-readable dependency contract is necessary for:
- architectural clarity
- package ownership
- AI operating guidance
- provider-lane control
- upgrade reasoning

But prose alone is not enough.

The repository also needs machine-enforced truth so that:
- manifests
- lockfiles
- CI
- workspace settings

…cannot silently drift away from the written policy.

### 2) Exact pin duplication is a structural drift source
If exact versions are repeated in multiple docs, they will eventually diverge.

That creates:
- AI ambiguity
- review ambiguity
- inconsistent upgrades
- stale documentation
- broken trust in the governance system

The solution is to keep exact version authority in one human source only: `DEPENDENCY.md`.

### 3) AI tools need a dependency workflow, not just a dependency list
Without a strict dependency-change workflow, AI tools will tend to:
- edit manifests first
- add unlisted packages
- use loose version specifiers
- normalize toward registry habits rather than repo policy

That is incompatible with this repository’s governance model.

### 4) Internal dependencies must be structurally constrained
`workspace:*` is not just a preference.
It is part of how the repository preserves:
- local package resolution
- workspace correctness
- clear internal package ownership
- safer package version coordination

### 5) Drift must be detected before merge
Dependency rules that are only checked manually will eventually fail under pressure.

The repository therefore needs CI drift checks to reinforce the human contract.

---

## Approved now

The following are approved as dependency-governance policy:

### Human dependency authority
- `DEPENDENCY.md` as the only authoritative human source for exact dependency versions

### Machine dependency authority
- root `package.json`
- `pnpm-workspace.yaml`
- root `pnpm-lock.yaml`
- CI workflow version references
- `workspace:*` internal dependency resolution

### Repo-wide dependency rules
- one shared root lockfile
- no `latest` in repo manifests
- `workspace:*` for all internal dependencies
- dependency changes must begin in `DEPENDENCY.md`
- CI drift-checks
- root-only exception handling for `overrides` and `packageExtensions`
- selective pnpm catalog usage

---

## Deferred

The following are intentionally deferred:

- `catalogMode: strict` at launch
- broad catalog enforcement for every dependency immediately
- Corepack as the sole enforcement mechanism in CI
- dependency automation beyond the current governance/document/CI model
- package-manager or registry sophistication beyond current repo needs

---

## Rejected

The following are explicitly rejected:

- exact version authority duplicated across multiple docs
- `latest` in repo manifests
- internal dependencies using relative paths or hardcoded version specs
- dependency upgrades that begin in manifests instead of `DEPENDENCY.md`
- casual root `overrides` / `packageExtensions`
- treating `ARCHITECTURE.md` exact-version references as installation authority

---

## Authority model

### Human authority
`DEPENDENCY.md` answers:
- what dependency is allowed
- where it belongs
- what version policy applies
- whether it is exact, ranged, or pending validation
- what activation rules apply

### Machine authority
The machine truth answers:
- what the repo is actually configured to use
- what the lockfile resolves
- what CI verifies
- how internal packages resolve locally

### Conflict rule
If exact version references disagree:
- `DEPENDENCY.md` wins as the human authority
- conflicting references elsewhere must be corrected or explicitly de-authorized
- AI tools must stop and escalate rather than guess

---

## Version classification policy

Every dependency must belong to one of these governance classes:

### 1) Verified exact pin
Use when:
- compatibility is tight
- runtime behavior matters
- generated output/config syntax depends on the version
- shared-package or production-app behavior depends on exact compatibility
- provider SDK behavior is important enough to pin explicitly

### 2) Approved range
Use when:
- the dependency is non-runtime or less sensitive
- patch/minor flexibility is intentionally allowed
- the lockfile still provides deterministic resolution
- the range has been explicitly approved

### 3) Validation pending
Use when:
- a dependency is not yet approved for implementation
- the version still needs official confirmation
- the dependency appears in planning lanes but is not yet active

### 4) Tool-only latest
Use only for:
- generator-style CLI commands
- docs examples explicitly marked as tool commands
- research placeholders that are not implementation authority

### Non-negotiable rule
Tool-only `latest` is never allowed in repo manifests.

---

## Exact pin policy

Use verified exact pins for:
- package manager version
- Node baseline references used in repo configuration
- framework trios and tightly coupled stacks
- build/config tools whose behavior affects repo configuration or output
- runtime/provider SDKs used in approved shared packages or production apps
- tools where config syntax or generated artifacts are version-sensitive

### Meaning
Exact pinning is the default for repo-critical and runtime-relevant dependencies.

---

## Approved range policy

Use approved ranges only when:
- the dependency family is intentionally managed as a compatible band
- the lockfile still ensures deterministic installs
- patch/minor flexibility has a governance reason
- the dependency is not being left loose by accident

### Important note
Approved range does not mean “let the registry decide.”
It still means:
- explicit approval
- lockfile-backed resolution
- controlled usage

---

## Internal dependency policy

### Required rule
All internal dependencies must use:

- `workspace:*`

### Forbidden
Do not use:
- relative paths as internal dependency specifiers
- hardcoded semver versions for internal packages
- registry-style ranges for internal workspace packages

### Why
This preserves:
- local resolution correctness
- clear workspace ownership
- safe monorepo package coordination
- lower internal version drift

---

## Lockfile policy

### Required rule
The repository uses one shared root lockfile:

- `pnpm-lock.yaml`

### Required behavior
- commit the lockfile
- update it when dependencies change
- use frozen-lockfile installs in CI

### Why
A shared lockfile reinforces:
- deterministic installs
- monorepo consistency
- reviewable dependency changes
- safer AI-assisted package updates

---

## Catalog policy

### Approved strategy
Use pnpm catalogs **selectively**.

### What catalogs are for
Catalogs may be used for:
- repo-wide shared external dependencies
- coordinated stack families
- reducing duplicated version declarations where the dependency truly behaves like shared repo infrastructure

### What catalogs are not for
Do not force every one-off dependency into a catalog at launch.

### Launch enforcement level
- catalogs may be used
- `catalogMode: manual` is the approved initial posture
- stricter enforcement is deferred until the repo’s active dependency set is cataloged broadly enough to justify it

---

## Root exception policy

### Allowed exception mechanisms
- root `overrides`
- root `packageExtensions`

### Exception rule
These are allowed only as root-level exception tools.

They are **not** normal dependency-management mechanisms.

### Requirements for use
Any such entry should have:
- a short reason
- an owner
- a cleanup target or review note
- a corresponding documentation note in `DEPENDENCY.md` or an ADR if the blast radius is high

### Why
Exception logic should remain:
- visible
- intentional
- temporary where possible

---

## Dependency-change workflow

Before adding or upgrading any dependency:

1. update `DEPENDENCY.md`
2. update the owning manifest or workspace config
3. update the root lockfile
4. run the relevant checks/tests
5. update any affected docs if dependency references changed

### Important rule
Dependency changes must not begin in `package.json` files.

They must begin in `DEPENDENCY.md`.

---

## CI dependency-governance policy

CI must fail when any of the following occur:

- `.nvmrc` and `engines.node` drift
- `packageManager` and CI pnpm version drift
- internal dependencies are not using `workspace:*`
- `latest` appears in repo manifests
- root dependency-truth files disagree
- lockfile changes are missing after dependency changes
- a normalized exact pin in `DEPENDENCY.md` conflicts with machine-truth files

### Meaning
Dependency governance is not review-only.
It is review + machine enforcement.

---

## Corepack policy

### Approved use
Corepack may be used as an onboarding convenience.

### Not approved as sole enforcement
Corepack is not the sole dependency-governance enforcement layer.

CI must still pin and verify the correct package-manager version explicitly.

---

## AI operating impact

AI tools must:

- treat `DEPENDENCY.md` as the only authoritative human source of exact versions
- begin dependency changes in `DEPENDENCY.md`
- use `workspace:*` for internal dependencies
- stop when exact-version references disagree
- stop when a dependency is missing from the contract
- stop when root-level override-style exceptions seem necessary

AI tools must not:

- add unlisted dependencies
- install dependencies in the wrong internal package
- use `latest` in repo manifests
- introduce internal semver ranges instead of `workspace:*`
- use `ARCHITECTURE.md` as install authority for exact versions
- quietly normalize loose dependency policy into manifests

---

## Consequences

### Positive consequences
- lower dependency drift
- clearer version authority
- safer AI-assisted dependency changes
- less duplicated version truth
- better CI enforcement
- stronger review clarity

### Negative consequences
- dependency changes become more procedural
- some version cleanup must happen before broad implementation
- doc maintenance is required to preserve trust in the contract

### Accepted tradeoff
This repository prefers:
- explicit and slightly slower dependency changes
over
- faster but ambiguous dependency changes

That is the correct tradeoff for an AI-assisted monorepo.

---

## Implementation impact

This ADR authorizes:
- `DEPENDENCY.md` as exact-version human authority
- machine-truth enforcement through manifests, workspace config, lockfile, and CI
- `workspace:*` internal dependency policy
- CI drift-check requirements
- selective catalog usage
- root-only override exception policy

This ADR does **not** by itself approve:
- any specific dependency addition
- any conditional package activation
- catalog-strict enforcement
- dependency automation beyond the current governance model

Those remain governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `DEPENDENCY.md`
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `docs/AGENTS.md`
- `ARCHITECTURE.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- the human vs machine authority split proves insufficient
- exact-version duplication reappears as a recurring repo failure
- CI drift checks are not enough to contain dependency divergence
- a future package-management decision changes workspace or lockfile strategy
- pnpm catalog usage becomes important enough to require stricter enforcement
- later locked topics materially change how dependency governance must work