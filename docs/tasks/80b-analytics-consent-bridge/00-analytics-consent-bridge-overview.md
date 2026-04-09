# Analytics Consent Bridge


## Purpose
Deferred shared consent synchronization helpers for cases where adopted analytics providers need the same consent state wiring. Single-provider consent gating should stay in the app or base analytics package until duplication is proven.


## Condition Block

- **Build when:** Two adopted analytics integrations need the same consent synchronization behavior.
- **Do not build when:** Single-provider analytics or app-local consent wiring is sufficient.
- **Minimum consumer rule:** Two consumers sharing one consent-sync contract.
- **Exit criteria:**
  - [ ] Consent state schema defined (necessary, analytics, marketing)
  - [ ] Provider-specific consent mappers implemented
  - [ ] PostHog opt-out integration
  - [ ] Plausible exclusion integration
  - [ ] Consent change event propagation
  - [ ] Used by at least two real consumers or provider lanes
  - [ ] README with consent flow diagrams
  - [ ] Changeset documenting initial release


## Dependencies

- `41-compliance` (GDPR/CCPA consent foundation)
- `80-analytics` (selected analytics lane helpers)
