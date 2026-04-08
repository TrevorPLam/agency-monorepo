# Analytics Consent Bridge


## Purpose
Unified consent state management that routes user privacy preferences to all analytics providers (Plausible, PostHog, GTM, etc.). Ensures consistent consent enforcement across multiple tracking surfaces without code duplication in each app.


## Condition Block

- **Build when:** Multiple analytics providers need unified consent state OR privacy requirements span GTM + PostHog + Plausible simultaneously.
- **Do not build when:** Single analytics provider with built-in consent OR client apps handle consent independently.
- **Minimum consumer rule:** Two analytics providers requiring synchronized consent.
- **Exit criteria:**
  - [ ] Consent state schema defined (necessary, analytics, marketing)
  - [ ] Provider-specific consent mappers implemented
  - [ ] Google Consent Mode v2 integration
  - [ ] PostHog opt-out integration
  - [ ] Plausible exclusion integration
  - [ ] Consent change event propagation
  - [ ] Used by at least one client site with 2+ analytics providers
  - [ ] README with consent flow diagrams
  - [ ] Changeset documenting initial release


## Dependencies

- `41-compliance` (GDPR/CCPA consent foundation)
- `80-analytics` (Analytics provider abstraction)
