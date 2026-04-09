# a7-docs-analytics-guides: Analytics Documentation Ownership

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate, while `docs/analytics/` remains part of the target architecture |
| **Minimum Consumers** | Repository-wide analytics users |
| **Dependencies** | `80-analytics`, `80a-analytics-attribution`, `80b-analytics-consent-bridge`, `81-experimentation`, `81a-experimentation-edge`, `42-monitoring`, `42a-monitoring-rum`, `e2-apps-analytics`, `a4-docs-marketing-standards` |
| **Exit Criteria** | `docs/analytics/` has an explicit owner, provider-boundary guidance, event-governance rules, and a minimal-analytics-first stance |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority |
| **Version Authority** | `docs/DEPENDENCY.md` for provider and package versions |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- `docs/analytics/README.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISION-STATUS.md`
- `docs/REPO-STATE.md`
- `docs/AGENTS.md`

## Purpose

This task family creates the missing planning owner for `docs/analytics/`.

It defines what belongs in analytics guides, how those guides relate to package specs, and how the repo keeps analytics governance lean instead of turning it into a premature platform.

## Owns

- Repository-level analytics documentation structure
- Event naming and taxonomy rules
- Provider-boundary guidance
- Dashboard and environment naming rules
- Ownership and approval expectations for analytics definitions

## Excludes

- Package implementation specs for `80-analytics`
- Attribution, consent-bridge, or experimentation implementation work
- App-specific instrumentation tickets