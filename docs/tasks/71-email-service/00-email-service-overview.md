# Email Service


## Purpose
Send-layer abstraction over Resend and Postmark. Apps call `sendEmail()` without knowing which provider handles delivery.


## Condition Block

- **Build when:** Email sending needs exist across multiple apps or provider flexibility is required.
- **Do not build when:** Only one app sends email and provider switching is unlikely.
- **Minimum consumer rule:** One real email flow is enough, but value increases with multiple senders.
- **Exit criteria:**
  - [ ] Send abstraction works with at least one real provider (Resend or Postmark)
  - [ ] Provider selection via environment variable functional
  - [ ] Error handling and retry logic documented
  - [ ] End-to-end send path wired and tested in real app
  - [ ] README with provider configuration guide
  - [ ] Changeset documenting initial release
