# Test Setup


## Purpose
Shared Vitest, Testing Library, and Playwright configuration for the monorepo. **Note:** This package centralizes test configuration; CI test capability exists independently from the foundation phase.


## Condition Block

- **Build when:** Repeated test configuration appears across multiple packages and apps, justifying centralization.
- **Do not build when:** Each package/app has unique test needs or only one consumer exists.
- **Minimum consumer rule:** Two or more consumers required — this package exists to eliminate duplicated test setup.
- **Exit criteria:**
  - [ ] Base Vitest config used by at least two packages or apps
  - [ ] React-specific config variant available
  - [ ] Playwright base config functional
  - [ ] Test utilities (render helpers, mocks) shared
  - [ ] README with configuration extension guide
  - [ ] Changeset documenting initial release
