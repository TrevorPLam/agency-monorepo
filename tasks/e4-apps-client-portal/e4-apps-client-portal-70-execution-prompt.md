# e4-apps-client-portal: Handoff Prompt

Use this prompt only for bounded client-portal planning or implementation work that already has human approval.

## Read first

1. `docs/tasks/e4-apps-client-portal/00-apps-client-portal-overview.md`
2. `docs/tasks/e4-apps-client-portal/01-apps-client-portal-spec.md`
3. `docs/tasks/e10-apps-client-sites-foundation/01-apps-client-sites-foundation-spec.md`
4. `docs/standards/tenant-isolation-data-governance.md`
5. `docs/REPO-STATE.md`

## Prompt

Plan or implement one client-owned portal without widening scope into a shared portal platform.

Requirements:

- Use `apps/client-sites/[client]-portal/` unless a different path has already been explicitly approved.
- Keep tenant scope explicit in auth and data design.
- Keep client-specific workflows app-local unless reuse is proven.
- Do not assume a dedicated API app or notifications package is required for the first portal.