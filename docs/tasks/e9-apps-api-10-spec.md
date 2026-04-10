# e9-apps-api: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | Route handlers and app-local backend-for-frontend patterns no longer fit the use case cleanly |
| **Minimum Consumers** | One real external or shared API need, or one runtime or security requirement that route handlers cannot satisfy well |
| **Dependencies** | `50-data-db`, `52-data-api-client`, `60-auth-internal`, `61-auth-portal`, `c12-infra-rate-limiting`, `d2-infra-environment-mgmt`, `a5-docs-tenant-isolation-data-governance` |
| **Exit Criteria** | Extraction threshold, API scope, auth model, and deployment expectations are explicit |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — a dedicated API app remains conditional behind route-handler-first policy
- Next.js backend-for-frontend guidance in `docs/ARCHITECTURE.md`
- Related tasks: `50-data-db`, `52-data-api-client`, `60-auth-internal`, `61-auth-portal`, `c12-infra-rate-limiting`

## Default rule

Use route handlers and app-local backend-for-frontend patterns first.

A dedicated API app may be proposed only when at least one of the following becomes true:

- Two or more distinct consumers need the same API surface
- A public or external API surface must be exposed and versioned intentionally
- Runtime, deployment, or long-running-work requirements exceed route-handler constraints
- Shared non-UI backend behavior can no longer stay app-local cleanly

## Scope rules

- Internal APIs and public APIs must be documented separately.
- Public APIs require explicit versioning expectations.
- Data access remains governed by shared data packages, not ad hoc direct provider usage.

## Auth and rate limiting

- Auth expectations must be explicit for every consumer class.
- Public endpoints must define rate-limiting posture before activation.
- Tenant-sensitive APIs must still follow `a5-docs-tenant-isolation-data-governance`.

## Deployment expectations

- A dedicated API app must justify its runtime and hosting needs.
- Do not assume a separate service only because the repo uses a monorepo.

## Explicit prohibitions

Do not:

- Create an API app “just in case”
- Duplicate route-handler logic into a second runtime prematurely
- Assume a shared API client package already exists
- Broaden package boundaries just to justify the app