# ADR: Use a Lightweight Decision Log

## Status

Accepted for planning.

## Context

The repository already has `docs/DECISION-STATUS.md` and an ADR directory, but it lacks a middle layer for decisions that matter enough to preserve but are not yet durable architecture records.

Without that middle layer, important context either disappears or gets pushed prematurely into ADRs.

## Decision

Use `docs/decisions/` as a lightweight decision-log layer.

- `docs/DECISION-STATUS.md` keeps the status register.
- `docs/decisions/` stores bounded decision notes with context, owner, and review date.
- `docs/architecture/ADRs/` remains the durable architecture record layer.

## Consequences

### Positive

- Non-obvious technical choices gain a stable written home.
- ADRs stay reserved for durable and expensive-to-reverse decisions.
- Task families can reference decision notes without overloading the status register.

### Negative

- Another documentation layer must be maintained carefully to avoid overlap.

## Alternatives considered

### Put everything in ADRs

Rejected because it would make ADRs too noisy and too frequent.

### Keep everything only in `docs/DECISION-STATUS.md`

Rejected because status labels do not preserve enough explanatory context.