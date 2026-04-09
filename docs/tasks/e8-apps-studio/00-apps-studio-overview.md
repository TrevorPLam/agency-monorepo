# e8-apps-studio: Sanity Studio Planning Lane

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | First approved Sanity-backed client site |
| **Minimum Consumers** | One approved Sanity-backed site, one editorial workflow, and one real preview or visual-editing need |
| **Dependencies** | `51-data-cms`, `e10-apps-client-sites-foundation`, `e3-apps-agency-website` if applicable, `a5-docs-tenant-isolation-data-governance`, `d2-infra-environment-mgmt` |
| **Exit Criteria** | The Studio lane has explicit embedded-versus-separate criteria, content-ownership rules, and environment guidance |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only until Studio activation is approved |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/ARCHITECTURE.md`
- `docs/REPO-STATE.md`
- `docs/DECISION-STATUS.md`
- Related tasks: `51-data-cms`, `e10-apps-client-sites-foundation`, `d2-infra-environment-mgmt`

## Purpose

This task family defines when Sanity Studio exists in the repository and what form it should take.

It exists so a future Studio does not appear as silent infrastructure the first time a Sanity-backed site is approved.

## Owns

- The Studio app decision
- Embedded-versus-separate Studio guidance
- Editorial workflow boundaries
- The relationship between Studio and `@agency/data-cms`
- Client and environment separation rules for content editing

## Excludes

- Making Sanity the default for every client site
- Burying schema ownership inside site apps
- Treating Studio as global repo infrastructure before a CMS trigger exists