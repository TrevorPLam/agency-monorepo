# e8-apps-studio: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | First approved Sanity-backed client site |
| **Minimum Consumers** | One approved Sanity-backed site, one editorial workflow, and one real preview or visual-editing need |
| **Dependencies** | `51-data-cms`, `e10-apps-client-sites-foundation`, `e3-apps-agency-website` if applicable, `a5-docs-tenant-isolation-data-governance`, `d2-infra-environment-mgmt` |
| **Exit Criteria** | Studio architecture, content ownership, preview rules, and environment boundaries are explicit |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Decision status: `DECISION-STATUS.md` — Studio activation remains conditional on a real Sanity-backed site
- Data lane: `51-data-cms`
- Client-site family: `e10-apps-client-sites-foundation`
- Environment management: `d2-infra-environment-mgmt`

## Default architecture decision

Default to a separately deployed Studio when the first real Studio is activated.

Allow an embedded `/studio` route inside a Next.js app only when all of the following are true:

- The editorial workflow is limited in scope
- One app owns the content surface cleanly
- Deployment and permission boundaries stay simple
- Embedding improves operator experience more than it harms separation

## Relationship to `@agency/data-cms`

- Shared schemas and shared content-model logic belong in `51-data-cms`.
- Presentation logic belongs in the consuming site app.
- Studio should consume shared schemas rather than becoming their hidden owner.

## Editorial and preview rules

- Draft mode, visual editing, and preview flows must be documented before activation.
- Client and environment boundaries must be explicit.
- Token usage and secret handling must stay environment-scoped and least-privilege.

## Explicit prohibitions

Do not:

- Assume every client site uses Sanity
- Treat Studio as launch-default repo infrastructure
- Hide content model ownership inside app-only code
- Blend schema code and presentation code casually