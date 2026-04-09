# f3-apps-client-sites-brand-foundation: Client Brand Foundation

## Task Header

| Field | Value |
|---|---|
| **State** | `conditional` — planning-approved, not implementation-approved by default |
| **Trigger** | One client has multiple real surfaces that genuinely share non-trivial brand tokens or reusable brand-specific UI overrides |
| **Minimum Consumers** | One client with at least two real surfaces sharing the same brand system |
| **Dependencies** | `30-ui-theme`, `32-ui-design-system`, `e10-apps-client-sites-foundation`, `f1-packages-content-blocks`, `f2-packages-i18n` when relevant |
| **Exit Criteria** | The repo has a clear threshold for when brand logic stays app-local and when a client-scoped brand package becomes justified |
| **Implementation Authority** | `docs/REPO-STATE.md` — planning only until a brand package is explicitly approved |
| **Version Authority** | `docs/DEPENDENCY.md` when implementation becomes approved |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/ARCHITECTURE.md`
- `docs/REPO-STATE.md`
- Related tasks: `30-ui-theme`, `32-ui-design-system`, `e10-apps-client-sites-foundation`

## Purpose

This task family defines when a client-specific brand-foundation package is justified.

It exists to prevent the repo from drifting into either per-app ad hoc theming or premature shared-package extraction.

## Owns

- The extraction threshold for client brand packages
- Allowed versus forbidden contents
- Naming and ownership conventions for client-scoped brand packages
- The line between app-local theming and shared brand foundations

## Excludes

- Generic multi-client branding packages
- Content or business logic living inside a brand package
- Brand-package creation before two real client surfaces exist