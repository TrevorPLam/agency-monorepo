# Analytics


## Purpose

Shared analytics utilities and tracking components for all agency applications. Provides privacy-compliant tracking helpers, multi-platform event management, and attribution utilities that work with Plausible, PostHog, and Google Analytics 4.


## Condition Block

- **Build when:** Multiple apps need analytics with provider abstraction (Plausible/PostHog/GA4) and privacy-compliant tracking.
- **Do not build when:** Analytics needs are simple or limited to a single provider in one app.
- **Minimum consumer rule:** Two consumers required — this package exists to unify analytics across surfaces.
- **Exit criteria:**
  - [ ] Provider abstraction (Plausible/PostHog/GA4) functional
  - [ ] Privacy-compliant tracking integration with consent package
  - [ ] Used by at least two apps
  - [ ] README with analytics implementation guide
  - [ ] Changeset documenting initial release


## Dependencies

- TASK_2 (Core Types) - for event type definitions
- TASK_3 (Core Utils) - for attribution helpers
- TASK_46 (Consent Package) - for privacy compliance integration


## Consumer Apps

- `apps/agency-website` - Marketing analytics (Plausible + PostHog)
- `apps/client-sites/*` - Client site tracking
- `apps/internal-tools/crm` - Product analytics (PostHog)


## Success Criteria

- Events track to all configured providers
- UTM attribution data captured on landing
- Consent check blocks tracking when denied
- No PII sent without personalData consent
- Page views auto-track on navigation
- Debug mode logs events to console
- Server-side rendering safe (no window errors)
