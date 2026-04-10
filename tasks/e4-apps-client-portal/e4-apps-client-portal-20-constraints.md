# e4-apps-client-portal: Constraints

## Hard constraints

- Do not weaken tenant isolation to make portal sharing easier.
- Do not assume `apps/client-portal/` is the default location.
- Do not invent a shared portal platform without evidence of multi-client product reuse.
- Do not move client-specific workflows into shared packages prematurely.
- Do not assume a dedicated API app is required for the first portal.

## Documentation constraints

- Keep portal behavior aligned with `e10-apps-client-sites-foundation`.
- Keep auth and tenant language aligned with `61-auth-portal` and `a5-docs-tenant-isolation-data-governance`.
- Keep the portal scope narrower than “any authenticated app.”