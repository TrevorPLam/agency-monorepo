# ADR: Client-Owned Portals Live Inside the Client Sites Family

## Status

Accepted for planning.

## Context

The architecture named both `apps/client-sites/[client]-portal/` and `apps/client-portal/`, but without a governing family owner those paths could drift into competing defaults.

## Decision

Make `apps/client-sites/[client]-portal/` the canonical default path for client-owned portals.

Reserve `apps/client-portal/` for a future shared multi-tenant portal product only if later evidence justifies it.

## Consequences

### Positive

- The client-sites family now has one clear topology.
- Client-facing surfaces stay grouped by client ownership.
- Portal behavior can be governed separately by `e4` without creating a path conflict.

### Negative

- A future shared portal platform will require an explicit decision rather than fitting the default path automatically.

## Alternatives considered

### Use `apps/client-portal/` as the default now

Rejected because it implies a shared product before the repository has evidence that one exists.