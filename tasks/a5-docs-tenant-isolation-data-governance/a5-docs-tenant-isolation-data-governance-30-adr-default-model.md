# ADR: Default Tenant Isolation Model

## Status

Accepted for planning.

## Context

The repository already assumes tenant isolation across data, auth, analytics, and monitoring tasks, but those assumptions were distributed and not governed by one explicit planning owner.

Without a single task family and standard, tenant rules will drift as more task families are added.

## Decision

Use row-level `clientId` scoping as the default repository isolation model.

Treat schema-per-client as an escalation path that requires an explicit decision and downstream documentation updates before any implementation approval.

## Consequences

### Positive

- One consistent tenant model exists across the planning system.
- Data, auth, analytics, and monitoring tasks can reference one source of truth.
- AI agents have an explicit anti-pattern list to avoid structural leakage.

### Negative

- Future stricter-isolation cases still require extra decision work.
- Some internal-tool reporting patterns must be documented carefully to avoid implying casual cross-client access.

## Alternatives considered

### Schema-per-client by default

Rejected as the default because it adds operational complexity before the repository has any approved implementation work.

### Package-local tenant rules only

Rejected because it guarantees drift across data, auth, and analytics planning docs.