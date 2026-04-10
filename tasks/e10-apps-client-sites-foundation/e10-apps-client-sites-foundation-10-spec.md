# e10-apps-client-sites-foundation: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | First approved client-site build that is distinct from the agency website |
| **Minimum Consumers** | One approved client-site build with realistic repeatability |
| **Dependencies** | `e3-apps-agency-website`, `40-seo`, `41-compliance`, `80-analytics`, `82-lead-capture`, `f1-packages-content-blocks`, `f2-packages-i18n`, `f3-apps-client-sites-brand-foundation`, `c5-infra-preview-deploy`, `a5-docs-tenant-isolation-data-governance` |
| **Exit Criteria** | The family topology, naming rules, ownership rules, and portal interaction are explicit |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only |
| **Version Authority** | `docs/DEPENDENCY.md` when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Related task families: `e3-apps-agency-website`, `e4-apps-client-portal`, `f1-packages-content-blocks`, `f2-packages-i18n`, `f3-apps-client-sites-brand-foundation`
- Control docs: `docs/REPO-STATE.md`, `docs/DECISION-STATUS.md`, `docs/ARCHITECTURE.md`

## Canonical topology

Use this as the default planning topology for repeatable client-owned surfaces:

```text
apps/
  client-sites/
    [client]-landing/
    [client]-website/
    [client]-portal/
```

### Meaning of each surface

- `[client]-landing/` is a narrower conversion surface or campaign-oriented property.
- `[client]-website/` is the primary public website for the client.
- `[client]-portal/` is the default location for a client-owned authenticated experience when that experience belongs to one client.

## Portal topology resolution

The canonical default for client-owned portals is `apps/client-sites/[client]-portal/`.

Reserve `apps/client-portal/` for a future shared multi-tenant portal product only if a later decision proves that a single reusable portal platform is warranted.

## App-local versus shared rules

Keep code app-local when it is:

- Client-branded only
- Route-specific
- Tied to one content model or one campaign
- Needed by only one client surface

Extract into shared packages only when:

- Two or more consumers need the same behavior now
- The behavior fits an existing package domain cleanly
- The shared API can stay generic

## Relationship to other conditional lanes

- `f1-packages-content-blocks` remains conditional and should not be assumed for every site.
- `f2-packages-i18n` remains conditional and should not be assumed for every site.
- `f3-apps-client-sites-brand-foundation` governs when a client-specific brand package becomes justified.
- `e4-apps-client-portal` owns portal behavior, auth, and tenant-boundary rules.

## Preview and deployment model

- Treat each client site as its own deployment concern.
- Preview environments should remain client-scoped.
- Do not assume every client site shares the same CMS, auth, analytics, or experimentation posture.

## Explicit prohibitions

Do not:

- Create a generic client-site starter framework package from this task
- Treat the agency website and client-sites as interchangeable
- Extract shared packages for one client only
- Default every client site to CMS, i18n, experimentation, or lead enrichment