# Lead Forms Progressive


## Purpose
Multi-step form orchestration with progressive profiling for lead capture. Converts long forms into digestible steps, reducing abandonment while collecting enriched data through follow-up micro-forms and behavioral inference.


## Condition Block

- **Build when:** Lead forms exceed 4 fields OR conversion drop-off >40% OR progressive profiling strategy required.
- **Do not build when:** Simple 1-2 field forms OR existing form solution meets conversion goals.
- **Minimum consumer rule:** One client site with form conversion optimization needs.
- **Exit criteria:**
  - [ ] Multi-step form state machine implemented
  - [ ] Step validation and error handling
  - [ ] Progress persistence (localStorage/session)
  - [ ] Step-skipping logic (skip if data known)
  - [ ] Micro-form follow-up workflows
  - [ ] Analytics integration (step drop-off tracking)
  - [ ] CRM webhook integration
  - [ ] Used by at least one client site
  - [ ] README with form builder guide
  - [ ] Changeset documenting initial release


## Dependencies

- `82-lead-capture` - Base lead capture components
- `80-analytics` - Conversion tracking
- `32-ui-design-system` - Form UI components
