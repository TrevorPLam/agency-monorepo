# Compliance


## Purpose

Shared GDPR, CCPA, and privacy compliance utilities for all agency applications. Provides consent management components, hooks, privacy preference storage, and region-aware tracking controls that any app can integrate.


## Condition Block

- **Build when:** Legal/privacy behavior must remain consistent across **more than one** public or client-facing surface, or when central governance is itself the requirement.
- **Do not build when:** The need exists in only one app and can be cleanly handled with a local implementation or hardcoded banner.
- **Minimum consumer rule:** Two consumers required — this package exists to eliminate duplication across surfaces, not to serve a single app.
- **Exit criteria:** 
  - [ ] Banner component displays and functions in at least one real consumer app
  - [ ] Consent preferences persist across sessions
  - [ ] Region detection works (EU/UK/CA triggering banner)
  - [ ] Analytics blocking functional based on consent state
  - [ ] README with integration guide complete
  - [ ] Changeset documenting initial release


## Dependencies

- TASK_2 (Core Types) - for consent state types
- TASK_4 (Core Utils) - for storage helpers
- TASK_9 (UI Design System) - for consent banner UI components
- TASK_45 (SEO Package) - for metadata privacy fields (optional)


## Consumer Apps

- `apps/agency-website` - Marketing site consent
- `apps/client-sites/*` - Client portal consent
- `apps/internal-tools/*` - Any tools needing GDPR compliance


## Success Criteria

- Consent banner displays in EU/UK/CA regions
- Consent preferences persist across sessions
- Analytics blocked until consent granted
- No UI code duplication across apps
- Type-safe consent category access
- Accessible banner (WCAG compliant)
- Mobile-responsive consent UI
