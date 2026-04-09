# ADR: Minimal Analytics First

## Status

Accepted for planning.

## Context

The target architecture includes multiple analytics-adjacent packages, but the repository is still in planning mode.

Without an explicit documentation owner, analytics guidance can quickly become either provider-specific noise or a premature abstraction manifesto.

## Decision

Document a minimal-analytics-first model.

- Plausible is the default lane for public-site and privacy-friendly analytics.
- PostHog is the default lane for authenticated product analytics, feature flags, and experimentation.
- Advanced analytics subdomains stay conditional until their triggers are met.

## Consequences

### Positive

- Public and authenticated surfaces stay clearly separated.
- Event-governance docs have a clear owner.
- The repository avoids overbuilding analytics policy before real consumers exist.

### Negative

- Some future multi-provider analytics work will need an explicit update rather than fitting automatically.

## Alternatives considered

### One unified analytics story for every surface

Rejected because it hides real differences between public-site analytics and product analytics.