# Decision Log

## Purpose

This directory is the lightweight decision-log layer that sits between `docs/DECISION-STATUS.md` and heavyweight ADRs.

Use it for non-trivial repository decisions that need context, owner, date, and follow-up, but do not yet justify a permanent ADR.

## Ownership

- Task family: `docs/tasks/a8-docs-decisions-log-00-overview.md`
- Related directories: `docs/architecture/`, `docs/tasks/`

## What belongs here

- Lightweight decision entries with context, recommendation, and review date
- Temporary but meaningful repository choices that should not live only in chat history
- Decision notes that may later promote to ADRs

## What does not belong here

- The full architecture blueprint
- Exact dependency pins
- Raw brainstorming or unresolved speculation
- Durable ADR content that already belongs under `docs/architecture/ADRs/`

## Relationship to other decision docs

- `docs/DECISION-STATUS.md` tracks repository-wide status labels such as `locked`, `leaning`, `open`, `deferred`, and `rejected`.
- `docs/decisions/` stores the lightweight explanatory record for specific non-obvious choices.
- `docs/architecture/ADRs/` stores durable, harder-to-reverse architecture decisions.

## Entry template

Use this shape for future decision entries:

```md
# Decision: [short title]

## Status
- proposed / accepted / expired / promoted to ADR-xxx

## Date
- YYYY-MM-DD

## Owner
- Team or person responsible

## Context
- Why the decision is being recorded

## Decision
- What was chosen

## Consequences
- What this changes or constrains

## Review date
- When this should be revisited

## Promotion rule
- Promote to ADR if it becomes durable, high-blast-radius, or hard to reverse
```

