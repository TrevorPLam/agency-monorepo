# Analytics


## Purpose

Shared analytics utilities and tracking components for apps that need reusable instrumentation. The package should support one chosen provider lane per app, typically Plausible for marketing surfaces or PostHog for product/internal analytics.


## Condition Block

- **Build when:** An app needs shared analytics helpers beyond app-local instrumentation.
- **Do not build when:** Analytics can stay app-local with a single simple integration.
- **Minimum consumer rule:** Extract only the helper surface that is genuinely reusable; do not create repo-wide provider fan-out by default.
- **Exit criteria:**
  - [ ] One adopted analytics lane functional
  - [ ] Privacy-compliant tracking gated by app-local consent handling or `80b` only if its trigger is met
  - [ ] Used by at least one real consumer
  - [ ] README with analytics implementation guide
  - [ ] Changeset documenting initial release


## Dependencies

- `20-core-types` - for shared event and payload types when extraction is justified
- `21-core-utils` - for reusable tracking helpers when duplication appears
- `41-compliance` - for privacy and consent boundary rules
- `80b-analytics-consent-bridge` only if a shared cross-provider consent-sync need is proven


## Consumer Apps

- `apps/agency-website` - Marketing analytics (typically Plausible)
- `apps/client-sites/*` - Client site tracking when shared helpers emerge
- `apps/internal-tools/crm` - Product analytics (typically PostHog)


## Success Criteria

- Events track to the selected provider lane
- UTM attribution data captured on landing
- Consent check blocks tracking when denied
- No PII sent without personalData consent
- Page views auto-track on navigation
- Debug mode logs events to console
- Server-side rendering safe (no window errors)
