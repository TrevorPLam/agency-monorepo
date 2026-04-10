# e9-apps-api: Dedicated API App Lane

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | Route handlers and app-local backend-for-frontend patterns no longer fit the use case cleanly |
| **Minimum Consumers** | One real external or shared API need, or one runtime or security requirement that route handlers cannot satisfy well |
| **Dependencies** | `50-data-db`, `52-data-api-client`, `60-auth-internal`, `61-auth-portal`, `c12-infra-rate-limiting`, `d2-infra-environment-mgmt`, `a5-docs-tenant-isolation-data-governance` |
| **Exit Criteria** | The repo has an explicit extraction threshold for a dedicated API app, plus scope, auth, rate-limit, and deployment rules |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only until API extraction is explicitly approved |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/ARCHITECTURE.md`
- `docs/REPO-STATE.md`
- `docs/DECISION-STATUS.md`
- Related tasks: `50-data-db`, `52-data-api-client`, `60-auth-internal`, `61-auth-portal`, `c12-infra-rate-limiting`

## Purpose

This task family defines when a dedicated API app is allowed to exist.

It exists so the repository does not create an API service “just in case” when Next.js route handlers and backend-for-frontend patterns remain sufficient.

## Owns

- The extraction threshold for a dedicated API app
- Internal versus public API scope rules
- API auth, rate-limit, and deployment expectations
- The relationship between route handlers and a later extracted API surface

## Excludes

- Premature API extraction
- A speculative shared API SDK before real consumers exist
- Duplicating route-handler logic into a second service without need