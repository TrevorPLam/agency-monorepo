# Analytics Documentation

## Purpose

This directory owns repository-level analytics guidance that sits above package specs and below architecture decisions.

It exists to keep event taxonomy, provider boundaries, dashboard naming, and environment conventions in one place.

## Ownership

- Task family: `docs/tasks/a7-docs-analytics-guides-00-overview.md`
- Related packages: `80-analytics`, `80a-analytics-attribution`, `80b-analytics-consent-bridge`, `81-experimentation`, `81a-experimentation-edge`, `42-monitoring`, `42a-monitoring-rum`

## Scope

This directory should contain:

- Event taxonomy guidance
- Event naming rules
- Custom-property rules
- Dashboard naming and ownership rules
- Environment conventions
- Provider boundary guidance

## Provider boundaries

- Use Plausible for public-site and privacy-friendly marketing analytics.
- Use PostHog for authenticated product analytics, feature flags, and experiments.
- Do not assume attribution, consent-bridge, experimentation, or RUM documentation is launch-default for every surface.

## Minimal analytics first

Start with the smallest analytics surface that answers the business question.

Do not let analytics docs turn into a mandate for multi-provider abstraction or enterprise-scale event governance before real consumers exist.

## Change process

When adding or changing analytics guidance:

1. Read `docs/tasks/a7-docs-analytics-guides-00-overview.md` first.
2. Confirm the provider boundary still matches `docs/DECISION-STATUS.md` and `docs/ARCHITECTURE.md`.
3. Update the relevant package task family if the change affects implementation planning.

