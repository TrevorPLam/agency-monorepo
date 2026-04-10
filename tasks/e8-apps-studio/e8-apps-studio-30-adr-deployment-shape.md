# ADR: Separate Studio by Default

## Status

Accepted for planning.

## Context

Sanity supports both a separately deployed Studio and an embedded Studio route in a Next.js app.

The repository needed a default so Studio architecture does not drift app by app.

## Decision

Default to a separately deployed Studio.

Allow an embedded Studio route only when editorial scope, deployment boundaries, and permission complexity all remain small.

## Consequences

### Positive

- Editorial tooling stays easier to separate from delivery apps.
- Multi-client or multi-environment growth has a safer default.
- Embedding remains available as a deliberate exception, not the default.

### Negative

- Simple single-surface setups may need an explicit exception if embedding is the better operator choice.

## Alternatives considered

### Embedded Studio by default

Rejected because it makes deployment and permission boundaries easier to blur as the repo grows.