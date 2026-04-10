# e4-apps-client-portal: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | First real client requiring a logged-in experience |
| **Minimum Consumers** | One real client portal requirement, one authenticated journey, and one real tenant-scoped data need |
| **Dependencies** | `50-data-db`, `61-auth-portal`, `32-ui-design-system`, `30-ui-theme`, `31-ui-icons`, `72-notifications`, `80-analytics`, `a5-docs-tenant-isolation-data-governance` |
| **Exit Criteria** | The portal lane has a canonical path, auth model, tenant model, and scope boundary |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — client-portal activation remains conditional behind launch-slice sequencing
- Family owner: `e10-apps-client-sites-foundation`
- Auth lane: `61-auth-portal`
- Data lane: `50-data-db`
- Tenant standard: `docs/standards/tenant-isolation-data-governance.md`

## Canonical topology

The default location for a client-owned portal is:

```text
apps/client-sites/[client]-portal/
```

Reserve `apps/client-portal/` for a future shared multi-tenant portal platform only if a later decision explicitly approves it.

## What a portal is in this repo

A client portal is a tenant-scoped authenticated client experience that:

- Belongs to one client surface first
- Uses `61-auth-portal` as the default auth lane
- Reads and writes tenant-scoped data
- May later adopt shared UI or notification packages only when reuse is real

## Phase-1 scope boundaries

Portal planning must define:

- Auth boundary and session model
- Tenant boundary and role expectations
- Route shape and app-local ownership
- Notification and analytics boundaries
- Deployment and environment expectations

Portal planning must not assume:

- Provider parity across auth systems
- A dedicated API app already exists
- A worker or queue layer already exists
- Shared portal business logic that has not earned extraction

## Tenant and session model

- One portal instance maps to one client-owned surface.
- Session context must resolve cleanly to one tenant boundary.
- Cross-client impersonation or support access requires explicit later governance and audit rules.

## App-local versus shared rules

Keep logic app-local when it is tied to one client workflow, one tenant model variation, or one route structure.

Use shared packages only when the logic is already generic and fits an existing package domain.

## Analytics and notification rules

- Use product-style analytics only where the portal has real authenticated behavior to measure.
- Public marketing analytics patterns do not belong inside portal planning by default.
- Shared notifications remain conditional until two or more workflows genuinely share them.