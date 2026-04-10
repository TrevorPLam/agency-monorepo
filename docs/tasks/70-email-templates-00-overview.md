# Email Templates


## Purpose
React Email templates and reusable layout components. Transactional receipts, password resets, notification digests, welcome emails.


## Condition Block

- **Build when:** The first transactional email flow exists (invites, resets, notifications, invoices, receipts, welcome sequences).
- **Do not build when:** Email needs are hypothetical or can be deferred.
- **Minimum consumer rule:** One real email flow is enough to start, but the abstraction matters more once multiple apps may send mail.
- **Exit criteria:**
  - [ ] At least one real template rendering correctly
  - [ ] Preview/dev server working for template development
  - [ ] Layout components reusable across multiple templates
  - [ ] README with template creation guide
  - [ ] Changeset documenting initial release
