# Data Api Client


## Purpose
Typed fetch wrappers and API client helpers for internal service-to-service calls. Only warranted once two or more apps genuinely call the same internal API.


## Condition Block

- **Build when:** Two or more apps genuinely call the same internal API and would otherwise duplicate typed fetch logic.
- **Do not build when:** One app talking to its own local route handlers.
- **Minimum consumer rule:** Two consumers required — this package exists to eliminate duplication.
- **Exit criteria:**
  - [ ] Shared typed fetch wrappers reduce real duplication
  - [ ] Used by at least two internal apps
  - [ ] Error handling and interceptor patterns documented
  - [ ] README with usage examples
  - [ ] Changeset documenting initial release
