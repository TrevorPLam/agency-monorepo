# ADR: Default Client Portal Topology

## Status

Accepted for planning.

## Context

The repository needed one default answer for where client-owned portals live, because both `apps/client-sites/[client]-portal/` and `apps/client-portal/` were present in planning materials.

## Decision

Use `apps/client-sites/[client]-portal/` as the default portal topology.

Reserve `apps/client-portal/` for a future shared multi-tenant portal product only if the repo later proves that such a product exists.

## Consequences

### Positive

- Portal planning stays grouped with other client-owned surfaces.
- The repository avoids implying a shared portal platform too early.
- Tenant and brand boundaries stay easier to reason about.

### Negative

- A later shared portal platform requires an explicit architecture update instead of reusing the default path silently.

## Alternatives considered

### Default to `apps/client-portal/`

Rejected because it assumes shared-product behavior before the repo has any approved portal implementation.