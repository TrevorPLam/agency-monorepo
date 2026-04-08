# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for the Agency Monorepo.

## What is an ADR?

An Architecture Decision Record captures:

- an important architectural decision,
- the context in which it was made,
- the consequences of that decision,
- the alternatives that were considered.

ADRs exist so future contributors can answer:
- Why was this built this way?
- What tradeoff was accepted?
- What would break if we changed it?

## Status values

Use one of the following statuses in every ADR:

- Proposed
- Accepted
- Deprecated
- Superseded by ADR-XXX

## ADR index

| ADR | Title | Status | Date |
|---|---|---|---|
| 000 | Template | Active reference | 2026-04-08 |
| 001 | Monorepo Tooling (pnpm + Turborepo) | Accepted | 2026-04-08 |
| 002 | Domain-Grouped Package Structure | Accepted | 2026-04-08 |
| 003 | Database and ORM Selection | Accepted | 2026-04-08 |
| 004 | Dual-Lane Authentication Architecture | Accepted | 2026-04-08 |

## Current accepted decisions

### ADR 001 — Monorepo Tooling

Repository tooling is standardized on:

- pnpm workspaces,
- Turborepo,
- a planned migration path to Nx when scale requires stricter graph governance.

Read this ADR before changing:

- `packageManager`,
- `pnpm-workspace.yaml`,
- `turbo.json`,
- CI workflow task execution.

### ADR 002 — Domain-Grouped Package Structure

Shared packages are grouped by domain, not by generic technical role.

Read this ADR before:

- creating a new package,
- moving a package between directories,
- introducing a new top-level package domain,
- creating a generic `utils`, `services`, or `components` catch-all package.

### ADR 003 — Database and ORM Selection

Operational data is standardized on:

- Neon PostgreSQL,
- Drizzle ORM,
- Better Auth for client portals,
- strict client-scoping rules in query design.

Read this ADR before changing:

- database provider,
- ORM choice,
- portal auth architecture,
- client data isolation patterns,
- migration workflow.

## When to write an ADR

Write an ADR when:

- choosing between significantly different technical approaches,
- making a decision that will be hard to reverse,
- establishing a pattern others must follow,
- answering a “why is it built this way?” question.

Do not write an ADR for:

- bug fixes,
- minor implementation details,
- standard patterns already documented elsewhere.

## Creating a new ADR

1. Copy `000-template.md` to `NNN-short-title.md`.
2. Fill in all sections.
3. Update the ADR index in this README.
4. Submit the ADR in the same PR as the architectural change when possible.

## Naming rules

- Use zero-padded numeric prefixes: `001-`, `002-`, `003-`
- Use lowercase kebab-case filenames
- Keep titles short and specific
- One ADR per decision

## Review rules

An ADR is required before:

- changing the default monorepo tooling,
- changing package structure conventions,
- changing the default database or ORM,
- changing authentication strategy for a package lane,
- introducing a new repo-wide architectural pattern.

High-risk areas should assume ADR review is mandatory:

- `packages/config`
- `packages/data/database`
- `packages/auth`
- root CI and workspace files

## Relationship to other docs

- `ARCHITECTURE.md` explains the current overall system.
- `DEPENDENCY.md` is the source of truth for pinned versions and upgrade policy.
- `AGENTS.md` defines hard operating rules for AI coding agents.
- Package guides explain how to use packages.
- ADRs explain why foundational decisions were made.

## Maintenance

When an ADR is replaced:

- do not delete the old ADR,
- mark it as `Superseded by ADR-XXX`,
- update this README index,
- link the new ADR from the old one.

When an ADR is no longer recommended but still historically important:

- mark it as `Deprecated`,
- explain what changed,
- keep it in the directory for historical traceability.