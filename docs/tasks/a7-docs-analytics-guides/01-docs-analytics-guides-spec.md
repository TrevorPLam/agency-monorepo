# a7-docs-analytics-guides: Specification

## Task Header

| Field | Value |
|---|---|
| **State** | `approved` — documentation work is authorized now |
| **Trigger** | Immediate, while `docs/analytics/` remains part of the target architecture |
| **Minimum Consumers** | Repository-wide analytics users |
| **Dependencies** | `80-analytics`, `80a-analytics-attribution`, `80b-analytics-consent-bridge`, `81-experimentation`, `81a-experimentation-edge`, `42-monitoring`, `42a-monitoring-rum`, `e2-apps-analytics`, `a4-docs-marketing-standards` |
| **Exit Criteria** | `docs/analytics/` is clearly separated from package specs and includes event-governance rules and provider boundaries |
| **Implementation Authority** | `docs/REPO-STATE.md` — documentation-only authority |
| **Version Authority** | `docs/DEPENDENCY.md` |
| **Supersedes** | n/a |
| **Superseded by** | n/a |

## Cross-references

- Owned directory: `docs/analytics/`
- Related packages: `80-analytics`, `80a-analytics-attribution`, `80b-analytics-consent-bridge`, `81-experimentation`, `42-monitoring`
- Marketing standards: `a4-docs-marketing-standards`

## Canonical outputs

This task family governs:

- `docs/analytics/README.md`
- Future event-taxonomy and dashboard guides stored under `docs/analytics/`

## Required guidance areas

The owned docs must define:

- What belongs in analytics docs versus package task families
- Plausible versus PostHog usage boundaries
- Event naming rules
- Custom-property rules
- Dashboard naming conventions
- Environment naming conventions
- Ownership and approval expectations for analytics schema changes

## Default provider boundary

- Plausible is the public-site, privacy-friendly default.
- PostHog is the authenticated product and experimentation default.
- Attribution, consent bridging, RUM, and experimentation docs remain opt-in planning lanes until their triggers are met.

## Explicit prohibitions

Do not allow this task family to become:

- A duplicate of `80-analytics` package specs
- A launch-default mandate for every analytics subdomain
- A justification for broad provider abstraction before real consumers exist

## Approval model

Analytics-event governance should identify:

- Who proposes a new event schema
- Who approves shared event naming changes
- Which surfaces are public-site only versus authenticated-product only