# 82-lead-capture: Implementation Specification

## Task Header

| Field | Value |
|-------|-------|
| **State** | `deferred` — Reserved for future implementation |
| **Trigger** | App requires lead capture and form handling |
| **Minimum Consumers** | 1+ apps with lead generation needs |
| **Dependencies** | React 19.2.5, `@agency/data-db`, `@agency/ui-design-system` |
| **Exit Criteria** | Lead capture package exported and used |
| **Implementation Authority** | `REPO-STATE.md` — Deferred until business need confirmed |
| **Version Authority** | `DEPENDENCY.md` §2 — React 19.2.5 |
| **Superseded by** | n/a |

**Cross-references:**
- Decision status: `DECISION-STATUS.md` — Lead capture `deferred`
- Version pins: `DEPENDENCY.md` §2
- Tenant isolation: `docs/standards/tenant-isolation-data-governance.md`
- Dependency-truth policy: `docs/standards/dependency-truth.md`
- Note: Deferred; keep one-off forms app-local until a shared lead workflow is proven

## Status

Reserved for future implementation

This phase is reserved for lead capture and form-handling infrastructure that justifies a shared package instead of app-local form code.

## Planned Contents

- `@agency/lead-capture` package
- Form components and validation
- CRM integration helpers
- Consent-safe submission and storage helpers


## When to Implement

Add this package when:
- Marketing site needs contact forms
- Lead qualification workflow needed
- Integration with external CRM required
- Tenant-safe lead storage and consent handling must stay consistent across more than one surface


## Related Tasks

- `41-compliance`
- `50-data-db`
- `72-notifications`
- `80-analytics`
- `82a-lead-forms-progressive`
- `82b-lead-enrichment`
