# ADR-012 — Analytics Architecture for Marketing vs Product Contexts

## Status
Accepted

## Date
2026-04-09

## Decision owners
Repository architecture owner

---

## Context

This repository already has a locked public-site and launch-slice posture:

- Milestone 1 is the agency website
- app-local-first extraction is the default
- shared packages are condition-gated
- `@agency/analytics` is not approved by default in Milestone 1
- the dependency contract already distinguishes marketing analytics from product analytics
- the target architecture already describes Plausible for public marketing sites and PostHog for authenticated product contexts

The Topic 12 problem is therefore not whether analytics tooling is viable.

That is already settled.

The real decision is:

> How should analytics be split between marketing and product contexts, what should stay app-local now, when should `@agency/analytics` exist, and when should attribution or consent-bridge packages be activated?

---

## Decision

The repository adopts a **split analytics policy**.

### Core rule
Marketing analytics and product analytics are separate lanes.

They may live in the same domain later, but they must not be flattened into one fake generic runtime model.

### Milestone 1 rule
If the first validating site needs analytics, keep it app-local.

Do not create `@agency/analytics` in Milestone 1 unless:
1. a second approved app makes the abstraction real
2. the package trigger is satisfied
3. `REPO-STATE.md` explicitly approves it

### Default provider lanes
- **Marketing lane:** Plausible by default
- **Product lane:** PostHog by default

### Shared package rule
If `@agency/analytics` is later activated, it must be a **two-lane analytics domain package** with lane-specific exports, not a one-size-fits-all tracker abstraction.

### Escalation package rule
- `@agency/analytics-attribution` remains deferred until cross-channel attribution is genuinely required
- `@agency/analytics-consent-bridge` remains deferred until 2+ analytics providers need unified consent handling

---

## Why this decision was made

### 1) The repo already recognizes a real split
The target architecture and dependency contract already distinguish:
- Plausible for public marketing surfaces
- PostHog for product contexts and flags

Topic 12 should formalize that split as policy, not erase it.

### 2) Milestone 1 should not activate a shared analytics package early
The launch-slice strategy explicitly allows app-local analytics in the first site to avoid premature package activation.

That means Topic 12 should reinforce:
- app-local first
- package later by trigger
- no shared analytics package just because target architecture shows one

### 3) A generic universal analytics API would be a distortion risk
Marketing analytics and product analytics differ in:
- consent posture
- identity model
- event semantics
- feature-flag coupling
- replay/experimentation needs
- dashboard/reporting expectations

A forced single runtime abstraction would likely hide those differences badly.

### 4) The analytics domain can still become shared later
A shared analytics package can still be justified when real reuse exists.

But the correct later shape is:
- one domain
- lane-specific exports
- narrow shared helpers
- explicit package boundaries

Not:
- one flattened analytics client for every use case

### 5) Attribution and consent orchestration are escalation concerns
Cross-channel attribution and cross-provider consent coordination add real complexity.

They should not be activated until their specific triggers are true.

---

## Approved now

The following are approved as Topic 12 policy:

- app-local analytics in Milestone 1 when needed
- Plausible as the default marketing analytics lane
- PostHog as the default product analytics lane
- a repo-wide event taxonomy standard
- lane-specific thinking even before the shared package exists

---

## Conditional

The following are conditional and require trigger review:

### `@agency/analytics`
Approve only when:
- 2+ approved apps need a shared analytics domain abstraction

### Shared marketing analytics helpers
Approve only when:
- 2+ public-facing apps need the same narrow marketing analytics infrastructure

### Shared product analytics helpers
Approve only when:
- 2+ authenticated product/internal apps need the same product analytics infrastructure

### Shared taxonomy helpers
Approve only when:
- multiple apps need the same event-name constants or event-shape validation in a stable way

### Backup analytics lanes
Cloudflare Web Analytics, Clarity, or similar backup lanes may be used app-locally where justified, but they do not by themselves justify shared extraction.

---

## Deferred

The following are intentionally deferred:

- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- multi-touch attribution models
- cross-provider consent orchestration
- broad marketing-data platform conventions
- product analytics standardization beyond what the first real product apps require

---

## Rejected

The following are explicitly rejected:

