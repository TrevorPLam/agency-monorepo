# e5-apps-playwright-e2e: Constraints

## Hard constraints

- Keep Playwright separate from shared testing utilities.
- Keep browser journeys focused on high-value user flows.
- Do not assume every app needs E2E on day one.
- Do not normalize flaky tests with broad retries or weak assertions.

## Documentation constraints

- Document the browser matrix explicitly.
- Keep environment and secret rules visible.
- Keep CI policy aligned with the actual reliability needs of the first adopters.