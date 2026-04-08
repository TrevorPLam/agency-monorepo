# ADR 001: Monorepo Tooling (pnpm + Turborepo)

## Status

Accepted

## Date

2026-04-08

## Context

We needed to choose a monorepo tooling foundation that balances:

- fast local development,
- reliable dependency management,
- efficient CI execution,
- a clean path from launch-stage simplicity to stricter governance later.

This repository is intended to support multiple applications, shared packages, tools, and documentation in one codebase.
That means the package manager and task runner are not implementation details.
They define how dependencies are installed, how workspaces are linked, how tasks are cached, and how safely the repository can scale.

The launch-stage repository needs to stay simple enough for a solo founder using AI coding tools, while still being structured correctly for future growth.
The tooling therefore needs to support:

- strict workspace discipline,
- affected-only task execution,
- remote caching in CI,
- compatibility with the planned domain-grouped package structure,
- a future migration path to stronger graph enforcement if scale demands it.

## Decision

Use **pnpm workspaces** as the repository package manager and **Turborepo** as the task orchestrator.

Adopt these rules as part of the decision:

- Internal packages use the `workspace:*` protocol.
- The root `package.json` pins pnpm via the `packageManager` field.
- `turbo.json` must use the `tasks` key, not the legacy `pipeline` key.
- Turborepo remote caching is enabled from the beginning in CI.
- The repository is structured so a future migration to Nx can happen without restructuring the package layout.

### Rationale

#### pnpm over npm or Yarn

pnpm was chosen because:

- it uses a content-addressable store, which reduces disk duplication across workspaces,
- it enforces stricter dependency resolution and reduces phantom dependency problems,
- it has strong native support for monorepo workspace linking,
- it fits the package discipline required by this repository.

#### Turborepo over Nx at launch

Turborepo was chosen for the launch and early growth stages because:

- it has lower setup and operational overhead,
- it integrates naturally with a Next.js and Vercel-oriented stack,
- it provides fast affected-only task execution,
- it supports remote caching immediately,
- it is sufficient for the expected early repository size.

#### Planned migration path

Nx is not the launch default.
It is the planned escalation path once the repository reaches a scale where stricter graph tooling and boundary enforcement justify the added complexity.

The intended migration trigger is:

- roughly 30 or more apps, or
- multiple active development teams, or
- recurring package-boundary violations that code review and ESLint can no longer control adequately.

## Consequences

### Positive

- Fast installs and better disk efficiency across many workspaces.
- Better protection against undeclared dependency usage.
- Faster CI through affected-only execution and remote cache reuse.
- Lower launch complexity than adopting Nx immediately.
- Good alignment with the current Next.js and Vercel deployment model.
- A future Nx migration remains possible without reorganizing the repository.

### Negative

- Turborepo does not provide the same level of built-in module-boundary governance as Nx.
- The repository must rely on ESLint rules, CODEOWNERS review, and documentation discipline to enforce boundaries during early stages.
- AI agents may still generate invalid `turbo.json` configs using `pipeline` unless the rule is documented and checked explicitly.
- The scaling path is clear, but the migration still represents future work.

### Neutral

- CI, onboarding, and agent rules must all reflect the exact same pnpm and Turborepo decisions.
- Version pins for Node, pnpm, and Turbo must stay synchronized across `.nvmrc`, root `package.json`, CI workflows, and `DEPENDENCY.md`.
- Future generators and templates must scaffold `turbo.json` with `tasks`, not `pipeline`.

## Alternatives Considered

### Alternative: Nx from day one

Why it was considered:

- stronger built-in module boundary enforcement,
- richer project graph tooling,
- better governance at larger scale.

Why it was rejected for launch:

- higher configuration and learning overhead,
- unnecessary complexity for the initial repository size,
- stricter governance is valuable later, but premature on day one,
- the repository structure can be made Nx-compatible now without paying the full complexity cost yet.

### Alternative: npm workspaces

Why it was considered:

- simpler and familiar,
- built into npm.

Why it was rejected:

- less strict dependency behavior,
- weaker protection against phantom dependencies,
- less efficient workspace installation model for a growing monorepo.

### Alternative: Yarn workspaces

Why it was considered:

- mature workspace support,
- common monorepo choice historically.

Why it was rejected:

- pnpm offers stricter dependency discipline for this repository model,
- pnpm’s install model is a better fit for shared-package-heavy growth,
- the repo documentation already standardizes on pnpm.

### Alternative: Rush

Why it was considered:

- strong monorepo governance,
- enterprise credibility.

Why it was rejected:

- more opinionated than needed at launch,
- less aligned with the intended Next.js / Vercel / solo-founder workflow,
- unnecessary operational weight for the initial stage.

## References

- `ARCHITECTURE.md`
- `DEPENDENCY.md`
- `TASKS.md`
- `docs/architecture/ADRs/README.md`
- `docs/architecture/ADRs/000-template.md`