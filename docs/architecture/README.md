# Architecture Documentation

## Purpose

This directory contains the architecture-level decision records, standards, and rationale for the agency monorepo.

Use this area to document decisions that are:
- cross-cutting,
- hard to reverse,
- likely to be questioned later,
- important enough that AI agents and future contributors must understand the "why," not just the "what."

This directory is not a replacement for:
- `ARCHITECTURE.md` — the broad system blueprint,
- `DEPENDENCY.md` — pinned versions and upgrade policy,
- `docs/AGENTS.md` — behavioral rules for AI agents,
- `docs/tasks/` — the flat task corpus for implementation sequencing and execution details.

## What belongs here

Architecture docs belong here when they answer questions like:

- Why was this tool chosen over another?
- Why is this package boundary enforced?
- Why is this package conditional instead of launch-day?
- Why is this provider the default lane?
- Why is this decision expensive to reverse?
- What alternative was considered and rejected?

Good architecture topics include:
- monorepo tooling
- package topology
- dependency boundaries
- public API and exports discipline
- database and tenant isolation
- auth lane separation
- analytics architecture
- release and versioning strategy
- CI governance and boundary enforcement
- scalability migration paths such as Turborepo to Nx

## What does not belong here

Do not put these here:

- package usage guides; those belong in `docs/package-guides/`
- step-by-step setup instructions; those belong in `docs/onboarding/`
- implementation task breakdowns; those belong in the relevant flat task files under `docs/tasks/`
- pinned versions; those belong in `DEPENDENCY.md`
- temporary working notes for a single feature PR
- low-impact coding conventions that are already obvious from linting or package docs

## Document types

This directory supports two layers:

1. **Architecture index documents**
   - high-level navigation
   - decision status overview
   - rationale maps
   - links to related records

2. **ADRs**
   - focused records for one important decision each
   - immutable historical context once accepted
   - concise explanation of context, decision, consequences, and alternatives

## Recommended structure

Use this structure:

```text
docs/
  architecture/
    01-config-biome-migration-50-ref-quickstart.md
    ADRs/
      01-config-biome-migration-50-ref-quickstart.md
      000-template.md
      001-monorepo-tooling.md
      002-domain-grouped-package-structure.md
      003-database-and-orm-selection.md
```

If the directory name is currently `ADRs/`, keep it consistent everywhere rather than mixing `ADR`, `ADRs`, and ad hoc filenames.

## Source of truth hierarchy

Use the following order when documents appear to overlap:

1. `docs/AGENTS.md` for agent behavior constraints
2. `DEPENDENCY.md` for versions, upgrade rules, and provider lanes
3. Accepted ADRs for durable architectural decisions
4. `docs/DECISION-STATUS.md` for in-flight decision status
5. `ARCHITECTURE.md` for the broad system model and intended shape
6. The relevant task files under `docs/tasks/` for implementation sequence and execution planning

If two docs conflict, do not guess.
Open the conflict explicitly and update the docs.

## When to write an ADR

Write an ADR when a decision is:

- difficult to reverse later
- likely to affect multiple packages or apps
- likely to be misunderstood by AI agents
- likely to be revisited in six months with "why did we do this?"
- a permanent constraint on repository growth

Typical ADR-worthy decisions in this repo include:
- pnpm + Turborepo as the launch monorepo toolchain
- domain-grouped package structure
- strict dependency direction rules
- explicit `exports` as package contract
- Next.js App Router only
- Drizzle + Neon for operational data
- `clientId` row-level scoping as the default tenant isolation model
- Better Auth for portals and Clerk for internal tools
- Changesets as required shared-package versioning workflow
- conditional-package discipline instead of speculative package creation

## When not to write an ADR

Do not write an ADR for:

- bug fixes
- small refactors
- package-internal naming choices
- obvious framework defaults
- one-off implementation details
- temporary experiments that are not yet approved as repository policy

Use `docs/DECISION-STATUS.md` first when a decision is still moving.

## ADR workflow

Use this sequence:

