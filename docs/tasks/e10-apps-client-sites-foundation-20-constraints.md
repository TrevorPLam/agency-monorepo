# e10-apps-client-sites-foundation: Constraints

## Hard constraints

- Keep client-owned surfaces under `apps/client-sites/` unless a later decision explicitly approves a different model.
- Do not treat a single client implementation as proof that a new shared package is justified.
- Do not blur portal, landing, and website responsibilities.
- Do not assume per-client customization can grow without architectural review.

## Documentation constraints

- Use one naming scheme consistently: `[client]-landing`, `[client]-website`, `[client]-portal`.
- Keep the portal-topology decision aligned with `e4-apps-client-portal`.
- Make app-local versus shared rules explicit in any downstream client-site task.