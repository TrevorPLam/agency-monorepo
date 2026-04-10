# a5-docs-tenant-isolation-data-governance: Tenant Isolation and Data Governance

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate control-plane work |
| **Minimum Consumers** | Repository-wide |
| **Dependencies** | `50-data-db`, `60-auth-internal`, `61-auth-portal`, `80-analytics`, `42-monitoring`, `42a-monitoring-rum`, `82-lead-capture`, `d1-infra-db-migrations`, `d2-infra-environment-mgmt` |
| **Exit Criteria** | The tenant-isolation standard, task-family docs, and downstream cross-links all agree on one default isolation model |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority; no package or schema implementation is implied |
| **Version Authority** | Repository governance only |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/standards/tenant-isolation-data-governance.md`
- `docs/REPO-STATE.md`
- `docs/DECISION-STATUS.md`
- `docs/DEPENDENCY.md`
- `docs/ARCHITECTURE.md`
- `docs/AGENTS.md`

## Purpose

This task family makes tenant isolation a governed planning surface instead of an implied rule scattered across data, auth, analytics, and monitoring tasks.

It owns the default isolation model, the escalation path to stronger isolation, and the anti-pattern list that future implementation work must treat as structural failures.

## Owns

- The tenant boundary policy used across the repository
- The default `clientId` row-scoping model
- The criteria for escalating to schema-per-client isolation
- Unsafe implementation patterns for AI agents and humans
- The linkage between the standard and downstream task families

## Excludes

- Database schema implementation
- Auth middleware implementation
- Analytics or logging implementation details
- Migration execution

Those belong to the relevant package or infra task families once implementation authority exists.

## Deliverables

- This 7-file task family
- The owned standard at `docs/standards/tenant-isolation-data-governance.md`
- Downstream task references that point back to one tenant-isolation source of truth