1. Capture the issue in `docs/DECISION-STATUS.md` as `open` or `leaning`
2. Discuss and validate the decision
3. Mark it `locked`
4. Create or update the ADR if the decision is durable or high-blast-radius
5. Link the ADR from this directory index and any related package guide
6. Update `ARCHITECTURE.md` only if the broad blueprint needs to change

This keeps planning, approval, and permanent record separate.

## Naming rules

Use zero-padded numbers and kebab-case:

- `000-template.md`
- `001-monorepo-tooling.md`
- `002-domain-grouped-package-structure.md`
- `003-database-and-orm-selection.md`

Rules:
- one ADR per file
- one decision per ADR
- stable filenames after merge
- do not rename accepted ADRs unless the numbering scheme itself was wrong before adoption

## ADR template requirements

Every ADR should include these sections:

- Title
- Status
- Date
- Context
- Decision
- Consequences
- Alternatives considered
- References

Status values should be limited to:
- Proposed
- Accepted
- Deprecated
- Superseded by ADR-XXX

## Writing standard

Keep ADRs short and durable.

Each ADR should:
- state the problem clearly
- document the actual decision, not a vague preference
- explain the cost of reversal
- record tradeoffs honestly
- name the rejected alternatives
- avoid tutorial-style content
- avoid long implementation walkthroughs

Aim for 300 to 900 words per ADR unless the decision is unusually complex.

## Required initial ADR set

Create these first:

- `001-monorepo-tooling.md`
- `002-domain-grouped-package-structure.md`
- `003-database-and-orm-selection.md`

These are already among the most foundational and most likely to be "helpfully" rewritten by AI tools if not anchored.

## Review expectations

Architectural docs need higher review discipline than feature docs.

Changes here should be reviewed when they affect:
- dependency boundaries
- package topology
- database isolation
- auth flows
- CI governance
- versioning policy
- package creation rules
- scaling strategy

If an ADR changes a live rule, update:
- `ARCHITECTURE.md`
- `docs/DECISION-STATUS.md`
- `docs/AGENTS.md`
- any affected package guide
- any affected onboarding document

## Relationship to package guides

Architecture docs explain why a pattern exists.

Package guides explain how to use a specific package correctly.

Example:
- ADR: why `agencyui-design-system` must stay generic
- Package guide: how to consume `agencyui-design-system` exports correctly

Do not duplicate package usage examples inside ADRs unless the example is necessary to explain the architectural tradeoff.

## Relationship to tasks

The flat task files under `docs/tasks/` are allowed to reference ADR work, but task docs should not become the permanent explanation layer.

Use this split:
- task docs = build sequence and implementation output
- architecture docs = durable reasoning and policy
- decision status = current state of unresolved choices

## Maintenance rules

Update this directory when:
- a new architectural decision becomes durable
- an accepted ADR is deprecated
- an ADR is superseded
- the directory structure changes
- a new core governance document is introduced

Do not leave orphaned ADRs.
Every ADR must be reachable from:
- this file, or
- `docs/architecture/ADRs/01-config-biome-migration-50-ref-quickstart.md`

## Cross-links

This directory should link to:

- `../../ARCHITECTURE.md`
- `../../DEPENDENCY.md`
- `../AGENTS.md`
- `../DECISION-STATUS.md`
- `../package-guides/01-config-biome-migration-50-ref-quickstart.md`
- `../onboarding/`
- `./ADRs/01-config-biome-migration-50-ref-quickstart.md`

## Initial checklist

- [ ] Create `docs/architecture/01-config-biome-migration-50-ref-quickstart.md`
- [ ] Create `docs/architecture/ADRs/01-config-biome-migration-50-ref-quickstart.md`
- [ ] Create `docs/architecture/ADRs/000-template.md`
- [ ] Create ADR 001
- [ ] Create ADR 002
- [ ] Create ADR 003
- [ ] Link this directory from root `01-config-biome-migration-50-ref-quickstart.md`
- [ ] Link this directory from onboarding docs
- [ ] Link accepted ADRs from `ARCHITECTURE.md` where relevant

