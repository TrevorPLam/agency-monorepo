# ADR 002: Domain-Grouped Package Structure

## Status

Accepted

## Date

2026-04-08

## Context

We needed a package structure that stays understandable as the repository grows from a small launch-stage monorepo into a multi-app agency platform.

A flat package list becomes difficult to reason about once the repository contains many shared libraries.
Likewise, a structure grouped only by technical role, such as `components`, `utils`, or `hooks`, tends to describe implementation style rather than business intent.

This repository needs a package layout that:

- communicates what each package is for,
- makes ownership easier to assign,
- supports a clear dependency flow,
- scales to many packages without becoming visually noisy,
- remains compatible with stronger boundary tooling later.

Because this monorepo is intended for agency work, the structure also needs to make it obvious which code belongs to foundational runtime concerns, UI concerns, marketing concerns, data concerns, auth concerns, and application-specific work.

## Decision

Organize shared packages by **domain**, not by generic technical role.

Use a repository structure where packages live under domain groupings such as:

- `packages/config`
- `packages/core`
- `packages/ui`
- `packages/marketing`
- `packages/data`
- `packages/auth`
- `packages/communication`
- `packages/analytics`
- `packages/experimentation`
- `packages/lead-capture`
- `packages/testing`

Within each domain, create narrowly-scoped packages whose names communicate exact responsibility, for example:

- `agencyconfig-eslint`
- `agencycore-types`
- `agencyui-theme`
- `agencydata-db`
- `agencyauth-portal`

This decision also includes these structural rules:

- Package naming should communicate business purpose, not generic implementation category.
- Shared code should live in a package only when two or more consumers can use it without distortion.
- Packages must follow the repository dependency flow rather than importing freely across domains.
- No package may import from an app.
- The structure should remain compatible with future Nx tag-based boundary enforcement.

## Consequences

### Positive

- Package boundaries communicate intent clearly.
- Ownership becomes easier to assign by business area.
- Dependency flow becomes easier to explain and enforce.
- The repository remains readable as the number of packages grows.
- Future Nx migration is easier because domain structure already aligns with tag-based boundaries.
- Package names become more descriptive and less likely to turn into generic dumping grounds.

### Negative

- Some functionality may appear like it could fit in more than one domain, which creates classification pressure.
- The team must exercise discipline to avoid creating “misc” or catch-all packages.
- Early contributors and AI agents must learn the domain model before placing code.
- A poorly governed domain structure can still decay if boundaries are documented but not enforced.

### Neutral

- ESLint boundary rules, package guides, and AGENTS rules must all reflect the same package taxonomy.
- Some packages will still need careful judgment calls about whether code belongs in `core`, `ui`, `marketing`, or an app.
- As the repository grows, additional domains may be introduced, but only when they represent durable business separation rather than temporary convenience.

## Alternatives Considered

### Alternative: Flat structure with all packages at the root

Why it was considered:

- simple at very small size,
- minimal folder nesting,
- easy to scaffold quickly.

Why it was rejected:

- becomes unwieldy once the package count grows,
- makes ownership and dependency intent less obvious,
- increases the chance of package sprawl,
- provides weak visual structure for a long-lived agency monorepo.

### Alternative: Grouping by technical role

Examples considered:

- `packages/components`
- `packages/utils`
- `packages/hooks`
- `packages/services`

Why it was considered:

- common in many JavaScript repositories,
- easy to understand initially,
- seems straightforward for small teams.

Why it was rejected:

- technical role names do not communicate business purpose,
- encourages broad generic packages that accumulate unrelated responsibilities,
- makes governance harder because “utils” and “services” become dumping grounds,
- maps less cleanly to ownership and future Nx boundaries.

### Alternative: App-first structure with minimal shared packages

Why it was considered:

- avoids premature abstraction,
- can move fast early.

Why it was rejected as the default repository shape:

- the repository is being designed specifically to support reusable agency infrastructure,
- shared packages are a strategic asset in this monorepo,
- pushing most shared logic into apps would make later extraction and standardization harder.

## References

- `ARCHITECTURE.md`
- `DEPENDENCY.md`
- `docs/tasks/README.md`
- `docs/architecture/ADRs/README.md`
- `docs/architecture/ADRs/000-template.md`
- `docs/architecture/ADRs/001-monorepo-tooling.md`