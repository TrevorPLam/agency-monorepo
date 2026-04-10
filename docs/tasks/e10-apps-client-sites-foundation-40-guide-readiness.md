# e10-apps-client-sites-foundation: Guide

## When to use this task family

Use this family when a new client-facing surface is being planned and you need to decide:

- Whether it belongs under `apps/client-sites/`
- Whether it is a landing page, website, or portal
- Whether anything should stay app-local or move to a shared package

## Readiness workflow

1. Confirm the work is client-owned, not agency-owned.
2. Classify the surface as landing page, website, or portal.
3. Check whether portal behavior also needs `e4-apps-client-portal`.
4. Decide which concerns stay app-local.
5. Activate conditional shared-package lanes only if their triggers are actually met.

## Review questions

- Is this surface repeatable enough to belong to the client-sites family?
- Is it public, authenticated, or campaign-specific?
- Are any proposed shared packages truly shared now, or only hypothetical?
- Does the preview/deployment model stay client-scoped?