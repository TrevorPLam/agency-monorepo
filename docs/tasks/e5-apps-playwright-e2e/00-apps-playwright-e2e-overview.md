# e5-apps-playwright-e2e: Browser-Level E2E Lane

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | At least one approved app has critical browser workflows that unit and integration tests do not cover safely |
| **Minimum Consumers** | One approved app with at least three critical browser journeys |
| **Dependencies** | `90-test-setup`, `91-test-fixtures`, `25-core-testing`, `c2-infra-ci-workflow`, `c3-infra-ci-workflow-v2`, the first app lanes that need browser coverage |
| **Exit Criteria** | The repo has one governed browser-level E2E lane with a clear ownership model, browser matrix, and CI policy |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only until E2E activation is approved |
| **Version Authority** | `docs/DEPENDENCY.md` when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/DECISION-STATUS.md`
- `docs/ARCHITECTURE.md`
- `docs/REPO-STATE.md`
- Related tasks: `90-test-setup`, `91-test-fixtures`, `25-core-testing`, `c2-infra-ci-workflow`, `c3-infra-ci-workflow-v2`

## Purpose

This task family defines the canonical browser-level E2E testing lane for the repository.

It exists so real user journeys have a home that is distinct from shared test utilities and package-level unit or integration tests.

## Owns

- The repository-wide Playwright lane
- Browser-level journey ownership
- Browser matrix and retry policy
- Secrets and environment rules for E2E runs
- CI and artifact expectations

## Excludes

- Package-level unit or component tests
- A shared abstraction that turns Playwright into a generic testing framework package
- Visual-regression-by-default scope