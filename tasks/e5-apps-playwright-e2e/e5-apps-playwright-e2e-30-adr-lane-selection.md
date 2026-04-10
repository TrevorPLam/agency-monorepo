# ADR: Use a Dedicated Playwright E2E Workspace

## Status

Accepted for planning.

## Context

The repository needed one place for browser-level journeys that is separate from package tests and shared fixtures.

Playwright's browser-context isolation makes it a good fit for reproducible, multi-browser user-flow testing.

## Decision

Use a dedicated root-owned Playwright workspace app when browser-level E2E testing is activated.

Keep it separate from shared package-level testing infrastructure.

## Consequences

### Positive

- Browser flows have one explicit home.
- Shared testing packages stay lightweight.
- Cross-browser coverage can expand without turning every package into an E2E consumer.

### Negative

- The repo will need a separate CI lane once E2E activation is approved.

## Alternatives considered

### Put browser tests inside shared testing packages

Rejected because it blurs the line between reusable test helpers and browser-level application journeys.