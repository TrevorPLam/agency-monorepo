# 82-lead-capture: Overview

## Purpose

Define the deferred shared lead-capture lane for forms and lead-handling workflows that outgrow app-local implementations.

## Condition Block

- **Build when:** A real marketing or client surface needs reusable lead-capture behavior beyond one-off app-local forms.
- **Do not build when:** A single app can keep its form handling, consent flow, and notifications local.
- **Minimum consumer rule:** Extract only after a reusable lead workflow is proven.
- **Exit criteria:**
	- [ ] Shared lead-capture surface is justified by a real consumer
	- [ ] Consent and privacy boundaries are documented
	- [ ] Tenant-sensitive lead data handling is explicit
	- [ ] Related analytics and notification boundaries are documented

## Dependencies

- `32-ui-design-system` for reusable form primitives when extraction is justified
- `41-compliance` for consent and privacy handling
- `50-data-db` for lead storage only when shared persistence is proven
- `72-notifications` and `80-analytics` only when those integrations are actually required
