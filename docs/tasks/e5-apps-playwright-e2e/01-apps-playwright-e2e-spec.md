# e5-apps-playwright-e2e: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | At least one approved app has critical browser workflows that unit and integration tests do not cover safely |
| **Minimum Consumers** | One approved app with at least three critical browser journeys |
| **Dependencies** | `90-test-setup`, `91-test-fixtures`, `25-core-testing`, `c2-infra-ci-workflow`, `c3-infra-ci-workflow-v2`, the first app lanes that need browser coverage |
| **Exit Criteria** | The Playwright lane is clearly separated from Vitest and shared testing packages, with explicit CI, browser, and secret rules |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Related task families: `90-test-setup`, `91-test-fixtures`, `25-core-testing`, `c2-infra-ci-workflow`, `c3-infra-ci-workflow-v2`
- First adopters: `e1-apps-crm`, `e3-apps-agency-website`, `e4-apps-client-portal`, `e6-apps-docs-site`, `e7-apps-email-preview` as applicable

## Ownership model

The default E2E shape is a dedicated root-owned workspace app at:

```text
apps/playwright-e2e/
```

This is a repository lane, not a shared testing package.

## What counts as E2E-worthy

Use Playwright for flows such as:

- Authentication journeys
- Multi-step forms or funnels
- Dashboard workflows across multiple pages
- Preview and publishing workflows
- Critical conversion paths that depend on browser behavior

## Browser matrix

- Local development default: Chromium
- Required PR CI coverage: Chromium
- Expanded smoke coverage for release or scheduled runs: Chromium, Firefox, and WebKit on the highest-value journeys

## CI and flake policy

- Keep retry counts low and explicit.
- Treat persistent flakiness as a defect, not as a normal reason to widen retries.
- Retain traces, screenshots, and video only for failed runs or explicit debug runs.

## Secret and environment policy

- Use environment-isolated test accounts and test data.
- Do not reuse production credentials or shared editor accounts.
- Keep preview, staging, and local targets explicit in the lane documentation.

## Explicit prohibitions

Do not:

- Replace package-level unit or integration tests with E2E
- Turn Playwright into a package-level abstraction layer
- Make visual regression default scope for every app
- Require a dedicated preview environment unless the first adopter actually needs it