- creating `@agency/analytics` in Milestone 1 from target-state package presence alone
- forcing one generic runtime analytics API across Plausible and PostHog
- treating one app plus hypothetical future reuse as enough evidence for package extraction
- activating attribution because “it may be useful later”
- activating consent-bridge before 2+ analytics providers truly need unified consent handling

---

## Provider-lane policy

### Marketing lane
Use this lane for:
- public website traffic
- referrer and UTM attribution
- conversion-oriented events
- simple funnels and goals
- privacy-sensitive public-site reporting

Default provider:
- Plausible

Typical backup lanes:
- Cloudflare Web Analytics
- Clarity

### Product lane
Use this lane for:
- authenticated workflow analytics
- product usage events
- feature flag evaluation
- experiments
- session-level product analysis

Default provider:
- PostHog

---

## Event taxonomy policy

### Naming convention
Use:

`domain.object.action`

Examples:
- `marketing.page.viewed`
- `marketing.cta.clicked`
- `marketing.form.submitted`
- `marketing.asset.downloaded`
- `product.user.signed_in`
- `product.project.created`
- `product.invoice.sent`
- `product.feature.used`

### Marketing event rules
Marketing events should be:
- anonymous-first
- conversion-oriented
- small in number
- tied to real funnel steps

### Product event rules
Product events should be:
- entity/action oriented
- tied to authenticated workflows when applicable
- useful for product questions, not vanity volume
- stable enough to survive UI refactors

### Property rules
Do not:
- put PII in event names
- emit uncontrolled high-cardinality properties casually
- design the taxonomy around hypothetical future BI needs

---

## Shared package shape

If `@agency/analytics` is activated later, it should behave as a domain package with lane-specific exports.

### Allowed direction
Examples of acceptable exports:
- marketing provider/bootstrap helpers
- product provider/bootstrap helpers
- event-name constants
- event payload typing helpers
- minimal shared instrumentation utilities

### Not allowed direction
Do not turn the package into:
- a fake universal tracker that erases provider differences
- a product-analytics platform for every app by default
- a consent engine
- an attribution engine
- a dumping ground for experiments, replay, and feature-flag logic

---

## Package boundaries

### What stays app-local
Keep these app-local by default:
- first-site analytics setup
- route-specific event wiring
- campaign-specific event choices
- app-specific conversion logic
- app-specific backup provider setup

### What may become shared later
Extract only when justified:
- provider bootstrap wrappers
- shared event constants
- event payload typing helpers
- stable analytics initialization patterns
- lane-specific helper utilities

### Separate escalation packages
Keep these separate even later:
- attribution
- consent bridge
- experimentation
- edge experimentation

---

## Consequences

### Positive consequences
- preserves the real split between marketing and product analytics
- prevents premature shared-package activation
- keeps Milestone 1 smaller and safer
- allows later shared extraction without forcing fake uniformity
- reduces consent and attribution overbuild at launch

### Negative consequences
- the first site and first product app may each carry some local setup
- cross-app analytics conventions mature later
- later extraction will require some disciplined consolidation

### Accepted tradeoff
This repository prefers:
- lane clarity and app-local setup first
over
- early analytics platform abstraction

That is the correct tradeoff for this phase.

---

## Implementation impact

This ADR authorizes:
- app-local analytics in Milestone 1
- Plausible as the default marketing lane
- PostHog as the default product lane
- later activation of `@agency/analytics` only when the trigger is real
- a shared event taxonomy standard

This ADR does **not** by itself approve:
- `@agency/analytics` in Milestone 1
- `@agency/analytics-attribution`
- `@agency/analytics-consent-bridge`
- experimentation packages
- cross-provider consent orchestration

Those remain governed by:
- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`

---

## Related documents

- `REPO-STATE.md`
- `DECISION-STATUS.md`
- `DEPENDENCY.md`
- `docs/AGENTS.md`
- `ARCHITECTURE.md`
- `docs/architecture/ADR-004-launch-slice-strategy.md`
- `docs/architecture/ADR-007-marketing-site-architecture-in-shared-monorepo.md`

---

## Change conditions

Reopen this ADR only if one of the following occurs:

- a second real app makes `@agency/analytics` unavoidable without distortion
- the first authenticated product app reveals a stable shared product analytics API
- a second public-facing site reveals a stable shared marketing analytics API
- cross-provider consent handling becomes genuinely necessary
- multi-touch attribution becomes a real business requirement rather than a planning placeholder