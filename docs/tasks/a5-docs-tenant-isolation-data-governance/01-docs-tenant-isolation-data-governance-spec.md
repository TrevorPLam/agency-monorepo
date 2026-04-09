# a5-docs-tenant-isolation-data-governance: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate control-plane work |
| **Minimum Consumers** | Repository-wide |
| **Dependencies** | `50-data-db`, `60-auth-internal`, `61-auth-portal`, `80-analytics`, `42-monitoring`, `42a-monitoring-rum`, `82-lead-capture`, `d1-infra-db-migrations`, `d2-infra-environment-mgmt` |
| **Exit Criteria** | Every tenant-sensitive planning task can point to one default model, one escalation path, and one anti-pattern list |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority; tenant-sensitive code remains gated |
| **Version Authority** | Repository governance only |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Standard: `docs/standards/tenant-isolation-data-governance.md`
- State: `docs/REPO-STATE.md`
- Decisions: `docs/DECISION-STATUS.md`
- Architecture: `docs/ARCHITECTURE.md`
- Related tasks: `50-data-db`, `60-auth-internal`, `61-auth-portal`, `80-analytics`, `42-monitoring`, `d1-infra-db-migrations`, `d2-infra-environment-mgmt`

## Canonical outputs

This task family governs:

- `docs/standards/tenant-isolation-data-governance.md`
- Tenant-isolation references inside future package and app task families
- Repository-wide wording for the default isolation model and escalation path

## Required policy decisions

### Default isolation model

- Row-level `clientId` scoping is the default repository model.
- Client-owned data surfaces must require explicit client scope.
- Query helpers must make it structurally difficult to omit tenant predicates.

### Escalation model

- Schema-per-client isolation is an escalation path, not the default.
- Escalation requires a documented reason such as contractual isolation, regulatory pressure, or an operational model that row-level isolation cannot satisfy safely.
- Escalation must be reflected in `docs/DECISION-STATUS.md` or an ADR before implementation approval.

### Required coverage areas

The owned standard must cover all of the following:

- Query guard requirements
- Migration and seeding isolation rules
- Auth-to-tenant mapping rules
- Audit and logging isolation rules
- Analytics and monitoring isolation rules
- Admin bypass rules and audit expectations
- Export/import boundaries
- Unsafe AI implementation patterns

## Downstream task expectations

Any task family that touches tenant-sensitive work must link back here instead of redefining the tenant model locally.

The following planning tasks must treat this task family as authoritative:

- `50-data-db`
- `60-auth-internal`
- `61-auth-portal`
- `80-analytics`
- `42-monitoring`
- `42a-monitoring-rum`
- `82-lead-capture`
- `e4-apps-client-portal`
- `e8-apps-studio`
- `e9-apps-api`

## Explicit anti-patterns

The standard must explicitly forbid:

- Queries over client-owned data without a tenant predicate
- Shared admin bypass helpers without audit controls
- Seed or migration scripts that merge client-owned datasets casually
- Logs that include cross-client sensitive payloads
- Analytics events or dashboards that collapse client data without an approved reason
- Sessions or auth flows that leave tenant identity ambiguous

## Out of scope

- Choosing a concrete database isolation implementation now
- Adding auth claims or middleware now
- Building enforcement tooling now

This task creates the planning contract, not the implementation.