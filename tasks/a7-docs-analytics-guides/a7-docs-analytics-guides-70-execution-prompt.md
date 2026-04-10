# a7-docs-analytics-guides: Handoff Prompt

Use this prompt only for bounded analytics documentation work that already has human approval.

## Read first

1. `docs/tasks/a7-docs-analytics-guides/00-docs-analytics-guides-overview.md`
2. `docs/tasks/a7-docs-analytics-guides/01-docs-analytics-guides-spec.md`
3. `docs/analytics/README.md`
4. `docs/DECISION-STATUS.md`
5. The related analytics or experimentation task family

## Prompt

Update repository-level analytics documentation without expanding analytics scope beyond what the planning docs authorize.

Requirements:

- Keep Plausible focused on public-site analytics.
- Keep PostHog focused on authenticated product analytics, feature flags, and experiments.
- Do not turn documentation work into implementation planning for attribution, consent bridging, or RUM unless those tasks are explicitly in scope.
- Keep event naming deterministic and ownership explicit.