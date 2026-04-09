# ADR: Keep Client Brand Systems Local Until Reuse Is Real

## Status

Accepted for planning.

## Context

Client brand systems often look reusable before they actually are. Extracting them too early creates shallow shared packages that mix tokens, content, and workflow assumptions.

## Decision

Keep brand logic app-local until at least two real client-owned surfaces share the same non-trivial brand system.

Only then may a client-scoped brand-foundation package be proposed.

## Consequences

### Positive

- Shared brand packages are created only when they are justified.
- Client-specific content and business logic stay out of shared UI packages.
- The repo avoids generic “brand foundation” abstractions that are not truly shared.

### Negative

- Teams may duplicate small token sets briefly before the threshold is met.

## Alternatives considered

### Create a brand package for every client site immediately

Rejected because it creates shared-package surface area without real reuse.