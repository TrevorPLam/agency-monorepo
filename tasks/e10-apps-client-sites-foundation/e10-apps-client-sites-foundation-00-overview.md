# e10-apps-client-sites-foundation: Client Sites Family

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | First approved client-site build that is distinct from the agency website |
| **Minimum Consumers** | One approved client-site build with a realistic expectation of repetition across clients |
| **Dependencies** | `e3-apps-agency-website`, `40-seo`, `41-compliance`, `80-analytics`, `82-lead-capture`, `f1-packages-content-blocks`, `f2-packages-i18n`, `f3-apps-client-sites-brand-foundation`, `c5-infra-preview-deploy`, `a5-docs-tenant-isolation-data-governance` |
| **Exit Criteria** | The client-sites family has one canonical topology, one naming model, and one app-local versus shared rule set |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only until the family is explicitly approved |
| **Version Authority** | `docs/DEPENDENCY.md` when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/ARCHITECTURE.md`
- `docs/REPO-STATE.md`
- `docs/DECISION-STATUS.md`
- `docs/AGENTS.md`
- Related tasks: `e3-apps-agency-website`, `e4-apps-client-portal`, `f3-apps-client-sites-brand-foundation`

## Purpose

This task family owns the `apps/client-sites/` planning lane.

It exists so the repository can describe how repeatable client-facing apps behave as a governed family without prematurely creating a shared framework package.

## Owns

- The canonical `apps/client-sites/` family model
- The difference between client landing pages, client websites, and client portals
- Per-client naming and folder conventions
- App-local versus shared extraction rules for client-owned surfaces
- Preview and deployment expectations per client

## Excludes

- The agency website app itself
- Shared multi-tenant portal products
- Generic client-site starter framework packages
- CMS, i18n, experimentation, or lead-enrichment defaults for every client site