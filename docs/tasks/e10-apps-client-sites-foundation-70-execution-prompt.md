# e10-apps-client-sites-foundation: Handoff Prompt

Use this prompt only for bounded client-site planning or implementation work that already has human approval.

## Read first

1. `docs/tasks/e10-apps-client-sites-foundation-00-overview.md`
2. `docs/tasks/e10-apps-client-sites-foundation-10-spec.md`
3. `docs/tasks/e4-apps-client-portal-00-overview.md` if the surface is authenticated
4. `docs/REPO-STATE.md`

## Prompt

Plan or implement one client-owned surface under the `apps/client-sites/` family without widening scope into a generic framework.

Requirements:

- Use `[client]-landing`, `[client]-website`, or `[client]-portal` naming.
- Keep client-specific code app-local unless two or more real consumers justify extraction.
- Treat `apps/client-sites/[client]-portal/` as the default portal location.
- Do not activate CMS, i18n, experimentation, or brand-foundation lanes unless their triggers are satisfied.

