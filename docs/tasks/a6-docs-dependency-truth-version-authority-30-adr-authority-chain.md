# ADR: Dependency Truth Authority Chain

## Status

Accepted for planning.

## Context

The repository already depends heavily on exact version pins and provider lanes, but multiple docs can mention versions or setup commands.

Without a clear authority chain, architecture prose, task prompts, and generator examples will drift.

## Decision

Keep `docs/DEPENDENCY.md` as the operational source of exact pins.

Use the dependency-truth standard and this task family to define how version claims are classified, verified, and corrected.

## Consequences

### Positive

- One operational file owns exact pins.
- Task docs can reference version policy without duplicating the full table.
- AI agents have a clear rule for resolving conflicting dependency claims.

### Negative

- Multiple docs still need maintenance when pins change.
- Research notes cannot be merged casually into task specs without verification.

## Alternatives considered

### Put all version governance only in `docs/DEPENDENCY.md`

Rejected because the repo also needs reusable classification and source-precedence rules.

### Let task specs carry their own local pin tables

Rejected because it creates predictable drift across the planning system.