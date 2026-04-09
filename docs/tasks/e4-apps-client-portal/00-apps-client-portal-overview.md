# e4-apps-client-portal: Client Portal Planning Lane

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | First real client requiring a logged-in experience |
| **Minimum Consumers** | One real client portal requirement, one authenticated journey, and one real tenant-scoped data need |
| **Dependencies** | `50-data-db`, `61-auth-portal`, `32-ui-design-system`, `30-ui-theme`, `31-ui-icons`, `72-notifications`, `80-analytics`, `a5-docs-tenant-isolation-data-governance` |
| **Exit Criteria** | Portal behavior, topology, auth/data boundaries, and app-local versus shared rules are explicit |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only until a portal is explicitly approved |
| **Version Authority** | `docs/DEPENDENCY.md` when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/ARCHITECTURE.md`
- `docs/REPO-STATE.md`
- `docs/DECISION-STATUS.md`
- `docs/standards/tenant-isolation-data-governance.md`
- Related tasks: `e10-apps-client-sites-foundation`, `61-auth-portal`, `50-data-db`

## Purpose

This task family defines what a client portal is in this repository and what it is not.

It exists so portal planning stops being implied by auth, data, and UI tasks without a governing app-lane owner.

## Owns

- The client-portal app pattern
- Portal-specific auth, tenant, and data-boundary rules
- Portal route and session expectations
- Portal analytics and notification boundaries
- The default portal topology decision in coordination with `e10`

## Excludes

- A shared multi-tenant portal platform
- A generalized auth abstraction across unrelated portal types
- Assumptions that a dedicated API app or worker layer already exists
- Moving client-specific business logic into shared packages prematurely