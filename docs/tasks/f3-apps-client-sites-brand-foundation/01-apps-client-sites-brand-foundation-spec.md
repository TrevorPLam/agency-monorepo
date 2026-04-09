# f3-apps-client-sites-brand-foundation: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | One client has multiple real surfaces that genuinely share non-trivial brand tokens or reusable brand-specific UI overrides |
| **Minimum Consumers** | One client with at least two real surfaces sharing the same brand system |
| **Dependencies** | `30-ui-theme`, `32-ui-design-system`, `e10-apps-client-sites-foundation`, `f1-packages-content-blocks`, `f2-packages-i18n` when relevant |
| **Exit Criteria** | The extraction threshold, allowed contents, and naming conventions are explicit |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- UI foundation: `30-ui-theme`, `32-ui-design-system`
- Family owner: `e10-apps-client-sites-foundation`

## Extraction threshold

Keep brand logic app-local until at least two real client-owned surfaces share the same non-trivial brand system.

Examples that may justify extraction:

- Website plus landing page
- Website plus portal
- Multi-subsite or multi-brand rollouts under one client program

## Allowed contents

- Design tokens
- Theme variables
- Typography systems
- Spacing scales
- Reused component overrides that remain brand-only

## Forbidden contents

- Content
- Page sections
- Analytics wiring
- SEO configuration
- App business logic
- Tenant logic
- Route-specific code

## Naming convention

When activated, use a client-scoped name such as:

```text
packages/ui/[client]-brand-foundation/
@agency/[client]-brand-foundation
```

Do not create a generic `@agency/brand-foundation` package that implies cross-client reuse.

## Ownership rule

- The package is shared only across one client's surfaces.
- Brand packages do not become a dumping ground for content or workflow logic.

## Explicit prohibitions

Do not:

- Extract a brand package for one surface only
- Put marketing content or layout sections into the brand package
- Use the package as a back door for app business logic