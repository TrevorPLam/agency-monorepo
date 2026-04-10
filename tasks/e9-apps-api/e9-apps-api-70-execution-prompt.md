# e9-apps-api: Handoff Prompt

Use this prompt only for bounded API-lane planning or implementation work that already has human approval.

## Read first

1. `docs/tasks/e9-apps-api/00-apps-api-overview.md`
2. `docs/tasks/e9-apps-api/01-apps-api-spec.md`
3. `docs/tasks/52-data-api-client/`
4. `docs/tasks/c12-infra-rate-limiting/`
5. `docs/REPO-STATE.md`

## Prompt

Evaluate or implement the dedicated API lane only if the documented extraction threshold has been met.

Requirements:

- Keep route handlers as the default when they are still sufficient.
- Separate internal and public API concerns.
- Document auth, rate limiting, and tenant boundaries before implementation.
- Do not create an API app for speculative future reuse.