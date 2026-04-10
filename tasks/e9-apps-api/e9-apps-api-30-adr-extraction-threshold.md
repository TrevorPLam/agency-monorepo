# ADR: Route Handlers First, Dedicated API Later

## Status

Accepted for planning.

## Context

Next.js route handlers already cover many backend-for-frontend needs, but the architecture also leaves room for a future dedicated API app.

The repository needed an explicit rule so the API lane remains conditional rather than silently becoming default infrastructure.

## Decision

Use route handlers and app-local BFF patterns first.

Only propose a dedicated API app after the extraction threshold in this task family is satisfied.

## Consequences

### Positive

- The repo avoids premature service extraction.
- Client and internal apps can stay simpler longer.
- A future API app, if needed, must be justified clearly.

### Negative

- Some teams may need to revisit route-handler architecture before they get an extracted API lane.

## Alternatives considered

### Create a dedicated API app as standard infrastructure

Rejected because it adds operational and architectural surface area before the repo has approved consumers.