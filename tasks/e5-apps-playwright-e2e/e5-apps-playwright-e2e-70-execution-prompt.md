# e5-apps-playwright-e2e: Handoff Prompt

Use this prompt only for bounded E2E planning or implementation work that already has human approval.

## Read first

1. `docs/tasks/e5-apps-playwright-e2e/00-apps-playwright-e2e-overview.md`
2. `docs/tasks/e5-apps-playwright-e2e/01-apps-playwright-e2e-spec.md`
3. `docs/tasks/90-test-setup/`
4. `docs/tasks/91-test-fixtures/`
5. `docs/REPO-STATE.md`

## Prompt

Plan or implement the Playwright lane for one approved app without turning it into a generic shared testing framework.

Requirements:

- Keep browser-level tests in the dedicated E2E workspace lane.
- Start with the highest-value journeys.
- Use Chromium as the required PR lane unless broader coverage is explicitly justified.
- Keep secrets, accounts, and environments isolated for testing.