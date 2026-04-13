```md id="p7v3nk"
# ADR-017 — Email and notifications architecture

## Status
Locked

---

## 1) Context

The repository needs a default policy for transactional email, template ownership, delivery-provider boundaries, and future notifications scope.

This is no longer a viability question.

Current ecosystem guidance confirms that React Email is a viable React-based template authoring approach, and Resend is a viable default sending lane aligned with Next.js and React Email workflows. The repository therefore does not need to answer “can we send email this way?” first. It needs to answer:

- what the default rendering lane is,
- what the default delivery lane is,
- when email should remain app-local,
- when shared email packages are justified,
- and when broader notifications infrastructure becomes a separate concern.

This ADR must also remain consistent with the repository’s already-locked posture:

- app-local-first extraction
- website-first launch slice
- Route Handlers first
- no early `apps/api`
- target-state architecture is not implementation approval
- shared packages require real reuse, low distortion, and explicit approval
- `@agency/email-templates`, `@agency/email-service`, and `@agency/notifications` are not Milestone 1 packages

---

## 2) Decision

### Default rendering lane
React Email is the default lane for email template authoring and rendering.

### Default delivery lane
Resend is the default lane for transactional email delivery.

### Important scope clarification
This topic governs **transactional/app email first**, not broad marketing/broadcast tooling.

Marketing or campaign-oriented broadcast tooling must not be silently folded into transactional email package decisions.

### Default implementation posture
The first real transactional email flow stays app-local by default.

That includes, when needed:

- local React Email templates
- local render helpers
- local provider wiring
- local send helpers
- local Route Handler integration
- local webhook/event handling
- local validation/mapping logic
- app-specific workflow orchestration

### Shared package posture
`@agency/email-templates` is conditional.  
`@agency/email-service` is conditional.

They must not activate from target-state package presence alone.

They may activate only when all are true:

1. there is a real transactional email consumer,
2. extraction passes the normal shared-package acceptance rules,
3. the package API stays low-distortion,
4. the package scope remains clearly separated,
5. the package is explicitly approved in `REPO-STATE.md`.

### Notifications posture
`@agency/notifications` is deferred and trigger-based.

It must not be created for:

- email-only sending
- one app sending transactional emails
- simple provider-wrapper convenience
- theoretical future multi-channel expansion

It may only be considered when there is a real need for one or more of:

- multi-channel delivery
- shared user notification preferences
- cross-app notification orchestration
- digest / fan-out behavior
- shared event-to-channel routing

### Provider escalation posture
Postmark-like lanes are escalation-only.

They may be considered later when there is a real operational need for stronger stream separation, deliverability controls, or reporting boundaries beyond the default Resend lane.

---

## 3) What is approved

The following are approved as the default email posture:

- React Email as the default rendering lane
- Resend as the default transactional delivery lane
- app-local transactional email implementation for the first real consumer
- Route Handlers / approved server-only app code as the first sending surface
- app-local webhook/event handling when needed
- app-local template ownership until shared-package triggers are met

---

## 4) What is conditional

The following remain conditional:

- `@agency/email-templates`
- `@agency/email-service`
- shared template primitives with real reuse
- shared render helpers with real reuse
- shared provider send helpers with real reuse
- normalized delivery-event helpers with real reuse

### Conditional package rule

#### `@agency/email-templates`
If activated later, this package must remain rendering-oriented.

It may contain:

- reusable React Email templates
- shared email layout primitives
- render helpers
- preview/test helpers

It must not contain:

- provider send logic
- app-specific workflow orchestration
- notification routing logic
- campaign-specific logic unique to one app

#### `@agency/email-service`
If activated later, this package must remain transport-oriented.

It may contain:

- provider send adapters
- send validation helpers
- webhook verification/handling helpers
- delivery-event normalization helpers

It must not contain:

- branded template ownership unique to one app
- multi-channel orchestration
- business workflow logic that belongs in apps
- campaign-management logic

---

## 5) What is deferred

The following remain deferred:

- `@agency/notifications`
- multi-channel notification architecture
- shared notification preferences center
- queue / digest / fan-out infrastructure
- provider-neutral runtime abstraction
- deliverability escalation as a default lane
- broad marketing/broadcast tooling as part of this topic

---

## 6) What is rejected

The following are rejected:

- activating shared email packages in Milestone 1 by default
- creating `@agency/notifications` for email-only workflows
- extracting one app’s workflow emails into shared code for convenience
- building a broad abstraction because provider changes are theoretically possible
- collapsing template rendering, provider transport, and notifications into one vague package boundary
- silently treating marketing/broadcast tooling as part of transactional email architecture

---

## 7) Boundary rules for future activation

If `@agency/email-templates`, `@agency/email-service`, or `@agency/notifications` activate later, they must remain clearly separated.

### Separation rule
Keep these concerns distinct:

- template rendering
- provider transport
- business workflow orchestration
- broader notifications routing/preferences
- marketing/broadcast tooling

### Distortion test
If a proposed shared email package requires:

- app-specific workflow branches
- branded forks unique to one app
- provider-specific behavior leaking into consumer APIs
- notification-routing logic unrelated to email transport
- campaign-management concerns mixed with transactional app email

…then the logic should remain app-local or belong in a different later-stage package decision.

---

## 8) Consequences

### Positive consequences
- preserves app-local-first extraction
- keeps Milestone 1 lean
- gives a clear default lane without forcing early package creation
- keeps Route Handlers first
- avoids turning email needs into premature platform buildout
- preserves clean boundaries between email delivery and broader notifications concerns

### Tradeoffs
- the first real transactional email flow may duplicate some local setup
- template reuse may remain local longer than a platform-minded team would prefer
- later extraction requires deliberate review rather than automatic promotion into shared packages

These tradeoffs are acceptable because the repository optimizes for right-sized architecture and AI-safe implementation, not premature platform abstraction.

---

## 9) Implementation interpretation

This ADR locks the **policy**, not automatic implementation approval.

It does **not** authorize:

- building `@agency/email-templates` now
- building `@agency/email-service` now
- building `@agency/notifications` now
- installing email dependencies by default
- creating a provider-neutral notification system early
- folding marketing/broadcast tooling into transactional email boundaries

Exact dependency approval still belongs in `DEPENDENCY.md`, and implementation approval still belongs in `REPO-STATE.md`.

---

## 10) Final normalized rule

Use React Email as the default rendering lane and Resend as the default transactional delivery lane.

Until shared-package triggers are explicitly met:

- keep templates app-local,
- keep provider wiring app-local,
- keep workflow-specific email logic app-local,
- keep transactional email distinct from broader notifications,
- keep marketing/broadcast tooling outside this boundary,
- and do not activate shared email or notifications packages by inference.
```
