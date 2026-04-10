# a5-docs-tenant-isolation-data-governance: Guide

## When to use this task family

Use this family whenever you are:

- Defining a tenant-sensitive package or app task
- Updating the tenant-isolation standard
- Reviewing data, auth, analytics, monitoring, or export behavior for client separation

## Authoring workflow

1. Read `docs/standards/tenant-isolation-data-governance.md`.
2. Identify whether the surface is client-owned or truly shared.
3. Document the required tenant identifier and where it is enforced.
4. Call out any admin or reporting exceptions explicitly.
5. Link the downstream task back to this family instead of restating the model from scratch.

## Escalation workflow

If row-level isolation appears insufficient:

1. State why the default model fails.
2. Describe the stronger model being proposed.
3. Update `docs/DECISION-STATUS.md` or add an ADR before implementation work starts.
4. Update downstream task docs so the exception is visible.

## Review questions

- Is the data client-owned?
- Is tenant scope explicit in the modeled interface?
- Is an exception being requested, or is the default model still appropriate?
- Could logging, analytics, or seeds accidentally bypass the tenant boundary?