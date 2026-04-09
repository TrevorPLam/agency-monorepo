# a5-docs-tenant-isolation-data-governance: Handoff Prompt

Use this prompt only for bounded tenant-isolation documentation or implementation work that already has human approval.

## Read first

1. `docs/tasks/a5-docs-tenant-isolation-data-governance/00-docs-tenant-isolation-data-governance-overview.md`
2. `docs/tasks/a5-docs-tenant-isolation-data-governance/01-docs-tenant-isolation-data-governance-spec.md`
3. `docs/standards/tenant-isolation-data-governance.md`
4. `docs/REPO-STATE.md`
5. The relevant downstream task family

## Prompt

Implement or update tenant-sensitive planning work without changing the default isolation model.

Requirements:

- Treat row-level `clientId` scoping as the default.
- Do not make tenant scope optional for client-owned data.
- Do not create undocumented admin bypasses.
- If the requested change needs schema-per-client or another stronger model, stop and document the escalation instead of improvising.
- Keep all edits scoped to the task family or standard explicitly in scope.