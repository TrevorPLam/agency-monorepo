# Test Fixtures


## Purpose
Shared mock factories and seed builders for test suites. Generates test data matching Zod schemas from `@agency/core-types`.


## Condition Block

- **Build when:** Multiple test suites need the same domain factories (clients, projects, users, invoices) and duplication is observed.
- **Do not build when:** Test data needs are simple or unique to each test suite.
- **Minimum consumer rule:** Two or more test suites required — this package exists to eliminate duplicated mock factories.
- **Exit criteria:**
  - [ ] Factory functions for core domain entities (client, project, user, invoice)
  - [ ] Used by at least two test suites
  - [ ] Type-safe generation matching Zod schemas
  - [ ] README with factory usage examples
  - [ ] Changeset documenting initial release
